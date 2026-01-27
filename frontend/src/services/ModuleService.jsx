import axios from "axios";

const API_URL = "http://localhost:5000/api/modules";

export const fetchModules = async (grouped = false) => {
  try {
    const token = localStorage.getItem("token");
    const url = grouped 
      ? `${API_URL}?grouped=true`
      : API_URL;
    
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // If grouped=true, response.data has {success: true, data: [...]}
    // If grouped=false, response.data is array directly
    return grouped ? response.data.data : response.data;
    
  } catch (error) {
    console.error("Error fetching modules:", error);
    throw error;
  }
};