import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND,
  withCredentials: true, // Crucial: allows cookies to be sent/received across domains
});

// NEWS API METHODS
export const getNews = async (page = 1) => {
  const response = await API.get(`/api/allnews?page=${page}`);
  return response.data;
};

export const getNewsById = async (id) => {
  const response = await API.get(`/api/news/${id}`);
  return response.data;
};

export const getAIAnalysisByNewsId = async (id) => {
  const response = await API.get(`/api/news/${id}/analysis`);
  return response.data;
};

export const chatWithAI = async (id, message, history) => {
  const response = await API.post(`/api/news/${id}/chat`, { message, history });
  return response.data;
};

export const googleLogin = async (credential) => {
  const response = await API.post("/api/user/google-login", { credential });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await API.post("/api/user/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await API.post("/api/user/reset-password", { email, otp, newPassword });
  return response.data;
};


// STOCK API METHODS
export const getStocks = async () => {
  const response = await API.get("/stocks");
  return response.data;
};

export const fetchStockDetails = async (symbol) => {
  const response = await API.get(`/api/stocks/${encodeURIComponent(symbol)}`);
  return response.data;
};

export const fetchStockChart = async (symbol, range = "1d") => {
  const response = await API.get(`/api/stocks/${encodeURIComponent(symbol)}/chart?range=${range}`);
  return response.data;
};

export const fetchNifty50 = async () => {
  const response = await API.get("/api/nifty50");
  return response.data;
};

// USER AUTHENTICATION API METHODS
export const getCurrentUser = async () => {
  const response = await API.get("/api/user/current-user");
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await API.post("/api/user/login", { email, password });
  return response.data;
};

export const logoutUser = async () => {
  const response = await API.post("/api/user/logout");
  return response.data;
};

export const createAccount = async (name, email, password) => {
  const response = await API.post("/api/user/createaccount", { name, email, password });
  return response.data;
};

export const verifyOTP = async (name, email, password, otp) => {
  const response = await API.post("/api/user/verify-otp", { name, email, password, otp });
  return response.data;
};

// WATCHLIST API METHODS
export const getWatchlist = async () => {
  const response = await API.get("/api/watchlist");
  return response.data;
};

export const addToWatchlist = async (symbol, alertThreshold, isWatched) => {
  const response = await API.post("/api/watchlist", { symbol, alertThreshold, isWatched });
  return response.data;
};

export const removeFromWatchlist = async (symbol) => {
  const response = await API.delete(`/api/watchlist/${encodeURIComponent(symbol)}`);
  return response.data;
};

// NOTIFICATION API METHODS
export const getNotifications = async () => {
  const response = await API.get("/api/notifications");
  return response.data;
};

export const markNotificationsAsRead = async () => {
  const response = await API.post("/api/notifications/read");
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await API.delete(`/api/notifications/${encodeURIComponent(id)}`);
  return response.data;
};

// PORTFOLIO API METHODS
export const getHoldings = async () => {
  const response = await API.get("/api/holdings");
  return response.data;
};

export const addHolding = async (symbol, buyPrice, qty) => {
  const response = await API.post("/api/holdings", { symbol, buyPrice, qty });
  return response.data;
};

export const updateHolding = async (id, buyPrice, qty) => {
  const response = await API.put(`/api/holdings/${encodeURIComponent(id)}`, { buyPrice, qty });
  return response.data;
};

export const removeHolding = async (id) => {
  const response = await API.delete(`/api/holdings/${encodeURIComponent(id)}`);
  return response.data;
};

export const searchStocks = async (query) => {
  const response = await API.get(`/api/stocks/search?query=${encodeURIComponent(query)}`);
  return response.data;
};
