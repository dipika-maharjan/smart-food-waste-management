import axios from "axios";
import { getToken } from "./authService";

const API_URL = "https://smart-food-waste-management.up.railway.app/api/users";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

// Get user profile
export const getUserProfile = async () => {
  const res = await axios.get(`${API_URL}/me`, getHeaders());
  return res.data;
};

// Update user profile
export const updateUserProfile = async (name, phone) => {
  const res = await axios.put(
    `${API_URL}/me`,
    { name, phone },
    getHeaders()
  );
  return res.data;
};

// Delete user account
export const deleteUserProfile = async () => {
  const res = await axios.delete(`${API_URL}/me`, getHeaders());
  return res.data;
};
