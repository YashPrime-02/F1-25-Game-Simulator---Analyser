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

  const [loading, setLoading] = useState(false); // ✅ NEW (UX)

  /* ========================
     LOAD STANDINGS (SAFE + REACTIVE)
  ======================== */

  useEffect(() => {
    let cancelled = false; 

    if (!season?.id) {
      setLeader(null);
      setGap(0);
      return;
    }

    const loadStandings = async () => {
      try {
        setLoading(true);

        const standings = await fetchDriverStandings(season.id);

        if (cancelled) return;

        if (!standings || !standings.length) {
          setLeader(null);
          setGap(0);
          return;
        }

        const newLeader = standings[0].driverName;

        let newGap = 0;

        if (standings.length > 1) {
          newGap =
            standings[0].totalPoints -
            standings[1].totalPoints;
        }

        // ✅ update only if changed (prevents unnecessary re-render)
        setLeader((prev) => (prev !== newLeader ? newLeader : prev));
        setGap((prev) => (prev !== newGap ? newGap : prev));

      } catch (err) {
        if (!cancelled) {
          console.error(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadStandings();

    return () => {
      cancelled = true; // ✅ cleanup
    };
  }, [season?.id, refresh]); // ✅ FIXED DEPENDENCY

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
            (s) => s.id === Number(e.target.value)
          );

          setSeason(selected);
        }}
      >
        {seasons.map((s) => (
          <option key={s.id} value={s.id}>
            Season {s.seasonNumber}
          </option>
        ))}
      </select>

      <div className="status">
        Leader :{" "}
        {loading
          ? "Updating..."
          : leader || "No races yet"}

        {gap > 0 && !loading && (
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