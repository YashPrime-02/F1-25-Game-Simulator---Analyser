import { createContext, useContext, useEffect, useState } from "react";
import { fetchActiveSeason, fetchAllSeasons } from "../services/seasonService";
import { fetchLatestRace } from "../services/raceService";

const SeasonContext = createContext();

export function SeasonProvider({ children }) {

  const [season, setSeason] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestRaceId, setLatestRaceId] = useState(null);

  // ✅ NEW: refresh trigger
  const [refresh, setRefresh] = useState(0);

  const triggerRefresh = () => {
    setRefresh(prev => prev + 1);
  };

  const loadSeason = async () => {

    try {

      setLoading(true);

      const allSeasons = await fetchAllSeasons();
      let seasonsList = allSeasons || [];

      let activeSeason = null;

      try {
        activeSeason = await fetchActiveSeason();
      } catch (err) {
        console.warn("Active season fetch failed:", err);
      }

      let selectedSeason = null;

      if (activeSeason) {

        selectedSeason = activeSeason;

        const exists = seasonsList.find(s => s.id === activeSeason.id);

        if (!exists) {
          seasonsList = [...seasonsList, activeSeason];
        }

      }

      if (!selectedSeason && seasonsList.length > 0) {
        selectedSeason = seasonsList[seasonsList.length - 1];
      }

      setSeasons(seasonsList);
      setSeason(selectedSeason);

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
        reloadSeason: loadSeason,

        // ✅ NEW EXPORTS
        refresh,
        triggerRefresh
      }}
    >

      {children}

    </SeasonContext.Provider>

  );

}

export const useSeason = () => useContext(SeasonContext);