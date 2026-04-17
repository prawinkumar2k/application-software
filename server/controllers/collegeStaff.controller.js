const { Op } = require('sequelize');
const { Application, Student, ApplicationCollege, College, Mark, Payment, District, Community, Caste, AcademicYear } = require('../models');
const { generateApplicationPDF } = require('../services/pdf.service');
const { success, error, paginated } = require('../utils/apiResponse');

const FULL_APP_INCLUDE = [
  {
    model: Student, as: 'student',
    include: [
      { model: Community, as: 'community' },
      { model: Caste, as: 'caste' },
      { model: District, as: 'commDistrict' },
      { model: District, as: 'permDistrict' },
    ],
  },
  { model: Mark, as: 'marks' },
  { model: Payment, as: 'payments' },
  { model: ApplicationCollege, as: 'collegePreferences', include: [{ model: College, as: 'college' }] },
  { model: AcademicYear, as: 'academicYear' },
];

// GET /college/applications
async function getCollegeApplications(req, res) {
  try {
    const collegeId = req.user.college_id;
    if (!collegeId) return error(res, 'No college assigned to this account', 403);

    const { start_date, end_date, gender, community_id, district_id, hostel, status, page = 1, limit = 20 } = req.query;

    const activeYear = await AcademicYear.findOne({ where: { is_active: 1 } });

    const appIds = await ApplicationCollege.findAll({
      where: { college_id: collegeId },
      attributes: ['application_id'],
      raw: true,
    }).then(rows => rows.map(r => r.application_id));

    const appWhere = { application_id: { [Op.in]: appIds } };
    if (activeYear) appWhere.year_id = activeYear.year_id;
    if (status) appWhere.status = status;
    if (start_date && end_date) appWhere.created_at = { [Op.between]: [new Date(start_date), new Date(end_date)] };

    const studentWhere = {};
    if (gender) studentWhere.gender = gender;
    if (community_id) studentWhere.community_id = community_id;
    if (district_id) studentWhere.comm_district_id = district_id;
    if (hostel === 'true') studentWhere.hostel_required = 1;

    const count = await Application.count({ where: appWhere, include: [{ model: Student, as: 'student', where: studentWhere, required: true }] });
    const rows = await Application.findAll({
      where: appWhere,
      include: [
        {
          model: Student, as: 'student',
          where: studentWhere,
          include: [
            { model: Community, as: 'community', attributes: ['community_name'] },
            { model: District, as: 'commDistrict', attributes: ['district_name'] },
          ],
        },
        { model: Payment, as: 'payments', attributes: ['status', 'amount'], required: false },
        { model: AcademicYear, as: 'academicYear', attributes: ['year_label'] },
      ],
      order: [['created_at', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch applications', 500);
  }
}

// GET /college/applications/:id
async function getCollegeApplicationDetail(req, res) {
  try {
    const collegeId = req.user.college_id;
    const appId = req.params.id;

    const pref = await ApplicationCollege.findOne({ where: { application_id: appId, college_id: collegeId } });
    if (!pref) return error(res, 'Application not found for this college', 404);

    const app = await Application.findByPk(appId, { include: FULL_APP_INCLUDE });
    if (!app) return error(res, 'Application not found', 404);

    return success(res, app);
  } catch (err) {
    return error(res, 'Failed to fetch application', 500);
  }
}

// GET /college/reports/pdf?type=gender&start_date=&end_date=
async function generateCollegeReport(req, res) {
  try {
    const collegeId = req.user.college_id;
    const { type = 'all', start_date, end_date, gender, community_id, hostel } = req.query;

    const appIds = await ApplicationCollege.findAll({
      where: { college_id: collegeId },
      attributes: ['application_id'],
      raw: true,
    }).then(rows => rows.map(r => r.application_id));

    const appWhere = { application_id: { [Op.in]: appIds } };
    if (start_date && end_date) appWhere.created_at = { [Op.between]: [new Date(start_date), new Date(end_date)] };

    const studentWhere = {};
    if (gender) studentWhere.gender = gender;
    if (community_id) studentWhere.community_id = community_id;
    if (hostel === 'true') studentWhere.hostel_required = 1;

    const apps = await Application.findAll({
      where: appWhere,
      include: [
        {
          model: Student, as: 'student', where: studentWhere,
          include: [
            { model: Community, as: 'community' },
            { model: Caste, as: 'caste' },
            { model: District, as: 'commDistrict' },
          ],
        },
        { model: Mark, as: 'marks' },
        { model: ApplicationCollege, as: 'collegePreferences', include: [{ model: College, as: 'college' }] },
        { model: AcademicYear, as: 'academicYear' },
      ],
      order: [['created_at', 'ASC']],
    });

    const college = await College.findByPk(collegeId);
    const reportHTML = buildCollegeReportHTML(apps, college, type);

    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(reportHTML, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, landscape: true, margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' } });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report_${type}_${Date.now()}.pdf"`);
    return res.send(pdf);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to generate report', 500);
  }
}

function buildCollegeReportHTML(apps, college, type) {
  const title = `${college?.college_name || 'College'} — Applications Report (${type.toUpperCase()})`;
  const rows = apps.map((app, i) => {
    const s = app.student;
    return `<tr>
      <td>${i + 1}</td>
      <td>${app.application_no}</td>
      <td>${s?.name || ''}</td>
      <td>${s?.gender || ''}</td>
      <td>${s?.community?.community_name || ''}</td>
      <td>${s?.commDistrict?.district_name || ''}</td>
      <td>${s?.admission_type || ''}</td>
      <td>${s?.hostel_required ? 'Yes' : 'No'}</td>
      <td>${app.status}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
body{font-family:Arial,sans-serif;font-size:11px}
h1{text-align:center;font-size:14px;color:#1e3a5f}
h2{text-align:center;font-size:12px;color:#555;margin-top:0}
table{width:100%;border-collapse:collapse}
th{background:#1e3a5f;color:white;padding:5px 4px;text-align:left}
td{border:1px solid #ccc;padding:4px;vertical-align:top}
tr:nth-child(even){background:#f9f9f9}
</style></head><body>
<h1>DOTE Admission Management System</h1>
<h2>${title}</h2>
<table>
<thead><tr><th>#</th><th>App No.</th><th>Name</th><th>Gender</th><th>Community</th><th>District</th><th>Admission Type</th><th>Hostel</th><th>Status</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p style="margin-top:20px;font-size:10px;text-align:right">Total: ${apps.length} applications | Generated: ${new Date().toLocaleString('en-IN')}</p>
</body></html>`;
}

module.exports = { getCollegeApplications, getCollegeApplicationDetail, generateCollegeReport };
