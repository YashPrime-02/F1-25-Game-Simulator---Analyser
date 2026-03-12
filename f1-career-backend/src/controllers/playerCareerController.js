const {
  sequelize,
  Career,
  PlayerCareer,
  Driver,
  Team,
  Season,
  RaceWeekend,
  RaceResult,
  CareerDriverLineup
} = require("../models");

const { calculateDriverStandings } = require("../services/championshipService");


/*
====================================================
CREATE PLAYER CAREER (SEAT ALLOTMENT ENGINE)
====================================================
*/

exports.createPlayerCareer = async (req, res) => {

  const transaction = await sequelize.transaction();

  try {

    const { driverId, careerName, teamId, replacedDriverId, customDriver } =
      req.body;

    /* =====================================
       FIND MAIN CAREER
    ===================================== */

    const mainCareer = await Career.findOne({
      where: { userId: req.user.id },
      transaction
    });

    if (!mainCareer) {

      await transaction.rollback();

      return res.status(404).json({
        message: "Career not found"
      });

    }

    /* =====================================
       CHECK PLAYER CAREER EXISTS
    ===================================== */

    const existing = await PlayerCareer.findOne({
      where: { userId: req.user.id },
      transaction
    });

    if (existing) {

      await transaction.rollback();

      return res.status(400).json({
        message: "Career already exists",
      });

    }

    /* =====================================
       VALIDATE TEAM
    ===================================== */

    const team = await Team.findByPk(teamId, { transaction });

    if (!team) {

      await transaction.rollback();

      return res.status(404).json({
        message: "Team not found",
      });

    }

    /* =====================================
       CHECK ACTIVE DRIVERS
    ===================================== */

    const activeDrivers = await Driver.count({
      where: {
        teamId,
        isActive: true,
      },
      transaction
    });

    if (activeDrivers >= 2 && !replacedDriverId) {

      await transaction.rollback();

      return res.status(400).json({
        message: "Team already has 2 active drivers. Select replacement.",
      });

    }

    let finalDriverId = driverId;

    /* =====================================
       HANDLE DRIVER REPLACEMENT
    ===================================== */

    if (replacedDriverId) {

      const replacedDriver = await Driver.findByPk(replacedDriverId, { transaction });

      if (!replacedDriver) {

        await transaction.rollback();

        return res.status(404).json({
          message: "Driver to replace not found",
        });

      }

      if (replacedDriver.teamId !== teamId) {

        await transaction.rollback();

        return res.status(400).json({
          message: "Driver does not belong to selected team",
        });

      }

      await replacedDriver.update(
        { isActive: false },
        { transaction }
      );

    }

    /* =====================================
       CREATE CUSTOM DRIVER
    ===================================== */

/* =====================================
   CREATE CUSTOM DRIVER
===================================== */

if (customDriver) {

  // Ensure authenticated user exists
  if (!req.user || !req.user.id) {
    await transaction.rollback();
    return res.status(401).json({
      message: "Unauthorized: missing user context"
    });
  }

  // Basic validation
  if (!customDriver.firstName || !customDriver.lastName) {
    await transaction.rollback();
    return res.status(400).json({
      message: "Custom driver must include firstName and lastName"
    });
  }

  // Normalize values
  const firstName = customDriver.firstName.trim();
  const lastName = customDriver.lastName.trim();
  const nationality = (customDriver.nationality || "Unknown").trim();

  // Prevent duplicate custom drivers for same user
  const existingCustom = await Driver.findOne({
    where: {
      firstName,
      lastName,
      createdByUserId: req.user.id
    },
    transaction
  });

  if (existingCustom) {
    finalDriverId = existingCustom.id;
  } else {

    const newDriver = await Driver.create(
      {
        firstName,
        lastName,
        nationality,
        teamId,
        driverNumber: customDriver.number || 2,
        morale: 60,
        isActive: true,
        createdByUserId: req.user.id   // required by DB rule
      },
      { transaction }
    );

    finalDriverId = newDriver.id;
  }

}
    /* =====================================
       CREATE PLAYER CAREER
    ===================================== */

    const playerCareer = await PlayerCareer.create(
      {
        userId: req.user.id,
        driverId: finalDriverId,
        teamId,
        replacedDriverId: replacedDriverId || null,
        careerName,
        isCustomDriver: !!customDriver,
      },
      { transaction }
    );

    /*
    =====================================
    AUTO CREATE FIRST SEASON
    =====================================
    */

    const existingSeason = await Season.findOne({
      where: {
        careerId: mainCareer.id,
        seasonNumber: 1
      },
      transaction
    });

    if (!existingSeason) {

      await Season.create(
        {
          careerId: mainCareer.id,
          seasonNumber: 1,
          year: 2025,
          raceCount: 24,
          status: "active",
        },
        { transaction }
      );

    }

    await transaction.commit();

    const populatedCareer = await PlayerCareer.findByPk(playerCareer.id, {
      include: [
        {
          model: Driver,
          include: [Team]
        }
      ]
    });

    res.json(populatedCareer);

  } catch (err) {

    await transaction.rollback();

    console.error(err);

    res.status(500).json({
      message: "Failed creating career",
    });

  }

};


