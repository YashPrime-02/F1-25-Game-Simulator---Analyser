const {
  Season,
  RaceWeekend,
  RaceResult,
  Driver,
  Team
} = require("../models");

exports.getSeasonProgress = async (req, res) => {
  try {

    const { seasonId } = req.params;

    const season = await Season.findByPk(seasonId);

    if (!season) {
      return res.status(404).json({
        message: "Season not found"
      });
    }

    /* ===============================
       GET ALL WEEKENDS
    =============================== */

    const weekends = await RaceWeekend.findAll({
      where: { seasonId }
    });

    const weekendIds = weekends.map(w => w.id);

    /* ===============================
       GET ALL RESULTS
    =============================== */

    const results = await RaceResult.findAll({
      where: { raceWeekendId: weekendIds }
    });

    /* ===============================
       CALCULATE COMPLETED ROUNDS
    =============================== */

    const completedSet = new Set(
      results.map(r => r.raceWeekendId)
    );

    const completed = completedSet.size;

    const percent = (
      (completed / season.raceCount) * 100
    ).toFixed(1);

    const seasonComplete = completed >= season.raceCount;

    /* ===============================
       CHAMPIONS
    =============================== */

    let driverChampion = null;
    let constructorChampion = null;

    if (seasonComplete) {

      /* ===== DRIVER CHAMPION ===== */

      if (season.driverChampionId) {

        const driver = await Driver.findByPk(
          season.driverChampionId
        );

        if (driver) {
          driverChampion =
            `${driver.firstName} ${driver.lastName}`;
        }

      }

      /* ===== CONSTRUCTOR CHAMPION ===== */

      if (season.constructorChampionId) {

        const team = await Team.findByPk(
          season.constructorChampionId
        );

        if (team) {
          constructorChampion = team.name;
        }

      }

    }

    /* ===============================
       RESPONSE
    =============================== */

    res.json({
      raceCount: season.raceCount,
      completed,
      percent,
      seasonComplete,
      driverChampion,
      constructorChampion
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Season progress error"
    });

  }
};