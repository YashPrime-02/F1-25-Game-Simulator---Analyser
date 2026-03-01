import { useEffect, useState } from "react";
import "./topbar.css";
import {
  fetchDriverStandings,
  fetchSeasonNews,
} from "../../services/raceService";
import { useSeason } from "../../context/SeasonContext";


export default function TopBar() {
  const [muted, setMuted] = useState(false);
  const [beat, setBeat] = useState(0);
  const { season } = useSeason();
  const [leader, setLeader] = useState(null);
  const [gap, setGap] = useState(0);
 
  
  useEffect(() => {
    setMuted(localStorage.getItem("music-muted") === "true");

    const beatListener = (e) => {
      setBeat(e.detail);
    };

    window.addEventListener("music-beat", beatListener);

    return () => window.removeEventListener("music-beat", beatListener);
  }, []);

  const toggleMute = () => {
    const newState = !muted;
    setMuted(newState);
    localStorage.setItem("music-muted", newState);

    window.dispatchEvent(new Event("music-toggle"));
  };
  

  useEffect(() => {
      const loadData = async () => {
        try {
          const standings = await fetchDriverStandings(season.id);
  
          if (standings.length > 0) {
            setLeader(standings[0].driverName);
  
            if (standings.length > 1) {
              setGap(standings[0].totalPoints - standings[1].totalPoints);
            }
          }
  
        
        } catch (err) {
          console.error("Dashboard load failed", err);
        }
      };
  
      if (season?.id) {
        loadData();
      }
    }, [season]);
  return (
    <div className="topbar">
      <div className="season-info">Season 1</div>

      <div className="status">Current Leader : {leader || "No races completed yet"} </div>
      
     
       
      
      {/* LED + Button */}
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
