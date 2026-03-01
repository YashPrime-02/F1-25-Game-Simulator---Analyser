import { createContext, useContext, useEffect, useState } from "react";
import { fetchActiveSeason } from "../services/seasonService";
import { fetchLatestRace } from "../services/raceService"; // ✅ ADDED

const SeasonContext = createContext();

export function SeasonProvider({ children }) {
  const [season, setSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [latestRaceId, setLatestRaceId] = useState(null);

  useEffect(() => {
    const loadSeason = async () => {
      try {
        const data = await fetchActiveSeason();
        setSeason(data);

        // ✅ FETCH LATEST RACE (SAFE ADDITION)
        if (data?.id) {
          try {
            const latestRace = await fetchLatestRace(data.id);

            if (latestRace?.id) {
              setLatestRaceId(latestRace.id);
            }
          } catch (err) {
            // no races yet → silently ignore
            console.log("No latest race available");
          }
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSeason();
  }, []);

  return (
    <SeasonContext.Provider
      value={{
        season,
        loading,
        latestRaceId,
        setLatestRaceId,
        setSeason,
      }}
    >
      {children}
    </SeasonContext.Provider>
  );
}

export const useSeason = () => useContext(SeasonContext);