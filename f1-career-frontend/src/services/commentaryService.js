import api from "./api";

export const fetchSeasonCommentary = async (seasonId) => {
  const response = await api.get(`/races/commentary/${seasonId}`);

  const data = response.data;

  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    round: item?.round,  
    text:
      item?.text ||
      item?.message ||
      item?.commentaryText ||
      item?.commentary ||
      ""
  }));
};