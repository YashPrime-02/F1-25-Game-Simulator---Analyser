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

      <div
        className="control-col"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <label className="fl-box">
          <input
            type="checkbox"
            checked={driver.fastestLap}
            onChange={() => toggleFastestLap(driver.id)}
          />
          <span>FL</span>
        </label>

        <label className="dnf-box">
          <input
            type="checkbox"
            checked={driver.dnf}
            onChange={() => toggleDNF(driver.id)}
          />
          <span>DNF</span>
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

  useEffect(() => {
    const loadDrivers = async () => {
      const res = await api.get("/drivers");
      setDrivers(
        res.data.map((d) => ({
          ...d,
          fastestLap: false,
          dnf: false,
        }))
      );
    };
    loadDrivers();
  }, []);

  const createWeekend = async () => {
    if (!season?.id) return alert("No active season.");

    try {
      setLoading(true);
      const res = await api.post("/races/weekend", {
        seasonId: season.id,
      });
      setRaceWeekendId(res.data.id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed creating weekend");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = drivers.findIndex((d) => d.id === active.id);
      const newIndex = drivers.findIndex((d) => d.id === over.id);
      setDrivers(arrayMove(drivers, oldIndex, newIndex));
    }
  };

  const toggleFastestLap = (id) => {
    setDrivers((prev) =>
      prev.map((d) => ({
        ...d,
        fastestLap: d.id === id ? !d.fastestLap : false,
      }))
    );
  };

  const toggleDNF = (id) => {
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, dnf: !d.dnf } : d
      )
    );
  };

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

      await api.post("/races/results", {
        raceWeekendId,
        results,
      });

      const recapRes = await api.get(
        `/races/recap-ai/${raceWeekendId}`
      );

      setRecap(recapRes.data);
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
      setRecapLoading(false);
    }
  };

  return (
    <div className="manual-wrapper">
      <GlassCard className="manual-header">
        <h2>Manual Race Control</h2>
        {!raceWeekendId ? (
          <button  className="submit-btn" onClick={createWeekend} disabled={loading}>
            {loading ? "Preparing Weekend..." : "Start New Round"}
          </button>
        ) : (
          <div className="weekend-status">Weekend Ready ✔</div>
        )}
      </GlassCard>

      {raceWeekendId && (
        <GlassCard className="manual-board">
          <h3>Drag Drivers to Set Finishing Order</h3>

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
            disabled={loading}
          >
            Submit Race Results
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