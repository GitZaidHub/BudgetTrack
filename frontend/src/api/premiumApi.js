import axiosInstance from './axiosInstance';

export const getLeaderboard = () => axiosInstance.get('/premium/leaderboard');