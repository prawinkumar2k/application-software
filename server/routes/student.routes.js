const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireStudent } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const appCtrl = require('../controllers/application.controller');
const { getAvailableColleges } = require('../controllers/college.controller');
const adminCtrl = require('../controllers/admin.controller');
const { Community, Caste, AcademicYear, District } = require('../models');

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
    console.error('Error fetching communities:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch communities' });
  }
});

router.get('/districts', async (req, res) => {
  try {
    const districts = await District.findAll({ order: [['district_name', 'ASC']] });
    return res.json({ success: true, data: districts });
  } catch (err) {
    console.error('Error fetching districts:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch districts' });
  }
});

router.get('/academic-years', async (req, res) => {
  try {
    const years = await AcademicYear.findAll({ order: [['year_id', 'DESC']] });
    return res.json({ success: true, data: years });
  } catch (err) {
    console.error('Error fetching academic years:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch academic years' });
  }
});

router.get('/castes', async (req, res) => {
  try {
    const castes = await Caste.findAll({ order: [['caste_name', 'ASC']] });
    return res.json({ success: true, data: castes });
  } catch (err) {
    console.error('Error fetching castes:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch castes' });
  }
});

// Applications (requires student auth)
router.post('/applications', verifyToken, requireStudent, appCtrl.createApplication);
router.get('/applications', verifyToken, requireStudent, appCtrl.getMyApplications);
router.put('/applications/:id', verifyToken, requireStudent, appCtrl.updateApplication);
router.get('/applications/:id', verifyToken, requireStudent, appCtrl.getApplication);
router.post('/applications/:id/submit', verifyToken, requireStudent, appCtrl.submitApplication);
router.get('/applications/:id/pdf', verifyToken, requireStudent, appCtrl.downloadPDF);
router.post('/applications/upload', verifyToken, requireStudent, upload.single('document'), appCtrl.uploadDocument);

module.exports = router;
