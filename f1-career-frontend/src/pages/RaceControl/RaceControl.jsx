import { useState, useEffect } from "react";
import { useSeason } from "../../context/SeasonContext";
import {
  simulateRace,
  fetchRaceResults,
  fetchAIRecap,
} from "../../services/raceService";
import GlassCard from "../../components/ui/GlassCard";
import { motion } from "framer-motion";
import "./raceControl.css";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/F1_theme.mp3";

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
  const [sessionState, setSessionState] = useState("idle");

  /* ===============================
     ✅ SEASON STATUS CHECK
  =============================== */
  const isSeasonCompleted = season?.status === "completed";

  useBackgroundAudio(f1Music, {
    volume: 0.35,
    loop: true,
  });

  /* ===============================
     LOCK CONTROL ROOM WHEN FINISHED
  =============================== */
  useEffect(() => {
    if (isSeasonCompleted) {
      setSessionState("finished");
    }
  }, [isSeasonCompleted]);

  /* ===============================
     SIMULATION ENGINE
  =============================== */
  const handleSimulate = async () => {
    try {
      setMessage(null);

      setSessionState("red");
      setSimLoading(true);

      await new Promise((r) => setTimeout(r, 800));

      setSessionState("yellow");
      await new Promise((r) => setTimeout(r, 800));

      setSessionState("green");

      const simResponse = await simulateRace(season.id);

      setCurrentRound(simResponse.roundNumber);

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
      setSessionState("finished");
    } catch (error) {
      console.error(error);
      setMessage("🏁 Season already completed.");
    } finally {
      setSimLoading(false);
      setAiLoading(false);
    }
  };

  /* ===============================
     UI
  =============================== */

  return (
    <div className="race-control-container">
      {/* ================= HEADER ================= */}
      <div className="control-header">
        <h1>Race Control Center</h1>

        <div className="session-lights">
          <div
            className={`light red ${
              sessionState === "red" ? "active" : ""
            }`}
          />
          <div
            className={`light yellow ${
              sessionState === "yellow" ? "active" : ""
            }`}
          />
          <div
            className={`light green ${
              sessionState === "green" ||
              sessionState === "finished"
                ? "active"
                : ""
            }`}
          />
        </div>
      </div>

      {currentRound && (
        <div className="round-info">
          Round {currentRound} Completed
        </div>
      )}

      {/* ================= CONTROL BUTTON ================= */}
      <GlassCard>
        <button
          className="simulate-btn"
          onClick={() => {
            if (isSeasonCompleted) {
              setMessage("🏁 Season already completed.");
              return;
            }

            if (isSimulated) {
              setMessage(
                "Simulation already ran once for this round. Move to next round."
              );
              return;
            }

            handleSimulate();
          }}
          disabled={
            simLoading ||
            aiLoading ||
            isSeasonCompleted ||
            message?.includes("Season Completed")
          }
        >
          {simLoading
            ? "Simulating Race..."
            : aiLoading
            ? "Generating AI Recap..."
            : "Simulate Race"}
        </button>
      </GlassCard>

      {message && <div className="info-message">{message}</div>}

      {/* ================= SEASON COMPLETED UI ================= */}
      {isSeasonCompleted && (
        <motion.div
          className="season-finale"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🏁 Season Completed — Race Control Closed
          <br />
          All sessions finished. Await next championship.
        </motion.div>
      )}

      {/* ================= LOADERS ================= */}
      {(simLoading || aiLoading) && (
        <div className="status-feed">
          {simLoading && "Race simulation running..."}
          {aiLoading && " AI generating broadcast recap..."}
        </div>
      )}

      {/* ================= RESULTS ================= */}
      {results && (
        <GlassCard>
          <h2>🏁 Official Classification</h2>
          <p>
            <strong>Winner:</strong> {results.winner}
          </p>
          <p>
            <strong>Podium:</strong> {results.podium.join(", ")}
          </p>
          <p>
            <strong>Fastest Lap:</strong> {results.fastestLap}
          </p>
          <p>
            <strong>DNFs:</strong> {results.dnfCount}
          </p>
        </GlassCard>
      )}

      {/* ================= AI RECAP ================= */}
      {recap && (
        <GlassCard>
          <h2>🎬 Drive To Survive Recap</h2>
          <p>{recap.narrative}</p>

          <div className="championship-box">
            <p>Leader: {recap.championship.leader}</p>
            <p>Gap: {recap.championship.gap} pts</p>
            {recap.championship.rivalry && (
              <p>Rivalry: {recap.championship.rivalry}</p>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}