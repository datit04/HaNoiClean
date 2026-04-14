import api from './api';

const userApi = {
  getProfile: () => api.get('/users/me'),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (id, data) =>
    api.put(`/users/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: () => api.get('/users'),
  delete: (id) => api.delete(`/users/${id}`),
};

export default userApi;
