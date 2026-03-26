import { useEffect, useState } from "react";
import { useSeason } from "../../context/SeasonContext";
import api from "../../services/api";
import GlassCard from "../../components/ui/GlassCard";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./manualRace.css";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/f1Drive.mp3";

/* ================= SORTABLE DRIVER ================= */

function SortableDriver({
  driver,
  index,
  toggleFastestLap,
  toggleDNF,
  changeIncident,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: driver.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`driver-row 
        ${driver.fastestLap ? "fl-active" : ""} 
        ${driver.dnf ? "dnf-active" : ""}`}
      {...attributes}
      {...listeners}
    >
      <div className="pos-col">P{index + 1}</div>

      <div className="name-col">
        {driver.firstName} {driver.lastName}
      </div>

      <div className="control-col" onPointerDown={(e) => e.stopPropagation()}>
        {/* FASTEST LAP */}
        <label className="fl-box">
          <input
            type="checkbox"
            checked={driver.fastestLap}
            disabled={driver.dnf}
            onChange={() => toggleFastestLap(driver.id)}
          />
          <span>FL</span>
        </label>

        {/* DNF */}
        <label className="dnf-box">
          <input
            type="checkbox"
            checked={driver.dnf}
            onChange={() => toggleDNF(driver.id)}
          />
          <span>DNF</span>
        </label>

        {/* INCIDENT */}
        <select
          className="incident-select"
          value={driver.incident}
          disabled={!driver.dnf}
          onChange={(e) => changeIncident(driver.id, e.target.value)}
        >
          <option value="none">Incident</option>
          <option value="crash">💥 Crash</option>
          <option value="collision">🤝 Collision</option>
          <option value="engine">⚙️ Engine</option>
          <option value="mechanical">🔧 Mechanical</option>
          <option value="spin">🌀 Spin</option>
        </select>
      </div>
    </div>
  );
}

/* ================= MAIN ================= */

