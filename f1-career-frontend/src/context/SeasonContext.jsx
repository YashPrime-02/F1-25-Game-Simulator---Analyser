import { createContext, useContext, useEffect, useState } from "react";
import { fetchActiveSeason, fetchAllSeasons } from "../services/seasonService";
import { fetchLatestRace } from "../services/raceService";

const SeasonContext = createContext();

export function SeasonProvider({ children }) {

  const [season, setSeason] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestRaceId, setLatestRaceId] = useState(null);

  const loadSeason = async () => {

    try {

      setLoading(true);

      /* ===============================
         LOAD ALL SEASONS (dropdown)
      =============================== */

      const allSeasons = await fetchAllSeasons();

      setSeasons(allSeasons || []);

      let selectedSeason = null;

      /* ===============================
         TRY FETCH ACTIVE SEASON
      =============================== */

      try {

        const active = await fetchActiveSeason();

        if (active) {
          selectedSeason = active;
        }

      } catch (err) {

        // 404 is expected when no active season exists
        console.log("No active season from API");

      }

      /* ===============================
         FALLBACK → LATEST SEASON
      =============================== */

      if (!selectedSeason && allSeasons?.length > 0) {

        selectedSeason = allSeasons[allSeasons.length - 1];

      }

      setSeason(selectedSeason);

      /* ===============================
         FETCH LATEST RACE
      =============================== */

      if (selectedSeason?.id) {

        try {

          const latestRace = await fetchLatestRace(selectedSeason.id);

          if (latestRace?.id) {
            setLatestRaceId(latestRace.id);
          } else {
            setLatestRaceId(null);
          }

        } catch {

          setLatestRaceId(null);

        }

      }

    } catch (err) {

      console.error("Season loading failed:", err);

      setSeason(null);
      setSeasons([]);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadSeason();

  }, []);

  return (

    <SeasonContext.Provider
      value={{
        season,
        seasons,
        loading,
        latestRaceId,
        setLatestRaceId,
        setSeason,
        reloadSeason: loadSeason
      }}
    >

      {children}

    </SeasonContext.Provider>

  );

}

export const useSeason = () => useContext(SeasonContext);