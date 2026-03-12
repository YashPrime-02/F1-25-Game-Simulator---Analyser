import api from "./api";

/**
 * Login user
 */
export const loginUser = async ({ email, password }) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data; // expected { token, user }
};

/**
 * Signup user
 */
export const signupUser = async ({ name, email, password }) => {
  const response = await api.post("/auth/signup", {
    name,
    email,
    password,
  });

  return response.data; // expected { token, user }
};

/**
 * Logout helper
 */
export const logoutUser = () => {
  localStorage.removeItem("token");
};