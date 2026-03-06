import { useEffect, useState } from "react";
import { useSeason } from "../../context/SeasonContext";
import {
  fetchChampionshipSummary,
  fetchDriverStandings,
  fetchSeasonNews,
  fetchSeasonCommentary,
} from "../../services/raceService";
import GlassCard from "../../components/ui/GlassCard";
import Counter from "../../components/ui/Counter";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/F1_theme.mp3";
import { useNavigate } from "react-router-dom";
import { fetchLatestRace } from "../../services/raceService";
import "./dashboard.css";

export default function Dashboard() {
  /* ===============================
     STATE
  =============================== */

  const [leader, setLeader] = useState(null);
  const [gap, setGap] = useState(0);
  const [summary, setSummary] = useState(null);
  const [news, setNews] = useState([]);
  const [commentary, setCommentary] = useState([]);
  const navigate = useNavigate();
  const { season, setLatestRaceId } = useSeason();

  /* ===============================
     🎵 KEEP SOUND SYSTEM (UNCHANGED)
  =============================== */

  useBackgroundAudio(f1Music, {
    volume: 0.35,
    loop: true,
  });

  /* ===============================
     LOAD DASHBOARD DATA
  =============================== */

  useEffect(() => {
    if (!season?.id) return;

    const loadDashboard = async () => {
      try {
        const [summaryData, standings, newsData, commentaryData, latestRace] =
          await Promise.all([
            fetchChampionshipSummary(season.id),
            fetchDriverStandings(season.id),
            fetchSeasonNews(season.id),
            fetchSeasonCommentary(season.id),
            fetchLatestRace(season.id),
          ]);

        setSummary(summaryData);
        setNews(newsData || []);
        setCommentary(commentaryData || []);

        // ✅ store latest race id
        if (latestRace?.id) {
          setLatestRaceId(latestRace.id);
        }

        if (standings.length > 0) {
          setLeader(standings[0].driverName);

          if (standings.length > 1) {
            setGap(standings[0].totalPoints - standings[1].totalPoints);
          }
        }
      } catch (err) {
        console.error("Dashboard load failed", err);
      }
    };

    loadDashboard();
  }, [season?.id]);
  /* ===============================
     LOADING STATE
  =============================== */

  if (!summary) {
    return (
      <GlassCard>
        <h2>Championship Loading...</h2>
        <p>Run a race to generate standings.</p>
      </GlassCard>
    );
  }

  /* ===============================
     UI
  =============================== */

  return (
    <div className="dashboard-grid">
      {/* ================= MAIN BROADCAST PANEL ================= */}
      <GlassCard className="broadcast-main">
        <div className="glass-news-header">
          <span className="live-dot"></span>
          <h2>Race Broadcast Center</h2>
        </div>

        <h3>🏆 {leader}</h3>
        <p>{summary.phase}</p>

        {season?.latestRaceId && (
          <button
            className="watch-btn"
            onClick={() => navigate(`/recap/${season.latestRaceId}`)}
          >
            ▶ Watch Last Race Recap
          </button>
        )}
      </GlassCard>

      {/* ================= LEADER ================= */}
      <GlassCard>
        <h2>Championship Leader</h2>
        <p>{leader || "No races completed yet"}</p>
      </GlassCard>

      {/* ================= GAP ================= */}
      <GlassCard>
        <h2>Points Gap</h2>
        <Counter value={gap} /> Points
      </GlassCard>

      {/* ================= MOMENTUM ================= */}
      <GlassCard>
        <h2>Momentum</h2>
        <p>{summary.momentum}</p>
      </GlassCard>

      {/* ================= RIVALRY ================= */}
      {summary.rivalry && (
        <GlassCard>
          <h2>Rivalry Watch</h2>
          <p>{summary.rivalry}</p>
        </GlassCard>
      )}

      {/* ================= BREAKING NEWS ================= */}
      {news.length > 0 && (
        <GlassCard className="broadcast-main">
          <div className="glass-news-header">
            <span className="live-dot small"></span>
            <h2>Breaking Paddock News</h2>
          </div>

          <h4>{news[0].headline}</h4>
          <p>{news[0].content}</p>
        </GlassCard>
      )}

      {/* ================= LIVE COMMENTARY TICKER ================= */}
      {commentary.length > 0 && (
        <div className="broadcast-main commentary-panel">
          <h2>🎙 Last Race Commentary Feed</h2>

          <div className="ticker">
            <div className="ticker-text">
              {commentary
                .slice(0, 5)
                .map((c) => `Round ${c.round}: ${c.commentary}   •   `)
                .join("")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
