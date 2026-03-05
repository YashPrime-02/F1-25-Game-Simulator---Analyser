import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Drivers.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function DriverProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // 1️⃣ get active season
        const seasonRes = await api.get("/seasons/active");
        const seasonId = seasonRes.data.id;

        // 2️⃣ fetch player profile using season id
        const profileRes = await api.get(`/player-career/profile/${seasonId}`);

        setData(profileRes.data);
      } catch (err) {
        console.error("Driver profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) return <div className="loading">Loading Driver Profile...</div>;
  if (!data) return <div className="loading">Driver data unavailable</div>;

  const { driver, stats, raceHistory } = data;
  console.log(raceHistory);
  return (
    <div className="driver-profile-container">
      {/* DRIVER HEADER */}

      <div className="driver-header">
        <div className="driver-info">
          <h2>{driver.name}</h2>
          <p>{driver.team}</p>
          <p>#{driver.number}</p>
        </div>

        <div className="morale">Morale: {driver.morale}</div>
      </div>

      {/* STATS GRID */}

      <div className="stats-grid">
        <div className="stat">
          <span>P{stats.position}</span>
          <p>Championship</p>
        </div>

        <div className="stat">
          <span>{stats.points}</span>
          <p>Points</p>
        </div>

        <div className="stat">
          <span>{stats.wins}</span>
          <p>Wins</p>
        </div>

        <div className="stat">
          <span>{stats.podiums}</span>
          <p>Podiums</p>
        </div>

        <div className="stat">
          <span>{stats.fastestLaps}</span>
          <p>Fastest Laps</p>
        </div>

        <div className="stat">
          <span>{stats.avgFinish}</span>
          <p>Avg Finish</p>
        </div>
      </div>

      {/* PERFORMANCE GRAPH */}

      <div className="chart-section">
        <h3>Race Performance</h3>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={raceHistory}
            margin={{ top: 20, right: 50, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="round" padding={{ left: 20, right: 40 }} />

            <YAxis
              reversed
              domain={[1, 20]}
              allowDecimals={false}
              allowDataOverflow
            />

            <Tooltip />

            <Line
              type="linear"
              dataKey="position"
              stroke="#e10600"
              strokeWidth={4}
              dot={{ r: 6 }}
              activeDot={{ r: 8 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
