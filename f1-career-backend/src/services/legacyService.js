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

    legacy.seasons += 1;
    legacy.totalPoints += driver.totalPoints;
    legacy.wins += driver.wins;
    legacy.podiums += driver.podiums;

    if (standings[0].driverId === driver.driverId) {
      legacy.championships += 1;
    }

    await legacy.save();
  }

  console.log("✅ Driver legacy updated");
};