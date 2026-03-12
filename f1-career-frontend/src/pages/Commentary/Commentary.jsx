import { useEffect, useState } from "react";
import { useSeason } from "../../context/SeasonContext";
import { fetchSeasonCommentary } from "../../services/raceService";
import GlassCard from "../../components/ui/GlassCard";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/F1_theme.mp3";
import "./commentary.css";

export default function Commentary() {
  const { season } = useSeason();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ retain F1 theme music
  useBackgroundAudio(f1Music, {
    volume: 0.35,
    loop: true,
  });

  useEffect(() => {
    if (!season?.id) return;

    const loadCommentary = async () => {
      try {
        const data = await fetchSeasonCommentary(season.id);
        setFeed(data || []);
      } catch (err) {
        console.error("Failed loading commentary", err);
      } finally {
        setLoading(false);
      }
    };

    loadCommentary();
  }, [season?.id]);

  if (loading) {
    return (
      <GlassCard>
        <h2>🎙 Loading Broadcast Feed...</h2>
      </GlassCard>
    );
  }

  return (
    <div className="commentary-container">

      <div className="glass-news-header">
        <div className="live-dot"></div>
        <h2>Live Race Commentary</h2>
      </div>

      {feed.length === 0 ? (
        <GlassCard>
          <p>No commentary yet. Run a race first.</p>
        </GlassCard>
      ) : (
        feed.map((item, index) => (
          <GlassCard key={index}>
            <div className="commentary-item">
              <span className="round-badge">
                Round {item.round}
              </span>

              <p className="commentary-text">
                {item.commentary}
              </p>
            </div>
          </GlassCard>
        ))
      )}
    </div>
  );
}