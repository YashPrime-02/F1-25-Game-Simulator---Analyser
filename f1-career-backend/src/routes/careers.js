const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const careerController = require('../controllers/careerController');

router.post('/', auth, careerController.createCareer);
router.get('/', auth, careerController.getMyCareers);

module.exports = router;