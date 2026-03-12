import api from "./api";

export const createCareer = async (data) => {
  const response = await api.post("/careers", data);
  return response.data;
};