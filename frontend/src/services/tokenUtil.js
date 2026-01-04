const TOKEN_KEY = "miniwhatsapp_token";

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY) || "";
