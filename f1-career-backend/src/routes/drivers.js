const router = require("express").Router();
const {
  getDrivers,
  getDriversByTeam,
} = require("../controllers/driverController");

router.get("/", getDrivers);
router.get("/team/:teamId", getDriversByTeam);

module.exports = router;