// src/services/simulation/politicsService.js

exports.detectTeamTension = (standings) => {
  if (standings.length < 2) return null;

  const leader = standings[0];
  const p2 = standings[1];

  if (leader.totalPoints - p2.totalPoints < 10) {
    return {
      active: true,
      message: 'Internal team pressure increasing as title fight tightens.',
    };
  }

  return { active: false };
};