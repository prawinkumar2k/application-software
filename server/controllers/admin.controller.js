const bcrypt = require('bcrypt');
const { Op, fn, col, literal } = require('sequelize');
const {
  User, College, Application, Student, Payment, District,
  Community, Caste, AcademicYear, FeeStructure, Mark,
  ApplicationCollege, Course
} = require('../models');
const { success, error, paginated } = require('../utils/apiResponse');

// Dashboard stats
async function getDashboardStats(req, res) {
  try {
    const activeYear = await AcademicYear.findOne({ where: { is_active: 1 } });
    const yearFilter = activeYear ? { year_id: activeYear.year_id } : {};

    const [totalApps, pendingPayments, verified, allocated] = await Promise.all([
      Application.count({ where: yearFilter }),
      Application.count({ where: { ...yearFilter, status: 'SUBMITTED' } }),
      Application.count({ where: { ...yearFilter, status: 'VERIFIED' } }),
      Application.count({ where: { ...yearFilter, status: 'ALLOCATED' } }),
    ]);

    // Gender breakdown
    const genderStats = await Student.findAll({
      attributes: ['gender', [fn('COUNT', col('Student.student_id')), 'count']],
      include: [{ model: Application, as: 'applications', where: yearFilter, required: true, attributes: [] }],
      group: ['Student.gender'],
      raw: true,
    });

    // Admission type breakdown
    const admissionStats = await Student.findAll({
      attributes: ['admission_type', [fn('COUNT', col('Student.student_id')), 'count']],
      include: [{ model: Application, as: 'applications', where: yearFilter, required: true, attributes: [] }],
      group: ['Student.admission_type'],
      raw: true,
    });

    return success(res, {
      counters: { totalApps, pendingPayments, verified, allocated },
      genderStats,
      admissionStats,
      activeYear,
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch dashboard stats', 500);
  }
}

// User management
async function getUsers(req, res) {
  try {
    const { page = 1, limit = 200, role, search } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }];

    const count = await User.count({ where });
    const rows = await User.findAll({
      where,
      attributes: { exclude: ['password', 'refresh_token'] },
      include: [{ association: 'college', attributes: ['college_id', 'college_name'] }],
      order: [['created_at', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });
    return paginated(res, rows, count, page, limit);
  } catch (err) {
    return error(res, 'Failed to fetch users', 500);
  }
}

async function createUser(req, res) {
  try {
    const { name, email, password, role, college_id } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return error(res, 'Email already registered', 409);

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed, role, college_id: college_id || null });
    const { password: _, refresh_token: __, ...userData } = user.toJSON();
    return success(res, userData, 'User created', 201);
  } catch (err) {
    return error(res, 'Failed to create user', 500);
  }
}

async function updateUser(req, res) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found', 404);
    const { password, ...rest } = req.body;
    const updates = { ...rest };
    if (password) updates.password = await bcrypt.hash(password, 12);
    await user.update(updates);
    return success(res, null, 'User updated');
  } catch (err) {
    return error(res, 'Failed to update user', 500);
  }
}

async function toggleUserStatus(req, res) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found', 404);
    await user.update({ is_active: user.is_active ? 0 : 1 });
    return success(res, null, `User ${user.is_active ? 'enabled' : 'disabled'}`);
  } catch (err) {
    return error(res, 'Failed to toggle user status', 500);
  }
}

// Master data: Districts
async function getDistricts(req, res) {
  try {
    const districts = await District.findAll({ order: [['district_name', 'ASC']] });
    return success(res, districts);
  } catch (err) { return error(res, 'Failed', 500); }
}

async function createDistrict(req, res) {
  try {
    const district = await District.create(req.body);
    return success(res, district, 'District created', 201);
  } catch (err) { return error(res, 'Failed', 500); }
}

async function updateDistrict(req, res) {
  try {
    const d = await District.findByPk(req.params.id);
    if (!d) return error(res, 'Not found', 404);
    await d.update(req.body);
    return success(res, d, 'Updated');
  } catch (err) { return error(res, 'Failed', 500); }
}

// Communities
async function getCommunities(req, res) {
  try {
    const communities = await Community.findAll({ include: [{ model: Caste, as: 'castes' }], order: [['community_name', 'ASC']] });
    return success(res, communities);
  } catch (err) { return error(res, 'Failed', 500); }
}

