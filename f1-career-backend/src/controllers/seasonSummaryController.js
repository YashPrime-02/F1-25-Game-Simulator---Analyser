const {
  Season,
  RaceWeekend,
  RaceResult,
  Driver,
  Team
} = require("../models");

const { Op } = require("sequelize");

/* ===============================
   F1 POINT SYSTEM
=============================== */
const F1_POINTS = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1
};

exports.getSeasonProgress = async (req, res) => {
  try {

    const { seasonId } = req.params;

    console.log("\n==============================");
    console.log("🚀 SEASON PROGRESS START");
    console.log("Season ID:", seasonId);

    const season = await Season.findByPk(seasonId);

    if (!season) {
      console.log("❌ Season not found");
      return res.status(404).json({ message: "Season not found" });
    }

    /* ===============================
       WEEKENDS
    =============================== */

    const weekends = await RaceWeekend.findAll({ where: { seasonId } });
    const weekendIds = weekends.map(w => w.id);

    console.log("🟡 Total weekends:", weekendIds.length);

    /* ===============================
       RESULTS
    =============================== */

    const results = await RaceResult.findAll({
      where: {
        raceWeekendId: {
          [Op.in]: weekendIds
        }
      }
    });

    console.log("🟢 Total results:", results.length);

    /* ===============================
       GROUP BY RACE
    =============================== */

    const raceMap = {};

    for (const r of results) {
      if (!raceMap[r.raceWeekendId]) {
        raceMap[r.raceWeekendId] = [];
      }
      raceMap[r.raceWeekendId].push(r);
    }

    console.log("\n📊 RACE BREAKDOWN:");
    Object.entries(raceMap).forEach(([raceId, raceResults]) => {
      console.log(`Race ${raceId} → ${raceResults.length} drivers`);
    });

    /* ===============================
       COMPLETION
    =============================== */

    const completed = Object.keys(raceMap).length;

    const percent = (
      (completed / season.raceCount) * 100
    ).toFixed(1);

    const seasonComplete = completed >= season.raceCount;

    console.log("\n📈 Progress:", percent + "%");
    console.log("🏁 Season Complete:", seasonComplete);

    let driverChampion = null;
    let constructorChampion = null;

    let driverStandings = [];
    let constructorStandings = [];

    /* ===============================
       CALCULATIONS
    =============================== */

    if (seasonComplete) {

      console.log("\n🔥 CALCULATING STANDINGS...\n");

      const driverPoints = {};
      const driverWins = {};
      const driverPodiums = {};

      /* ===== PER RACE DEBUG ===== */

      for (const [raceId, raceResults] of Object.entries(raceMap)) {

        const winner = raceResults.find(r => r.position === 1);

        console.log(`🏎️ Race ${raceId} Winner → Driver ${winner?.driverId}`);

        for (const r of raceResults) {

          let points = F1_POINTS[r.position] || 0;

          // Fastest lap
          if ((r.fastestLap === true || r.fastestLap === "true") && r.position <= 10) {
            points += 1;
          }

          // DNF
          if (r.dnf) {
            points = 0;
          }

          if (!driverPoints[r.driverId]) {
            driverPoints[r.driverId] = 0;
            driverWins[r.driverId] = 0;
            driverPodiums[r.driverId] = 0;
          }

          driverPoints[r.driverId] += points;

          if (r.position === 1) driverWins[r.driverId]++;
          if (r.position <= 3) driverPodiums[r.driverId]++;
        }
      }

      console.log("\n🏁 DRIVER POINTS:", driverPoints);
      console.log("🏆 DRIVER WINS:", driverWins);
      console.log("🥉 DRIVER PODIUMS:", driverPodiums);

      /* ===============================
         DRIVER STANDINGS
      =============================== */

      const sortedDrivers = Object.entries(driverPoints)
        .sort((a, b) => b[1] - a[1]);

      driverStandings = await Promise.all(
        sortedDrivers.map(async ([driverId, points]) => {
          const driver = await Driver.findByPk(driverId);

          return {
            driverId,
            name: `${driver.firstName} ${driver.lastName}`,
            points,
            wins: driverWins[driverId],
            podiums: driverPodiums[driverId]
          };
        })
      );

      console.log("\n🥇 FINAL DRIVER STANDINGS:");
      console.log(driverStandings.slice(0, 5));

      driverChampion = driverStandings[0]?.name;

      /* ===============================
         CONSTRUCTORS
      =============================== */

      const drivers = await Driver.findAll();

      const driverTeamMap = {};
      drivers.forEach(d => {
        driverTeamMap[d.id] = d.teamId;
      });

      const constructorPoints = {};

      for (const r of results) {

        const teamId = r.teamId || driverTeamMap[r.driverId];
        if (!teamId) continue;

        let points = F1_POINTS[r.position] || 0;

        if ((r.fastestLap === true || r.fastestLap === "true") && r.position <= 10) {
          points += 1;
        }

        if (r.dnf) {
          points = 0;
        }

        if (!constructorPoints[teamId]) {
          constructorPoints[teamId] = 0;
        }

        constructorPoints[teamId] += points;
      }

      const sortedTeams = Object.entries(constructorPoints)
        .sort((a, b) => b[1] - a[1]);

      constructorStandings = await Promise.all(
        sortedTeams.map(async ([teamId, points]) => {
          const team = await Team.findByPk(teamId);

          return {
            teamId,
            name: team.name,
            points
          };
        })
      );

      console.log("\n🏆 FINAL CONSTRUCTOR STANDINGS:");
      console.log(constructorStandings.slice(0, 5));

      constructorChampion = constructorStandings[0]?.name;
    }

    console.log("\n🏁 FINAL CHAMPIONS:");
    console.log("Driver:", driverChampion);
    console.log("Constructor:", constructorChampion);

    console.log("==============================\n");

    /* ===============================
       RESPONSE
    =============================== */

    res.json({
      raceCount: season.raceCount,
      completed,
      percent,
      seasonComplete,
      driverChampion,
      constructorChampion,
      driverStandings,
      constructorStandings
    });

  } catch (err) {

    console.error("❌ Season progress error:", err);

    res.status(500).json({
      message: "Season progress error"
    });

  }
};