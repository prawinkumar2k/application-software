const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const adminCtrl = require('../controllers/admin.controller');
const collegeCtrl = require('../controllers/college.controller');

router.use(verifyToken, requireRole('SUPER_ADMIN'));

// Dashboard
router.get('/dashboard/stats', adminCtrl.getDashboardStats);

// Colleges
router.get('/colleges', collegeCtrl.getAllColleges);
router.post('/colleges', collegeCtrl.createCollege);
router.put('/colleges/:id', collegeCtrl.updateCollege);
router.delete('/colleges/:id', collegeCtrl.deleteCollege);

// Courses
router.post('/courses', collegeCtrl.createCourse);
router.put('/courses/:id', collegeCtrl.updateCourse);
router.delete('/courses/:id', collegeCtrl.deleteCourse);

// Users
router.get('/users', adminCtrl.getUsers);
router.post('/users', adminCtrl.createUser);
router.put('/users/:id', adminCtrl.updateUser);
router.patch('/users/:id/toggle', adminCtrl.toggleUserStatus);

// Master data
router.get('/districts', adminCtrl.getDistricts);
router.post('/districts', adminCtrl.createDistrict);
router.put('/districts/:id', adminCtrl.updateDistrict);

router.get('/communities', adminCtrl.getCommunities);
router.post('/communities', adminCtrl.createCommunity);
router.post('/castes', adminCtrl.createCaste);

router.get('/academic-years', adminCtrl.getAcademicYears);
router.post('/academic-years', adminCtrl.createAcademicYear);
router.put('/academic-years/:id', adminCtrl.updateAcademicYear);

router.get('/fee-structures', adminCtrl.getFeeStructures);
router.post('/fee-structures', adminCtrl.upsertFeeStructure);

// Applications management
router.get('/applications', adminCtrl.getApplications);
router.patch('/applications/:id/status', adminCtrl.updateApplicationStatus);

// Reports
router.get('/reports/applications', adminCtrl.getApplicationReport);
router.get('/reports/applications/download', adminCtrl.downloadApplicationReport);
router.get('/reports/payments', adminCtrl.getPaymentReport);
router.get('/reports/payments/download', adminCtrl.downloadPaymentReport);

module.exports = router;