async function createCommunity(req, res) {
  try {
    const c = await Community.create(req.body);
    return success(res, c, 'Created', 201);
  } catch (err) { return error(res, 'Failed', 500); }
}

async function createCaste(req, res) {
  try {
    const c = await Caste.create(req.body);
    return success(res, c, 'Created', 201);
  } catch (err) { return error(res, 'Failed', 500); }
}

// Academic Years
async function getAcademicYears(req, res) {
  try {
    const years = await AcademicYear.findAll({ order: [['year_id', 'DESC']] });
    return success(res, years);
  } catch (err) { return error(res, 'Failed', 500); }
}

async function createAcademicYear(req, res) {
  try {
    if (req.body.is_active) await AcademicYear.update({ is_active: 0 }, { where: {} });
    const year = await AcademicYear.create(req.body);
    return success(res, year, 'Created', 201);
  } catch (err) { return error(res, 'Failed', 500); }
}

async function updateAcademicYear(req, res) {
  try {
    const year = await AcademicYear.findByPk(req.params.id);
    if (!year) return error(res, 'Not found', 404);
    if (req.body.is_active) await AcademicYear.update({ is_active: 0 }, { where: { year_id: { [Op.ne]: year.year_id } } });
    await year.update(req.body);
    return success(res, year, 'Updated');
  } catch (err) { return error(res, 'Failed', 500); }
}

// Fee structures
async function getFeeStructures(req, res) {
  try {
    const fees = await FeeStructure.findAll({ include: [{ model: AcademicYear }] });
    return success(res, fees);
  } catch (err) { return error(res, 'Failed', 500); }
}

async function upsertFeeStructure(req, res) {
  try {
    const { year_id, category, amount } = req.body;
    const [fee, created] = await FeeStructure.findOrCreate({ where: { year_id, category }, defaults: { amount } });
    if (!created) await fee.update({ amount });
    return success(res, fee, created ? 'Created' : 'Updated', created ? 201 : 200);
  } catch (err) { return error(res, 'Failed', 500); }
}

// Reports
async function getApplicationReport(req, res) {
  try {
    const { start_date, end_date, district_id, gender, community_id, college_id, status, page = 1, limit = 50 } = req.query;
    const activeYear = await AcademicYear.findOne({ where: { is_active: 1 } });

    const appWhere = {};
    if (activeYear) appWhere.year_id = activeYear.year_id;
    if (status) appWhere.status = status;
    if (start_date && end_date) appWhere.created_at = { [Op.between]: [new Date(start_date), new Date(end_date)] };

    const studentWhere = {};
    if (gender) studentWhere.gender = gender;
    if (community_id) studentWhere.community_id = community_id;
    if (district_id) studentWhere.comm_district_id = district_id;

    const count = await Application.count({ where: appWhere, include: [{ model: Student, as: 'student', where: studentWhere, required: true }] });
    const rows = await Application.findAll({
      where: appWhere,
      include: [
        { model: Student, as: 'student', where: studentWhere, include: STUDENT_MINI_INCLUDE },
        { model: AcademicYear, as: 'academicYear', attributes: ['year_label'] },
        { model: Payment, as: 'payments', attributes: ['status', 'amount'], required: false },
      ],
      order: [['created_at', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });
    return paginated(res, rows, count, page, limit);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to generate report', 500);
  }
}

const STUDENT_MINI_INCLUDE = [
  { model: Community, as: 'community', attributes: ['community_name'] },
  { model: District, as: 'commDistrict', attributes: ['district_name'] },
];

async function getPaymentReport(req, res) {
  try {
    const { start_date, end_date, status, page = 1, limit = 50 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (start_date && end_date) where.created_at = { [Op.between]: [new Date(start_date), new Date(end_date)] };

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [{ model: Application, as: 'application', attributes: ['application_no', 'status'] }],
      order: [['created_at', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });
    return paginated(res, rows, count, page, limit);
  } catch (err) {
    return error(res, 'Failed', 500);
  }
}

module.exports = {
  getDashboardStats, getUsers, createUser, updateUser, toggleUserStatus,
  getDistricts, createDistrict, updateDistrict,
  getCommunities, createCommunity, createCaste,
  getAcademicYears, createAcademicYear, updateAcademicYear,
  getFeeStructures, upsertFeeStructure,
  getApplicationReport, getPaymentReport,
};
