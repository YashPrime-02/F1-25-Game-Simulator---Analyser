const { Driver, Team } = require("../models");

/* ===============================
   GET ALL ACTIVE DRIVERS
================================ */

exports.getDrivers = async (req, res) => {
  const drivers = await Driver.findAll({
    where: { isActive: true },
    attributes: [
      "id",
      "firstName",
      "lastName",
      "teamId",
      "driverNumber",
      "morale",
    ],
    include: [
      {
        model: Team,
        attributes: ["id", "name", "shortCode"],
      },
    ],
    order: [["id", "ASC"]],
  });

  res.status(200).json(drivers);
};

/* ===============================
   GET DRIVERS BY TEAM
================================ */

exports.getDriversByTeam = async (req, res) => {
  const { teamId } = req.params;

  const drivers = await Driver.findAll({
    where: {
      teamId,
      isActive: true,
    },
    attributes: [
      "id",
      "firstName",
      "lastName",
      "driverNumber",
      "morale",
    ],
    order: [["id", "ASC"]],
  });

  res.status(200).json(drivers);
};