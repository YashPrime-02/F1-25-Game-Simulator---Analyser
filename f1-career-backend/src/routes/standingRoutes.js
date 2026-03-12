const router = require("express").Router();
const ctrl = require("../controllers/standingController");
const auth = require("../middleware/auth");
router.get("/teammates/:seasonId",auth,ctrl.getTeammateDelta);
router.get("/constructors/:seasonId",auth,ctrl.getConstructors);

module.exports = router;