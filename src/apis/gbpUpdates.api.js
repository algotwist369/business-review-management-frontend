import apiClient from './apiClient';

export const createGbpUpdate = (data) => apiClient.post('/gbp-updates', data);

export const updateGbpUpdate = (id, data) => apiClient.put(`/gbp-updates/${id}`, data);

export const getGbpUpdates = ({ month, page = 1, limit = 20, search = '' }) => {
    const params = { page, limit };
    if (month) params.month = month;
    if (search) params.search = search;
    return apiClient.get('/gbp-updates', { params });
};

export const getGbpUpdateById = (id) => apiClient.get(`/gbp-updates/${id}`);

export const getGbpUpdatesByBusiness = (businessId, month) => {
    const params = {};
    if (month) params.month = month;
    return apiClient.get(`/gbp-updates/business/${businessId}`, { params });
};

export const getGbpUpdatesSummary = (month) => {
    const params = {};
    if (month) params.month = month;
    return apiClient.get('/gbp-updates/summary', { params });
};

export const deleteGbpUpdate = (id) => apiClient.delete(`/gbp-updates/${id}`);
