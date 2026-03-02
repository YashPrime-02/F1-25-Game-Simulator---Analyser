// src/controllers/raceController.js
const { calculatePoints } = require("../utils/pointsCalculator");
const { Driver } = require("../models");
const { generateAIText } = require("../services/aiService");
const {
  calculateDriverStandings,
  detectTitleClinch,
} = require("../services/championshipService");
const { detectRivalry } = require("../services/narrativeService");
const {
  getDriverPersonality,
} = require("../services/simulation/personalityService");
const {
  detectControversy,
} = require("../services/simulation/controversyService");
const {
  generateTransferRumorContext,
} = require("../services/simulation/transferService");
const { detectTeamTension } = require("../services/simulation/politicsService");
const { SeasonMemory, NewsFeed } = require("../models");
const {
  updateMoraleAfterRace,
} = require("../services/simulation/moraleService");
const {
  buildChampionshipSummary,
} = require("../services/championshipSummaryService");
const {
  getSeasonPhase,
  getTitlePressure,
  getMomentum,
} = require("../services/commentaryContextService");
const {
  RaceWeekend,
  RaceResult,
  Season,
  SeasonCalendar,
  Career,
  sequelize,
  Team,
} = require("../models");
const { Commentary } = require("../models");
const { getLegacyContext } = require("../services/legacyNarrativeService");
const { archiveSeasonLegacy } = require("../services/legacyService");
const { DriverLegacy } = require("../models");
const { detectDriverDynasty } = require("../services/dynastyService");

const POINTS_MAP = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1,
};

/* =========================================================
   CREATE RACE WEEKEND
========================================================= */
exports.createRaceWeekend = async (req, res) => {
  const { seasonId, roundNumber, weather, safetyCar, redFlag, notes } =
    req.body;

  if (!seasonId || !roundNumber) {
    return res.status(400).json({
      message: "seasonId and roundNumber required",
    });
  }

  const season = await Season.findByPk(seasonId);
  if (!season) return res.status(404).json({ message: "Season not found" });

  const career = await Career.findOne({
    where: { id: season.careerId, userId: req.user.id },
  });

  if (!career) return res.status(403).json({ message: "Not authorized" });

  const existing = await RaceWeekend.findOne({
    where: { seasonId, roundNumber },
  });

  if (existing)
    return res.status(400).json({
      message: "Race weekend already exists for this round",
    });

  const raceWeekend = await RaceWeekend.create({
    seasonId,
    roundNumber,
    weather,
    safetyCar,
    redFlag,
    notes,
  });

  res.status(201).json(raceWeekend);
};

const shuffleArray = (array) => {
  return [...array].sort(() => 0.5 - Math.random());
};

/* =========================================================
   SUBMIT RACE RESULTS
========================================================= */
exports.submitRaceResults = async (req, res) => {
  const { raceWeekendId, results } = req.body;

  if (!raceWeekendId || !Array.isArray(results)) {
    return res.status(400).json({
      message: "raceWeekendId and results array required",
    });
  }

  if (results.length !== 20) {
    return res.status(400).json({
      message: "Exactly 20 results required (P1–P20)",
    });
  }

  const raceWeekend = await RaceWeekend.findByPk(raceWeekendId);
  if (!raceWeekend)
    return res.status(404).json({ message: "Race weekend not found" });

  const transaction = await sequelize.transaction();

  try {
    await RaceResult.destroy({
      where: { raceWeekendId },
      transaction,
    });

    await RaceResult.bulkCreate(
      results.map((r) => ({
        raceWeekendId,
        driverId: r.driverId,
        position: r.position,
        fastestLap: r.fastestLap || false,
        dnf: r.dnf || false,
      })),
      { transaction },
    );

    // ✅ Morale system integration (SAFE ADDITION)
    await updateMoraleAfterRace(results, Driver);

    await transaction.commit();
    res.json({ message: "Race results saved successfully" });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).json({ message: "Failed to save results" });
  }
};

