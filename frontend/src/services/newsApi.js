import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND,
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