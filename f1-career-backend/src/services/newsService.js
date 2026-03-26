const {
  RaceResult,
  RaceWeekend,
  Driver,
  Team,
  NewsFeed,
} = require("../models");

const { detectDriverDynasty } = require("./dynastyService");

exports.generateRaceNews = async (seasonId) => {
  const news = [];

  const weekends = await RaceWeekend.findAll({
    where: { seasonId },
    order: [["roundNumber", "ASC"]],
  });

  if (!weekends.length) return;

  const lastWeekend = weekends[weekends.length - 1];

  const results = await RaceResult.findAll({
    where: { raceWeekendId: lastWeekend.id },
    include: [{ model: Driver, include: [Team] }],
  });

  /* =========================
     🏆 WINNER
  ========================= */
  const winner = results.find((r) => r.position === 1);

  if (winner) {
    news.push({
      seasonId,
      roundNumber: lastWeekend.roundNumber,
      headline: "Race Winner",
      content: `${winner.Driver.firstName} ${winner.Driver.lastName} wins Round ${lastWeekend.roundNumber}.`,
    });
  }

  /* =========================
     💥 INCIDENTS
  ========================= */
  const dnfs = results.filter((r) => r.dnf);

  if (dnfs.length >= 2) {
    news.push({
      seasonId,
      roundNumber: lastWeekend.roundNumber,
      headline: "Race Drama",
      content: `${dnfs.length} drivers retired from the race causing major disruption.`,
    });
  }

  /* =========================
     🔥 DOMINANCE
  ========================= */
  const dominance = await detectDriverDynasty(seasonId);

  if (dominance) {
    news.push({
      seasonId,
      roundNumber: lastWeekend.roundNumber,
      headline: "Dominance",
      content: dominance.message,
    });
  }

  /* =========================
     SAVE
  ========================= */
  for (const item of news) {
    await NewsFeed.create(item);
  }
};