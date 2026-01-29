import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const fetchUsers = (params) =>
  axios.get(API_URL, { ...getAuthHeader(), params });

export const createUser = (data) => axios.post(API_URL, data, getAuthHeader());

export const updateUser = (id, data) =>
  axios.put(`${API_URL}/${id}`, data, getAuthHeader());

export const deleteUser = (id) =>
  axios.delete(`${API_URL}/${id}`, getAuthHeader());

export const exportUsers = (params) =>
  axios.get(`${API_URL}/export`, {
    ...getAuthHeader(),
    params,
  });
