import { useEffect, useState } from "react";
import "./topbar.css";
import { fetchDriverStandings } from "../../services/raceService";
import { fetchAllSeasons } from "../../services/seasonService";
import { useSeason } from "../../context/SeasonContext";

export default function TopBar() {

  const { season, setSeason } = useSeason();

  const [seasons, setSeasons] = useState([]);
  const [leader, setLeader] = useState(null);
  const [gap, setGap] = useState(0);

  const [muted, setMuted] = useState(false);
  const [beat, setBeat] = useState(0);

  /* ========================
     LOAD SEASONS
  ======================== */

  useEffect(() => {

    const loadSeasons = async () => {

      try {

        const data = await fetchAllSeasons();
        setSeasons(data);

      } catch (err) {

        console.error("Failed loading seasons", err);

      }

    };

    loadSeasons();

  }, []);

  /* ========================
     LOAD STANDINGS
  ======================== */

  useEffect(() => {

    if (!season?.id) return;

    const loadStandings = async () => {

      try {

        const standings = await fetchDriverStandings(season.id);

        if (!standings.length) return;

        setLeader(standings[0].driverName);

        if (standings.length > 1) {

          setGap(
            standings[0].totalPoints - standings[1].totalPoints
          );

        }

      } catch (err) {

        console.error(err);

      }

    };

    loadStandings();

  }, [season]);

  /* ========================
     MUSIC
  ======================== */

  useEffect(() => {

    setMuted(localStorage.getItem("music-muted") === "true");

    const beatListener = (e) => setBeat(e.detail);

    window.addEventListener("music-beat", beatListener);

    return () =>
      window.removeEventListener("music-beat", beatListener);

  }, []);

  const toggleMute = () => {

    const newState = !muted;

    setMuted(newState);

    localStorage.setItem("music-muted", newState);

    window.dispatchEvent(new Event("music-toggle"));

  };

  /* ========================
     UI
  ======================== */

  return (

    <div className="topbar">

      {/* SEASON SELECTOR */}

      <select
        className="season-dropdown"
        value={season?.id || ""}
        onChange={(e) => {

          const selected = seasons.find(
            s => s.id === Number(e.target.value)
          );

          setSeason(selected);

        }}
      >

        {seasons.map(s => (

          <option key={s.id} value={s.id}>
            Season {s.seasonNumber}
          </option>

        ))}

      </select>

      {/* LEADER */}

      <div className="status">

        Leader : {leader || "No races yet"}

        {gap > 0 && (
          <span> | Gap {gap} pts</span>
        )}

      </div>

      {/* AUDIO */}

      <button
        className={`mute-btn ${muted ? "muted" : ""}`}
        onClick={toggleMute}
      >

        <div
          className="led-ring"
          style={{
            transform: `scale(${1 + beat / 400})`,
          }}
        />

        {muted ? "MUTED" : "LIVE AUDIO"}

      </button>

    </div>

  );

}