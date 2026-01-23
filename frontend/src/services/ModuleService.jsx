// services/ModuleService.jsx
import axios from "axios";

const API_URL = "http://localhost:5000/api/modules";

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const fetchModules = async () => {
  try {
    const response = await axios.get(`${API_URL}/grouped`, getAuthHeader());
    return response.data.data;
  } catch (error) {
    console.error("Error fetching modules:", error);
    throw error;
  }
};

export const fetchModulesUnique = async () => {
  try {
    const response = await axios.get(`${API_URL}/grouped-unique`, getAuthHeader());
    return response.data.data;
  } catch (error) {
    console.error("Error fetching unique modules:", error);
    throw error;
  }
};

export default {
  fetchModules,
  fetchModulesUnique,
};