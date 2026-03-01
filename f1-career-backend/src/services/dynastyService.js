const { RaceResult, RaceWeekend, Driver, Team } = require("../models");

/*
==================================================
DYNASTY ENGINE — CORE ANALYSIS
==================================================
*/

exports.detectDriverDynasty = async (seasonId) => {
  const weekends = await RaceWeekend.findAll({
    where: { seasonId },
    order: [["roundNumber", "ASC"]],
  });

  if (!weekends.length) return null;

  const results = await RaceResult.findAll({
    where: {
      raceWeekendId: weekends.map(w => w.id),
      position: 1,
    },
    include: [{ model: Driver, include: [Team] }],
  });

  const winCount = {};

  for (const r of results) {
    winCount[r.driverId] = (winCount[r.driverId] || 0) + 1;
  }

  const entries = Object.entries(winCount);
  if (!entries.length) return null;

  const [driverId, wins] =
    entries.sort((a, b) => b[1] - a[1])[0];

  const dominanceRatio = wins / weekends.length;

  if (dominanceRatio >= 0.6) {
    const driver = await Driver.findByPk(driverId, {
      include: [Team],
    });

    // ✅ FIXED LOG
    console.log({
      leader: `${driver.firstName} ${driver.lastName}`,
      wins,
      races: weekends.length,
      winRate: wins / weekends.length,
    });

    return {
      type: "DRIVER_DOMINANCE",
      message: `${driver.firstName} ${driver.lastName} is establishing a dominant season.`,
      wins,
      races: weekends.length,
    };
  }

  return null;
};