// src/services/championshipService.js

const { RaceWeekend, RaceResult } = require('../models');

const pointsMap = {
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

exports.calculateDriverStandings = async (seasonId) => {
  const raceWeekends = await RaceWeekend.findAll({
    where: { seasonId },
  });

  const raceIds = raceWeekends.map((r) => r.id);

  const results = await RaceResult.findAll({
    where: { raceWeekendId: raceIds }
  });

  const standings = {};

  results.forEach((r) => {
    const base = pointsMap[r.position] || 0;
    const flBonus = r.fastestLap && r.position <= 10 ? 1 : 0;
    const pts = base + flBonus;

    if (!standings[r.driverId]) standings[r.driverId] = 0;
    standings[r.driverId] += pts;
  });

  return Object.entries(standings)
    .map(([driverId, totalPoints]) => ({
      driverId: Number(driverId),
      totalPoints,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);
};

exports.detectTitleClinch = async (season, currentRound) => {
  const standings = await exports.calculateDriverStandings(season.id);

  if (standings.length < 2) return null;

  const leader = standings[0];
  const p2 = standings[1];

  const gap = leader.totalPoints - p2.totalPoints;

  const remainingRaces = season.raceCount - currentRound;
  const maxPointsAvailable = remainingRaces * 26; // 25 + FL

  if (gap > maxPointsAvailable) {
    return {
      clinched: true,
      driverId: leader.driverId,
      gap,
    };
  }

  return { clinched: false };
};