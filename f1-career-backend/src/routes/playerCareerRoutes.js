
  const router = require("express").Router();
const ctrl = require("../controllers/playerCareerController");
const auth = require('../middleware/auth');

router.post("/", auth, ctrl.createPlayerCareer);
router.get("/", auth, ctrl.getPlayerCareer);

module.exports = router;