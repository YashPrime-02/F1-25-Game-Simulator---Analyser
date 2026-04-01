import { useEffect, useState } from "react";
import { fetchDriverStandings } from "../../services/standingsService";
import { useSeason } from "../../context/SeasonContext";
import GlassCard from "../../components/ui/GlassCard";
import Counter from "../../components/ui/Counter";
import { motion } from "framer-motion";
import "./standings.css";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/F1_theme.mp3";

function Standings() {
  const { season, loading: seasonLoading } = useSeason();

  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useBackgroundAudio(f1Music, {
    volume: 0.35,
    loop: true
  });

  /* ===============================
     LOAD DATA
  =============================== */

  useEffect(() => {
    if (!season) return;

    console.log("🟡 Season Loaded:", season);

    const loadData = async () => {
      try {
        console.log("📡 Fetching standings for season:", season.id);

        const data = await fetchDriverStandings(season.id);

        console.log("🟢 API RESPONSE (RAW):", data);

        // 🔥 Deep inspection
        if (Array.isArray(data)) {
          console.log("📊 Total Drivers:", data.length);
          console.log("🥇 Top 5 Drivers:", data.slice(0, 5));
        } else {
          console.warn("⚠️ Unexpected API format:", data);
        }

        setStandings(data);

      } catch (err) {
        console.error("❌ API ERROR:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [season]);

  /* ===============================
     STATE CHANGE DEBUG
  =============================== */

  useEffect(() => {
    if (standings.length > 0) {
      console.log("📦 STATE UPDATED (standings):", standings);

      console.log("🔍 FIRST DRIVER:", standings[0]);

      // 🔥 Check team consistency
      console.log("🏎️ TEAM CHECK (Top 5):");
      standings.slice(0, 5).forEach((d, i) => {
        console.log(
          `#${i + 1} ${d.driverName} → ${d.teamName} (${d.totalPoints} pts)`
        );
      });
    }
  }, [standings]);

  /* ===============================
     LOADING STATES
  =============================== */

  if (seasonLoading) {
    console.log("⏳ Season still loading...");
    return <p>Loading Season...</p>;
  }

  if (!season) {
    console.warn("⚠️ No active season found");
    return (
      <GlassCard>
        <h2>No Active Season</h2>
        <p>Please create a career and start a season.</p>
      </GlassCard>
    );
  }

  if (loading) {
    console.log("⏳ Standings loading...");
    return <p>Loading Championship Table...</p>;
  }

  if (error) {
    console.error("❌ Failed to load standings UI");
    return <p>Failed to load standings.</p>;
  }

  /* ===============================
     RENDER
  =============================== */

  console.log("🎯 FINAL RENDER DATA:", standings);

  return (
    <GlassCard>
      <h2>Driver Championship Standings</h2>

      <table className="standings-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Driver</th>
            <th>Team</th>
            <th>Points</th>
            <th>Wins</th>
            <th>Podiums</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((driver, index) => {
            // 🔥 Row-level debug (only top 3 to avoid spam)
            if (index < 3) {
              console.log("🧾 ROW DEBUG:", {
                position: index + 1,
                driver: driver.driverName,
                team: driver.teamName,
                points: driver.totalPoints
              });
            }

            return (
              <motion.tr
                key={driver.driverId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={index === 0 ? "leader-row" : ""}
              >
                <td>{index + 1}</td>
                <td>{driver.driverName}</td>
                <td>{driver.teamName}</td>
                <td>
                  <Counter value={driver.totalPoints} />
                </td>
                <td>{driver.wins}</td>
                <td>{driver.podiums}</td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </GlassCard>
  );
}

export default Standings;