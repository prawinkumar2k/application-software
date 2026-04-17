const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { Application, Student, ApplicationCollege, Mark, Payment, Document, College, Course, AcademicYear, District, Community, Caste } = require('../models');
const { generateApplicationPDF } = require('../services/pdf.service');
const { sendConfirmationEmail } = require('../services/email.service');
const { success, error, paginated } = require('../utils/apiResponse');

const STUDENT_INCLUDE = [
  { model: Community, as: 'community', attributes: ['community_id', 'community_name'] },
  { model: Caste, as: 'caste', attributes: ['caste_id', 'caste_name'] },
  { model: District, as: 'commDistrict', attributes: ['district_id', 'district_name'] },
  { model: District, as: 'permDistrict', attributes: ['district_id', 'district_name'] },
];

const APP_INCLUDE = [
  { model: Student, as: 'student', include: STUDENT_INCLUDE },
  { model: AcademicYear, as: 'academicYear' },
  { model: Mark, as: 'marks' },
  { model: Payment, as: 'payments' },
  { model: Document, as: 'documents' },
  {
    model: ApplicationCollege, as: 'collegePreferences',
    include: [
      { model: College, as: 'college', include: [{ model: District, as: 'district' }] },
      { model: Course, as: 'course' },
    ],
    order: [['preference_order', 'ASC']],
  },
];

function generateAppNo(yearLabel, studentId) {
  const year = yearLabel?.replace('-', '') || new Date().getFullYear();
  return `DOTE${year}${String(studentId).padStart(6, '0')}`;
}

