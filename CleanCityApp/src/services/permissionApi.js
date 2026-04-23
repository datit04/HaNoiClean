import api from './api';

const permissionApi = {
  getAll: () => api.get('/permissions'),
  getByRole: (roleId) => api.get(`/permissions/roles/${roleId}`),
  updateByRole: (roleId, permissionIds) => api.put(`/permissions/roles/${roleId}`, permissionIds),
  getMyPermissions: () => api.get('/permissions/me'),
};

export default permissionApi;
