const {
  sequelize,
  PlayerCareer,
  Driver,
  Team,
  Season,
  RaceWeekend,
  RaceResult,
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

    /* ===============================
       SINGLE CAREER CHECK
    =============================== */

    const existing = await PlayerCareer.findOne({
      where: { userId: req.user.id },
    });

    if (existing) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Career already exists",
      });
    }

    /* ===============================
       TEAM VALIDATION
    =============================== */

    const team = await Team.findByPk(teamId);

    if (!team) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Team not found",
      });
    }

    /* ===============================
       TEAM SEAT LIMIT (2 DRIVERS)
    =============================== */

    const activeDrivers = await Driver.count({
      where: {
        teamId,
        isActive: true,
      },
    });

    if (activeDrivers >= 2 && !replacedDriverId) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Team already has 2 active drivers. Select replacement.",
      });
    }

    let finalDriverId = driverId;

    /* ===============================
       DRIVER REPLACEMENT VALIDATION
    =============================== */

    if (replacedDriverId) {
      const replacedDriver = await Driver.findByPk(replacedDriverId);

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

      await replacedDriver.update({ isActive: false }, { transaction });
    }

    /* ===============================
       CUSTOM DRIVER CREATION
    =============================== */

    if (customDriver) {
      const newDriver = await Driver.create(
        {
          firstName: customDriver.firstName,
          lastName: customDriver.lastName,
          nationality: customDriver.nationality || "Unknown",
          teamId,
          driverNumber: customDriver.number || 99,
          morale: 60,
          isActive: true,
          createdByUserId: req.user.id,
        },
        { transaction }
      );

      finalDriverId = newDriver.id;
    }

    /* ===============================
       CREATE CAREER RECORD
    =============================== */

    const career = await PlayerCareer.create(
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

    await transaction.commit();

    const populatedCareer = await PlayerCareer.findByPk(career.id, {
      include: [
        {
          model: Driver,
          include: [Team],
        },
      ],
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

/* =========================================================
   PLAYER PROFILE
========================================================= */

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

    /* ======================================
       DETERMINE SEASONS TO INCLUDE
    ====================================== */

    let seasonIds = [seasonId];

    if (careerMode) {
      const seasons = await Season.findAll({
        where: { careerId: season.careerId },
        attributes: ["id"],
      });

      seasonIds = seasons.map(s => s.id);
    }

    /* ======================================
       DRIVER STANDINGS (CURRENT SEASON ONLY)
    ====================================== */

    const standings = await calculateDriverStandings(seasonId);

    const playerStanding = standings.find(
      (s) => s.driverId === playerDriverId
    );

    const index = standings.findIndex(
      (s) => s.driverId === playerDriverId
    );

    const position = index !== -1 ? index + 1 : null;
    const points = playerStanding?.totalPoints || 0;

    /* ======================================
       FETCH RESULTS (MULTI SEASON SAFE)
    ====================================== */

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

    /* ======================================
       RESULT STATS (CAREER)
    ====================================== */

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

    /* ======================================
       GRAPH DATA (SEASON + ROUND)
    ====================================== */

    const raceHistory = results.map(r => ({
      round: `S${r.RaceWeekend.seasonId}-R${r.RaceWeekend.roundNumber}`,
      position: r.position,
    }));

    /* ======================================
       RESPONSE
    ====================================== */

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