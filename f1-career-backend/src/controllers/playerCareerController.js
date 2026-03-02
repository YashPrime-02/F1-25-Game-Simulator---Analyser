const { PlayerCareer, Driver, Team, sequelize } = require("../models");

/*
====================================================
CREATE PLAYER CAREER (SEAT ALLOTMENT ENGINE)
====================================================
*/

exports.createPlayerCareer = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      driverId,
      careerName,
      teamId,
      replacedDriverId,
      customDriver,
    } = req.body;

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

      await replacedDriver.update(
        { isActive: false },
        { transaction }
      );
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

    /* ===============================
       RETURN POPULATED CAREER
    =============================== */

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