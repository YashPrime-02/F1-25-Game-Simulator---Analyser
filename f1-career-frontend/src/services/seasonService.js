import api from "./api";

export const fetchActiveSeason = async () => {
  const response = await api.get("/seasons/active");
  return response.data;
};