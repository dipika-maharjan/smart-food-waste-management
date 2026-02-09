import axios from "axios";
import { getToken } from "./authService";

const API_URL = "https://smart-food-waste-management.up.railway.app/api";

const getAuthHeaders = () => {
  const token = getToken();
  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
};

// ============================================================
// DONATION CENTERS
// ============================================================

// Create donation center
export const createDonationCenter = async (data) => {
  const res = await axios.post(
    `${API_URL}/donation-centers`,
    data,
    getAuthHeaders()
  );
  return res.data;
};

// Get all donation centers
export const getDonationCenters = async () => {
  const res = await axios.get(`${API_URL}/donation-centers`);
  return res.data;
};

// Get donation center by ID
export const getDonationCenterById = async (id) => {
  const res = await axios.get(`${API_URL}/donation-centers/${id}`);
  return res.data;
};

// Update donation center
export const updateDonationCenter = async (id, data) => {
  const res = await axios.put(
    `${API_URL}/donation-centers/${id}`,
    data,
    getAuthHeaders()
  );
  return res.data;
};

// Delete donation center
export const deleteDonationCenter = async (id) => {
  const res = await axios.delete(
    `${API_URL}/donation-centers/${id}`,
    getAuthHeaders()
  );
  return res.data;
};

// ============================================================
// DONATION OFFERS
// ============================================================

// Create donation offer
export const createDonationOffer = async (data) => {
  const res = await axios.post(
    `${API_URL}/donation-offers`,
    data,
    getAuthHeaders()
  );
  return res.data;
};

// Get all donation offers
export const getDonationOffers = async () => {
  const res = await axios.get(`${API_URL}/donation-offers`, getAuthHeaders());
  return res.data;
};

// Get donation offer by ID
export const getDonationOfferById = async (id) => {
  const res = await axios.get(
    `${API_URL}/donation-offers/${id}`,
    getAuthHeaders()
  );
  return res.data;
};

// Update donation offer status
export const updateDonationOfferStatus = async (id, status) => {
  const res = await axios.patch(
    `${API_URL}/donation-offers/${id}/status`,
    { status },
    getAuthHeaders()
  );
  return res.data;
};

// Delete donation offer
export const deleteDonationOffer = async (id) => {
  const res = await axios.delete(
    `${API_URL}/donation-offers/${id}`,
    getAuthHeaders()
  );
  return res.data;
};
