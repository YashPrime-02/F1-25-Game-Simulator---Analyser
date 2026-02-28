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

  useEffect(() => {
    // Wait until season is loaded
    if (!season) return;

    const loadData = async () => {
      try {
        const data = await fetchDriverStandings(season.id);
        setStandings(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [season]);

  if (seasonLoading) {
    return <p>Loading Season...</p>;
  }

  if (!season) {
    return (
      <GlassCard>
        <h2>No Active Season</h2>
        <p>Please create a career and start a season.</p>
      </GlassCard>
    );
  }

  if (loading) {
    return <p>Loading Championship Table...</p>;
  }

  if (error) {
    return <p>Failed to load standings.</p>;
  }


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
          {standings.map((driver, index) => (
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
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
}

export default Standings;
