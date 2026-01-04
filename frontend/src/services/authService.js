import axios from "axios";
import { getAuthToken } from "./tokenUtil.js";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" }
});

client.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = async ({ username, password }) => {
  const { data } = await client.post("/api/auth/register", { username, password });
  return data;
};

export const loginUser = async ({ username, password }) => {
  const { data } = await client.post("/api/auth/login", { username, password });
  return data;
};

export const searchUsers = async (username) => {
  const { data } = await client.get(`/api/auth/users?username=${encodeURIComponent(username)}`);
  return data;
};
