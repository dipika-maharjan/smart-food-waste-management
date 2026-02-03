import axios from "axios";

const API_URL = "http://localhost:5000/api/food"; // adjust backend URL

export const addFoodItem = async (food) => {
  const res = await axios.post(`${API_URL}/add`, food);
  return res.data;
};

export const getInventory = async () => {
  const res = await axios.get(`${API_URL}/list`);
  return res.data;
};

export const updateFoodStatus = async (id, status) => {
  const res = await axios.put(`${API_URL}/update-status/${id}`, { status });
  return res.data;
};
