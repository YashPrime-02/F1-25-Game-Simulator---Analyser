const { Career, Season } = require("../models");

/* =========================================================
   CREATE CAREER
========================================================= */
exports.createCareer = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        message: "Career name and type are required",
      });
    }

    const career = await Career.create({
      userId: req.user.id,
      name,
      type,
    });

    const season = await Season.create({
      careerId: career.id,
      seasonNumber: 1,
      year: new Date().getFullYear(),
      raceCount: 10,
      status: "active",
    });

    res.status(201).json({
      career,
      season,
    });
  } catch (error) {
    console.error("createCareer error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
/* =========================================================
   GET MY CAREERS
========================================================= */
exports.getMyCareers = async (req, res) => {
  try {
    const careers = await Career.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.json(careers);
  } catch (error) {
    console.error("getMyCareers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};