/*
====================================================
GET PLAYER CAREER
====================================================
*/

exports.getPlayerCareer = async (req, res) => {

  try {

    const career = await PlayerCareer.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: Driver,
          include: [Team],
        },
        {
          model: Driver,
          as: "ReplacedDriver",
        },
      ],
    });

    res.json(career);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed fetching career",
    });

  }

};


/*
====================================================
PLAYER PROFILE
====================================================
*/

exports.getPlayerProfile = async (req, res) => {

  try {

    const seasonId = Number(req.params.seasonId);
    const careerMode = req.query.career === "true";

    const season = await Season.findByPk(seasonId);

    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }

    const playerCareer = await PlayerCareer.findOne({
      where: { userId: req.user.id },
      include: [Driver, Team],
    });

    if (!playerCareer) {
      return res.status(404).json({ message: "Player career not found" });
    }

    const playerDriverId = playerCareer.driverId;

    let seasonIds = [seasonId];

    if (careerMode) {

      const seasons = await Season.findAll({
        where: { careerId: season.careerId },
        attributes: ["id"],
      });

      seasonIds = seasons.map(s => s.id);

    }

    const standings = await calculateDriverStandings(seasonId);

    const playerStanding = standings.find(
      (s) => s.driverId === playerDriverId
    );

    const index = standings.findIndex(
      (s) => s.driverId === playerDriverId
    );

    const position = index !== -1 ? index + 1 : null;
    const points = playerStanding?.totalPoints || 0;

    const results = await RaceResult.findAll({
      where: { driverId: playerDriverId },
      include: [
        {
          model: RaceWeekend,
          required: true,
          where: { seasonId: seasonIds },
          attributes: ["roundNumber", "seasonId"],
        },
      ],
      order: [
        [RaceWeekend, "seasonId", "ASC"],
        [RaceWeekend, "roundNumber", "ASC"],
      ],
    });

    const wins = results.filter(r => r.position === 1).length;
    const podiums = results.filter(r => r.position <= 3).length;
    const dnfs = results.filter(r => r.dnf).length;
    const fastestLaps = results.filter(r => r.fastestLap).length;

    const avgFinish =
      results.length > 0
        ? (
            results.reduce((sum, r) => sum + r.position, 0) /
            results.length
          ).toFixed(2)
        : null;

    const raceHistory = results.map(r => ({
      round: `S${r.RaceWeekend.seasonId}-R${r.RaceWeekend.roundNumber}`,
      position: r.position,
    }));

    res.json({
      driver: {
        name: `${playerCareer.Driver.firstName} ${playerCareer.Driver.lastName}`,
        team: playerCareer.Team.name,
        nationality: playerCareer.Driver.nationality,
        number: playerCareer.Driver.driverNumber,
        morale: playerCareer.Driver.morale,
      },
      stats: {
        position,
        points,
        wins,
        podiums,
        dnfs,
        fastestLaps,
        avgFinish,
      },
      raceHistory,
    });

  } catch (err) {

    console.error("playerProfile error:", err);

    res.status(500).json({
      message: "Failed to load player profile",
    });

  }

};