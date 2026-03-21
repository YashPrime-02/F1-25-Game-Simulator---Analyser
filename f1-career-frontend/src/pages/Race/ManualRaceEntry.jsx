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

function SortableDriver({ driver, index, toggleFastestLap }) {
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
      className={`driver-row ${driver.fastestLap ? "fl-active" : ""}`}
      {...attributes}
      {...listeners}
    >
      <div className="pos-col">P{index + 1}</div>

      <div className="name-col">
        {driver.firstName} {driver.lastName}
      </div>

      <div className="control-col" onPointerDown={(e) => e.stopPropagation()}>
        <label className="fl-box">
          <input
            type="checkbox"
            checked={driver.fastestLap}
            onChange={() => toggleFastestLap(driver.id)}
          />
          <span>Fastest Lap</span>
        </label>
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

  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState("success");

  const [countdown, setCountdown] = useState(null);
  const [phase, setPhase] = useState("idle");

  /* ================= TOAST HELPER ================= */
  const showToast = (message, type = "success", duration = 4000) => {
    setToast(message);
    setToastType(type);

    if (duration !== 0) {
      setTimeout(() => setToast(null), duration);
    }
  };

  /* ================= AUDIO ================= */
  useBackgroundAudio(f1Music, {
    volume: 0.35,
    loop: true,
  });

  /* ================= LOAD DRIVERS ================= */
  const loadDrivers = async () => {
    try {
      const res = await api.get("/drivers");

      setDrivers(
        res.data.map((d) => ({
          ...d,
          fastestLap: false,
          dnf: false,
        }))
      );
    } catch {
      showToast("Failed to load drivers ❌", "error");
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  /* ================= DETECT WEEKEND ================= */

  useEffect(() => {
    const detectWeekend = async () => {
      if (!season?.id) return;

      try {
        const res = await api.post("/races/weekend", {
          seasonId: season.id,
        });

        setRaceWeekendId(res.data.id);
      } catch {
        console.log("Weekend detection skipped");
      }
    };

    detectWeekend();
  }, [season]);

  /* ================= COUNTDOWN FLOW ================= */

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setPhase("transition");
      handleNextRace();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  /* ================= NEXT RACE ================= */

  const handleNextRace = async () => {
    try {
      showToast("Travelling to next Grand Prix... ✈️", "success");

      const res = await api.post("/races/weekend", {
        seasonId: season.id,
        next: true,
      });

      setRaceWeekendId(res.data.id);

      await loadDrivers();

      setRecap(null);
      setSubmitted(false);
      setCountdown(null);

      showToast("Next race weekend ready 🏁", "success");

      setPhase("ready");
    } catch (err) {
      console.error(err);
      showToast("Failed to prepare next race ❌", "error");
    }
  };

  /* ================= DRAG ================= */

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = drivers.findIndex((d) => d.id === active.id);
      const newIndex = drivers.findIndex((d) => d.id === over.id);

      setDrivers(arrayMove(drivers, oldIndex, newIndex));
    }
  };

  /* ================= FASTEST LAP ================= */

  const toggleFastestLap = (id) => {
    setDrivers((prev) =>
      prev.map((d) => ({
        ...d,
        fastestLap: d.id === id ? !d.fastestLap : false,
      }))
    );
  };

  /* ================= SUBMIT ================= */

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

      const results = drivers.map((d, index) => ({
        driverId: d.id,
        position: index + 1,
        fastestLap: d.fastestLap,
        dnf: d.dnf,
      }));

      await api.post("/races/results", {
        raceWeekendId,
        results,
      });

      setSubmitted(true);
      setPhase("submitted");

      try {
        const recapRes = await api.get(`/races/recap-ai/${raceWeekendId}`);
        setRecap(recapRes.data);
      } catch {
        console.warn("AI recap unavailable.");
      }

      showToast(
        "Race results submitted ✔ Preparing next round...",
        "success",
        0 // persistent (because countdown running)
      );

      setCountdown(10);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Submission failed ❌",
        "error"
      );
    } finally {
      setLoading(false);
      setRecapLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="manual-wrapper">

      {/* TRANSITION */}
      {phase === "transition" && (
        <div className="transition-screen">
          <div className="loader-ring"></div>
          <h2>Travelling to Next Grand Prix...</h2>
          <p>Simulating race logistics & strategy...</p>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`toast-message ${toastType}`}>
          {toast}
          {countdown !== null && (
            <span style={{ marginLeft: 8, fontWeight: 700 }}>
              ({countdown})
            </span>
          )}
        </div>
      )}

      <GlassCard className="manual-header">
        <h2>Manual Race Control</h2>

        {raceWeekendId ? (
          <div className="weekend-status">Weekend Ready ✔</div>
        ) : (
          <div>Preparing Weekend...</div>
        )}
      </GlassCard>

      {raceWeekendId && phase !== "transition" && (
        <GlassCard className="manual-board">
          <h3>Drag Drivers to Set Finishing Order</h3>
          <h3>NOTE: PLACE DNF DRIVERS AT LAST</h3>

          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            className="submit-btn"
            onClick={submitResults}
            disabled={loading || submitted}
          >
            {submitted ? "Round Submitted ✔" : "Submit Race Results"}
          </button>
        </GlassCard>
      )}

      {recapLoading && (
        <GlassCard className="recap-loading">
          <div className="ai-loader">
            <div className="pulse"></div>
            <p>AI generating race narrative...</p>
          </div>
        </GlassCard>
      )}

      {recap && !recapLoading && (
        <GlassCard className="recap-card">
          <h3>AI Race Recap</h3>
          <p>{recap.narrative}</p>
        </GlassCard>
      )}
    </div>
  );
}