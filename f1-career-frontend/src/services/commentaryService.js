import api from "./api";

export const fetchSeasonCommentary = async (seasonId) => {
  const response = await api.get(`/races/commentary/${seasonId}`);

  const data = response.data;

  // ✅ ensure array always returned
  if (!Array.isArray(data)) return [];

  // ✅ normalize backend fields → frontend contract
  return data.map((item) => ({
    text:
      item?.text ||
      item?.message ||
      item?.commentaryText ||
      item?.commentary ||
      ""
  }));
};