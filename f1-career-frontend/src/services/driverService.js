import api from "./api";

/* ===============================
   GET DRIVERS BY TEAM
================================ */

export const getDriversByTeam = async (teamId) => {
  const res = await api.get(`/drivers/team/${teamId}`);
  return res.data;
};