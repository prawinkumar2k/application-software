const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireStudent } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const appCtrl = require('../controllers/application.controller');
const { getAvailableColleges } = require('../controllers/college.controller');
const adminCtrl = require('../controllers/admin.controller');
const { Community, Caste, AcademicYear } = require('../models');

// Public endpoints (no auth required)
router.get('/colleges/available', getAvailableColleges);

// Master data endpoints (accessible to all users)
router.get('/communities', async (req, res) => {
  try {
    const communities = await Community.findAll({
      include: [{ model: Caste, as: 'castes' }],
      order: [['community_name', 'ASC']]
    });
    return res.json({ success: true, data: communities });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch communities' });
  }
});

router.get('/districts', async (req, res) => {
  try {
    const { District } = require('../models');
    const districts = await District.findAll({ order: [['district_name', 'ASC']] });
    return res.json({ success: true, data: districts });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch districts' });
  }
});

router.get('/academic-years', async (req, res) => {
  try {
    const years = await AcademicYear.findAll({ order: [['year_id', 'DESC']] });
    return res.json({ success: true, data: years });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch academic years' });
  }
});

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