/* =========================================================
   DRIVER STANDINGS
========================================================= */
exports.getDriverStandings = async (req, res) => {
  const { seasonId } = req.params;

  const raceWeekends = await RaceWeekend.findAll({ where: { seasonId } });
  const raceIds = raceWeekends.map((r) => r.id);

  const allResults = await RaceResult.findAll({
    where: { raceWeekendId: raceIds },
  });

  const drivers = await Driver.findAll();
  const teams = await Team.findAll();

  const driverMap = {};
  drivers.forEach((d) => (driverMap[d.id] = d));

  const teamMap = {};
  teams.forEach((t) => (teamMap[t.id] = t.name));

  const standings = {};

  allResults.forEach((r) => {
    const driver = driverMap[r.driverId];
    if (!driver) return;

    let points = POINTS_MAP[r.position] || 0;
    if (r.fastestLap && r.position <= 10) points += 1;

    if (!standings[r.driverId]) {
      standings[r.driverId] = {
        driverId: r.driverId,
        driverName: `${driver.firstName} ${driver.lastName}`,
        teamName: teamMap[driver.teamId] || "Unknown",
        driverNumber: driver.driverNumber,
        totalPoints: 0,
        wins: 0,
        podiums: 0,
      };
    }

    standings[r.driverId].totalPoints += points;
    if (r.position === 1) standings[r.driverId].wins += 1;
    if (r.position <= 3) standings[r.driverId].podiums += 1;
  });

  const sorted = Object.values(standings).sort(
    (a, b) => b.totalPoints - a.totalPoints,
  );

  res.json(sorted);
};

/* =========================================================
   SEASON POINTS PROGRESSION
========================================================= */
exports.getSeasonProgression = async (req, res) => {
  const { seasonId } = req.params;

  const raceWeekends = await RaceWeekend.findAll({
    where: { seasonId },
    order: [["roundNumber", "ASC"]],
  });

  const drivers = await Driver.findAll();
  const driverMap = {};
  drivers.forEach((d) => (driverMap[d.id] = d));

  const cumulative = {};
  const progression = [];

  for (const race of raceWeekends) {
    const results = await RaceResult.findAll({
      where: { raceWeekendId: race.id },
    });

    results.forEach((r) => {
      const driver = driverMap[r.driverId];
      if (!driver) return;

      let points = POINTS_MAP[r.position] || 0;
      if (r.fastestLap && r.position <= 10) points += 1;

      if (!cumulative[r.driverId]) cumulative[r.driverId] = 0;
      cumulative[r.driverId] += points;
    });

    const snapshot = { round: race.roundNumber };

    Object.keys(cumulative).forEach((driverId) => {
      const driver = driverMap[driverId];
      if (!driver) return;

      const name = `${driver.firstName} ${driver.lastName}`;
      snapshot[name] = cumulative[driverId];
    });

    progression.push(snapshot);
  }

  res.json(progression);
};

/* =========================================================
   RACE commentary generation (AI-POWERED)
========================================================= */

const generateRaceCommentary = async ({
  season,
  race,
  winnerName,
  leaderName,
  gap,
  seasonPhase,
}) => {
  const commentators = [
    {
      name: "Crofty",
      style: "Excited play-by-play commentator",
    },
    {
      name: "Brundle",
      style: "Technical analytical expert",
    },
    {
      name: "Paddock Insider",
      style: "Political paddock journalist",
    },
  ];

  const outputs = [];

  for (const voice of commentators) {
    const prompt = `
You are ${voice.name}, a ${voice.style} in Formula 1 broadcast.

Round: ${race.roundNumber}
Season Phase: ${seasonPhase}
Winner: ${winnerName}
Championship Leader: ${leaderName}
Points Gap: ${gap}

Write ONE short broadcast commentary line.
No line breaks. Under 40 words.
`;

    let text = await generateAIText(prompt);
    text = text.replace(/\n/g, " ").trim();

    outputs.push({
      seasonId: season.id,
      round: race.roundNumber,
      commentator: voice.name,
      text,
    });
  }

  await Commentary.bulkCreate(outputs);
};

