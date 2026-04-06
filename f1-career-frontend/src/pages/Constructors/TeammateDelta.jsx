import { useEffect, useState } from "react";
import api from "../../services/api";
import { useSeason } from "../../context/SeasonContext";
import "./TeammateDelta.css";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/F1_theme.mp3";

export default function TeammateDelta() {
  const { season } = useSeason();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!season) return;

    api
      .get(`/standings/teammates/${season.id}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, [season]);

  /* ===============================
     🧠 TEAM KEY RESOLVER (CLEAN)
  =============================== */

  const getTeamKey = (name) => {
    const key = name.toLowerCase();

    if (key.includes("red bull")) return "redbull";
    if (key.includes("ferrari")) return "ferrari";
    if (key.includes("mercedes")) return "mercedes";
    if (key.includes("mclaren")) return "mclaren";
    if (key.includes("aston")) return "astonmartin";
    if (key.includes("alpine")) return "alpine";
    if (key.includes("williams")) return "williams";
    if (key.includes("rb") || key.includes("racing bulls")) return "rb";
    if (key.includes("haas")) return "haas";
    if (key.includes("sauber") || key.includes("kick")) return "sauber";

    return "";
  };

  /* ===============================
     🏁 TEAM LOGOS (YOUR WORKING MAP)
  =============================== */

  const teamLogoMap = {
    ferrari:
      "https://media.formula1.com/content/dam/fom-website/teams/2024/ferrari-logo.png",

    redbull:
      "https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing-logo.png",

    mercedes:
      "https://media.formula1.com/content/dam/fom-website/teams/2024/mercedes-logo.png",

    mclaren:
      "https://media.formula1.com/content/dam/fom-website/teams/2024/mclaren-logo.png",

    astonmartin:
      "https://media.formula1.com/content/dam/fom-website/teams/2024/aston-martin-logo.png",

    alpine:
      "https://media.formula1.com/content/dam/fom-website/teams/2024/alpine-logo.png",

    williams:
      "https://media.formula1.com/content/dam/fom-website/teams/2024/williams-logo.png",

    haas:
      "https://media.formula1.com/content/dam/fom-website/teams/2024/haas-logo.png",

    rb:
      "https://media.formula1.com/content/dam/fom-website/teams/2024/rb-logo.png",

    sauber:
      "https://media.formula1.com/content/dam/fom-website/teams/2024/kick-sauber-logo.png",
  };

  const getTeamLogo = (name) => {
    const key = getTeamKey(name);
    return teamLogoMap[key] || null;
  };

  useBackgroundAudio(f1Music, {
    volume: 0.35,
    loop: true,
  });

  return (
    <>
      <div className="teammate-page">
        <h2>Teammate Battle</h2>

        {data.map((t) => {
          const total = t.points1 + t.points2;

          const p1 = total ? ((t.points1 / total) * 100).toFixed(1) : 0;
          const p2 = total ? ((t.points2 / total) * 100).toFixed(1) : 0;

          const leader =
            t.points1 > t.points2
              ? "driver1"
              : t.points2 > t.points1
              ? "driver2"
              : "equal";

          const getInitials = (name) =>
            name.split(" ").map((n) => n[0]).join("").toUpperCase();

          const teamKey = getTeamKey(t.team);
          const logo = getTeamLogo(t.team);

          return (
            <div key={t.team} className={`team-card ${teamKey}`}>
              
              {/* 🏁 HEADER */}
              <div className="team-header">
                {logo && (
                  <img
                    src={logo}
                    alt={t.team}
                    className="team-logo"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
                <h3>{t.team}</h3>
              </div>

              <p className={leader === "driver1" ? "leader" : "loser"}>
                🪖 {t.driver1}
                <span className="driver-points">{p1}%</span>
              </p>

              <p className={leader === "driver2" ? "leader" : "loser"}>
                🪖 {t.driver2}
                <span className="driver-points">{p2}%</span>
              </p>

              <div className="battle-bar">
                <div
                  className="bar-bg"
                  style={{
                    background: `linear-gradient(
                      to right,
                      #9aff02 0%,
                      #9aff02 ${p1}%,
                      #00cfff ${p1}%,
                      #00cfff 100%
                    )`,
                  }}
                />

                <span className="bar-label left">
                  {getInitials(t.driver1)}
                </span>
                <span className="bar-label right">
                  {getInitials(t.driver2)}
                </span>

                <div className="hover-zone left">
                  <div className="tooltip">
                    {t.driver1} • {t.points1} pts
                  </div>
                </div>

                <div className="hover-zone right">
                  <div className="tooltip">
                    {t.driver2} • {t.points2} pts
                  </div>
                </div>

                <div className="clash-line" />
              </div>

              <strong className="delta">Δ {t.delta}</strong>
            </div>
          );
        })}
      </div>

      {/* ===============================
          🏁 LEADER SECTION
      =============================== */}

      <div className="leaders-section">
        <h2>Current Team Leaders</h2>

        {data.map((t) => {
          const total = t.points1 + t.points2;

          const p1 = total ? (t.points1 / total) * 100 : 0;
          const p2 = total ? (t.points2 / total) * 100 : 0;

          const leader =
            t.points1 > t.points2
              ? { name: t.driver1, pct: p1 }
              : { name: t.driver2, pct: p2 };

          const teamKey = getTeamKey(t.team);
          const logo = getTeamLogo(t.team);

          return (
            <div key={t.team} className={`leader-row ${teamKey}`}>
              
              <div className="leader-team">
                {logo && (
                  <img
                    src={logo}
                    alt={t.team}
                    className="team-logo small"
                  />
                )}
                {t.team}
              </div>

              <div className="leader-bar">
                <div
                  className="leader-fill"
                  style={{ width: `${leader.pct}%` }}
                />
              </div>

              <div className="leader-driver">
                {leader.name}
                <span>{leader.pct.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}