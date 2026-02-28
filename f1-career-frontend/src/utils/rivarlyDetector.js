export const detectRivalryFrontend = (standings) => {
  if (!standings || standings.length < 2) return null;

  const gap =
    standings[0].totalPoints - standings[1].totalPoints;

  if (gap <= 10) {
    return `${standings[0].driverName} vs ${standings[1].driverName} title fight intensifies`;
  }

  return null;
};