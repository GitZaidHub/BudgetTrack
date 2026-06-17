import axiosInstance from './axiosInstance';

export const signupUser = (username, email, password) =>
  axiosInstance.post('/auth/signup', { username, email, password });

export const loginUser = (email, password) =>
  axiosInstance.post('/auth/login', { email, password });

export const getCurrentUser = () => axiosInstance.get('/auth/me');