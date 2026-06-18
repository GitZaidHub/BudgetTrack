import axiosInstance from './axiosInstance';

export const getExpenses = (page = 1, limit = 10) =>
  axiosInstance.get('/expenses', { params: { page, limit } });

export const createExpense = (amount, description, category) =>
  axiosInstance.post('/expenses', { amount, description, category });

export const deleteExpense = (id) => axiosInstance.delete(`/expenses/${id}`);