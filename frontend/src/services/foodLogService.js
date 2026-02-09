import axios from "axios";
import { getToken } from "./authService";

const API_URL = "https://smart-food-waste-management.up.railway.app/api/food-logs";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

// Create food log
export const createFoodLog = async (data) => {
  const res = await axios.post(API_URL, data, getHeaders());
  return res.data;
};

// Get all food logs
export const getFoodLogs = async () => {
  const res = await axios.get(API_URL, getHeaders());
  return res.data;
};

// Get food log by ID
export const getFoodLogById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, getHeaders());
  return res.data;
};

// Delete food log
export const deleteFoodLog = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, getHeaders());
  return res.data;
};
