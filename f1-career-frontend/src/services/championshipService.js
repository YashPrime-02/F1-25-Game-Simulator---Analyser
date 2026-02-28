export const calculateTension = (standings) => {
  if (!standings || standings.length < 2) return 0;

  const gap = standings[0].totalPoints - standings[1].totalPoints;

  if (gap <= 5) return 100;   // title war
  if (gap <= 15) return 70;
  if (gap <= 30) return 40;
  return 15; // domination
};