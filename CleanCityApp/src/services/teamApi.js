import api from './api';

// Lấy tất cả đội
export const getTeams = (params = {}) => api.get('/teams', { params });

// Lấy đội theo id
export const getTeamById = (id) => api.get(`/teams/${id}`);

// Tạo mới đội
export const createTeam = (data) => api.post('/teams', data);

// Cập nhật đội
export const updateTeam = (id, data) => api.put(`/teams/${id}`, data);

// Xóa đội
export const deleteTeam = (id) => api.delete(`/teams/${id}`);
