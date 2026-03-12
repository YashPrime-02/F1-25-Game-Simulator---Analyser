export const getSeasonPhase = (round, total) => {
  const ratio = round / total;

  if (ratio < 0.3) return "Season Opener Phase";
  if (ratio < 0.75) return "Championship Battle Phase";
  return "Final Title Decider Phase";
};