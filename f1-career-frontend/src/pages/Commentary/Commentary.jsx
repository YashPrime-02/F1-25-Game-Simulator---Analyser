import { useEffect, useState } from "react";
import { useSeason } from "../../context/SeasonContext";
import { fetchSeasonNews } from "../../services/raceService";
import { fetchSeasonCommentary } from "../../services/commentaryService";
import { assignVoice } from "../../utils/commentaryVoices";
import GlassCard from "../../components/ui/GlassCard";
import { fetchDriverStandings } from "../../services/raceService";
import { calculateTension } from "../../services/championshipService";
import "./Commentary.css";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/F1_theme.mp3";
import { detectRivalryFrontend } from "../../utils/rivarlyDetector";
import { getSeasonPhase } from "../../utils/seasonPhase";

export default function Commentary() {
  const { season } = useSeason();

  const [tension, setTension] = useState(0);
  const [news, setNews] = useState([]);
  const [commentary, setCommentary] = useState([]);
  const [rivalry, setRivalry] = useState(null);

  /* ===== AUDIO ===== */
  useBackgroundAudio(f1Music, {
    volume: 0.35,
    loop: true,
  });

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    if (!season?.id) return;

    const loadContent = async () => {
      try {
        const [newsData, commentaryData] = await Promise.all([
          fetchSeasonNews(season.id),
          fetchSeasonCommentary(season.id),
        ]);

        const standings = await fetchDriverStandings(season.id);

        setTension(calculateTension(standings));
        setNews(Array.isArray(newsData) ? newsData : []);
        setCommentary(Array.isArray(commentaryData) ? commentaryData : []);
        setRivalry(detectRivalryFrontend(standings));
      } catch (err) {
        console.error("Failed loading commentary", err);
        setCommentary([]);
      }
    };

    loadContent();
  }, [season?.id]);

  /* ===== DERIVED VALUES ===== */
  const latestRound = commentary[0]?.round;

  const phase =
    latestRound && season?.raceCount
      ? getSeasonPhase(latestRound, season.raceCount)
      : null;

  /* ===== UI ===== */
  return (
    <section className="commentary-section">
      {/* ===== BREAKING BANNER ===== */}
      {latestRound && (
        <div className="breaking-banner">
          BREAKING • Round {latestRound} completed • Championship fight evolving
        </div>
      )}

      {/* ===== SEASON PHASE ===== */}
      {phase && <div className="season-phase">{phase}</div>}

      {/* ===== BROADCAST CARD ===== */}
      {commentary[0] && (
        <GlassCard>
          <div className="broadcast-card">
            <h2>📡 Race Broadcast</h2>
            <p>
              Round {commentary[0].round} has concluded. Media reaction is
              dominating the paddock discussion.
            </p>
          </div>
        </GlassCard>
      )}

      <h2 className="commentary-title">Race Commentary</h2>
      <h2 className="commentary-title">Championship Tension Meter</h2>

      <div className="tension-meter">
        <div className="tension-bar" style={{ width: `${tension}%` }} />
      </div>

      <h2 className="commentary-title">Championship Rivalry</h2>

      {/* rivalry broadcast alert */}
      <div className="rivalry-alert">
        ⚔️ {rivalry || "No rivalry active right now"}
      </div>

      {/* ===== TIMELINE ===== */}
      <div className="commentary-timeline">
        {commentary.map((c, index) => {
          const voice = assignVoice(index);

          return (
            <GlassCard key={index}>
              <div
                className={`commentary-card ${
                  index === commentary.length - 1 ? "latest" : ""
                }`}
                style={{ animationDelay: `${index * 0.18}s` }}
              >
                <div className="timeline-dot" />

                <h3 className="commentary-header">
                  🎙 {voice.name} — Round {c.round}
                </h3>

                <p>{c.text || c.commentary || "—"}</p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}