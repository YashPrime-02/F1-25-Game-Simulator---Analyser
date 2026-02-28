import { useEffect, useState } from "react";
import { useSeason } from "../../context/SeasonContext";
import { fetchSeasonNews } from "../../services/raceService";
import { motion } from "framer-motion";
import "./news.css";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/F1_theme.mp3";



export default function News() {
  const { season } = useSeason();
  const [news, setNews] = useState([]);
   

  useBackgroundAudio(f1Music, {
      volume: 0.35,
      loop: true
    });

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchSeasonNews(season.id);
        setNews(data);
      } catch (err) {
        console.error(err);
      }
    };

    if (season?.id) loadNews();
  }, [season]);

return (
  <div className="news-container">

    <motion.div
      className="news-title"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <span className="live-dot"></span>
      F1 Commentary
    </motion.div>

    {news.length === 0 && (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Awaiting paddock updates...
      </motion.p>
    )}

    {news.map((item, index) => (
      <motion.div
        key={item.id}
        className="news-card"
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.5,
          delay: index * 0.15,   // ⭐ stagger feed appearance
          ease: "easeOut"
        }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="round-tag">
          ROUND {item.roundNumber}
        </div>

        <h2>{item.headline}</h2>

        <p>{item.content}</p>
      </motion.div>
    ))}
  </div>
);
}