// POST /applications — create draft
async function createApplication(req, res) {
  try {
    const studentId = req.user.student_id;
    const activeYear = await AcademicYear.findOne({ where: { is_active: 1 } });
    if (!activeYear) return error(res, 'No active admission cycle found', 400);

    const existing = await Application.findOne({ where: { student_id: studentId, year_id: activeYear.year_id } });
    if (existing) return success(res, existing, 'Draft already exists');

    const app = await Application.create({ student_id: studentId, year_id: activeYear.year_id, status: 'DRAFT' });
    const appNo = generateAppNo(activeYear.year_label, app.application_id);
    await app.update({ application_no: appNo });

    return success(res, app, 'Application created', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to create application', 500);
  }
}

// PUT /applications/:id — update draft
async function updateApplication(req, res) {
  try {
    const studentId = req.user.student_id;
    const app = await Application.findOne({ where: { application_id: req.params.id, student_id: studentId } });
    if (!app) return error(res, 'Application not found', 404);
    if (['PAID','SUBMITTED','ALLOCATED'].includes(app.status)) return error(res, 'Application cannot be edited after submission', 400);

    const { marks, college_preferences, ...studentFields } = req.body;

    // Update student profile
    if (Object.keys(studentFields).length > 0) {
      await Student.update(studentFields, { where: { student_id: studentId } });
    }

    // Update marks
    if (marks && Array.isArray(marks)) {
      await Mark.destroy({ where: { application_id: app.application_id } });
      if (marks.length > 0) {
        await Mark.bulkCreate(marks.map(m => ({ ...m, application_id: app.application_id })));
      }
    }

    // Update college preferences
    if (college_preferences && Array.isArray(college_preferences)) {
      await ApplicationCollege.destroy({ where: { application_id: app.application_id } });
      if (college_preferences.length > 0) {
        await ApplicationCollege.bulkCreate(college_preferences.map((p, i) => ({
          application_id: app.application_id,
          college_id: p.college_id,
          course_id: p.course_id || null,
          preference_order: p.preference_order || i + 1,
        })));
      }
    }

    const updated = await Application.findByPk(app.application_id, { include: APP_INCLUDE });
    return success(res, updated, 'Application updated');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to update application', 500);
  }
}

// GET /applications/:id
async function getApplication(req, res) {
  try {
    const studentId = req.user.student_id;
    const app = await Application.findOne({
      where: { application_id: req.params.id, student_id: studentId },
      include: APP_INCLUDE,
    });
    if (!app) return error(res, 'Application not found', 404);
    return success(res, app);
  } catch (err) {
    return error(res, 'Failed to fetch application', 500);
  }
}

// GET /applications — my applications
async function getMyApplications(req, res) {
  try {
    const apps = await Application.findAll({
      where: { student_id: req.user.student_id },
      include: [{ model: AcademicYear, as: 'academicYear' }, { model: Payment, as: 'payments' }],
      order: [['created_at', 'DESC']],
    });
    return success(res, apps);
  } catch (err) {
    return error(res, 'Failed to fetch applications', 500);
  }
}

// POST /applications/:id/submit
async function submitApplication(req, res) {
  try {
    const studentId = req.user.student_id;
    const app = await Application.findOne({ where: { application_id: req.params.id, student_id: studentId }, include: APP_INCLUDE });
    if (!app) return error(res, 'Application not found', 404);
    if (app.status !== 'DRAFT') return error(res, 'Application already submitted', 400);

    const prefs = app.collegePreferences || [];
    if (prefs.length === 0) return error(res, 'Please add at least one college preference', 400);

    // Get fee for student's community
    const student = await Student.findByPk(studentId, { include: STUDENT_INCLUDE });
    const communityCode = student?.community?.community_code || 'GENERAL';

    const { FeeStructure } = require('../models');
    const feeRecord = await FeeStructure.findOne({ where: { year_id: app.year_id, category: communityCode } })
      || await FeeStructure.findOne({ where: { year_id: app.year_id, category: 'GENERAL' } });

    const feeAmount = feeRecord ? parseFloat(feeRecord.amount) : 0;

    // Zero-fee: directly mark as SUBMITTED
    if (feeAmount === 0) {
      await app.update({ status: 'SUBMITTED', submitted_at: new Date() });
      const orderId = `DOTE-FREE-${app.application_id}-${Date.now()}`;
      await Payment.create({ application_id: app.application_id, order_id: orderId, amount: 0, status: 'SUCCESS' });
      if (student?.email) {
        try { await sendConfirmationEmail(student.email, student.name, app.application_no); } catch (_) {}
      }
      return success(res, { application: app, paymentRequired: false }, 'Application submitted successfully (fee waived)');
    }

    // Non-zero fee: return order details for CCAvenue
    const orderId = `DOTE-${app.application_id}-${Date.now()}`;
    await Payment.create({ application_id: app.application_id, order_id: orderId, amount: feeAmount, status: 'PENDING' });
    await app.update({ status: 'SUBMITTED', submitted_at: new Date() });

    return success(res, { application: app, paymentRequired: true, orderId, amount: feeAmount }, 'Application submitted. Proceed to payment.');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to submit application', 500);
  }
}

// GET /applications/:id/pdf
async function downloadPDF(req, res) {
  try {
    const studentId = req.user.student_id;
    const app = await Application.findOne({ where: { application_id: req.params.id, student_id: studentId }, include: APP_INCLUDE });
    if (!app) return error(res, 'Application not found', 404);

    const pdfBuffer = await generateApplicationPDF(app.toJSON());
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="application_${app.application_no}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to generate PDF', 500);
  }
}

// Upload document
async function uploadDocument(req, res) {
  try {
    const { application_id, doc_type } = req.body;
    if (!req.file) return error(res, 'No file uploaded', 400);
    const doc = await Document.create({
      application_id,
      doc_type,
      file_path: req.file.path,
      original_name: req.file.originalname,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
    });
    return success(res, doc, 'Document uploaded', 201);
  } catch (err) {
    return error(res, 'Failed to upload document', 500);
  }
}

module.exports = { createApplication, updateApplication, getApplication, getMyApplications, submitApplication, downloadPDF, uploadDocument };
