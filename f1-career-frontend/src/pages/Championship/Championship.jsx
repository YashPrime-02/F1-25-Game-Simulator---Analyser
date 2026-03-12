import { useEffect, useState } from "react";
import { useSeason } from "../../context/SeasonContext";
import { fetchSeasonProgression } from "../../services/raceService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./championship.css";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/F1_theme.mp3";


export default function ChampionshipPage() {
  const { season } = useSeason();
  const [data, setData] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const loadProgression = async () => {
      try {
        const progression = await fetchSeasonProgression(season.id);
        setData(progression);

        if (progression.length > 0) {
          const keys = Object.keys(progression[0]).filter(
            (key) => key !== "round"
          );
          setDrivers(keys);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (season?.id) loadProgression();
  }, [season]);
  
  useBackgroundAudio(f1Music, {
    volume: 0.35,
    loop: true
  });

  return (
  <div className="championship-container">
    <div className="championship-header">
      <h1 className="championship-title">
        Championship Progression
      </h1>
      <div className="title-glow" />
    </div>

    {data.length === 0 ? (
      <p className="empty-state">No races completed yet.</p>
    ) : (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={600}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="round" />
            <YAxis />
            <Tooltip />
            <Legend />

            {drivers.map((driver, index) => (
              <Line
                key={driver}
                type="monotone"
                dataKey={driver}
                stroke={`hsl(${index * 40}, 70%, 50%)`}
                strokeWidth={3}
                dot={false}
                className="chart-line"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);
}