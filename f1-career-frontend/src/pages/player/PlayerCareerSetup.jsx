import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getTeams } from "../../services/teamService";
import { getDriversByTeam } from "../../services/driverService";
import { createPlayerCareer } from "../../services/playerCareerService";

import GlassCard from "../../components/ui/GlassCard";
import "./PlayerCareerSetup.css";

export default function PlayerCareerSetup() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("existing");

  const [teams, setTeams] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [replacedDriver, setReplacedDriver] = useState(null);

  const [careerName, setCareerName] = useState("");

  const [customDriver, setCustomDriver] = useState({
    firstName: "",
    lastName: "",
    nationality: "",
    driverNumber: "",
  });

  const [loading, setLoading] = useState(false);

  /* ===============================
     LOAD TEAMS
  =============================== */

  useEffect(() => {
    let mounted = true;

    const loadTeams = async () => {
      try {
        const data = await getTeams();
        if (mounted) setTeams(data);
      } catch (err) {
        console.error("Teams load failed", err);
      }
    };

    loadTeams();
    return () => (mounted = false);
  }, []);

  /* ===============================
     LOAD DRIVERS WHEN TEAM CHANGES
  =============================== */

  useEffect(() => {
    if (!selectedTeam) {
      setDrivers([]);
      return;
    }

    let mounted = true;

    const loadDrivers = async () => {
      try {
        const data = await getDriversByTeam(selectedTeam.id);
        if (mounted) setDrivers(data);
      } catch (err) {
        console.error("Drivers load failed", err);
      }
    };

    loadDrivers();
    return () => (mounted = false);
  }, [selectedTeam]);

  /* ===============================
     MODE CHANGE
  =============================== */

  const changeMode = (newMode) => {
    setMode(newMode);

    // reset dependent selections
    setSelectedDriver(null);
    setReplacedDriver(null);
  };

  /* ===============================
     TEAM SELECT
  =============================== */

  const selectTeam = (team) => {
    setSelectedTeam(team);
    setSelectedDriver(null);
    setReplacedDriver(null);
    setDrivers([]);
  };

  /* ===============================
     CREATE CAREER
  =============================== */

  const startCareer = async () => {
    if (!careerName || !selectedTeam)
      return alert("Fill required fields");

    if (mode === "existing" && !selectedDriver)
      return alert("Select a driver");

    if (mode === "custom" && !replacedDriver)
      return alert("Select driver to replace");

    try {
      setLoading(true);

      await createPlayerCareer({
        careerName,
        driverId: mode === "existing" ? selectedDriver.id : null,
        teamId: selectedTeam.id,
        replacedDriverId:
          mode === "custom" ? replacedDriver.id : null,
        customDriver: mode === "custom" ? customDriver : null,
      });

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     UI
  =============================== */

  return (
    <div className="career-container">
      <GlassCard>
        <h2>Start Player Career</h2>

        <input
          placeholder="Career Name"
          value={careerName}
          onChange={(e) => setCareerName(e.target.value)}
        />

        <div className="mode-select">
          <button onClick={() => changeMode("existing")}>
            Existing Driver
          </button>

          <button onClick={() => changeMode("custom")}>
            Custom Driver
          </button>
        </div>
      </GlassCard>

      {/* TEAM SELECT */}
      <GlassCard>
        <h3>Select Team</h3>

        <div className="team-grid">
          {teams.map((team) => (
            <div
              key={team.id}
              className={`team-card ${
                selectedTeam?.id === team.id ? "active" : ""
              }`}
              onClick={() => selectTeam(team)}
            >
              {team.name}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* EXISTING DRIVER MODE */}
      {mode === "existing" && (
        <GlassCard>
          <h3>Select Driver</h3>

          {!selectedTeam ? (
            <p className="hint">Select a team first</p>
          ) : drivers.length === 0 ? (
            <p className="hint">No active drivers found</p>
          ) : (
            drivers.map((driver) => (
              <div
                key={driver.id}
                className={`driver-card ${
                  selectedDriver?.id === driver.id ? "active" : ""
                }`}
                onClick={() => setSelectedDriver(driver)}
              >
                {driver.firstName} {driver.lastName}
              </div>
            ))
          )}
        </GlassCard>
      )}

      {/* CUSTOM DRIVER MODE */}
      {mode === "custom" && (
        <>
          <GlassCard>
            <h3>Create Driver</h3>

            <input
              placeholder="First Name"
              onChange={(e) =>
                setCustomDriver({
                  ...customDriver,
                  firstName: e.target.value,
                })
              }
            />

            <input
              placeholder="Last Name"
              onChange={(e) =>
                setCustomDriver({
                  ...customDriver,
                  lastName: e.target.value,
                })
              }
            />

            <input
              placeholder="Nationality"
              onChange={(e) =>
                setCustomDriver({
                  ...customDriver,
                  nationality: e.target.value,
                })
              }
            />

            <input
              placeholder="Driver Number"
              type="number"
              onChange={(e) =>
                setCustomDriver({
                  ...customDriver,
                  driverNumber: e.target.value,
                })
              }
            />
          </GlassCard>

          {/* REPLACEMENT ONLY FOR CUSTOM */}
          {selectedTeam && drivers.length > 0 && (
            <GlassCard>
              <h3>Select Driver To Replace</h3>

              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className={`driver-card ${
                    replacedDriver?.id === driver.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => setReplacedDriver(driver)}
                >
                  Replace {driver.firstName} {driver.lastName}
                </div>
              ))}
            </GlassCard>
          )}
        </>
      )}

      <GlassCard>
        <button
          className="start-btn"
          disabled={loading}
          onClick={startCareer}
        >
          {loading ? "Creating Career..." : "Start Career"}
        </button>
      </GlassCard>
    </div>
  );
}