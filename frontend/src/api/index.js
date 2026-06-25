import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const habitApi = {
  getHabits: () => api.get('/habits/'),
  createHabit: (data) => api.post('/habits/', data),
  completeHabit: (id, date) => api.post(`/habits/${id}/complete`, { date, progress_value: 1 }),
  deleteHabit: (id) => api.delete(`/habits/${id}`),
};

export const authApi = {
  login: (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    return api.post('/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },
  register: (data) => api.post('/users/', data),
  getMe: () => api.get('/users/me/'),
  getStats: () => api.get('/users/me/stats'),
  getBadges: () => api.get('/users/me/badges'),
  getLeaderboard: (timeFilter) => api.get('/users/leaderboard/', { params: { time_filter: timeFilter } }),
  updateProfile: (data) => api.put('/users/me/profile', data),
  updatePreferences: (data) => api.put('/users/me/preferences', data),
  resetPassword: (newPassword) => api.post('/reset-password', { new_password: newPassword }),
};

export default api;
