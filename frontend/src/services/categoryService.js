import axios from "axios";
import { getToken } from "./authService";

const API_URL = "https://smart-food-waste-management.up.railway.app/api/category";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

// Create category
export const createCategory = async (category) => {
  const res = await axios.post(
    API_URL,
    { category },
    getHeaders()
  );
  return res.data;
};

// Get all categories
export const getCategories = async () => {
  const res = await axios.get(API_URL, getHeaders());
  return res.data;
};

// Delete category
export const deleteCategory = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, getHeaders());
  return res.data;
};
