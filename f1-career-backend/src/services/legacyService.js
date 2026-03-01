const {DriverLegacy,TeamLegacy,Driver,Team,} = require("../models");
const {RaceWeekend,RaceResult,} = require("../models");

const { calculateDriverStandings }=require("./championshipService");

exports.ensureLegacyExists = async () => {
  const drivers = await Driver.findAll();
  const teams = await Team.findAll();

  for (const d of drivers) {
    await DriverLegacy.findOrCreate({
      where: { driverId: d.id },
    });
  }

  for (const t of teams) {
    await TeamLegacy.findOrCreate({
      where: { teamId: t.id },
    });
  }
};


exports.archiveSeasonLegacy = async (season) => {
  await exports.ensureLegacyExists();

  const standings = await calculateDriverStandings(season.id);

  for (const driver of standings) {
    const legacy = await DriverLegacy.findOne({
      where: { driverId: driver.driverId },
    });

    if (!legacy) continue;

    legacy.seasons = (legacy.seasons || 0) + 1;
    legacy.points = (legacy.points || 0) + driver.totalPoints;
    legacy.wins = (legacy.wins || 0) + driver.wins;
    legacy.podiums = (legacy.podiums || 0) + driver.podiums;

    // champion bonus
    if (standings[0].driverId === driver.driverId) {
      legacy.championships = (legacy.championships || 0) + 1;
    }

    await legacy.save();
  }

  console.log("✅ Driver legacy updated");
};