const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const ctrl = require('../controllers/collegeStaff.controller');

router.use(verifyToken, requireRole('COLLEGE_STAFF', 'SUPER_ADMIN'));

router.get('/applications', ctrl.getCollegeApplications);
router.get('/applications/:id', ctrl.getCollegeApplicationDetail);
router.get('/reports/pdf', ctrl.generateCollegeReport);

module.exports = router;
