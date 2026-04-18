const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function buildApplicationHTML(app, photoDataUri = null) {
  const s = app.student || {};
  const marks = app.marks || [];
  const prefs = app.collegePreferences || [];

  const totalMarks = marks.reduce((sum, m) => sum + parseFloat(m.marks_obtained || 0), 0);
  const maxTotal = marks.reduce((sum, m) => sum + parseFloat(m.max_marks || 100), 0);
  const percentage = maxTotal > 0 ? ((totalMarks / maxTotal) * 100).toFixed(2) : '0.00';

  const photoBlock = photoDataUri
    ? `<img src="${photoDataUri}" style="width:90px;height:110px;object-fit:cover;border:2px solid #1e3a5f;" alt="Photo" />`
    : `<div style="width:90px;height:110px;border:2px dashed #aaa;display:flex;align-items:center;justify-content:center;font-size:9px;color:#aaa;text-align:center;line-height:1.5;">PASTE<br/>PHOTO<br/>HERE</div>`;

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; color: #222; }
  .section { margin-bottom: 16px; }
  .section-title { background: #1e3a5f; color: white; padding: 4px 8px; font-weight: bold; font-size: 12px; margin-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  td, th { border: 1px solid #ccc; padding: 4px 8px; }
  th { background: #f0f0f0; font-weight: bold; text-align: left; }
  .label { font-weight: bold; width: 35%; background: #f8f8f8; }
  .footer { margin-top: 40px; font-size: 11px; color: #666; }
</style>
</head>
<body>

  <!-- Header with photo -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
    <div style="flex:1;text-align:center;">
      <div style="font-size:16px;font-weight:bold;color:#1e3a5f;margin-bottom:4px;">GOVERNMENT OF TAMIL NADU</div>
      <div style="font-size:13px;color:#444;margin-bottom:6px;">Directorate of Technical Education<br/>Application for Admission to Government Polytechnic Colleges</div>
      <div style="text-align:right;font-size:11px;color:#555;">
        Application No: <strong>${app.application_no || 'DRAFT'}</strong> &nbsp;|&nbsp; Status: <strong>${app.status}</strong>
      </div>
    </div>
    <div style="margin-left:16px;flex-shrink:0;">${photoBlock}</div>
  </div>

  <div class="section">
    <div class="section-title">Personal Details</div>
    <table>
      <tr><td class="label">Name</td><td>${s.name || ''}</td><td class="label">Date of Birth</td><td>${s.dob || ''}</td></tr>
      <tr><td class="label">Gender</td><td>${s.gender || ''}</td><td class="label">Aadhaar No.</td><td>${s.aadhaar || ''}</td></tr>
      <tr><td class="label">Religion</td><td>${s.religion || ''}</td><td class="label">Community</td><td>${s.community?.community_name || ''}</td></tr>
      <tr><td class="label">Caste</td><td>${s.caste?.caste_name || ''}</td><td class="label">Admission Type</td><td>${s.admission_type || ''}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Contact Information</div>
    <table>
      <tr><td class="label">Mobile</td><td>${s.mobile || ''}</td><td class="label">Email</td><td>${s.email || ''}</td></tr>
      <tr><td class="label">Comm. Address</td><td colspan="3">${s.comm_address || ''}, ${s.comm_city || ''} - ${s.comm_pincode || ''}</td></tr>
      <tr><td class="label">Perm. Address</td><td colspan="3">${s.perm_address || ''}, ${s.perm_city || ''} - ${s.perm_pincode || ''}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Parent / Guardian Details</div>
    <table>
      <tr><td class="label">Father's Name</td><td>${s.father_name || ''}</td><td class="label">Mother's Name</td><td>${s.mother_name || ''}</td></tr>
      <tr><td class="label">Occupation</td><td>${s.parent_occupation || ''}</td><td class="label">Annual Income</td><td>₹${s.annual_income || '0'}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Academic Details</div>
    <table>
      <tr><td class="label">Board</td><td>${s.board || ''}</td><td class="label">Register No.</td><td>${s.register_no || ''}</td></tr>
      <tr><td class="label">Last School/Institute</td><td colspan="3">${s.last_school || ''}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Marks (Qualifying Examination)</div>
    <table>
      <tr><th>Subject</th><th>Marks Obtained</th><th>Maximum Marks</th></tr>
      ${marks.map(m => `<tr><td>${m.subject_name}</td><td>${m.marks_obtained}</td><td>${m.max_marks}</td></tr>`).join('')}
      <tr><td><strong>Total</strong></td><td><strong>${totalMarks}</strong></td><td><strong>${maxTotal}</strong></td></tr>
      <tr><td colspan="2"><strong>Percentage</strong></td><td><strong>${percentage}%</strong></td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">College Preferences (in order)</div>
    <table>
      <tr><th>#</th><th>College Name</th><th>Course</th></tr>
      ${prefs.sort((a, b) => a.preference_order - b.preference_order)
        .map(p => `<tr><td>${p.preference_order}</td><td>${p.college?.college_name || p.college_id}</td><td>${p.course?.course_name || '-'}</td></tr>`).join('')}
    </table>
  </div>

  <div class="section">
    <div class="section-title">Special Category</div>
    <table>
      <tr>
        <td class="label">Differently Abled</td><td>${s.is_differently_abled ? 'Yes' : 'No'}</td>
        <td class="label">Ex-Servicemen</td><td>${s.is_ex_servicemen ? 'Yes' : 'No'}</td>
      </tr>
      <tr>
        <td class="label">Sports Person</td><td>${s.is_sports_person ? 'Yes' : 'No'}</td>
        <td class="label">Govt. School</td><td>${s.is_govt_school ? 'Yes' : 'No'}</td>
      </tr>
      <tr>
        <td class="label">Hostel Required</td><td>${s.hostel_required ? 'Yes' : 'No'}</td>
        <td></td><td></td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <p>I hereby declare that the information furnished above is true and correct to the best of my knowledge.</p>
    <br/>
    <p>Signature of Applicant: _________________________ &nbsp;&nbsp;&nbsp; Date: _____________</p>
    <br/>
    <p style="text-align:center;font-size:10px">Generated by DOTE Admission Management System | Government of Tamil Nadu</p>
  </div>
</body>
</html>`;
}

async function generateApplicationPDF(applicationData) {
  let photoDataUri = null;
  const photoDoc = (applicationData.documents || []).find(d => d.doc_type === 'photo');
  if (photoDoc?.file_path) {
    try {
      const absPath = path.isAbsolute(photoDoc.file_path)
        ? photoDoc.file_path
        : path.join(__dirname, '..', photoDoc.file_path);
      if (fs.existsSync(absPath)) {
        const ext = path.extname(absPath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
        const data = fs.readFileSync(absPath);
        photoDataUri = `data:${mimeType};base64,${data.toString('base64')}`;
      }
    } catch (_) {}
  }

  const html = buildApplicationHTML(applicationData, photoDataUri);
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
  });
  await browser.close();
  return pdfBuffer;
}

module.exports = { generateApplicationPDF, buildApplicationHTML };
