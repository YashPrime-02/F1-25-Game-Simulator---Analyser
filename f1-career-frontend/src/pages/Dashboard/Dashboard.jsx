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
      const [
        summaryData,
        standings,
        newsData,
        commentaryData,
        latestRace
      ] = await Promise.all([
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
          setGap(
            standings[0].totalPoints -
              standings[1].totalPoints
          );
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
    <>
      {/* ================= LEADER ================= */}
      <GlassCard>
        <h2>🏆 Championship Leader</h2>
        <p>{leader || "No races completed yet"}</p>
      </GlassCard>

      <br />

      {/* ================= GAP ================= */}
      <GlassCard>
        <h2>Points Gap</h2>
        <Counter value={gap} /> Points
      </GlassCard>

      <br />

      {/* ================= SEASON PHASE ================= */}
      <GlassCard>
        <h2>Season Phase</h2>
        <p>{summary.phase}</p>
      </GlassCard>

      <br />

      {/* ================= MOMENTUM ================= */}
      <GlassCard>
        <h2>Momentum</h2>
        <p>{summary.momentum}</p>
      </GlassCard>

      {/* ================= RIVALRY ================= */}
      {summary.rivalry && (
        <>
          <br />
          <GlassCard>
            <h2>Rivalry Watch</h2>
            <p>{summary.rivalry}</p>
          </GlassCard>
        </>
      )}

      {/* ================= NEWS FEED ================= */}
      {news.length > 0 && (
        <>
          <br />
          <GlassCard>
            <div className="glass-news-header">
              <span className="live-dot small"></span>
              <h2>Paddock News</h2>
            </div>

            {news.slice(0, 3).map((n) => (
              <div key={n.id} className="news-item">
                <h4>{n.headline}</h4>
                <p>{n.content}</p>
              </div>
            ))}
          </GlassCard>
        </>
      )}

      {/* ================= COMMENTARY ================= */}
      {commentary.length > 0 && (
        <>
          <br />
          <GlassCard>
            <h2>🎙 Race Commentary</h2>

            {commentary.slice(0, 3).map((c, i) => (
              <p key={i}>
                <strong>Round {c.round}:</strong>{" "}
                {c.commentary}
              </p>
            ))}
          </GlassCard>
        </>
      )}
    </>
  );
}