/* =========================================================
   COMMENTARY CONTEXT SERVICE
========================================================= */

const getSeasonPhase = (round, total) => {
  const ratio = round / total;

  if (ratio < 0.3) return "Season Opener Phase";
  if (ratio < 0.75) return "Championship Battle Phase";
  return "Final Title Decider Phase";
};

const getTitlePressure = (gap) => {
  if (gap <= 5) return "EXTREME pressure";
  if (gap <= 15) return "HIGH pressure";
  if (gap <= 35) return "manageable pressure";
  return "comfortable championship lead";
};

const getMomentum = (standings) => {
  if (!standings?.length) return "unknown";

  const leader = standings[0];
  const challenger = standings[1];

  if (!challenger) return "leader dominance";

  const gap = leader.totalPoints - challenger.totalPoints;

  if (gap <= 5) return "title fight intensifying";
  if (gap <= 15) return "battle building";
  return "leader pulling away";
};

module.exports = {
  getSeasonPhase,
  getTitlePressure,
  getMomentum,
};