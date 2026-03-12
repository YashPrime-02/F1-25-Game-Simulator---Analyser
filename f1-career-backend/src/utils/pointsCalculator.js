// src/utils/pointsCalculator.js

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

exports.calculatePoints = (results) => {
  return results.map((r) => {
    let points = POINTS_MAP[r.position] || 0;

    // Fastest lap bonus
    if (r.fastestLap && r.position <= 10) {
      points += 1;
    }

    return {
      driverId: r.driverId,
      position: r.position,
      points,
    };
  });
};