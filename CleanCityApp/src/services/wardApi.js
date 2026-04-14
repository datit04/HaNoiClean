import api from './api';

// Lấy tất cả phường/xã đang active
export const getWards = () => api.get('/wards');

// Lấy phường/xã theo id
export const getWardById = (id) => api.get(`/wards/${id}`);

// Tạo mới phường/xã
export const createWard = (ward) => api.post('/wards', ward);

// Cập nhật phường/xã
export const updateWard = (id, ward) => api.put(`/wards/${id}`, ward);

// Xóa phường/xã
export const deleteWard = (id) => api.delete(`/wards/${id}`);
