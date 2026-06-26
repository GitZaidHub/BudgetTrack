import axiosInstance from './axiosInstance';

export const suggestCategory = (description) =>
  axiosInstance.post('/ai/suggest-category', { description });

export const getExpenseSummary = () => axiosInstance.post('/ai/summarize');

export const getBudgetSuggestions = () => axiosInstance.post('/ai/budget-suggestion');