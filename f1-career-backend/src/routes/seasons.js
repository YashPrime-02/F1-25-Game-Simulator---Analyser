const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const seasonController = require('../controllers/seasonController');
const ctrl = require("../controllers/seasonSummaryController");


router.post('/', auth, seasonController.createSeason);
router.get('/active', auth, seasonController.getActiveSeason);
router.get('/:seasonId', auth, seasonController.getSeasonById);
router.patch('/:seasonId/complete', auth, seasonController.completeSeason);
router.post("/finalize/:seasonId",  auth, seasonController.finalizeSeason);
router.get("/progress/:seasonId", auth, ctrl.getSeasonProgress);

module.exports = router;