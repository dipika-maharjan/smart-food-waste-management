import axios from "axios";

const API_URL = "http://localhost:5000/api";

// ============================================================
// FOOD MANAGEMENT
// ============================================================

// Add new food item
export const addFoodItem = async (food) => {
  const res = await axios.post(`${API_URL}/foods`, food);
  return res.data;
};

// Get all food items
export const getInventory = async () => {
  const res = await axios.get(`${API_URL}/foods`);
  return res.data;
};

// Update food status (AVAILABLE, USED, DONATED, WASTED)
export const updateFoodStatus = async (id, status, reason = null, remarks = null) => {
  const payload = { status };
  if (reason) payload.reason = reason;
  if (remarks) payload.remarks = remarks;
  
  const res = await axios.post(`${API_URL}/foods/${id}/status`, payload);
  return res.data;
};

// Delete food item
export const deleteFoodItem = async (id) => {
  const res = await axios.delete(`${API_URL}/foods/${id}`);
  return res.data;
};

// ============================================================
// ANALYTICS
// ============================================================

// Get analytics data
export const getAnalytics = async () => {
  const res = await axios.get(`${API_URL}/analytics`);
  return res.data;
};
