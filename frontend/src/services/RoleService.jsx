import axios from "axios";

const API_URL = "http://localhost:5000/api/roles";

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});

export const fetchRoles = () =>
  axios.get(API_URL, getAuthHeader());

export const createRole = (data) =>
  axios.post(API_URL, data, getAuthHeader());

export const updateRole = (id, data) =>
  axios.put(`${API_URL}/${id}`, data, getAuthHeader());

export const deleteRole = (id) =>
  axios.delete(`${API_URL}/${id}`, getAuthHeader());