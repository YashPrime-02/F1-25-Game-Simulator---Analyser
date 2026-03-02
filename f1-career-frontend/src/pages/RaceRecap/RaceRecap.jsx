import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GlassCard from "../../components/ui/GlassCard";
import {
  getRaceRecapAI,
  fetchRaceResults
} from "../../services/raceService";
import "./RaceRecap.css";
import useRevealSequence from "../../hooks/useRevealSequence";
import TypewriterText from "../../components/ui/TypewriterText";
import Counter from "../../components/ui/Counter";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/F1_theme.mp3";



export default function RaceRecap() {
  const { raceWeekendId } = useParams();
  const [recap, setRecap] = useState(null);
  const [raceData, setRaceData] = useState(null);
  const [loading, setLoading] = useState(true);

  const visible = useRevealSequence(
  ["hero", "narrative", "podium", "championship"],
  900
);

useBackgroundAudio(f1Music, {
    volume: 0.35,
    loop: true
  });


useEffect(() => {
  const load = async () => {
    setLoading(true);

    try {
      const [aiData, recapData] = await Promise.all([
        getRaceRecapAI(raceWeekendId),
        fetchRaceResults(raceWeekendId),
      ]);

      setRecap(aiData);
      setRaceData(recapData);
    } finally {
      setLoading(false);
    }
  };

  load();
}, [raceWeekendId]);

if (loading || !recap || !raceData) {
  return (
    <div className="f1-loader">
      <div className="f1-loader-center">
        <div className="f1-scanline" />

        <h1 className="f1-loader-title">
          GENERATING RACE BROADCAST
        </h1>

        <p className="f1-loader-sub">
          AI commentators analysing telemetry… <br /> usually takes 40-50 seconds
        </p>

        <div className="f1-progress">
          <div className="f1-progress-bar" />
        </div>
      </div>
    </div>
  );
}

  return (
  <>
    {/* HERO */}
    {visible.includes("hero") && (
      <div className="broadcast-enter recap-spacing">
        <GlassCard>
          <h1>🏁 Round {raceData?.round}</h1>
          <h2>{raceData?.winner}</h2>
          <p>Race Winner</p>
        </GlassCard>
      </div>
    )}

    {/* AI NARRATIVE */}
    {visible.includes("narrative") && (
      <div className="broadcast-enter recap-spacing">
        <GlassCard>
          <h2>Race Recap</h2>
          <TypewriterText text={recap?.narrative || ""} />
        </GlassCard>
      </div>
    )}

    {/* PODIUM */}
    {visible.includes("podium") && (
      <div className="broadcast-enter recap-spacing">
        <GlassCard>
          <h2>Podium Finishers</h2>
          {raceData?.podium?.map((driver, i) => (
            <p key={i}>P{i + 1} — {driver}</p>
          ))}
        </GlassCard>
      </div>
    )}

    {/* CHAMPIONSHIP */}
    {visible.includes("championship") && (
      <div className="broadcast-enter recap-spacing">
        <GlassCard>
          <h2>Championship Situation</h2>

          <p>
            Leader: <strong>{recap?.championship?.leader}</strong>
          </p>

          <p>
            Gap: <Counter value={recap?.championship?.gap || 0} /> pts
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