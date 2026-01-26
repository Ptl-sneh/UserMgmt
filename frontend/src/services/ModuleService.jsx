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
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(`${API_URL}/grouped`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Modules API Response:", response.data); // Debug log
    return response.data.data;
  } catch (error) {
    console.error(
      "Error fetching modules:",
      error.response?.data || error.message,
    );
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