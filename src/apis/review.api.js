import apiClient from './apiClient';

// User operations
export const addReview = (data) => apiClient.post('/reviews', data);
export const editReview = (id, data) => apiClient.put(`/reviews/${id}`, data);
export const deleteReview = (id) => apiClient.delete(`/reviews/${id}`);

// Admin operations
export const getReviewsByUser = (userId, { page = 1, limit = 20, filterType, startDate, endDate }) =>
    apiClient.get(`/reviews/user/${userId}`, { params: { page, limit, filterType, startDate, endDate } });

export const getReviewStats = () => apiClient.get('/reviews/stats/all');

export const getPaymentSetting = () => apiClient.get('/reviews/payment-setting');
export const updatePaymentSetting = (perReviewPrice) => apiClient.patch('/reviews/payment-setting', { perReviewPrice });
export const markAsPaid = ({ id }) => apiClient.post(`/reviews/mark-as-paid/${id}`);
export const markAsPaidCustomDate = (data) => apiClient.post('/reviews/mark-as-paid-custom-date', data);
export const markAsUnpaid = (id) => apiClient.post(`/reviews/mark-as-unpaid/${id}`);
export const markAsUnpaidCustomDate = (data) => apiClient.post('/reviews/mark-as-unpaid-custom-date', data);
export const getReviewsForBusiness = (businessId, { page = 1, limit = 20 } = {}) =>
    apiClient.get(`/reviews/business/${businessId}`, { params: { page, limit } });
