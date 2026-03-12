import api from "./api";

/* ===============================
   GET ALL TEAMS
================================ */

export const getTeams = async () => {
  const res = await api.get("/teams");
  return res.data;
};