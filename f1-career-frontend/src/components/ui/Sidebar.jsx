import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { logoutUser } from "../../services/authService";
import { useSound } from "../../context/SoundContext";
import "./sidebar.css";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { playError } = useSound();

  const handleLogout = () => {
    logoutUser(); // removes token
    playError(); // optional sound
    navigate("/", { replace: true });
  };

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 240 }}
      transition={{ duration: 0.3 }}
      className="sidebar"
    >
      <div className="logo" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? "F1" : "F1 SIM"}
      </div>

      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/standings">Standings</NavLink>
        <NavLink to="/dashboard/race-control">Race Center</NavLink>
        <NavLink to="/drivers">Drivers</NavLink>
        <NavLink to="/news">News</NavLink>
        <NavLink to="/dashboard/championship">Championship</NavLink>
      </nav>

      <div className="sidebar-footer" onClick={handleLogout}>
        🚪 Logout
      </div>
      
    </motion.div>
  );
}

export default Sidebar;