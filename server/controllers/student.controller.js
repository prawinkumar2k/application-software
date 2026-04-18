const { Student, Community, Caste, District } = require('../models');
const { success, error } = require('../utils/apiResponse');

// GET /student/profile — get student profile
async function getProfile(req, res) {
  try {
    const studentId = req.user.student_id;
    const student = await Student.findByPk(studentId, {
      attributes: { exclude: ['password', 'otp', 'otp_expires', 'refresh_token'] },
      include: [
        { model: Community, as: 'community', attributes: ['community_id', 'community_name', 'community_code'] },
        { model: Caste, as: 'caste', attributes: ['caste_id', 'caste_name'] },
        { model: District, as: 'commDistrict', attributes: ['district_id', 'district_name'] },
        { model: District, as: 'permDistrict', attributes: ['district_id', 'district_name'] },
      ],
    });
    if (!student) return error(res, 'Student not found', 404);
    return success(res, student);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch profile', 500);
  }
}

// PUT /student/profile — update student profile
async function updateProfile(req, res) {
  try {
    const studentId = req.user.student_id;
    const student = await Student.findByPk(studentId);
    if (!student) return error(res, 'Student not found', 404);

    // List of allowed fields to update (exclude sensitive fields)
    const allowed = [
      'name', 'dob', 'gender', 'aadhaar', 'religion',
      'community_id', 'caste_id',
      'comm_address', 'comm_city', 'comm_district_id', 'comm_pincode',
      'perm_address', 'perm_city', 'perm_district_id', 'perm_pincode',
      'alt_mobile', 'father_name', 'mother_name', 'parent_occupation',
      'annual_income', 'board', 'register_no', 'last_school', 'admission_type',
      'hostel_required', 'is_differently_abled', 'is_ex_servicemen',
      'is_sports_person', 'is_govt_school'
    ];

    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Check Aadhaar uniqueness if changing
    if (updates.aadhaar && updates.aadhaar !== student.aadhaar) {
      const exists = await Student.findOne({ where: { aadhaar: updates.aadhaar } });
      if (exists) return error(res, 'Aadhaar number already in use', 400);
    }

    await student.update(updates);
    const updated = await Student.findByPk(studentId, {
      attributes: { exclude: ['password', 'otp', 'otp_expires', 'refresh_token'] },
      include: [
        { model: Community, as: 'community', attributes: ['community_id', 'community_name', 'community_code'] },
        { model: Caste, as: 'caste', attributes: ['caste_id', 'caste_name'] },
        { model: District, as: 'commDistrict', attributes: ['district_id', 'district_name'] },
        { model: District, as: 'permDistrict', attributes: ['district_id', 'district_name'] },
      ],
    });
    
    return success(res, updated, 'Profile updated successfully');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to update profile', 500);
  }
}

module.exports = { getProfile, updateProfile };
