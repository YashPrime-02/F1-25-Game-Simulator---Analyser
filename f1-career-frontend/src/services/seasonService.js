import api from "./api";

export const fetchActiveSeason = async () => {

  const res = await api.get("/season/active");
  return res.data;

};

export const fetchAllSeasons = async () => {

  const res = await api.get("/season");
  return res.data;

};