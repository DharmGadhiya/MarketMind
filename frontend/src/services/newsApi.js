import axios from "axios";

const API = axios.create({
   baseURL: import.meta.env.VITE_BACKEND,
   withCredentials: true, // Crucial: allows cookies to be sent/received across domains
 });

 export const getNews = async (page = 1) => {
   const response = await API.get(
     `/api/allnews?page=${page}`
   );

   return response.data;
 };

 export const getNewsById = async (id) => {
   const response = await API.get(
     `/api/news/${id}`
   );

   return response.data;
 };

 export const getAIAnalysisByNewsId = async (id) => {
   const response = await API.get(`/api/news/${id}/analysis`);
   return response.data;
 };

 export const getStocks = async () => {
   const response = await API.get("/stocks");
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