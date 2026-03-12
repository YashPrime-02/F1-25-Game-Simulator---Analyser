// src/services/raceService.js
import api from "./api";

export const simulateRace = async (seasonId) => {
  const response = await api.post("/races/simulate", {
    seasonId,
  });
  return response.data;
};

export const fetchRaceResults = async (raceWeekendId) => {
  const response = await api.get(`/races/recap/${raceWeekendId}`);
  return response.data;
};

export const fetchAIRecap = async (raceWeekendId) => {
  const response = await api.get(`/races/recap-ai/${raceWeekendId}`);
  return response.data;
};

export const fetchSeasonNews = async (seasonId) => {
  const response = await api.get(`/races/news/${seasonId}`);
  return response.data;
};

export const fetchSeasonProgression = async (seasonId) => {
  const response = await api.get(`/races/progression/${seasonId}`);
  return response.data;
};

export const fetchDriverStandings = async (seasonId) => {
  const response = await api.get(`/races/standings/${seasonId}`);
  return response.data;
};

export const fetchChampionshipSummary = async (seasonId) => {
  const response = await api.get(
    `/races/championship-summary/${seasonId}`
  );
  return response.data;
};

export const getRaceRecapAI = (raceWeekendId) =>
  api.get(`/races/recap-ai/${raceWeekendId}`).then(r => r.data);

/* ======================================================
   ✅ NEW — COMMENTARY FEED 
====================================================== */

export const fetchSeasonCommentary = async (seasonId) => {
  const response = await api.get(`/races/commentary/${seasonId}`);
  return response.data;
};

/* ======================================================
   ✅ NEW — LATEST RACE DATA (FOR COMMENTARY FEED) 
====================================================== */


export const fetchLatestRace = async (seasonId) => {
  const res = await api.get(`/races/latest/${seasonId}`);
  return res.data;
};