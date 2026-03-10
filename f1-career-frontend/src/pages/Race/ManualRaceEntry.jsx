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

/* ================= SORTABLE DRIVER ================= */

function SortableDriver({ driver, index, toggleFastestLap, toggleDNF }) {
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

        {/* <label className="dnf-box">
          <input
            type="checkbox"
            checked={driver.dnf}
            onChange={() => toggleDNF(driver.id)}
          />
          <span>DNF</span>
        </label> */}
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
  const [countdown, setCountdown] = useState(null);

  /* ================= LOAD DRIVERS ================= */

  useEffect(() => {
    const loadDrivers = async () => {
      const res = await api.get("/drivers");

      setDrivers(
        res.data.map((d) => ({
          ...d,
          fastestLap: false,
          dnf: false,
        })),
      );
    };

    loadDrivers();
  }, []);

  /* ================= AUTO DETECT WEEKEND ================= */

  useEffect(() => {
    const detectWeekend = async () => {
      if (!season?.id) return;

      try {
        const res = await api.post("/races/weekend", {
          seasonId: season.id,
        });

        setRaceWeekendId(res.data.id);
      } catch (err) {
        console.log("Weekend detection skipped");
      }
    };

    detectWeekend();
  }, [season]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      window.location.reload();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

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
      })),
    );
  };

  /* ================= DNF ================= */

  const toggleDNF = (id) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, dnf: !d.dnf } : d)),
    );
  };

  /* ================= SUBMIT ================= */

  const submitResults = async () => {
  try {

    setLoading(true);
    setRecapLoading(true);

    const fastestCount = drivers.filter((d) => d.fastestLap).length;

    if (fastestCount !== 1) {
      alert("Exactly one fastest lap required.");
      setLoading(false);
      return;
    }

    const results = drivers.map((d, index) => ({
      driverId: d.id,
      position: index + 1,
      fastestLap: d.fastestLap,
      dnf: d.dnf,
    }));

    /* ===============================
       SAVE RESULTS
    =============================== */

    await api.post("/races/results", {
      raceWeekendId,
      results,
    });

    setSubmitted(true);

    /* ===============================
       FETCH AI RECAP
    =============================== */

    try {

      const recapRes = await api.get(`/races/recap-ai/${raceWeekendId}`);
      setRecap(recapRes.data);

    } catch {
      console.warn("AI recap unavailable.");
    }

    /* ===============================
       SHOW TOAST + START COUNTDOWN
    =============================== */

    setToast("Race results submitted ✔ Preparing next round...");
    setCountdown(10);   // start reverse countdown

  } catch (err) {

    alert(err.response?.data?.message || "Submission failed");

  } finally {

    setLoading(false);
    setRecapLoading(false);

  }
};

  return (
    <div className="manual-wrapper">
      {toast && (
        <div className="toast-message">
          {toast}
          {countdown !== null && (
            <span
              style={{ marginLeft: "8px", fontWeight: "700", color: "#e10600" }}
            >
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

      {raceWeekendId && (
        <GlassCard className="manual-board">
          <h3>Drag Drivers to Set Finishing Order</h3>

          <h3>NOTE : PLACE DNF DRIVERS AT LAST MANUALLY PLEASE</h3>

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
