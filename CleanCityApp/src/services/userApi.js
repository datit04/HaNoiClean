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
  toggleLock: (id) => api.put(`/users/${id}/toggle-lock`),
  getRoles: (userId) => api.get(`/users/${userId}/roles`),
  assignRoles: (userId, roleNames) => api.post(`/users/${userId}/roles`, { roleNames }),
  removeRoles: (userId, roleNames) =>
    api.delete(`/users/${userId}/roles`, { params: { roleNames } }),
};

export default userApi;
