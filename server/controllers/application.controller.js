const fs = require('fs');
const path = require('path');
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

// GET /application-status — check if student has submitted
async function getApplicationStatus(req, res) {
  try {
    const studentId = req.user.student_id;
    const app = await Application.findOne({
      where: { student_id: studentId },
      include: [{ model: AcademicYear, as: 'academicYear' }],
      order: [['created_at', 'DESC']],
    });
    const hasApplication = !!app;
    const hasSubmitted = app ? app.status !== 'DRAFT' : false;
    return success(res, { hasApplication, hasSubmitted, application: app });
  } catch (err) {
    return error(res, 'Failed to fetch application status', 500);
  }
}

// POST /applications — create draft
async function createApplication(req, res) {
  try {
    const studentId = req.user.student_id;
    const activeYear = await AcademicYear.findOne({ where: { is_active: 1 } });
    if (!activeYear) return error(res, 'No active admission cycle found', 400);

    // RULE: Block if student already has a submitted application (any year)
    const submittedApp = await Application.findOne({
      where: {
        student_id: studentId,
        status: { [Op.in]: ['SUBMITTED', 'PAID', 'VERIFIED', 'ALLOCATED', 'REJECTED'] },
      },
    });
    if (submittedApp) return error(res, 'You have already submitted an application', 400);

    // Return existing draft for same year instead of creating duplicate
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

    // RULE: Passport photo must be uploaded before submission
    const photoDoc = await Document.findOne({ where: { application_id: app.application_id, doc_type: 'photo' } });
    if (!photoDoc) return error(res, 'Passport size photo upload is required before submitting', 400);

    // Get student details for aadhaar check and fee calculation
    const student = await Student.findByPk(studentId, { include: STUDENT_INCLUDE });

    // RULE: Aadhaar is mandatory before submission
    if (!student?.aadhaar) return error(res, 'Aadhaar number is required before submitting', 400);

    // RULE: Block if another application already used this Aadhaar
    const aadhaarConflict = await Application.findOne({
      where: { aadhaar_number: student.aadhaar, application_id: { [Op.ne]: app.application_id } },
    });
    if (aadhaarConflict) return error(res, 'Application already exists for this Aadhaar number', 400);

    const communityCode = student?.community?.community_code || 'GENERAL';

    const { FeeStructure } = require('../models');
    const feeRecord = await FeeStructure.findOne({ where: { year_id: app.year_id, category: communityCode } })
      || await FeeStructure.findOne({ where: { year_id: app.year_id, category: 'GENERAL' } });

    const feeAmount = feeRecord ? parseFloat(feeRecord.amount) : 0;

    // Zero-fee: directly mark as SUBMITTED
    if (feeAmount === 0) {
      try {
        await app.update({ status: 'SUBMITTED', submitted_at: new Date(), aadhaar_number: student.aadhaar });
      } catch (dupErr) {
        if (dupErr.original?.code === 'ER_DUP_ENTRY') return error(res, 'Application already exists for this Aadhaar number', 400);
        throw dupErr;
      }
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
    try {
      await app.update({ status: 'SUBMITTED', submitted_at: new Date(), aadhaar_number: student.aadhaar });
    } catch (dupErr) {
      if (dupErr.original?.code === 'ER_DUP_ENTRY') return error(res, 'Application already exists for this Aadhaar number', 400);
      throw dupErr;
    }

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

// GET /applications/:id/documents
async function getDocuments(req, res) {
  try {
    const studentId = req.user.student_id;
    const app = await Application.findOne({ where: { application_id: req.params.id, student_id: studentId } });
    if (!app) return error(res, 'Application not found', 404);
    const docs = await Document.findAll({
      where: { application_id: req.params.id },
      attributes: ['doc_id', 'doc_type', 'original_name', 'file_size', 'mime_type', 'created_at'],
      order: [['created_at', 'DESC']],
    });
    return success(res, docs);
  } catch (err) {
    return error(res, 'Failed to fetch documents', 500);
  }
}

// POST /applications/upload
async function uploadDocument(req, res) {
  const filePath = req.file?.path;
  try {
    const { application_id, doc_type } = req.body;
    if (!req.file) return error(res, 'No file uploaded', 400);
    if (!application_id) return error(res, 'application_id is required', 400);
    if (!['photo', 'tc', 'marksheet'].includes(doc_type)) return error(res, 'doc_type must be photo, tc, or marksheet', 400);

    // Photo: image only, max 2MB
    if (doc_type === 'photo') {
      if (!['image/jpeg', 'image/png'].includes(req.file.mimetype)) {
        fs.unlinkSync(filePath);
        return error(res, 'Passport photo must be a JPEG or PNG image', 400);
      }
      if (req.file.size > 2 * 1024 * 1024) {
        fs.unlinkSync(filePath);
        return error(res, 'Passport photo must be under 2MB', 400);
      }
    }

    // Verify application belongs to this student
    const app = await Application.findOne({ where: { application_id, student_id: req.user.student_id } });
    if (!app) { fs.unlinkSync(filePath); return error(res, 'Application not found', 404); }

    // Remove existing document of the same type (replace instead of accumulate)
    const existing = await Document.findOne({ where: { application_id, doc_type } });
    if (existing) {
      try { if (fs.existsSync(existing.file_path)) fs.unlinkSync(existing.file_path); } catch (_) {}
      await existing.destroy();
    }

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
    if (filePath) { try { fs.unlinkSync(filePath); } catch (_) {} }
    console.error(err);
    return error(res, 'Failed to upload document', 500);
  }
}

module.exports = { getApplicationStatus, createApplication, updateApplication, getApplication, getMyApplications, submitApplication, downloadPDF, getDocuments, uploadDocument };
