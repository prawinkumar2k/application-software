const { Op } = require('sequelize');
const { College, Course, District, ApplicationCollege, Application } = require('../models');
const { success, error, paginated } = require('../utils/apiResponse');

// GET /api/v1/colleges/available?gender=MALE&hostel=true&district_id=1&search=
async function getAvailableColleges(req, res) {
  try {
    const { gender, hostel, district_id, search, page = 1, limit = 500 } = req.query;

    const where = { is_active: 1 };

    // Rule 1 – Gender filter (server-side, never expose to client until filtered)
    if (gender === 'MALE') {
      where.gender_type = { [Op.in]: ['MALE', 'CO-ED'] };
    } else if (gender === 'FEMALE') {
      where.gender_type = { [Op.in]: ['FEMALE', 'CO-ED'] };
    }

    // Rule 2 – Hostel filter
    if (hostel === 'true' || hostel === true) {
      where.hostel_available = 1;
      if (gender === 'MALE') where.hostel_gender = { [Op.in]: ['MALE', 'BOTH'] };
      else if (gender === 'FEMALE') where.hostel_gender = { [Op.in]: ['FEMALE', 'BOTH'] };
    }

    if (district_id) where.district_id = district_id;
    if (search) where.college_name = { [Op.like]: `%${search}%` };

    const count = await College.count({ where });
    const rows = await College.findAll({
      where,
      include: [
        { model: District, as: 'district', attributes: ['district_id', 'district_name'] },
        { model: Course, as: 'courses', where: { is_active: 1 }, required: false, attributes: ['course_id', 'course_code', 'course_name', 'intake_seats'] },
      ],
      order: [['college_name', 'ASC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch colleges', 500);
  }
}

// GET /api/v1/colleges/:id
async function getCollegeById(req, res) {
  try {
    const college = await College.findByPk(req.params.id, {
      include: [
        { model: District, as: 'district' },
        { model: Course, as: 'courses', where: { is_active: 1 }, required: false },
      ],
    });
    if (!college) return error(res, 'College not found', 404);
    return success(res, college);
  } catch (err) {
    return error(res, 'Failed to fetch college', 500);
  }
}

// Admin CRUD
async function createCollege(req, res) {
  try {
    const college = await College.create(req.body);
    return success(res, college, 'College created', 201);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') return error(res, 'College code already exists', 409);
    return error(res, 'Failed to create college', 500);
  }
}

async function updateCollege(req, res) {
  try {
    const college = await College.findByPk(req.params.id);
    if (!college) return error(res, 'College not found', 404);
    await college.update(req.body);
    return success(res, college, 'College updated');
  } catch (err) {
    return error(res, 'Failed to update college', 500);
  }
}

async function deleteCollege(req, res) {
  try {
    const college = await College.findByPk(req.params.id);
    if (!college) return error(res, 'College not found', 404);
    await college.update({ is_active: 0 });
    return success(res, null, 'College deactivated');
  } catch (err) {
    return error(res, 'Failed to delete college', 500);
  }
}

async function getAllColleges(req, res) {
  try {
    const { page = 1, limit = 500, search, district_id, gender_type } = req.query;
    const where = {};
    if (search) where.college_name = { [Op.like]: `%${search}%` };
    if (district_id) where.district_id = district_id;
    if (gender_type) where.gender_type = gender_type;

    const count = await College.count({ where });
    const rows = await College.findAll({
      where,
      include: [{ model: District, as: 'district', attributes: ['district_name'] }],
      order: [['college_name', 'ASC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });
    return paginated(res, rows, count, page, limit);
  } catch (err) {
    return error(res, 'Failed to fetch colleges', 500);
  }
}

// Course CRUD
async function createCourse(req, res) {
  try {
    const course = await Course.create({ ...req.body, college_id: req.params.collegeId || req.body.college_id });
    return success(res, course, 'Course created', 201);
  } catch (err) {
    return error(res, 'Failed to create course', 500);
  }
}

async function updateCourse(req, res) {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return error(res, 'Course not found', 404);
    await course.update(req.body);
    return success(res, course, 'Course updated');
  } catch (err) {
    return error(res, 'Failed to update course', 500);
  }
}

async function deleteCourse(req, res) {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return error(res, 'Course not found', 404);
    await course.update({ is_active: 0 });
    return success(res, null, 'Course deactivated');
  } catch (err) {
    return error(res, 'Failed to delete course', 500);
  }
}

module.exports = { getAvailableColleges, getCollegeById, createCollege, updateCollege, deleteCollege, getAllColleges, createCourse, updateCourse, deleteCourse };
