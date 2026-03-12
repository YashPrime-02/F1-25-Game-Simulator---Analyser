const { DriverLegacy, TeamLegacy, Driver, Team } = require("../models");

exports.getLegacyContext = async (winnerDriverId) => {
  const legacy = await DriverLegacy.findOne({
    where: { driverId: winnerDriverId },
  });

  if (!legacy) {
    return {
      championStatus: "Unknown",
      legacyNarrative: "Career story still forming",
    };
  }

  let championStatus = "Race winner";
  let legacyNarrative = "";

  if (legacy.championships === 0) {
    legacyNarrative = "Still chasing a first world championship.";
  } else if (legacy.championships === 1) {
    championStatus = "World Champion";
    legacyNarrative = "A proven title winner building reputation.";
  } else if (legacy.championships >= 2 && legacy.championships <= 3) {
    championStatus = `${legacy.championships}-time World Champion`;
    legacyNarrative = "Entering elite championship territory.";
  } else {
    championStatus = "Legend of the sport";
    legacyNarrative = "One of the defining drivers of an era.";
  }

  return {
    championStatus,
    legacyNarrative,
  };
};