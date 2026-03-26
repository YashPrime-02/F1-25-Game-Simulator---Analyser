const { RaceResult, RaceWeekend, Driver, Team, NewsFeed } = require("../../models");
const { detectDriverDynasty } = require("../dynastyService");

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
      content: `${winner.Driver.firstName} ${winner.Driver.lastName} takes victory in Round ${lastWeekend.roundNumber}.`,
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
      content: `${dnfs.length} drivers failed to finish, triggering chaos and reshuffling the order.`,
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
     ⚔️ RIVALRY (simple gap logic)
  ========================= */

  const allResults = await RaceResult.findAll({
    where: { raceWeekendId: weekends.map((w) => w.id) },
  });

  const winCount = {};

  allResults.forEach((r) => {
    if (r.position === 1) {
      winCount[r.driverId] = (winCount[r.driverId] || 0) + 1;
    }
  });

  const topDrivers = Object.entries(winCount).sort((a, b) => b[1] - a[1]);

  if (topDrivers.length >= 2) {
    const diff = topDrivers[0][1] - topDrivers[1][1];

    if (diff <= 1) {
      news.push({
        seasonId,
        roundNumber: lastWeekend.roundNumber,
        headline: "Title Fight",
        content: "The championship battle is intensifying with no clear leader.",
      });
    }
  }

  /* =========================
     SAVE TO DB (IMPORTANT)
  ========================= */

  for (const item of news) {
    await NewsFeed.create(item);
  }
};