import apiClient from './apiClient';

// User operations
export const addReview = (data) => apiClient.post('/reviews', data);
export const editReview = (id, data) => apiClient.put(`/reviews/${id}`, data);
export const deleteReview = (id) => apiClient.delete(`/reviews/${id}`);

// Admin operations
export const getReviewsByUser = (userId, { page = 1, limit = 20, filterType, startDate, endDate }) =>
    apiClient.get(`/reviews/user/${userId}`, { params: { page, limit, filterType, startDate, endDate } });

export const getReviewStats = () => apiClient.get('/reviews/stats/all');

export const markAsPaid = (id) => apiClient.post(`/reviews/mark-as-paid/${id}`);
export const markAsPaidCustomDate = (data) => apiClient.post('/reviews/mark-as-paid-custom-date', data);
