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