import { useEffect, useState } from "react";
import api from "../../services/api";
import "./createCareer.css";

export default function CreateCareer() {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [nationality, setNationality] = useState("India");
  const [careerName, setCareerName] = useState("");

  useEffect(() => {
    api.get("/drivers").then(r => setDrivers(r.data));
  }, []);

  const startCareer = async () => {
    if (!selectedDriver) return alert("Select a driver");

    await api.post("/player-career", {
      driverId: selectedDriver,
      careerName,
      nationality
    });

    window.location.href = "/dashboard";
  };

  return (
    <div className="career-container">

      <div className="career-header">
        <h1>CREATE CAREER</h1>
        <p>Select your driver and begin your legacy</p>
      </div>

      {/* Career Settings */}
      <div className="career-settings">

        <input
          className="career-input"
          placeholder="Career Name"
          value={careerName}
          onChange={e => setCareerName(e.target.value)}
        />

        {/* NATIONALITY PICKER */}
        <select
          className="nationality-picker"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
        >
          <option>India</option>
          <option>United Kingdom</option>
          <option>Italy</option>
          <option>Germany</option>
          <option>France</option>
          <option>Spain</option>
          <option>Netherlands</option>
          <option>Australia</option>
          <option>Japan</option>
          <option>Brazil</option>
        </select>

      </div>

      {/* DRIVER GRID */}
      <div className="driver-grid">
        {drivers.map(d => (
          <div
            key={d.id}
            className={`driver-card ${
              selectedDriver === d.id ? "selected" : ""
            }`}
            onClick={() => setSelectedDriver(d.id)}
          >
            <div className="driver-number">
              #{d.number || "00"}
            </div>

            <h3>
              {d.firstName} {d.lastName}
            </h3>

            <p className="team-name">
              {d.Team?.name || "Free Agent"}
            </p>
          </div>
        ))}
      </div>

      <button className="start-btn" onClick={startCareer}>
        START CAREER
      </button>

    </div>
  );
}