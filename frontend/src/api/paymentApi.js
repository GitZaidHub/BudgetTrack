import axiosInstance from './axiosInstance';

export const createPaymentOrder = () => axiosInstance.post('/payment/create-order');

export const verifyPayment = (orderId) => axiosInstance.post('/payment/verify', { orderId });