/* =========================================================
   RACE RECAP AI
========================================================= */
exports.getRaceRecapAI = async (req, res) => {
  const { PlayerCareer } = require("../models");
  try {
    const { raceWeekendId } = req.params;

    /* ===============================
       LOAD RACE + SEASON
    =============================== */

    const race = await RaceWeekend.findByPk(raceWeekendId);
    if (!race)
      return res.status(404).json({ message: "Race weekend not found" });

    const season = await Season.findByPk(race.seasonId);
    if (!season)
      return res.status(404).json({ message: "Season not found" });

    /* ===============================
       LOAD RESULTS
    =============================== */

    const results = await RaceResult.findAll({
      where: { raceWeekendId },
      include: [{ model: Driver, include: [Team] }],
      order: [["position", "ASC"]],
    });

    if (!results.length)
      return res.status(400).json({ message: "No race results found" });

    /* ===============================
       STANDINGS
    =============================== */

    const standings = await calculateDriverStandings(season.id);
    if (!standings?.length)
      return res.status(400).json({ message: "Standings unavailable" });

    const leader = standings[0];
    const p2 = standings[1];
    const gap = p2 ? leader.totalPoints - p2.totalPoints : 0;

    /* ===============================
       COMMENTARY CONTEXT
    =============================== */

    const seasonPhase = getSeasonPhase(
      race.roundNumber,
      season.raceCount
    );

    const titlePressure = getTitlePressure(gap);
    const momentum = getMomentum(standings);

    /* ===============================
       MEMORY CONTEXT
    =============================== */


    const playerCareer = await PlayerCareer.findOne({include: [Driver],});
    const previousMemories = await SeasonMemory.findAll({
      where: { seasonId: season.id },
      order: [["roundNumber", "ASC"]],
      limit: 5,
    });

    const memoryContext = previousMemories
      .map((m) => `Round ${m.roundNumber}: ${m.summary}`)
      .join(" ");

    /* ===============================
       NARRATIVE SIGNALS
    =============================== */

    const rivalry = detectRivalry(standings);
    const titleStatus = await detectTitleClinch(
      season,
      race.roundNumber
    );
    const controversy = detectControversy(results);
    const politicalTension = detectTeamTension(standings);

    const transferRumors = generateTransferRumorContext(
      standings,
      race.roundNumber,
      season.raceCount
    );

    /* ===============================
       WINNER DATA
    =============================== */

    const winner = results.find((r) => r.position === 1);
    if (!winner)
      return res.status(400).json({ message: "Winner not found" });

    const personality = getDriverPersonality(winner.driverId);
    const legacyContext = await getLegacyContext(winner.driverId);

    const winnerMorale = winner.Driver?.morale ?? 50;

    const winnerName = `${winner.Driver.firstName} ${winner.Driver.lastName}`;
    const winnerTeam = winner.Driver.Team?.name || "Unknown";

    const podium = results
      .filter((r) => r.position <= 3)
      .map(
        (r) =>
          `${r.Driver.firstName} ${r.Driver.lastName} (${r.Driver.Team?.name || "Unknown"})`
      );

    const fastestLap = results.find((r) => r.fastestLap);
    const fastestLapText = fastestLap
      ? `${fastestLap.Driver.firstName} ${fastestLap.Driver.lastName}`
      : "None";

    const dnfCount = results.filter((r) => r.dnf).length;

    const leaderDriver = await Driver.findByPk(leader.driverId);
    const leaderName = leaderDriver
      ? `${leaderDriver.firstName} ${leaderDriver.lastName}`
      : "Unknown";

    /* ===============================
       DYNASTY CONTEXT (STABLE POSITION)
    =============================== */

    const dynasty = await detectDriverDynasty(season.id);

    console.log("DYNASTY USED IN PROMPT:", dynasty);

    /* ===============================
       AI PROMPT
    =============================== */
    'Unknown';
    const playerContext = playerCareer
  ? `Player Driver: ${playerCareer.Driver.firstName} ${playerCareer.Driver.lastName}`
  : "No player driver.";
    const prompt = `
You are a serious professional Formula 1 commentator.

STRICT RULES:
- Use only provided data.
- Do not invent incidents.
- No line breaks.
- Under 250 words.

Season Context: ${memoryContext || "Season opener."}
Season Phase: ${seasonPhase}
Championship Pressure: ${titlePressure}
Momentum Trend: ${momentum}
Driver Personality: ${personality.style}
Winner Morale: ${winnerMorale}/100
Historical Status: ${legacyContext.championStatus}
Legacy Context: ${legacyContext.legacyNarrative}

${
  dynasty
    ? `
PRIMARY SEASON STORYLINE (HIGHEST PRIORITY):
${dynasty.message}

You MUST treat this as the central narrative of the season recap.
All analysis should acknowledge this dominance.
`
    : "No dominant dynasty storyline detected."
}

Round: ${race.roundNumber}
Weather: ${race.weather}
SafetyCar: ${race.safetyCar}
RedFlag: ${race.redFlag}

Winner: ${winnerName} (${winnerTeam})
Podium: ${podium.join(", ")}
Fastest Lap: ${fastestLapText}
DNFs: ${dnfCount}
Player Context: ${playerContext}
Championship Leader: ${leaderName}

Points Gap To P2: ${gap}
Title Clinched: ${titleStatus.clinched ? 'Yes' : 'No'}

Points Gap To P2: ${gap}
Title Clinched: ${titleStatus.clinched ? "Yes" : "No"}

Rivalry: ${rivalry?.message || "None"}
Controversy: ${controversy?.message || "None"}
Political Tension: ${politicalTension?.message || "None"}
Transfer Rumors: ${transferRumors?.message || "None"}

Generate dramatic but realistic recap.
`;

    /* ===============================
       GENERATE RECAP
    =============================== */

    let narrative = await generateAIText(prompt);
    narrative = narrative.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

    await SeasonMemory.create({
      seasonId: season.id,
      roundNumber: race.roundNumber,
      summary: narrative,
    });

    /* ===============================
       RESPONSE
    =============================== */

    return res.json({
      raceWeekendId,
      narrative,
      championship: {
        leader: leaderName,
        gap,
        rivalry: rivalry?.message || null,
        titleClinched: titleStatus.clinched,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "AI recap failed" });
  }
};

/* =========================================================
   CONSTRUCTOR STANDINGS
========================================================= */
exports.getConstructorStandings = async (req, res) => {
  const { seasonId } = req.params;

  const raceWeekends = await RaceWeekend.findAll({ where: { seasonId } });
  const raceIds = raceWeekends.map((r) => r.id);

  const results = await RaceResult.findAll({
    where: { raceWeekendId: raceIds },
  });

  const drivers = await Driver.findAll();
  const teams = await Team.findAll();

  const driverTeamMap = {};
  drivers.forEach((d) => (driverTeamMap[d.id] = d.teamId));

  const teamMap = {};
  teams.forEach((t) => (teamMap[t.id] = t.name));

  const constructorTable = {};

  results.forEach((r) => {
    const teamId = driverTeamMap[r.driverId];
    if (!teamId) return;

    if (!constructorTable[teamId]) {
      constructorTable[teamId] = {
        teamId,
        teamName: teamMap[teamId] || "Unknown",
        totalPoints: 0,
        wins: 0,
      };
    }

    let points = POINTS_MAP[r.position] || 0;
    if (r.fastestLap && r.position <= 10) points += 1;

    constructorTable[teamId].totalPoints += points;

    if (r.position === 1) constructorTable[teamId].wins += 1;
  });

  const sorted = Object.values(constructorTable).sort(
    (a, b) => b.totalPoints - a.totalPoints,
  );

  res.json(sorted);
};

/* =========================================================
   RACE RECAP DATA (NON-AI)
========================================================= */
exports.getRaceRecapData = async (req, res) => {
  const { raceWeekendId } = req.params;

  const race = await RaceWeekend.findByPk(raceWeekendId);
  if (!race) return res.status(404).json({ message: "Race not found" });

  const results = await RaceResult.findAll({
    where: { raceWeekendId },
    order: [["position", "ASC"]],
  });

  const drivers = await Driver.findAll();
  const driverMap = {};
  drivers.forEach((d) => (driverMap[d.id] = d));

  const winner = results.find((r) => r.position === 1);
  const podium = results.filter((r) => r.position <= 3);
  const fastestLap = results.find((r) => r.fastestLap);
  const dnfs = results.filter((r) => r.dnf);

  res.json({
    round: race.roundNumber,
    weather: race.weather,
    safetyCar: race.safetyCar,
    redFlag: race.redFlag,
    winner: winner
      ? `${driverMap[winner.driverId]?.firstName} ${driverMap[winner.driverId]?.lastName}`
      : null,
    podium: podium.map(
      (p) =>
        `${driverMap[p.driverId]?.firstName} ${driverMap[p.driverId]?.lastName}`,
    ),
    fastestLap: fastestLap
      ? `${driverMap[fastestLap.driverId]?.firstName} ${driverMap[fastestLap.driverId]?.lastName}`
      : null,
    dnfCount: dnfs.length,
  });
};

/* =========================================================
   FINALIZE SEASON HELPER (SAFE ADDITION)
========================================================= */
const finalizeSeasonIfNeeded = async (season) => {
  if (season.status === "completed") return null;

  const standings = await calculateDriverStandings(season.id);
  if (!standings?.length) return null;

  const champion = standings[0];

  await archiveSeasonLegacy(season);

  await season.update({
    status: "completed",
  });

  return {
    champion: champion.driverName,
    points: champion.totalPoints,
  };
};
/* =========================================================
   SIMULATE RACE
========================================================= */

exports.simulateRace = async (req, res) => {
  try {
    const { seasonId } = req.body;

    if (!seasonId) {
      return res.status(400).json({
        message: "seasonId required",
      });
    }

    const season = await Season.findByPk(seasonId);
    if (!season) return res.status(404).json({ message: "Season not found" });

    // Detect last simulated round
    const lastRace = await RaceWeekend.findOne({
      where: { seasonId },
      order: [["roundNumber", "DESC"]],
    });

    const nextRound = lastRace ? lastRace.roundNumber + 1 : 1;

    // season finished guard
    if (nextRound > season.raceCount) {
      return res.status(400).json({
        message: "Season already completed",
      });
    }

    const drivers = await Driver.findAll({
      where: { isActive: true },
    });

    if (drivers.length !== 20) {
      return res.status(400).json({
        message: "Exactly 20 active drivers required",
      });
    }

    const shuffled = shuffleArray(drivers);

    const transaction = await sequelize.transaction();

    try {
      // create weekend
      const raceWeekend = await RaceWeekend.create(
        {
          seasonId,
          roundNumber: nextRound,
          weather: "Dry",
          safetyCar: false,
          redFlag: false,
        },
        { transaction },
      );

      const generatedResults = shuffled.map((driver, index) => ({
        raceWeekendId: raceWeekend.id,
        driverId: driver.id,
        position: index + 1,
        fastestLap: index === Math.floor(Math.random() * 10),
        dnf: false,
      }));

      await RaceResult.bulkCreate(generatedResults, { transaction });

      await updateMoraleAfterRace(generatedResults, Driver);

      await transaction.commit();

      /* ===============================
         ✅ SEASON FINALE CHECK
      =============================== */

      let finale = null;

      if (nextRound === season.raceCount) {
        finale = await finalizeSeasonIfNeeded(season);
      }

      return res.status(201).json({
        message: "Race simulated successfully",
        raceWeekendId: raceWeekend.id,
        roundNumber: nextRound,
        seasonCompleted: !!finale,
        finale,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error("simulateRace error:", error);
    res.status(500).json({ message: "Simulation failed" });
  }
};
/* =========================================================
   SIMULATE NEWS
========================================================= */

exports.getSeasonNews = async (req, res) => {
  try {
    const { seasonId } = req.params;

    const news = await NewsFeed.findAll({
      where: { seasonId },
      order: [["roundNumber", "DESC"]],
    });

    res.json(news);
  } catch (err) {
    console.error("getSeasonNews error:", err);
    res.status(500).json({ message: "Failed to fetch news" });
  }
};

/* =========================================================
   FINALIZE SEASON
========================================================= */
exports.finalizeSeason = async (req, res) => {
  try {
    const { seasonId } = req.params;

    const season = await Season.findByPk(seasonId);
    if (!season) return res.status(404).json({ message: "Season not found" });

    if (season.status === "completed") {
      return res.json({ message: "Season already completed" });
    }

    // get standings using existing logic
    const standings = await calculateDriverStandings(seasonId);

    if (!standings.length) {
      return res.status(400).json({
        message: "No standings available",
      });
    }

    const champion = standings[0];

    await season.update({
      status: "completed",
    });

    res.json({
      message: "Season finalized",
      champion,
    });
  } catch (error) {
    console.error("finalizeSeason error:", error);
    res.status(500).json({ message: "Failed to finalize season" });
  }
};

/* =========================================================
   COMMENTARY FEED
========================================================= */
exports.getSeasonCommentary = async (req, res) => {
  try {
    const { seasonId } = req.params;

    const memories = await SeasonMemory.findAll({
      where: { seasonId },
      order: [["roundNumber", "DESC"]],
    });

    const commentary = memories.map((m) => ({
      round: m.roundNumber,
      commentary: m.summary,
    }));

    res.json(commentary);
  } catch (err) {
    console.error("getSeasonCommentary error:", err);
    res.status(500).json({ message: "Failed to fetch commentary" });
  }
};

/* =========================================================
   CHAMPIONSHIP SUMMARY
========================================================= */
exports.getChampionshipSummary = async (req, res) => {
  try {
    const { seasonId } = req.params;

    const season = await Season.findByPk(seasonId);
    if (!season)
      return res.status(404).json({
        message: "Season not found",
      });

    const summary = await buildChampionshipSummary(season);

    if (!summary) {
      return res.status(400).json({
        message: "No championship data yet",
      });
    }

    res.json(summary);
  } catch (error) {
    console.error("championshipSummary error:", error);
    res.status(500).json({
      message: "Failed to build summary",
    });
  }
};

//* =========================================================
// GET LATEST RACE (FOR COMMENTARY FEED)
//* =========================================================



exports.getLatestRace = async (req, res) => {
  try {
    const { seasonId } = req.params;

    const race = await RaceWeekend.findOne({
      where: { seasonId },
      order: [["roundNumber", "DESC"]],
    });

    if (!race)
      return res.status(404).json({ message: "No races yet" });

    res.json(race);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch latest race" });
  }
};