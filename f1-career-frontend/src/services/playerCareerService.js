import api from "./api";

export const createPlayerCareer = async (payload) => {
  const res = await api.post("/player-career", payload);
  return res.data;
};