export default function ManualRaceEntry() {
  const { season } = useSeason();

  const [drivers, setDrivers] = useState([]);
  const [raceWeekendId, setRaceWeekendId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recap, setRecap] = useState(null);
  const [recapLoading, setRecapLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [commentary, setCommentary] = useState([]);
  const [weather, setWeather] = useState("dry");

  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState("success");

  const [countdown, setCountdown] = useState(null);
  const [phase, setPhase] = useState("idle");

  useBackgroundAudio(f1Music, {
    volume: 0.35,
    loop: true,
  });

  /* ================= TOAST ================= */
  const showToast = (message, type = "success", duration = 4000) => {
    setToast(message);
    setToastType(type);
    if (duration !== 0) setTimeout(() => setToast(null), duration);
  };

  /* ================= LOAD DRIVERS ================= */
  const loadDrivers = async () => {
    try {
      const res = await api.get("/drivers");

      setDrivers(
        res.data.map((d) => ({
          ...d,
          fastestLap: false,
          dnf: false,
          incident: "none",
        })),
      );
    } catch {
      showToast("Failed to load drivers ❌", "error");
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  /* ================= WEEKEND ================= */
  useEffect(() => {
    const detectWeekend = async () => {
      if (!season?.id) return;

      try {
        const res = await api.post("/races/weekend", {
          seasonId: season.id,
          weather,
        });

        setRaceWeekendId(res.data.id);
      } catch {}
    };

    if (!raceWeekendId) {
      detectWeekend();
    }
  }, [raceWeekendId, season]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      resetRace();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  /* ================= DNF HANDLER (FIXED) ================= */
  const toggleDNF = (id) => {
    setDrivers((prev) => {
      const updated = prev.map((d) =>
        d.id === id
          ? {
              ...d,
              dnf: !d.dnf,
              fastestLap: false,
              incident: !d.dnf ? "none" : "crash", // ✅ FIXED LOGIC
            }
          : d,
      );

      return [
        ...updated.filter((d) => !d.dnf),
        ...updated.filter((d) => d.dnf),
      ];
    });
  };
  const changeIncident = (id, value) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, incident: value } : d)),
    );
  };

  /* ================= DRAG ================= */
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = drivers.findIndex((d) => d.id === active.id);
      const newIndex = drivers.findIndex((d) => d.id === over.id);

      const newOrder = arrayMove(drivers, oldIndex, newIndex);

      // 🔥 KEEP DNF AT BOTTOM ALWAYS
      setDrivers([
        ...newOrder.filter((d) => !d.dnf),
        ...newOrder.filter((d) => d.dnf),
      ]);
    }
  };

  /* ================= FASTEST LAP ================= */
  const toggleFastestLap = (id) => {
    setDrivers((prev) =>
      prev.map((d) => ({
        ...d,
        fastestLap: d.id === id ? !d.fastestLap : false,
      })),
    );
  };

  const resetRace = () => {
    setSubmitted(false);
    setRecap(null);
    setPhase("idle");
    setCountdown(null);

    loadDrivers();
    setRaceWeekendId(null);
  };

  /* ================= SUBMIT (FULLY FIXED) ================= */
  const submitResults = async () => {
    try {
      setLoading(true);
      setRecapLoading(true);

      const fastestCount = drivers.filter((d) => d.fastestLap).length;

      if (fastestCount !== 1) {
        showToast("Exactly one fastest lap required ⚠️", "error");
        setLoading(false);
        return;
      }

      const invalidDNF = drivers.some((d) => d.dnf && d.incident === "none");

      if (invalidDNF) {
        showToast("DNF must have incident ⚠️", "error");
        setLoading(false);
        return;
      }

      /* ======================
       🔥 FIXED RESULTS LOGIC
    ====================== */

      let positionCounter = 1;

      const results = drivers.map((d) => {
        if (d.dnf) {
          return {
            driverId: d.id,
            position: null, // ✅ FIXED (NO DUPLICATE POSITIONS)
            fastestLap: false,
            dnf: true,
            incident: d.incident,
          };
        }

        return {
          driverId: d.id,
          position: positionCounter++, // ✅ sequential only for finishers
          fastestLap: d.fastestLap,
          dnf: false,
          incident: null,
        };
      });

      /* ======================
       🛡️ DUPLICATE SAFETY
    ====================== */

      const uniqueResults = [];
      const seen = new Set();

      for (const r of results) {
        if (!seen.has(r.driverId)) {
          seen.add(r.driverId);
          uniqueResults.push(r);
        }
      }

      console.log("FINAL PAYLOAD:", uniqueResults);

      await api.post("/races/results", {
        raceWeekendId,
        results: uniqueResults,
      });

      setSubmitted(true);
      setPhase("submitted");

      const recapRes = await api.get(`/races/recap-ai/${raceWeekendId}`);
      setRecap(recapRes.data);

      showToast("Race submitted ✔", "success", 0);

      setCountdown(10); // real countdown (handled by useEffect)
    } catch (err) {
      showToast(err.response?.data?.message || "Error ❌", "error");
    } finally {
      setLoading(false);
      setRecapLoading(false);
    }
  };
  /* ================= UI ================= */

  return (
    <div className="manual-wrapper">
      {toast && <div className={`toast-message ${toastType}`}>{toast}</div>}

      <GlassCard className="manual-header">
        <h2>Manual Race Control </h2>
        <h4>DNF TICKED ARE PUSHED TO LAST</h4>

        <div className="weather-control">
          <label>Weather</label>
          <select value={weather} onChange={(e) => setWeather(e.target.value)}>
            <option value="dry">☀️ Dry</option>
            <option value="rain">🌧 Rain</option>
            <option value="mixed">🌦 Mixed</option>
          </select>
        </div>
      </GlassCard>

      {raceWeekendId && (
        <GlassCard className="manual-board">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={drivers.map((d) => d.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="driver-list">
                {drivers.map((driver, index) => (
                  <SortableDriver
                    key={driver.id}
                    driver={driver}
                    index={index}
                    toggleFastestLap={toggleFastestLap}
                    toggleDNF={toggleDNF}
                    changeIncident={changeIncident}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {loading ? (
            <div className="loader-container">
              <div className="loader-ring"></div>
              <p>Submitting race results...</p>
            </div>
          ) : (
            <button
              className="submit-btn"
              onClick={submitResults}
              disabled={submitted}
            >
              Submit Race Results
            </button>
          )}
          {submitted && countdown !== null && (
            <div className="next-round">
              Next race starts in {countdown}s...
            </div>
          )}
        </GlassCard>
      )}

      {recap && (
        <GlassCard>
          <h3>AI Recap</h3>
          <p>{recap.narrative}</p>
        </GlassCard>
      )}
    </div>
  );
}
