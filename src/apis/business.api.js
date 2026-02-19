import apiClient from './apiClient';

// Admin only operations
export const addBusiness = (data) => apiClient.post('/business', data);

export const getAllBusinesses = ({ page = 1, limit = 10 }) =>
    apiClient.get('/business', { params: { page, limit } });

export const editBusiness = (id, data) => apiClient.put(`/business/${id}`, data);

export const deleteBusiness = (id) => apiClient.delete(`/business/${id}`);

export const updateBusinessStatus = (id, is_active) =>
    apiClient.patch(`/business/${id}/status`, { is_active });