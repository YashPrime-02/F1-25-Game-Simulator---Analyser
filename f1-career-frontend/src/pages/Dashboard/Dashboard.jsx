import { useEffect, useState } from "react";
import { useSeason } from "../../context/SeasonContext";
import {
  fetchChampionshipSummary,
  fetchDriverStandings,
  fetchSeasonCommentary,
  fetchLatestRace,
} from "../../services/raceService";

import GlassCard from "../../components/ui/GlassCard";
import Counter from "../../components/ui/Counter";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/f1Drive.mp3";
import { useNavigate } from "react-router-dom";

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
  const [latestRaceId, setLatestRaceIdLocal] = useState(null);

  const navigate = useNavigate();
  const { season, setLatestRaceId } = useSeason();

  /* ===============================
     🎵 AUDIO
  =============================== */

  useBackgroundAudio(f1Music, {
    volume: 0.35,
    loop: true,
  });

  /* ===============================
     🧠 NEWS ENGINE
  =============================== */

  const generateFrontendNews = (standings, summary, commentary) => {
    const newsItems = [];

    if (!standings || standings.length === 0) return newsItems;

    const leader = standings[0];
    const second = standings[1];

    newsItems.push({
      type: "WINNER",
      text: `${leader.driverName} leads the championship after a strong run of form.`,
    });

    if (second) {
      const gap = leader.totalPoints - second.totalPoints;

      if (gap >= 30) {
        newsItems.push({
          type: "DOMINANCE",
          text: `${leader.driverName} pulling away — the title race slipping out of reach.`,
        });
      } else if (gap <= 10) {
        newsItems.push({
          type: "RIVALRY",
          text: `${leader.driverName} and ${second.driverName} locked in an intense title fight.`,
        });
      }
    }

    if (summary?.rivalry) {
      newsItems.push({
        type: "RIVALRY",
        text: summary.rivalry,
      });
    }

    if (commentary?.length >= 3) {
      const recent = commentary.slice(0, 3);

      const sameWinner = recent.every((c) =>
        c.commentary?.includes(leader.driverName)
      );

      if (sameWinner) {
        newsItems.push({
          type: "DOMINANCE",
          text: `${leader.driverName} unstoppable — three races in a row.`,
        });
      }
    }

    if (commentary?.length > 0) {
      const latest = commentary[0].commentary.toLowerCase();

      if (
        latest.includes("crash") ||
        latest.includes("collision") ||
        latest.includes("dnf") ||
        latest.includes("incident")
      ) {
        newsItems.push({
          type: "RIVALRY",
          text: `Chaos on track — major incident shaking up the race.`,
        });
      }
    }

    if (standings.length > 5) {
      newsItems.push({
        type: "STRUGGLE",
        text: `${standings[4].driverName} struggling to match the front runners.`,
      });
    }

    if (commentary?.length > 0) {
      const latest = commentary[0];

      newsItems.push({
        type: "UPDATE",
        text: `Round ${latest.round}: ${latest.commentary}`,
      });
    }

    return newsItems.slice(0, 6);
  };

  /* ===============================
     LOAD DASHBOARD
  =============================== */

  useEffect(() => {
    if (!season?.id) return;

    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const [summaryData, standings, commentaryData, latestRace] =
          await Promise.all([
            fetchChampionshipSummary(season.id),
            fetchDriverStandings(season.id),
            fetchSeasonCommentary(season.id),
            fetchLatestRace(season.id),
          ]);

        if (cancelled) return;

        setSummary(
          summaryData || {
            phase: "Season just started",
            momentum: "No momentum yet",
            rivalry: null,
          }
        );

        setCommentary(commentaryData || []);

        const generatedNews = generateFrontendNews(
          standings,
          summaryData,
          commentaryData
        );

        setNews(generatedNews);

        /* 🔥 KEY FIX */
        if (latestRace?.id) {
          setLatestRaceId(latestRace.id);        // context
          setLatestRaceIdLocal(latestRace.id);   // local trigger
        }

        if (standings?.length > 0) {
          setLeader(standings[0].driverName);

          setGap(
            standings.length > 1
              ? standings[0].totalPoints - standings[1].totalPoints
              : 0
          );
        } else {
          setLeader(null);
          setGap(0);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Dashboard load failed", err);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [season?.id, latestRaceId]); // ✅ FIXED DEPENDENCY

  /* ===============================
     LOADING
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
      <GlassCard className="broadcast-main">
        <div className="glass-news-header">
          <span className="live-dot"></span>
          <h2>Race Broadcast Center</h2>
        </div>

        <h3>🏆 {leader || "Championship undecided"}</h3>
        <p>{summary.phase || "Season just started"}</p>

        {latestRaceId && (
          <button
            className="watch-btn"
            onClick={() => navigate(`/recap/${latestRaceId}`)}
          >
            ▶ Watch Last Race Recap
          </button>
        )}
      </GlassCard>

      <GlassCard>
        <h2>Championship Leader</h2>
        <p>{leader || "No races completed yet"}</p>
      </GlassCard>

      <GlassCard>
        <h2>Points Gap</h2>
        <Counter value={gap} /> Points
      </GlassCard>

      <GlassCard>
        <h2>Momentum</h2>
        <p>{summary.momentum || "No momentum yet"}</p>
      </GlassCard>

      {summary.rivalry && (
        <GlassCard>
          <h2>Rivalry Watch</h2>
          <p>{summary.rivalry}</p>
        </GlassCard>
      )}

      {news.length > 0 && (
        <div className="broadcast-main news-panel">
          <h2>📰 Race Intelligence Feed</h2>

          <div className="news-feed">
            {news.map((n, i) => (
              <div key={n.text + i} className={`news-item ${n.type.toLowerCase()}`}>
                <span className="news-icon">
                  {n.type === "WINNER" && "🏆"}
                  {n.type === "DOMINANCE" && "🔥"}
                  {n.type === "RIVALRY" && "⚔️"}
                  {n.type === "STRUGGLE" && "📉"}
                  {n.type === "UPDATE" && "🎙"}
                </span>

                <span className="news-text">{n.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}