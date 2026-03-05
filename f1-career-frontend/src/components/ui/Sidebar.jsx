import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react"; // ✅ single import
import { motion } from "framer-motion";
import { logoutUser } from "../../services/authService";
import { useSound } from "../../context/SoundContext";
import "./sidebar.css";
import { useSeason } from "../../context/SeasonContext";
import Counter from "../../components/ui/Counter";
import { fetchDriverStandings } from "../../services/raceService";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { playError } = useSound();
  const [leaderPoints, setLeaderPoints] = useState(null);
  const { season, latestRaceId } = useSeason();

  const handleLogout = () => {
    logoutUser();
    playError();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const fetchLeaderPoints = async () => {
      if (latestRaceId && season) {
        try {
          const standings = await fetchDriverStandings(season.id);
          if (standings && standings.length > 0) {
            setLeaderPoints(standings[0].totalPoints); // ✅ fixed
          }
        } catch (err) {
          console.error("Failed to fetch leader points:", err);
        }
      }
    };

    fetchLeaderPoints();
  }, [latestRaceId, season]);

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 240 }}
      transition={{ duration: 0.3 }}
      className="sidebar"
    >
      <div className="logo">
        <img src="/F1-Favicon.png" alt="F1 Logo" className="logo-icon" />

        {!collapsed && <span className="logo-text">F1 25 SIM</span>}
      </div>
      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/standings">Driver Standings</NavLink>
        <NavLink to="/standings/constructors">Constructors</NavLink>
        <NavLink to="/season-summary">Season Summary</NavLink>
        <NavLink to="/standings/teammates">Teammate Battle</NavLink>
        <NavLink to="/dashboard/race-control">Race Center</NavLink>
        <NavLink to="/drivers">Drivers</NavLink>
        <NavLink to="/Commentary">Commentary</NavLink>
        <NavLink to="/dashboard/championship">Championship</NavLink>
        <NavLink to="/race/manual">Manually Feed Race Results </NavLink>

        {latestRaceId && (
          <NavLink to={`/recap/${latestRaceId}`} className="sidebar-live">
            🔴 Live Recap
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer" onClick={handleLogout}>
        🚪 Logout
      </div>
    </motion.div>
  );
}

export default Sidebar;
