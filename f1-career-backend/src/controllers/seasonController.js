// src/controllers/seasonController.js

const {
  Season,
  SeasonCalendar,
  Career,
  sequelize,
} = require('../models');

/**
 * CREATE SEASON
 */
exports.createSeason = async (req, res) => {
  const { careerId, trackIds } = req.body;

  // Basic validation
  if (!careerId || !Array.isArray(trackIds) || trackIds.length === 0) {
    return res.status(400).json({
      message: 'careerId and non-empty trackIds array required',
    });
  }

  // Max 24 races rule
  if (trackIds.length > 24) {
    return res.status(400).json({
      message: 'Maximum 24 races allowed',
    });
  }

  // Prevent duplicate tracks
  const uniqueTrackIds = [...new Set(trackIds)];
  if (uniqueTrackIds.length !== trackIds.length) {
    return res.status(400).json({
      message: 'Duplicate tracks not allowed in calendar',
    });
  }

  // Validate career ownership
  const career = await Career.findOne({
    where: { id: careerId, userId: req.user.id },
  });

  if (!career) {
    return res.status(403).json({
      message: 'Career not found or not owned by user',
    });
  }

  // Get last season
  const lastSeason = await Season.findOne({
    where: { careerId },
    order: [['seasonNumber', 'DESC']],
  });

  // Prevent new season if previous is still active
  if (lastSeason && lastSeason.status === 'active') {
    return res.status(400).json({
      message:
        'Complete the current season before starting a new one',
    });
  }

  const nextSeasonNumber = lastSeason
    ? lastSeason.seasonNumber + 1
    : 1;

  const nextYear = lastSeason
    ? lastSeason.year + 1
    : 2025;

  const raceCount = trackIds.length;

  const transaction = await sequelize.transaction();

  try {
    // Create season
    const season = await Season.create(
      {
        careerId,
        seasonNumber: nextSeasonNumber,
        year: nextYear,
        raceCount,
        status: 'active',
      },
      { transaction }
    );

    // Insert calendar entries
    const calendarEntries = trackIds.map((trackId, index) => ({
      seasonId: season.id,
      trackId,
      roundNumber: index + 1,
    }));

    await SeasonCalendar.bulkCreate(calendarEntries, {
      transaction,
    });

    await transaction.commit();

    return res.status(201).json({
      message: 'Season created successfully',
      seasonId: season.id,
      seasonNumber: nextSeasonNumber,
      year: nextYear,
      raceCount,
    });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    return res.status(500).json({
      message: 'Failed to create season',
    });
  }
};

/**
 * GET SEASON WITH CALENDAR
 */
exports.getSeasonById = async (req, res) => {
  const { seasonId } = req.params;

  const season = await Season.findByPk(seasonId);

  if (!season) {
    return res.status(404).json({ message: 'Season not found' });
  }

  // Validate ownership
  const career = await Career.findOne({
    where: {
      id: season.careerId,
      userId: req.user.id,
    },
  });

  if (!career) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const calendar = await SeasonCalendar.findAll({
    where: { seasonId },
    order: [['roundNumber', 'ASC']],
  });

  return res.json({
    season,
    calendar,
  });
};

/**
 * COMPLETE SEASON
 */
exports.completeSeason = async (req, res) => {
  const { seasonId } = req.params;

  const season = await Season.findByPk(seasonId);

  if (!season) {
    return res.status(404).json({ message: 'Season not found' });
  }

  const career = await Career.findOne({
    where: {
      id: season.careerId,
      userId: req.user.id,
    },
  });

  if (!career) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (season.status === 'completed') {
    return res.status(400).json({
      message: 'Season already completed',
    });
  }

  season.status = 'completed';
  await season.save();

  return res.json({
    message: 'Season marked as completed',
  });
};


exports.getActiveSeason = async (req, res) => {
  try {
    const career = await Career.findOne({
      where: { userId: req.user.id },
    });

    if (!career) {
      return res.status(404).json({
        message: "No career found",
      });
    }

    const season = await Season.findOne({
      where: {
        careerId: career.id,
        status: "active",
      },
    });

    if (!season) {
      return res.status(404).json({
        message: "No active season found",
      });
    }

    res.json(season);
  } catch (error) {
    console.error("getActiveSeason error:", error);
    res.status(500).json({ message: "Server error" });
  }
};