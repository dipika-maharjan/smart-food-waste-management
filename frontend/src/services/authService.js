import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Register a new user
export const register = async (name, email, password, phone = "") => {
  const res = await axios.post(`${API_URL}/register`, {
    name,
    email,
    password,
    phone,
  });
  return res.data;
};

// Login user
export const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  // Store token in localStorage
  if (res.data.access_token) {
    localStorage.setItem("token", res.data.access_token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }
  return res.data;
};

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Get token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};
