// src/services/championshipSummaryService.js

const { calculateDriverStandings } = require("./championshipService");
const { detectRivalry } = require("./narrativeService");
const { RaceWeekend, RaceResult } = require("../models");

/* ===============================
   Season Phase Logic
=============================== */
const getSeasonPhase = (round, total) => {
  if (!total || total === 0) return "Season Not Started";

  const ratio = round / total;

  if (ratio < 0.3) return "Season Opener Phase";
  if (ratio < 0.75) return "Championship Battle Phase";
  return "Final Title Decider Phase";
};

/* ===============================
   Momentum Detector (v1)
=============================== */
const detectMomentum = (standings) => {
  if (!standings || standings.length === 0) return null;

  const leader = standings[0];

  if (leader.wins >= 3)
    return `${leader.driverName} building strong momentum`;

  if (leader.totalPoints < 25)
    return "Championship still wide open";

  return "Title fight stabilizing";
};

/* ===============================
   MAIN SUMMARY BUILDER
=============================== */
exports.buildChampionshipSummary = async (season) => {
  if (!season) return null;

  const standings = await calculateDriverStandings(season.id);

  if (!standings || standings.length === 0) {
    return null;
  }

  const leader = standings[0];
  const p2 = standings[1] || null;

  const gap = p2
    ? leader.totalPoints - p2.totalPoints
    : 0;

  /* ===============================
     Get Current Completed Round
  =============================== */
  const completedRoundsRaw = await RaceResult.findAll({
    attributes: ["raceWeekendId"],
    include: [
      {
        model: RaceWeekend,
        where: { seasonId: season.id },
        attributes: ["roundNumber"],
      },
    ],
    group: ["raceWeekendId", "RaceWeekend.id"],
  });

  const currentRound = completedRoundsRaw?.length || 0;

  const phase = getSeasonPhase(
    currentRound,
    season.raceCount
  );

  const rivalry = detectRivalry(standings);
  const momentum = detectMomentum(standings);

  return {
    leader: leader.driverName,
    gap,
    phase,
    rivalry: rivalry?.message || null,
    momentum,
    round: currentRound,
  };
};