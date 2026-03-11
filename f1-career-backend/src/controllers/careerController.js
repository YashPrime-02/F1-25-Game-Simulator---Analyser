const {
  Career,
  Season,
  PlayerCareer,
  Driver,
  Team,
  RaceWeekend,
  RaceResult,
} = require("../models");

const {
  calculateDriverStandings,
} = require("../services/championshipService");

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

    // ✅ Prevent duplicate careers per user
    const existingCareer = await Career.findOne({
      where: { userId: req.user.id },
    });

    if (existingCareer) {
      return res.status(400).json({
        message: "Career already exists for this user",
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


/* =========================================================
   CAREER HUB
========================================================= */
exports.getCareerHub = async (req, res) => {
  try {
    const { seasonId } = req.params;

    const season = await Season.findByPk(seasonId);
    if (!season)
      return res.status(404).json({ message: "Season not found" });

    const playerCareer = await PlayerCareer.findOne({
      where: { userId: req.user.id },
      include: [Driver, Team],
    });

    if (!playerCareer)
      return res.status(404).json({ message: "Player career not found" });

    const playerDriverId = playerCareer.driverId;

    /* ===== Championship Position ===== */
    const standings = await calculateDriverStandings(seasonId);

    const playerStanding = standings.find(
      (s) => s.driverId === playerDriverId
    );

    const index = standings.findIndex(
   (s) => s.driverId === playerDriverId
);

    const position = index !== -1 ? index + 1 : null;

    /* ===== Player Results ===== */
    const raceWeekends = await RaceWeekend.findAll({
      where: { seasonId },
    });

    const raceIds = raceWeekends.map((r) => r.id);

    const results = await RaceResult.findAll({
      where: {
        raceWeekendId: raceIds,
        driverId: playerDriverId,
      },
    });

    const wins = results.filter((r) => r.position === 1).length;
    const podiums = results.filter((r) => r.position <= 3).length;
    const dnfs = results.filter((r) => r.dnf).length;
    const fastestLaps = results.filter((r) => r.fastestLap).length;

    const avgFinish =
      results.length > 0
        ? (
            results.reduce((sum, r) => sum + r.position, 0) /
            results.length
          ).toFixed(2)
        : null;

    /* ===== Season Progress ===== */
    const completedRoundsRaw = await RaceResult.findAll({
      attributes: ["raceWeekendId"],
      include: [
        {
          model: RaceWeekend,
          where: { seasonId },
          attributes: [],
        },
      ],
      group: ["raceWeekendId"],
    });

    const completedRounds = completedRoundsRaw.length;

    res.json({
      driver: {
        name: `${playerCareer.Driver.firstName} ${playerCareer.Driver.lastName}`,
        team: playerCareer.Team.name,
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
      season: {
        completedRounds,
        totalRounds: season.raceCount,
      },
    });
  } catch (err) {
    console.error("careerHub error:", err);
    res.status(500).json({ message: "Failed to load career hub" });
  }
};



/* =========================================================
   CAREER RIVALRY
========================================================= */
// console.log("🔥 RIVALRY EXPORT LINE REACHED");
exports.getCareerRivalry = async (req, res) => {
  try {
    const { seasonId } = req.params;

    const playerCareer = await PlayerCareer.findOne({
      where: { userId: req.user.id },
    });

    if (!playerCareer)
      return res.status(404).json({ message: "Player career not found" });

    const playerDriverId = playerCareer.driverId;

    const standings = await calculateDriverStandings(seasonId);

    if (!standings.length)
      return res.status(400).json({ message: "No standings yet" });

    const playerStanding = standings.find(
      (s) => s.driverId === playerDriverId
    );

    if (!playerStanding)
      return res.status(400).json({ message: "Player not in standings" });

    const rival = standings
      .filter((s) => s.driverId !== playerDriverId)
      .sort(
        (a, b) =>
          Math.abs(a.totalPoints - playerStanding.totalPoints) -
          Math.abs(b.totalPoints - playerStanding.totalPoints)
      )[0];

    if (!rival)
      return res.status(400).json({ message: "No rival found" });

    const raceWeekends = await RaceWeekend.findAll({
      where: { seasonId },
    });

    const raceIds = raceWeekends.map((r) => r.id);

    const allResults = await RaceResult.findAll({
      where: { raceWeekendId: raceIds }
    });

    let playerWins = 0;
    let rivalWins = 0;

    raceIds.forEach((raceId) => {
      const playerRace = allResults.find(
        (r) =>
          r.raceWeekendId === raceId &&
          r.driverId === playerDriverId
      );

      const rivalRace = allResults.find(
        (r) =>
          r.raceWeekendId === raceId &&
          r.driverId === rival.driverId
      );

      if (!playerRace || !rivalRace) return;

      if (playerRace.position < rivalRace.position)
        playerWins++;
      else if (rivalRace.position < playerRace.position)
        rivalWins++;
    });

    res.json({
      player: {
        driverId: playerDriverId,
        points: playerStanding.totalPoints,
      },
      rival: {
        driverId: rival.driverId,
        points: rival.totalPoints,
      },
      gap: Math.abs(
        playerStanding.totalPoints - rival.totalPoints
      ),
      headToHead: {
        playerWins,
        rivalWins,
      },
    });
  } catch (err) {
    console.error("careerRivalry error:", err);
    res.status(500).json({ message: "Failed to load rivalry" });
  }
};



