import { useState } from "react";
import { useSeason } from "../../context/SeasonContext";
import {
  simulateRace,
  fetchRaceResults,
  fetchAIRecap,
} from "../../services/raceService";
import GlassCard from "../../components/ui/GlassCard";
import { motion } from "framer-motion";
import "./raceControl.css";

export default function RaceControl() {
  const { season } = useSeason();
  const [currentRound, setCurrentRound] = useState(null);
  const [raceData, setRaceData] = useState(null);
  const [raceWeekendId, setRaceWeekendId] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [results, setResults] = useState(null);
  const [recap, setRecap] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSimulate = async () => {
  try {
    setMessage(null);
    setSimLoading(true);

    const simResponse = await simulateRace(season.id);

    // round update
    setCurrentRound(simResponse.roundNumber);

    // ✅ finale message
    if (simResponse.seasonCompleted) {
      setMessage(
        `🏆 Season Completed! Champion: ${simResponse.finale?.champion}`
      );
    }

    const weekendId = simResponse.raceWeekendId;
    setRaceWeekendId(weekendId);

    const raceData = await fetchRaceResults(weekendId);
    setResults(raceData);

    setSimLoading(false);
    setAiLoading(true);

    const aiData = await fetchAIRecap(weekendId);
    setRecap(aiData);

    setIsSimulated(true);

  } catch (error) {
    if (error.response?.data?.message === "Season already completed") {
      setMessage("Season already finished.");
    } else {
      console.error(error);
    }
  } finally {
    setSimLoading(false);
    setAiLoading(false);
  }
};
  return (
    <div className="race-control-container">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Race Control Center
      </motion.h1>

      {currentRound && (
  <div className="round-info">
    Round {currentRound} Completed
  </div>
)}

      <GlassCard>
        <button
          className="simulate-btn"
          onClick={() => {
            if (isSimulated) {
              setMessage(
                "Simulation already ran once for this round. Move to next round.",
              );
              return;
            }
            handleSimulate();
          }}
          disabled={simLoading || aiLoading || message?.includes("Season Completed")}
        >
          {simLoading
            ? "Simulating Race..."
            : aiLoading
              ? "Generating AI Recap..."
              : "Simulate Race"}
        </button>
      </GlassCard>

      {message && <div className="info-message">{message}</div>}

      {/* ✅ AI Loader goes here */}
      {aiLoading && (
        <div className="ai-loader">
          AI is generating cinematic recap... please hold.
        </div>
      )}

      {results && (
        <div className="results-card">
          <h2>Race Results</h2>
          <p>Winner: {results.winner}</p>
          <p>Podium: {results.podium.join(", ")}</p>
          <p>Fastest Lap: {results.fastestLap}</p>
          <p>DNFs: {results.dnfCount}</p>
        </div>
      )}

      {recap && (
        <div className="recap-card">
          <h2>Drive To Survive Recap</h2>
          <p>{recap.narrative}</p>

          <div className="championship-box">
            <p>Leader: {recap.championship.leader}</p>
            <p>Gap: {recap.championship.gap} pts</p>
            {recap.championship.rivalry && (
              <p>Rivalry: {recap.championship.rivalry}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
