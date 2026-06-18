import axiosInstance from './axiosInstance';

export const requestPasswordReset = (email) =>
  axiosInstance.post('/password/forgotpassword', { email });

export const checkResetLink = (id) => axiosInstance.get(`/password/resetpassword/${id}`);

export const submitNewPassword = (id, newPassword) =>
  axiosInstance.post(`/password/resetpassword/${id}`, { newPassword });