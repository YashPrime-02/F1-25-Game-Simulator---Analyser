// src/controllers/seasonController.js

const {
  Season,
  SeasonCalendar,
  Career,
  sequelize,
} = require("../models");

const { calculateDriverStandings } = require("../services/championshipService");
const { Op } = require("sequelize");


/* ======================================================
   CREATE SEASON
====================================================== */

exports.createSeason = async (req, res) => {
  try {

    const { careerId, trackIds } = req.body;

    if (!careerId || !Array.isArray(trackIds) || !trackIds.length) {
      return res.status(400).json({
        message: "careerId and trackIds required",
      });
    }

    const career = await Career.findOne({
      where: { id: careerId, userId: req.user.id },
    });

    if (!career)
      return res.status(403).json({
        message: "Career not owned by user",
      });

    const lastSeason = await Season.findOne({
      where: { careerId },
      order: [["seasonNumber", "DESC"]],
    });

    if (lastSeason && lastSeason.status === "active") {
      return res.status(400).json({
        message: "Finish current season first",
      });
    }

    const nextSeasonNumber = lastSeason
      ? lastSeason.seasonNumber + 1
      : 1;

    const nextYear = lastSeason
      ? lastSeason.year + 1
      : 2025;

    const transaction = await sequelize.transaction();

    const season = await Season.create(
      {
        careerId,
        seasonNumber: nextSeasonNumber,
        year: nextYear,
        raceCount: trackIds.length,
        status: "active",
      },
      { transaction }
    );

    const calendarEntries = trackIds.map((trackId, index) => ({
      seasonId: season.id,
      trackId,
      roundNumber: index + 1,
    }));

    await SeasonCalendar.bulkCreate(calendarEntries, {
      transaction,
    });

    await transaction.commit();

    res.status(201).json(season);

  } catch (err) {

    console.error(err);
    res.status(500).json({
      message: "Season creation failed",
    });

  }
};



/* ======================================================
   GET ALL SEASONS (FOR DROPDOWN)
====================================================== */

exports.getAllSeasons = async (req, res) => {

  try {

    /* GET LATEST USER CAREER */

    const career = await Career.findOne({
      where: { userId: req.user.id },
      order: [["createdAt","DESC"]]
    });

    if (!career) {
      return res.json([]);
    }

    const seasons = await Season.findAll({
      where: {
        careerId: career.id
      },
      order: [["seasonNumber","ASC"]]
    });

    res.json(seasons);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed fetching seasons"
    });

  }

};



/* ======================================================
   GET ACTIVE SEASON
====================================================== */

exports.getActiveSeason = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {

    const career = await Career.findOne({
      where: { userId: req.user.id },
      order: [["createdAt","DESC"]],
      transaction
    });

    if (!career) {
      await transaction.rollback();
      return res.json(null);
    }

    /* FIND ACTIVE SEASON */

    let season = await Season.findOne({
      where: {
        careerId: career.id,
        status: "active"
      },
      order: [["seasonNumber","DESC"]],
      transaction
    });

    /* IF ACTIVE EXISTS RETURN */

    if (season) {
      await transaction.commit();
      return res.json(season);
    }

    /* FIND LAST SEASON */

    const lastSeason = await Season.findOne({
      where: { careerId: career.id },
      order: [["seasonNumber","DESC"]],
      transaction
    });

    /* NO SEASONS EXIST → CREATE FIRST */

    if (!lastSeason) {

      season = await Season.create({
        careerId: career.id,
        seasonNumber: 1,
        year: 2025,
        raceCount: 24,
        status: "active"
      }, { transaction });

      await transaction.commit();
      return res.json(season);
    }

    /* CREATE NEXT SEASON */

    season = await Season.create({
      careerId: career.id,
      seasonNumber: lastSeason.seasonNumber + 1,
      year: lastSeason.year + 1,
      raceCount: lastSeason.raceCount,
      status: "active"
    }, { transaction });

    await transaction.commit();
    return res.json(season);

  } catch (err) {

    await transaction.rollback();

    console.error("getActiveSeason error:", err);

    res.status(500).json({
      message: "Failed fetching active season"
    });

  }
};

/* ======================================================
   GET SEASON + CALENDAR
====================================================== */

exports.getSeasonById = async (req, res) => {

  try {

    const { seasonId } = req.params;

    const season = await Season.findByPk(seasonId);

    if (!season)
      return res.status(404).json({
        message: "Season not found",
      });

    const calendar = await SeasonCalendar.findAll({
      where: { seasonId },
      order: [["roundNumber", "ASC"]],
    });

    res.json({
      season,
      calendar,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed fetching season",
    });

  }

};



/* ======================================================
   COMPLETE SEASON + AUTO CREATE NEXT
====================================================== */

exports.completeSeason = async (req, res) => {

  try {

    const { seasonId } = req.params;

    const season = await Season.findByPk(seasonId);

    if (!season)
      return res.status(404).json({
        message: "Season not found",
      });

    if (season.status === "completed")
      return res.json({
        message: "Season already completed",
      });

    const standings = await calculateDriverStandings(season.id);

    const champion = standings?.[0];

    await season.update({
      status: "completed",
      driverChampionId: champion?.driverId || null,
    });

    const nextSeason = await Season.create({
      careerId: season.careerId,
      seasonNumber: season.seasonNumber + 1,
      year: season.year + 1,
      raceCount: season.raceCount,
      status: "active",
    });

    res.json({
      message: "Season completed",
      champion,
      nextSeason,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Season completion failed",
    });

  }

};