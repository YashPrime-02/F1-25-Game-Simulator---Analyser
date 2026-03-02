const { PlayerCareer, Driver, Team } = require("../models");

/*
====================================================
CREATE PLAYER CAREER
Supports:
- Existing driver career
- Custom player driver
- Team selection
- Driver replacement
====================================================
*/

exports.createPlayerCareer = async (req, res) => {
  try {
    const {
      driverId,
      careerName,
      teamId,
      replacedDriverId,
      customDriver,
    } = req.body;

    /* ===============================
       PREVENT MULTIPLE CAREERS
    =============================== */

    const existing = await PlayerCareer.findOne({
      where: { userId: req.user.id },
    });

    if (existing) {
      return res.status(400).json({
        message: "Career already exists",
      });
    }

    let finalDriverId = driverId;

    /* ===============================
       CREATE CUSTOM DRIVER (OPTIONAL)
    =============================== */

    if (customDriver) {
      if (!teamId) {
        return res.status(400).json({
          message: "Team required for custom driver",
        });
      }

      const newDriver = await Driver.create({
        firstName: customDriver.firstName,
        lastName: customDriver.lastName,
        nationality: customDriver.nationality || "Unknown",
        teamId,
        driverNumber: customDriver.number || 99,
        morale: 60,
        isActive: true,
      });

      finalDriverId = newDriver.id;
    }

    /* ===============================
       DRIVER REPLACEMENT (OPTIONAL)
    =============================== */

    if (replacedDriverId) {
      await Driver.update(
        { isActive: false },
        { where: { id: replacedDriverId } }
      );
    }

    /* ===============================
       CREATE CAREER
    =============================== */

    const career = await PlayerCareer.create({
      userId: req.user.id,
      driverId: finalDriverId,
      teamId: teamId || null,
      replacedDriverId: replacedDriverId || null,
      careerName,
      isCustomDriver: !!customDriver,
    });

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
    console.error(err);
    res.status(500).json({ message: "Failed creating career" });
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
    res.status(500).json({ message: "Failed fetching career" });
  }
};