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
         LOAD ALL SEASONS
      =============================== */

      const allSeasons = await fetchAllSeasons();

      let seasonsList = allSeasons || [];

      /* ===============================
         FETCH ACTIVE SEASON
      =============================== */

      let activeSeason = null;

      try {

        activeSeason = await fetchActiveSeason();

      } catch (err) {

        console.warn("Active season fetch failed:", err);

      }

      /* ===============================
         DETERMINE SELECTED SEASON
      =============================== */

      let selectedSeason = null;

      if (activeSeason) {

        selectedSeason = activeSeason;

        // ensure active season exists in dropdown list
        const exists = seasonsList.find(s => s.id === activeSeason.id);

        if (!exists) {
          seasonsList = [...seasonsList, activeSeason];
        }

      }

      /* ===============================
         FALLBACK → LATEST SEASON
      =============================== */

      if (!selectedSeason && seasonsList.length > 0) {

        selectedSeason = seasonsList[seasonsList.length - 1];

      }

      setSeasons(seasonsList);
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