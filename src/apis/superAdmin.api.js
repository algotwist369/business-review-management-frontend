import apiClient from './apiClient';

export const assignUserToAdmin = (data) => apiClient.post('/super-admin/assign-admin', data);

export const assignUsersToAdminBulk = (data) => apiClient.post('/super-admin/assign-admin-bulk', data);

export const updateUserRole = (id, role) =>
    apiClient.patch(`/super-admin/update-role/${id}`, { role });
