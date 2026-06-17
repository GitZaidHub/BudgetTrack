import axiosInstance from './axiosInstance';

export const getExpenses = () => axiosInstance.get('/expenses');

export const createExpense = (amount, description, category) =>
  axiosInstance.post('/expenses', { amount, description, category });

export const deleteExpense = (id) => axiosInstance.delete(`/expenses/${id}`);