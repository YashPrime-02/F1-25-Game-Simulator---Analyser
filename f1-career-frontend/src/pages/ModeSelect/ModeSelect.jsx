import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createCareer } from "../../services/careerService";
import "./modeSelect.css";

function ModeSelect() {
  const navigate = useNavigate();

  const handleCreate = async (type) => {
  try {
    await createCareer({
      name: type === "solo" ? "Driver Career" : "Team Career",
      type,
    });

    // ✅ route based on mode
    if (type === "solo") {
      navigate("/player-career/setup");
    } else {
      navigate("/team-career/setup");
    }

  } catch (err) {
    if (err.response?.data?.message === "Career already exists for this user") {

      // If career already exists → still go to setup
      if (type === "solo") {
        navigate("/player-career/setup");
      } else {
        navigate("/team-career/setup");
      }

    } else {
      alert("Career creation failed");
    }
  }
};
  return (
    <div className="mode-container">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Select Career Mode
      </motion.h1>

      <div className="mode-grid">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="mode-card"
          onClick={() => handleCreate("solo")}
        >
          <h2>Driver Career</h2>
          <p>Become World Champion</p>
        </motion.div>
{/* 
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="mode-card"
          onClick={() => handleCreate("myteam")}
        >
          <h2>Team Career</h2>
          <p>Build a Legacy</p>
        </motion.div> */}
      </div>
    </div>
  );
}

export default ModeSelect;