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
  const [hoveredDriver, setHoveredDriver] = useState(null);

  const [animatedGap, setAnimatedGap] = useState(0);
  const [stage, setStage] = useState(0);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const progression = await fetchSeasonProgression(season.id);
        setData(progression);

        if (progression.length > 0) {
          const keys = Object.keys(progression[0]).filter((k) => k !== "round");
          setDrivers(keys);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (season?.id) load();
  }, [season]);

  useBackgroundAudio(f1Music, { volume: 0.35, loop: true });

  /* ================= CALCULATIONS ================= */

  const lastRound = data.length ? data[data.length - 1] : {};

  const sorted =
    drivers.length > 0
      ? [...drivers]
          .map((d) => ({ name: d, pts: lastRound[d] || 0 }))
          .sort((a, b) => b.pts - a.pts)
      : [];

  const gap = sorted.length >= 2 ? sorted[0].pts - sorted[1].pts : 0;

  let gapColor = "#00e676";
  if (gap <= 10) gapColor = "#ff1744";
  else if (gap <= 25) gapColor = "#ffd600";

  /* 🎬 GAP COUNTER */
  useEffect(() => {
    let start = 0;

    const duration = 1200;
    const steps = 30;
    const increment = gap / steps;

    let step = 0;

    const interval = setInterval(() => {
      step++;
      start += increment;

      if (step >= steps) {
        setAnimatedGap(gap);
        clearInterval(interval);
      } else {
        setAnimatedGap(Math.floor(start));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [gap]);

  /* ================= TITLE PROBABILITY (ENHANCED) ================= */

  const TOTAL_ROUNDS = 24;
  const POINTS_PER_WIN = 25;

  const remainingRounds = TOTAL_ROUNDS - data.length;
  const maxGain = remainingRounds * POINTS_PER_WIN;

  const probabilityData = sorted.slice(0, 5).map((d, i) => {
    const leaderPts = sorted[0].pts;
    const deficit = leaderPts - d.pts;

    let base = (maxGain - deficit) / maxGain;

    // pressure scaling (big gaps punish harder)
    base = Math.pow(base, 1.6);

    // leader dominance boost
    if (i === 0) base *= 1.25;

    // rank decay
    base *= 1 - i * 0.12;

    return {
      name: d.name,
      raw: Math.max(0, base),
    };
  });

  // normalize to 100%
  const total = probabilityData.reduce((s, d) => s + d.raw, 0);

  const finalProbability = probabilityData.map((d) => ({
    name: d.name,
    probability: ((d.raw / total) * 100).toFixed(1),
  }));

  /* ================= MOMENTUM ================= */

  const momentumData = sorted.slice(0, 5).map((d) => {
    let recentGain = 0;

    const lastRounds = data.slice(-3);

    lastRounds.forEach((round, idx) => {
      const prev = idx > 0 ? lastRounds[idx - 1][d.name] || 0 : 0;
      const curr = round[d.name] || 0;

      recentGain += curr - prev;
    });

    return {
      name: d.name,
      momentum: recentGain,
    };
  });

  /* 🎬 STAGING */
  useEffect(() => {
    if (data.length === 0) return;

    setStage(0);

    const timers = [
      setTimeout(() => setStage(1), 400),
      setTimeout(() => setStage(2), 900),
      setTimeout(() => setStage(3), 1400),
      setTimeout(() => setStage(4), 1800),
    ];

    return () => timers.forEach(clearTimeout);
  }, [data]);

  /* GAP HISTORY */
  const gapData = data.map((r) => {
    const sortedRound = [...drivers]
      .map((d) => ({ name: d, pts: r[d] || 0 }))
      .sort((a, b) => b.pts - a.pts);

    return {
      round: r.round,
      gap:
        sortedRound.length >= 2 ? sortedRound[0].pts - sortedRound[1].pts : 0,
    };
  });

  if (data.length === 0) {
    return (
      <div className="championship-container">
        <p className="empty-state">Loading Championship Data...</p>
      </div>
    );
  }

  return (
    <div className="championship-container">
      {/* HEADER */}
      <div className="championship-header">
        <h1 className="championship-title">Championship Progression</h1>
        <div className="title-glow" />
      </div>

      {/* GAP */}
      <div className={`battle-panel ${stage >= 1 ? "show" : ""}`}>
        <div className="battle-gap">
          <span className="battle-label">Gap</span>
          <span className="battle-value" style={{ color: gapColor }}>
            {animatedGap} pts
          </span>
        </div>
      </div>

      {/* STANDINGS */}
      <div className={`standings-panel ${stage >= 2 ? "show" : ""}`}>
        {sorted.slice(0, 5).map((d, i) => (
          <div
            key={d.name}
            className={`standing-card 
    ${i === 0 ? "gold" : ""} 
    ${i === 1 ? "silver" : ""} 
    ${i === 2 ? "bronze" : ""}
  `}
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <div className="left">
              <span className="rank">#{i + 1}</span>
              <span className="driver-name">{d.name}</span>
            </div>

            <div className="right">
              <span className="points">{d.pts}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 🏁 TITLE FIGHT */}
      <div className={`probability-panel ${stage >= 3 ? "show" : ""}`}>
        <h3 className="probability-title">TITLE FIGHT PROJECTION</h3>
        {/* 🧭 MOMENTUM LEGEND */}
        <div className="momentum-legend">
          <span className="legend-item up">▲ Positive Momentum</span>
          <span className="legend-item down">▼ Negative Momentum</span>
        </div>
        {finalProbability.map((d, i) => {
          const momentum =
            momentumData.find((m) => m.name === d.name)?.momentum || 0;

          // 🎨 dynamic F1 color per position
          const colors = [
            "#ffd700", // gold
            "#c0c0c0", // silver
            "#cd7f32", // bronze
            "#ff1744", // red
            "#00e5ff", // cyan
          ];

          return (
            <div
              key={d.name}
              className={`probability-row p${i + 1}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* LEFT */}
              <div className="prob-left">
                <span className="prob-rank">#{i + 1}</span>
                <span className="prob-driver">{d.name}</span>
              </div>

              {/* BAR */}
              <div className="prob-bar-container">
                <div
                  className="prob-bar"
                  style={{
                    width: `${d.probability}%`,
                    background: `linear-gradient(90deg, ${colors[i]}, rgba(255,255,255,0.15))`,
                  }}
                >
                  {/* flowing light */}
                  <div className="flow" />

                  {/* live pulse overlay */}
                  <div
                    className="pulse"
                    style={{
                      background: colors[i],
                      opacity: 0.25,
                    }}
                  />
                </div>
              </div>

              {/* RIGHT */}
              <div className="prob-right">
                <span className="prob-value">{d.probability}%</span>

                <span
                  className={`momentum ${
                    momentum > 0 ? "up" : momentum < 0 ? "down" : ""
                  }`}
                >
                  {momentum > 0
                    ? `▲ +${momentum}`
                    : momentum < 0
                      ? `▼ ${momentum}`
                      : "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 📉 GAP CHART */}
      <div className={`gap-chart-wrapper ${stage >= 3 ? "show" : ""}`}>
        <h3 className="gap-title">Gap Chart</h3>

        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={gapData}>
            <CartesianGrid strokeDasharray="2 2" opacity={0.2} />

            <XAxis
              dataKey="round"
              interval="preserveStartEnd"
              tickFormatter={(v) => `R${v}`}
            />

            <YAxis hide />

            <Tooltip
              formatter={(value) => [`${value} pts`, "Gap"]}
              labelFormatter={(label) => `Round ${label}`}
              contentStyle={{
                background: "rgba(0,0,0,0.85)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />

            <Line
              type="monotone"
              dataKey="gap"
              stroke={gapColor}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* MAIN CHART */}
      <div className={`chart-wrapper ${stage >= 4 ? "show" : ""}`}>
        <ResponsiveContainer width="100%" height={600}>
          <LineChart
            data={data}
            onMouseMove={(e) => {
              if (!e || e.activeTooltipIndex == null) return;

              const payload = e.activePayload;
              if (!payload || payload.length === 0) return;

              const active = payload.reduce((max, curr) =>
                curr.value > max.value ? curr : max,
              );

              setHoveredDriver(active.dataKey);
            }}
            onMouseLeave={() => setHoveredDriver(null)}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="round" />
            <YAxis />

            <Tooltip />
            <Legend />

            {drivers.map((driver, index) => {
              const rank = sorted.findIndex((d) => d.name === driver);

              let opacity = rank < 3 ? 1 : rank < 8 ? 0.7 : 0.4;

              if (hoveredDriver) {
                opacity = driver === hoveredDriver ? 1 : 0.15;
              }

              return (
                <Line
                  key={driver}
                  type="monotone"
                  dataKey={driver}
                  stroke={`hsl(${index * 40}, 70%, 50%)`}
                  strokeWidth={rank < 3 ? 4 : 2}
                  opacity={opacity}
                  dot={false}
                  className="chart-line-animated"
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
