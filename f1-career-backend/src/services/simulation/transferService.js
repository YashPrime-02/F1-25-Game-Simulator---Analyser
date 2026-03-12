// src/services/simulation/transferService.js

exports.generateTransferRumorContext = (standings, seasonRound, totalRounds) => {
  if (seasonRound < Math.floor(totalRounds / 2)) return null;

  const underperforming = standings.slice(-3);

  return {
    active: true,
    message: `Rumors circulating about drivers under pressure: ${underperforming
      .map(d => d.driverId)
      .join(', ')}`,
  };
};