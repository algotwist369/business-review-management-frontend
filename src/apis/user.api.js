import apiClient from './apiClient';

export const googleAuth = (data) => apiClient.post('/users/google-auth', data);
export const logout = () => apiClient.post('/users/logout');

// Admin only
export const getAllUsers = ({ page = 1, limit = 20 }) =>
    apiClient.get('/users', { params: { page, limit } });

export const getUserById = (id) => apiClient.get(`/users/${id}`);

export const updateUserStatus = (id, is_active) =>
    apiClient.patch(`/users/${id}/status`, { is_active });

export const deleteUser = (id) => apiClient.delete(`/users/${id}`);
