const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireStudent } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const appCtrl = require('../controllers/application.controller');
const { getAvailableColleges } = require('../controllers/college.controller');

// Colleges (public filter)
router.get('/colleges/available', getAvailableColleges);

// Applications (requires student auth)
router.use(verifyToken, requireStudent);
router.post('/applications', appCtrl.createApplication);
router.get('/applications', appCtrl.getMyApplications);
router.put('/applications/:id', appCtrl.updateApplication);
router.get('/applications/:id', appCtrl.getApplication);
router.post('/applications/:id/submit', appCtrl.submitApplication);
router.get('/applications/:id/pdf', appCtrl.downloadPDF);
router.post('/applications/upload', upload.single('document'), appCtrl.uploadDocument);

module.exports = router;
