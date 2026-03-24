const { RaceResult, RaceWeekend, Driver, Team } = require("../../models");
const { detectDriverDynasty } = require("../dynastyService");

exports.generateRaceNews = async (seasonId) => {
  const news = [];

  const weekends = await RaceWeekend.findAll({
    where: { seasonId },
    order: [["roundNumber", "ASC"]],
  });

  if (!weekends.length) return news;

  const results = await RaceResult.findAll({
    where: { raceWeekendId: weekends.map(w => w.id) },
    include: [{ model: Driver, include: [Team] }],
  });

  /* =========================
     🏆 LAST RACE WINNER STORY
  ========================= */
  const lastWeekend = weekends[weekends.length - 1];

  const lastRaceWinner = results.find(
    r => r.raceWeekendId === lastWeekend.id && r.position === 1
  );

  if (lastRaceWinner) {
    news.push({
      type: "WINNER",
      text: `${lastRaceWinner.Driver.firstName} ${lastRaceWinner.Driver.lastName} wins Round ${lastWeekend.roundNumber}.`,
    });
  }

  /* =========================
     🔥 DOMINANCE STORY
  ========================= */
  const dominance = await detectDriverDynasty(seasonId);

  if (dominance) {
    news.push({
      type: "DOMINANCE",
      text: dominance.message,
    });
  }

  return news;
};