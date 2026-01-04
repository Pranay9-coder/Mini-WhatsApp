import axios from "axios";
import { getAuthToken } from "./tokenUtil.js";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" }
});

client.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchChats = async () => {
  const { data } = await client.get("/api/chats");
  return data;
};

export const sendMessageApi = async ({ to, msg }) => {
  const { data } = await client.post("/api/chats", { to, msg });
  return data;
};

export const updateMessage = async (id, msg) => {
  const { data } = await client.put(`/api/chats/${id}`, { msg });
  return data;
};

export const deleteMessage = async (id) => client.delete(`/api/chats/${id}`);
