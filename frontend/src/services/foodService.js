import axios from "axios";
import { getToken } from "./authService";

const API_URL = "https://smart-food-waste-management.up.railway.app/api";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

// ============================================================
// FOOD MANAGEMENT
// ============================================================

// Add new food item
export const addFoodItem = async (food) => {
  const res = await axios.post(`${API_URL}/food`, food, getHeaders());
  return res.data;
};

// Get all food items
export const getInventory = async () => {
  const res = await axios.get(`${API_URL}/food`, getHeaders());
  const data = res.data || {};
  const buckets = [
    data.available_items,
    data.expired_items,
    data.used_items,
    data.donated_items,
    data.wasted_items,
  ];
  return buckets.flat().filter(Boolean);
};

// Update food item
export const updateFoodItem = async (id, data) => {
  const res = await axios.put(`${API_URL}/food/${id}`, data, getHeaders());
  return res.data;
};

// Update food status (AVAILABLE, USED, DONATED, WASTED)
export const updateFoodStatus = async (id, status, reason = null, remarks = null) => {
  const payload = { status };
  if (reason) payload.reason = reason;
  if (remarks) payload.remarks = remarks;
  
  const res = await axios.patch(`${API_URL}/food/${id}/status`, payload, getHeaders());
  return res.data;
};

// Delete food item
export const deleteFoodItem = async (id) => {
  const res = await axios.delete(`${API_URL}/food/${id}`, getHeaders());
  return res.data;
};

// ============================================================
// ANALYTICS
// ============================================================

// Get analytics data
export const getAnalytics = async () => {
  const res = await axios.get(`${API_URL}/analytics`, getHeaders());
  return res.data;
};
