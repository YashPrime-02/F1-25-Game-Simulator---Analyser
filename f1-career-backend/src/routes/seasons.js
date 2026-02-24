const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const seasonController = require('../controllers/seasonController');

router.post('/', auth, seasonController.createSeason);
router.get('/:seasonId', auth, seasonController.getSeasonById);
router.patch('/:seasonId/complete', auth, seasonController.completeSeason);

module.exports = router;