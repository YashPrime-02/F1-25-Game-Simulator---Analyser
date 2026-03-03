import { useEffect, useState } from "react";
import { useSeason } from "../../context/SeasonContext";
import api from "../../services/api";
import GlassCard from "../../components/ui/GlassCard";
import "./manualRace.css";

export default function ManualRaceEntry() {
  const { season } = useSeason();

  const [drivers, setDrivers] = useState([]);
  const [raceWeekendId, setRaceWeekendId] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recap, setRecap] = useState(null);

  /* ===============================
     LOAD ACTIVE DRIVERS
  =============================== */

  useEffect(() => {
    const loadDrivers = async () => {
      const res = await api.get("/drivers");
      const active = res.data.filter((d) => d.isActive);
      setDrivers(active);

      // initialize empty result structure
      setResults(
        active.map((d) => ({
          driverId: d.id,
          position: null,
          fastestLap: false,
          dnf: false,
        })),
      );
    };

    loadDrivers();
  }, []);

  /* ===============================
     CREATE RACE WEEKEND
  =============================== */

  const createWeekend = async () => {
    if (!season?.id) {
      alert("No active season.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/races/weekend", {
        seasonId: season.id,
        weather: "Dry",
        safetyCar: false,
        redFlag: false,
      });

      setRaceWeekendId(res.data.id);
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || "Failed creating weekend");
    } finally {
      setLoading(false);
    }
  };
  /* ===============================
     HANDLE INPUT CHANGE
  =============================== */

  const updateResult = (index, field, value) => {
    const updated = [...results];
    updated[index][field] = value;
    setResults(updated);
  };

  /* ===============================
     SUBMIT RESULTS
  =============================== */

  const submitResults = async () => {
    try {
      setLoading(true);

      // 🧠 VALIDATION
      const positions = results.map((r) => r.position);

      // Check empty
      if (positions.includes(null)) {
        alert("All drivers must have a finishing position.");
        setLoading(false);
        return;
      }

      // Check range
      const invalid = positions.some((p) => p < 1 || p > 20);
      if (invalid) {
        alert("Positions must be between 1 and 20.");
        setLoading(false);
        return;
      }

      // Check duplicates
      const unique = new Set(positions);
      if (unique.size !== 20) {
        alert("Duplicate positions detected.");
        setLoading(false);
        return;
      }

      await api.post("/races/results", {
        raceWeekendId,
        results,
      });

      const recapRes = await api.get(`/races/recap-ai/${raceWeekendId}`);

      setRecap(recapRes.data);
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manual-container">
      <GlassCard>
        <h2>Manual Race Weekend Entry</h2>

        {!raceWeekendId ? (
          <button onClick={createWeekend} disabled={loading}>
            {loading ? "Creating..." : "Create Race Weekend"}
          </button>
        ) : (
          <p>Weekend Created ✔ (Round Active)</p>
        )}
      </GlassCard>

      {raceWeekendId && (
        <GlassCard>
          <h3>Enter Results</h3>

          <table className="entry-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Position</th>
                <th>Fastest Lap</th>
                <th>DNF</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver, index) => (
                <tr key={driver.id}>
                  <td>
                    {driver.firstName} {driver.lastName}
                  </td>

                  <td>
                    <select
                      value={results[index].position || ""}
                      onChange={(e) =>
                        updateResult(index, "position", Number(e.target.value))
                      }
                    >
                      <option value="">Select</option>
                      {[...Array(20)].map((_, i) => {
                        const pos = i + 1;
                        const taken = results.some((r) => r.position === pos);

                        return (
                          <option
                            key={pos}
                            value={pos}
                            disabled={taken && results[index].position !== pos}
                          >
                            {pos}
                          </option>
                        );
                      })}
                    </select>
                  </td>

                  <td>
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        updateResult(index, "fastestLap", e.target.checked)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        updateResult(index, "dnf", e.target.checked)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={submitResults} disabled={loading}>
            Submit Results
          </button>
        </GlassCard>
      )}

      {recap && (
        <GlassCard>
          <h3>AI Race Recap</h3>
          <p>{recap.narrative}</p>
        </GlassCard>
      )}
    </div>
  );
}
