import { useEffect, useState } from "react";
import api from "../../services/api";
import { useSeason } from "../../context/SeasonContext";
import "./SeasonSummary.css";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/F1_theme.mp3";

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
     "Barcelona",
     "Montreal",
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

   const F1_FLAGS = {
     Melbourne: "au",
     Shanghai: "cn",
     Suzuka: "jp",
     Bahrain: "bh",
     Jeddah: "sa",
     Miami: "us",
     Imola: "it",
     Monaco: "mc",
     Barcelona: "es",
     Montreal: "ca",
     Austria: "at",
     Silverstone: "gb",
     Hungary: "hu",
     Spa: "be",
     Zandvoort: "nl",
     Monza: "it",
     Baku: "az",
     Singapore: "sg",
     Austin: "us",
     "Mexico City": "mx",
     Brazil: "br",
     "Las Vegas": "us",
     Qatar: "qa",
     "Abu Dhabi": "ae",
   };
  
  const totalRaces = F1_CALENDAR.length;
    /* ===============================
       🎵 BACKGROUND AUDIO
    =============================== */
  
    useBackgroundAudio(f1Music, {
      volume: 0.35,
      loop: true,
    });
  
    
  useEffect(() => {
    if (!season) return;

    api
      .get(`/seasons/progress/${season.id}`)
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

              {finished && (
                <span className="race-label">
                  <img
                    src={`https://flagcdn.com/w20/${F1_FLAGS[venue]}.png`}
                    alt={venue}
                    className="flag"
                  />
                  {venue}
                </span>
              )}
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
