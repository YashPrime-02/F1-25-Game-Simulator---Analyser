const {
  Season,
  Driver,
  SeasonMemory,
} = require("../models");

const { calculateDriverStandings } = require("./championshipService");
const { generateAIText } = require("./aiService");

const finalizeSeasonIfNeeded = async (season) => {

  if (season.status === "completed") return null;

  const standings = await calculateDriverStandings(season.id);
  if (!standings.length) return null;

  const champion = standings[0];

  const championDriver = await Driver.findByPk(champion.driverId);

  const championName =
    championDriver.firstName + " " + championDriver.lastName;

  const prompt = `
You are an official Formula 1 championship commentator.
Write a dramatic season finale summary.
Under 200 words.
No line breaks.

Champion: ${championName}
Points: ${champion.totalPoints}
Season Year: ${season.year}
`;

  let summary = await generateAIText(prompt);
  summary = summary.replace(/\n/g, " ").trim();

  await SeasonMemory.create({
    seasonId: season.id,
    roundNumber: season.raceCount,
    summary,
  });

  season.status = "completed";
  await season.save();

  return {
    champion: championName,
    summary,
  };
};

module.exports = {
  finalizeSeasonIfNeeded,
};