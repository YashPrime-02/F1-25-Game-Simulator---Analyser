import api from "./api";

export const fetchDriverStandings = async (seasonId) => {
  const response = await api.get(`/races/standings/${seasonId}`);
  return response.data;
};