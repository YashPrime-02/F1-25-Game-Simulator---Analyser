const { Season, RaceWeekend, RaceResult } = require("../models");

exports.getSeasonProgress = async (req, res) => {
  try {

    const { seasonId } = req.params;

    const season = await Season.findByPk(seasonId);

    const weekends = await RaceWeekend.findAll({
      where: { seasonId }
    });

    const weekendIds = weekends.map(w => w.id);

    const results = await RaceResult.findAll({
      where: { raceWeekendId: weekendIds }
    });

    // unique race weekends that have results
    const completedSet = new Set(
      results.map(r => r.raceWeekendId)
    );

    const completed = completedSet.size;

    const percent = (
      (completed / season.raceCount) * 100
    ).toFixed(1);

    res.json({
      raceCount: season.raceCount,
      completed,
      percent,
      seasonComplete: completed >= season.raceCount
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Season progress error"
    });
  }
};