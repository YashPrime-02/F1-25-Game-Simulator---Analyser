import { useEffect, useState } from "react";
import "./topbar.css";
import { fetchDriverStandings } from "../../services/raceService";
import { useSeason } from "../../context/SeasonContext";

export default function TopBar() {

  const { season, setSeason, seasons, refresh } = useSeason();

  const [leader, setLeader] = useState(null);
  const [gap, setGap] = useState(0);

  const [muted, setMuted] = useState(false);
  const [beat, setBeat] = useState(0);

  /* ========================
     LOAD STANDINGS (UPDATED)
  ======================== */

  useEffect(() => {

    if (!season?.id) {
      setLeader(null);
      setGap(0);
      return;
    }

    const loadStandings = async () => {

      try {

        const standings = await fetchDriverStandings(season.id);

        if (!standings.length) {
          setLeader(null);
          setGap(0);
          return;
        }

        setLeader(standings[0].driverName);

        if (standings.length > 1) {
          setGap(
            standings[0].totalPoints - standings[1].totalPoints
          );
        } else {
          setGap(0);
        }

      } catch (err) {
        console.error(err);
      }

    };

    loadStandings();

  }, [season, refresh]); // ✅ KEY CHANGE

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

      <div className="status">

        Leader : {leader || "No races yet"}

        {gap > 0 && (
          <span> | Gap {gap} pts</span>
        )}

      </div>

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