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

    const careers = await Career.findAll({
      where: { userId: req.user.id }
    });

    const careerIds = careers.map(c => c.id);

    const seasons = await Season.findAll({
      where: {
        careerId: { [Op.in]: careerIds }
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
  try {

    const careers = await Career.findAll({
      where: { userId: req.user.id },
    });

    if (!careers.length) {
      return res.status(404).json({
        message: "No career found",
      });
    }

    const careerIds = careers.map(c => c.id);

    /* ===============================
       1️⃣ TRY FIND ACTIVE SEASON
    =============================== */

    let season = await Season.findOne({
      where: {
        careerId: careerIds,
        status: "active",
      },
      order: [["seasonNumber", "DESC"]],
    });

    /* ===============================
       2️⃣ IF NONE ACTIVE → CREATE NEXT
    =============================== */

    if (!season) {

      const lastSeason = await Season.findOne({
        where: { careerId: careerIds },
        order: [["seasonNumber", "DESC"]],
      });

      if (!lastSeason) {
        return res.status(404).json({
          message: "No seasons exist",
        });
      }

      season = await Season.create({
        careerId: lastSeason.careerId,
        seasonNumber: lastSeason.seasonNumber + 1,
        year: lastSeason.year + 1,
        raceCount: lastSeason.raceCount,
        status: "active",
      });

    }

    res.json(season);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed fetching active season",
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