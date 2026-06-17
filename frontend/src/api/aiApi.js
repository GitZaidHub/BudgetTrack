import axiosInstance from './axiosInstance';

export const suggestCategory = (description) =>
  axiosInstance.post('/ai/suggest-category', { description });