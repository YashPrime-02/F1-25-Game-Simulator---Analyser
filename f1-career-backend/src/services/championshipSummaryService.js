// src/services/championshipSummaryService.js

const { calculateDriverStandings } = require("./championshipService");
const { detectRivalry } = require("./narrativeService");
const { RaceWeekend } = require("../models");

/* ===============================
   Season Phase Logic
=============================== */
const getSeasonPhase = (round, total) => {
  const ratio = round / total;

  if (ratio < 0.3) return "Season Opener Phase";
  if (ratio < 0.75) return "Championship Battle Phase";
  return "Final Title Decider Phase";
};

/* ===============================
   Momentum Detector (v1)
=============================== */
const detectMomentum = (standings) => {
  if (!standings.length) return null;

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
  const standings = await calculateDriverStandings(season.id);

  if (!standings || standings.length === 0) {
    return null;
  }

  const leader = standings[0];
  const p2 = standings[1];

  const gap = p2
    ? leader.totalPoints - p2.totalPoints
    : 0;

  // latest round
  const lastRace = await RaceWeekend.findOne({
    where: { seasonId: season.id },
    order: [["roundNumber", "DESC"]],
  });

  const currentRound = lastRace?.roundNumber || 0;

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