import { useEffect, useState } from "react";
import api from "../../services/api";
import { useSeason } from "../../context/SeasonContext";
import "./SeasonSummary.css";

export default function SeasonSummary() {
  const { season } = useSeason();

  const [progress, setProgress] = useState(null);
  const [displayPercent, setDisplayPercent] = useState(0);
  const F1_CALENDAR = [
    "Melbourne",
    "Shanghai",
    "Suzuka",
    "Bahrain",
    "Jeddah",
    "Miami",
    "Imola",
    "Monaco",
    "Montreal",
    "Barcelona",
    "Austria",
    "Silverstone",
    "Hungary",
    "Spa",
    "Zandvoort",
    "Monza",
    "Baku",
    "Singapore",
    "Austin",
    "Mexico City",
    "Brazil",
    "Las Vegas",
    "Qatar",
    "Abu Dhabi",
  ];
  const totalRaces = F1_CALENDAR.length;

  useEffect(() => {
    if (!season) return;

    api
      .get(`/season/progress/${season.id}`)
      .then((res) => setProgress(res.data));
  }, [season]);

  /* ======================
     Smooth Counter
  ====================== */

  useEffect(() => {
    if (!progress) return;

    let start = 0;

    const duration = 1200;
    const step = 20;
    const increment = progress.percent / (duration / step);

    const counter = setInterval(() => {
      start += increment;

      if (start >= progress.percent) {
        start = progress.percent;
        clearInterval(counter);
      }

      setDisplayPercent(Math.round(start));
    }, step);

    return () => clearInterval(counter);
  }, [progress]);

  if (!progress) return <div>Loading...</div>;

  /* ======================
     Completed Races
  ====================== */

  const completedRaces = Math.round((displayPercent / 100) * totalRaces);

  return (
    <div className="season-summary">
      <h2>Season Progress</h2>

      {/* ======================
         PROGRESS BAR
      ====================== */}

      <div className="progress-wrapper">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${displayPercent}%` }}
          />
        </div>

        <div
          className="progress-marker"
          style={{ left: `${displayPercent}%` }}
        />
      </div>

      <p className="progress-text">{displayPercent}% completed</p>

      {/* ======================
         RACE CIRCLES
      ====================== */}

      <div className="race-track">
        {F1_CALENDAR.map((venue, i) => {
          const finished = i < completedRaces;

          return (
            <div key={i} className="race-node">
              <div
                className={`race-dot ${finished ? "finished" : ""}`}
                title={venue}
              />

              {finished && <span className="race-label">{venue}</span>}
            </div>
          );
        })}
      </div>
      {/* ======================
         LOCKED SECTION
      ====================== */}

      {!progress.seasonComplete && (
        <div className="locked-section">
          <div className="lock-icon">🔒</div>

          <h3>Champions Locked</h3>

          <p>Complete the season to reveal winners</p>
        </div>
      )}

      {/* ======================
         WINNERS
      ====================== */}

      {progress.seasonComplete && (
        <div className="champions">
          <h3>Driver Champion</h3>

          <div className="winner-card">🏆 {progress.driverChampion}</div>

          <h3>Constructor Champion</h3>

          <div className="winner-card">🏁 {progress.constructorChampion}</div>
        </div>
      )}
    </div>
  );
}
