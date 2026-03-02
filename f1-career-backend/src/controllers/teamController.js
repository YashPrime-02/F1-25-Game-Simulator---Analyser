const { Team } = require("../models");

exports.getTeams = async (req, res) => {
  const teams = await Team.findAll({
    attributes: ["id", "name", "shortCode"],
    order: [["id", "ASC"]],
  });

  res.status(200).json(teams);
};