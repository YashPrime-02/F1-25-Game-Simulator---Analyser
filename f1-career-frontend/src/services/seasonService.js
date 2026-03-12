import api from "./api";

export const fetchActiveSeason = async () => {

  const res = await api.get("/seasons/active");
  return res.data;

};

export const fetchAllSeasons = async () => {

  const res = await api.get("/seasons");
  return res.data;

};