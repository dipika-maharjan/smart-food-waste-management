import axios from "axios";
import { getToken } from "./authService";

const API_URL = "https://smart-food-waste-management.up.railway.app/api/food/alerts";

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

// Get expiry alerts
export const getAlerts = async () => {
  const res = await axios.get(API_URL, getHeaders());
  return res.data;
};
