import { createContext, useContext, useEffect, useState } from "react";
import { fetchActiveSeason } from "../services/seasonService";

const SeasonContext = createContext();

export function SeasonProvider({ children }) {
  const [season, setSeason] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSeason = async () => {
      try {
        const data = await fetchActiveSeason();
        setSeason(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSeason();
  }, []);

  return (
    <SeasonContext.Provider value={{ season, loading }}>
      {children}
    </SeasonContext.Provider>
  );
}

export const useSeason = () => useContext(SeasonContext);