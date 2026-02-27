const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const raceController = require('../controllers/raceController');

router.post('/weekend', auth, raceController.createRaceWeekend);
router.post('/results', auth, raceController.submitRaceResults);

router.post('/simulate', auth, raceController.simulateRace); // ✅ CLEAN ENGINE ROUTE

router.get("/standings/:seasonId", auth, raceController.getDriverStandings);
router.get("/constructors/:seasonId", auth, raceController.getConstructorStandings);
router.get('/progression/:seasonId', auth, raceController.getSeasonProgression);
router.get('/recap/:raceWeekendId', auth, raceController.getRaceRecapData);
router.get('/recap-ai/:raceWeekendId', auth, raceController.getRaceRecapAI);
router.get("/news/:seasonId", auth, raceController.getSeasonNews);

module.exports = router;