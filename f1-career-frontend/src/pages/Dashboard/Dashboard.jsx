import { useEffect, useState } from "react";
import { useSeason } from "../../context/SeasonContext";
import { fetchChampionshipSummary } from "../../services/raceService";
import {
  fetchDriverStandings,
  fetchSeasonNews,
} from "../../services/raceService";
import GlassCard from "../../components/ui/GlassCard";
import Counter from "../../components/ui/Counter";

export default function Dashboard() {
  const { season } = useSeason();
  const [leader, setLeader] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!season?.id) return;

    const loadSummary = async () => {
      try {
        const data = await fetchChampionshipSummary(season.id);
        setSummary(data);
      } catch (err) {
        console.error("Failed loading championship summary", err);
      }
    };

    loadSummary();
  }, [season?.id]);

  useEffect(() => {
      const loadData = async () => {
        try {
          const standings = await fetchDriverStandings(season.id);
  
          if (standings.length > 0) {
            setLeader(standings[0].driverName);
  
            if (standings.length > 1) {
              setGap(standings[0].totalPoints - standings[1].totalPoints);
            }
          }
  
        
        } catch (err) {
          console.error("Dashboard load failed", err);
        }
      };
  
      if (season?.id) {
        loadData();
      }
    }, [season]);

  if (!summary) {
    return (
      <GlassCard>
        <h2>Championship Loading...</h2>
        <p>Run a race to generate standings.</p>
      </GlassCard>
    );
  }

  return (
    <>
      {/* Leader */}
      <GlassCard>
        <h2>Championship Leader</h2>
        <p> {leader || "No races completed yet"}</p>
      </GlassCard>

      <br />

      {/* Points Gap */}
      <GlassCard>
        <h2>Points Gap</h2>
        <Counter value={summary.gap} /> Points
      </GlassCard>

      <br />

      {/* Season Phase */}
      <GlassCard>
        <h2>Season Phase</h2>
        <p>{summary.phase}</p>
      </GlassCard>

      <br />

      {/* Momentum */}
      <GlassCard>
        <h2>Momentum</h2>
        <p>{summary.momentum}</p>
      </GlassCard>

      {/* Rivalry */}
      {summary.rivalry && (
        <>
          <br />
          <GlassCard>
            <h2>Rivalry Watch</h2>
            <p>{summary.rivalry}</p>
          </GlassCard>
        </>
      )}
    </>
  );
}