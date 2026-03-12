import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import GlassCard from "../../components/ui/GlassCard";
import { getRaceRecapAI, fetchRaceResults } from "../../services/raceService";

import "./RaceRecap.css";

import useRevealSequence from "../../hooks/useRevealSequence";
import TypewriterText from "../../components/ui/TypewriterText";
import Counter from "../../components/ui/Counter";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/F1_theme.mp3";

export default function RaceRecap() {

  const { raceWeekendId } = useParams();

  const pollingStopped = useRef(false);

  const [recap, setRecap] = useState(null);
  const [raceData, setRaceData] = useState(null);

  const [loadingResults, setLoadingResults] = useState(true);
  const [loadingRecap, setLoadingRecap] = useState(true);

  const visible = useRevealSequence(
    ["hero", "narrative", "podium", "championship"],
    900
  );

  useBackgroundAudio(f1Music, {
    volume: 0.35,
    loop: true
  });

  /* ======================================================
     LOAD RACE RESULTS
  ====================================================== */

  useEffect(() => {

    const loadResults = async () => {

      try {

        const id = Number(raceWeekendId);

        const raceResponse = await fetchRaceResults(id);

        setRaceData(raceResponse);

      } catch (err) {

        console.error("Race results load failed:", err);

      } finally {

        setLoadingResults(false);

      }

    };

    loadResults();

  }, [raceWeekendId]);


/* ======================================================
   LOAD AI RECAP (ONCE)
====================================================== */

useEffect(() => {

  const loadRecap = async () => {

    try {

      const id = Number(raceWeekendId);

      const aiData = await getRaceRecapAI(id);

      if (aiData) {
        setRecap(aiData);
      }

    } catch (err) {

      console.warn("AI recap not ready yet");

    } finally {

      setLoadingRecap(false);

    }

  };

  loadRecap();

}, [raceWeekendId]);
  /* ======================================================
     LOADER (ONLY FOR RESULTS)
  ====================================================== */

  if (loadingResults) {

    return (
      <div className="f1-loader">
        <div className="f1-loader-center">

          <div className="f1-scanline" />

          <h1 className="f1-loader-title">
            GENERATING RACE BROADCAST
          </h1>

          <p className="f1-loader-sub">
            Loading race telemetry...
          </p>

          <div className="f1-progress">
            <div className="f1-progress-bar" />
          </div>

        </div>
      </div>
    );

  }

  /* ======================================================
     UI
  ====================================================== */

  return (
    <>

      {/* HERO */}

      {visible.includes("hero") && (

        <div className="broadcast-enter recap-spacing">

          <GlassCard>

            <h1>🏁 Round {raceData?.round || "-"}</h1>

            <h2>
              {raceData?.winner || "Race data not yet available."}
            </h2>

            <p>Race Winner</p>

          </GlassCard>

        </div>

      )}

      {/* NARRATIVE */}

      {visible.includes("narrative") && (

        <div className="broadcast-enter recap-spacing">

          <GlassCard>

            <h2>Race Recap</h2>

            {recap?.narrative ? (
              <TypewriterText text={recap.narrative} />
            ) : (
              <p>AI broadcast recap still generating...</p>
            )}

          </GlassCard>

        </div>

      )}

      {/* PODIUM */}

      {visible.includes("podium") && (

        <div className="broadcast-enter recap-spacing">

          <GlassCard>

            <h2>Podium Finishers</h2>

            {raceData?.podium?.length ? (

              raceData.podium.map((driver, i) => (
                <p key={i}>
                  P{i + 1} — {driver}
                </p>
              ))

            ) : (

              <p>No podium data available.</p>

            )}

          </GlassCard>

        </div>

      )}

      {/* CHAMPIONSHIP */}

      {visible.includes("championship") && (

        <div className="broadcast-enter recap-spacing">

          <GlassCard>

            <h2>Championship Situation</h2>

            <p>
              Leader: <strong>{recap?.championship?.leader || "Unknown"}</strong>
            </p>

            <p>
              Gap: <Counter value={recap?.championship?.gap ?? 0} /> pts
            </p>

            {recap?.championship?.rivalry && (
              <p>{recap.championship.rivalry}</p>
            )}

          </GlassCard>

        </div>

      )}

    </>
  );
}