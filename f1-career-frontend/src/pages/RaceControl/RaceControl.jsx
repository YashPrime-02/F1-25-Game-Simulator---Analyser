import { useState, useEffect } from "react";
import { useSeason } from "../../context/SeasonContext";
import {
  simulateRace,
  fetchRaceResults,
  fetchAIRecap
} from "../../services/raceService";
import api from "../../services/api";

import GlassCard from "../../components/ui/GlassCard";
import { motion } from "framer-motion";
import "./raceControl.css";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/F1_theme.mp3";
import LiveRaceTimeline from "../Timeline/Timeline";

export default function RaceControl() {

  const { season, reloadSeason } = useSeason();

  const [completedRounds, setCompletedRounds] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);

  const [raceWeekendId, setRaceWeekendId] = useState(null);
  const [results, setResults] = useState(null);
  const [recap, setRecap] = useState(null);

  const [simLoading, setSimLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [sessionState, setSessionState] = useState("idle");
  const [showTimeline, setShowTimeline] = useState(false);

  useBackgroundAudio(f1Music, {
    volume: 0.35,
    loop: true,
  });

  /* ==================================================
     LOAD SEASON PROGRESS FROM BACKEND
  ================================================== */

  const loadSeasonProgress = async () => {

    if (!season?.id) return;

    try {

      const res = await api.get(`/season/progress/${season.id}`);
      const data = res.data;

      setCompletedRounds(data.completed);
      setCurrentRound(data.completed);

    } catch (err) {

      console.error("Progress load failed");
      setCompletedRounds(0);
      setCurrentRound(0);

    }

  };

  /* ==================================================
     RESET WHEN SEASON CHANGES
  ================================================== */

  useEffect(() => {

    setRaceWeekendId(null);
    setResults(null);
    setRecap(null);
    setMessage(null);
    setSessionState("idle");

    loadSeasonProgress();

  }, [season?.id]);

  /* ==================================================
     DETERMINE IF SEASON FINISHED
  ================================================== */

  const isSeasonCompleted =
    season && completedRounds >= season.raceCount;

  useEffect(() => {

    if (isSeasonCompleted) {
      setSessionState("finished");
    } else {
      setSessionState("idle");
    }

  }, [completedRounds, season]);

  /* ==================================================
     SIMULATION ENGINE
  ================================================== */

  const handleSimulate = async () => {

    try {

      setMessage(null);

      setSessionState("red");
      setSimLoading(true);

      await new Promise(r => setTimeout(r, 700));

      setSessionState("yellow");
      await new Promise(r => setTimeout(r, 700));

      setSessionState("green");

      const simResponse = await simulateRace(season.id);

      const weekendId = simResponse.raceWeekendId;

      setRaceWeekendId(weekendId);

      /* refresh progress */

      await loadSeasonProgress();

      /* ================= RESULTS ================= */

      const raceData = await fetchRaceResults(weekendId);

      setResults(raceData);

      setShowTimeline(true);

      setSimLoading(false);
      setAiLoading(true);

      const aiData = await fetchAIRecap(weekendId);

      setRecap(aiData);

      setShowTimeline(false);

      setSessionState("finished");

      /* ================= SEASON FINISHED ================= */

      if (simResponse.seasonCompleted) {

        setMessage(
          `🏆 Season Completed! Champion: ${simResponse.finale?.champion}`
        );

        await reloadSeason(); // load new season

      }

    } catch (error) {

      console.error(error);

      setMessage("Season already completed.");

    } finally {

      setSimLoading(false);
      setAiLoading(false);

    }

  };

  /* ==================================================
     UI
  ================================================== */

  return (

    <div className="race-control-container">

      {showTimeline && results && (
        <LiveRaceTimeline
          results={results}
          onFinish={() => setShowTimeline(false)}
        />
      )}

      <div className="control-header">

        <h1>Race Control Center</h1>

        <div className="session-lights">

          <div className={`light red ${sessionState === "red" ? "active" : ""}`} />
          <div className={`light yellow ${sessionState === "yellow" ? "active" : ""}`} />
          <div className={`light green ${sessionState !== "idle" ? "active" : ""}`} />

        </div>

      </div>

      {currentRound > 0 && (
        <div className="round-info">
          Round {currentRound} Completed
        </div>
      )}

      <GlassCard>

        <button
          className="simulate-btn"
          onClick={handleSimulate}
          disabled={
            simLoading ||
            aiLoading ||
            isSeasonCompleted
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

      {isSeasonCompleted && (
        <motion.div
          className="season-finale"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          🏁 Season Completed — Race Control Closed
        </motion.div>
      )}

      {(simLoading || aiLoading) && (
        <div className="status-feed">
          {simLoading && "Race simulation running..."}
          {aiLoading && "AI generating broadcast recap..."}
        </div>
      )}

      {results && !showTimeline && (
        <GlassCard>

          <h2>🏁 Official Classification</h2>

          <p><strong>Winner:</strong> {results.winner}</p>
          <p><strong>Podium:</strong> {results.podium.join(", ")}</p>
          <p><strong>Fastest Lap:</strong> {results.fastestLap}</p>
          <p><strong>DNFs:</strong> {results.dnfCount}</p>

        </GlassCard>
      )}

      {recap && (
        <GlassCard>

          <h2>🎬 Drive To Survive Recap</h2>

          <p>{recap.narrative}</p>

          <div className="championship-box">

            <p>Leader: {recap.championship.leader}</p>
            <p>Gap: {recap.championship.gap} pts</p>

          </div>

        </GlassCard>
      )}

    </div>

  );

}