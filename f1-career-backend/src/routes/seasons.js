const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const seasonController = require("../controllers/seasonController");
const ctrl = require("../controllers/seasonSummaryController");
router.get("/", auth, seasonController.getAllSeasons);
router.get("/active", auth, seasonController.getActiveSeason);
router.get("/progress/:seasonId", auth, ctrl.getSeasonProgress);
router.get("/:seasonId", auth, seasonController.getSeasonById);
router.patch("/:seasonId/complete", auth, seasonController.completeSeason);

module.exports = router;