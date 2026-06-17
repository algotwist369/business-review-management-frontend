import apiClient from './apiClient';

export const googleAuth = (data) => apiClient.post('/users/google-auth', data);
export const signup = (data) => apiClient.post('/users/signup', data);
export const login = (data) => apiClient.post('/users/login', data);
export const logout = () => apiClient.post('/users/logout');
export const getCurrentUser = () => apiClient.get('/users/me');
export const updatePassword = (data) => apiClient.patch('/users/password', data);

// Admin only
export const getAllUsers = (params) =>
    apiClient.get('/users', { params });

export const getUserById = (id) => apiClient.get(`/users/${id}`);

export const updateUserStatus = (id, is_active) =>
    apiClient.patch(`/users/${id}/status`, { is_active });

export const deleteUser = (id) => apiClient.delete(`/users/${id}`);

export const assignBusinessesToUser = (id, businessIds) =>
    apiClient.post(`/users/${id}/assign-businesses`, { businessIds });

export const assignScopesToUser = (id, scopes) =>
    apiClient.post(`/users/${id}/assign-scopes`, { scopes });
