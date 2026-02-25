import { useState } from "react";
import { useSeason } from "../../context/SeasonContext";
import { simulateRace, fetchRaceResults, fetchAIRecap } from "../../services/raceService";
import GlassCard from "../../components/ui/GlassCard";
import { motion } from "framer-motion";
import "./raceControl.css";

export default function RaceControl() {
  const { season } = useSeason();

  const [loading, setLoading] = useState(false);
  const [raceData, setRaceData] = useState(null);
  const [recap, setRecap] = useState(null);

  const handleSimulate = async () => {
    if (!season) return;

    try {
      setLoading(true);

      const simulation = await simulateRace(season.id, 1);

      const recapData = await fetchRaceResults(simulation.raceWeekendId);
      setRaceData(recapData);

      const aiData = await fetchAIRecap(simulation.raceWeekendId);
      setRecap(aiData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="race-control-container">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Race Control Center
      </motion.h1>

      <GlassCard>
        <button
          className="simulate-btn"
          onClick={handleSimulate}
          disabled={loading}
        >
          {loading ? "Simulating..." : "Simulate Race"}
        </button>
      </GlassCard>

      {raceData && (
        <GlassCard>
          <h2>Race Summary</h2>
          <p><strong>Winner:</strong> {raceData.winner}</p>
          <p><strong>Podium:</strong> {raceData.podium.join(", ")}</p>
          <p><strong>Fastest Lap:</strong> {raceData.fastestLap}</p>
          <p><strong>DNFs:</strong> {raceData.dnfCount}</p>
        </GlassCard>
      )}

      {recap && (
        <GlassCard>
          <h2>Drive To Survive Recap</h2>
          <p>{recap.narrative}</p>
        </GlassCard>
      )}
    </div>
  );
}

