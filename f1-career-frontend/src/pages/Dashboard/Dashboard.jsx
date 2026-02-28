import { useEffect, useState } from "react";
import { useSeason } from "../../context/SeasonContext";
import {
  fetchDriverStandings,
  fetchSeasonNews,
} from "../../services/raceService";

import "./dashboard.css";
import GlassCard from "../../components/ui/GlassCard";
import Counter from "../../components/ui/Counter";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/F1_theme.mp3";


export default function Dashboard() {
  const { season } = useSeason();

  const [leader, setLeader] = useState(null);
  const [gap, setGap] = useState(0);
  const [news, setNews] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const standings = await fetchDriverStandings(season.id);

        if (standings.length > 0) {
          setLeader(standings[0].driverName);

          if (standings.length > 1) {
            setGap(standings[0].totalPoints - standings[1].totalPoints);
          }
        }

        const newsData = await fetchSeasonNews(season.id);
        setNews(newsData);
      } catch (err) {
        console.error("Dashboard load failed", err);
      }
    };

    if (season?.id) {
      loadData();
    }
  }, [season]);

  useBackgroundAudio(f1Music, {
    volume: 0.35,
    loop: true
  });


  return (
    <>
      <GlassCard>
        <h2>Championship Leader</h2>
        <p>{leader || "No races completed yet"}</p>
      </GlassCard>

      <br />

      <GlassCard>
        <h2>Points Gap</h2>
        <Counter value={gap} /> Points
      </GlassCard>

      <br />

      <GlassCard>
        <div className="glass-news-header">
          <h2>F1 Season News Feed</h2>
          <span className="live-dot small"></span>
        </div>

        {news.length === 0 && <p>No news yet. Simulate a race.</p>}

        {news.map((item) => (
          <div key={item.id} className="news-item">
            <h4>
              Round {item.roundNumber} – {item.headline}
            </h4>
            <p>{item.content}</p>
            <hr />
          </div>
        ))}
      </GlassCard>
    </>
  );
}
