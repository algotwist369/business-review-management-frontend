import apiClient from './apiClient'

export const updateAiReviewPermission = (userId, enabled) =>
    apiClient.patch(`/ai-reviews/permissions/${userId}`, { enabled })

export const getAiReviewOptions = () => apiClient.get('/ai-reviews/options')
export const generateAiReview = (data) => apiClient.post('/ai-reviews/generate', data)
export const saveAiReviewFeedback = (id, feedback_status) =>
    apiClient.patch(`/ai-reviews/generations/${id}/feedback`, { feedback_status })

export const getDatasets = () => apiClient.get('/ai-reviews/datasets')
export const createDataset = (data) => apiClient.post('/ai-reviews/datasets', data)
export const updateDataset = (id, data) => apiClient.put(`/ai-reviews/datasets/${id}`, data)
export const deleteDataset = (id) => apiClient.delete(`/ai-reviews/datasets/${id}`)

export const getLanguages = () => apiClient.get('/ai-reviews/languages')
export const createLanguage = (data) => apiClient.post('/ai-reviews/languages', data)
export const updateLanguage = (id, data) => apiClient.put(`/ai-reviews/languages/${id}`, data)
export const deleteLanguage = (id) => apiClient.delete(`/ai-reviews/languages/${id}`)

export const getPromptOptions = (type) => apiClient.get(`/ai-reviews/prompt-options/${type}`)
export const createPromptOptions = (type, data) => apiClient.post(`/ai-reviews/prompt-options/${type}`, data)
export const updatePromptOption = (type, id, data) => apiClient.put(`/ai-reviews/prompt-options/${type}/${id}`, data)
export const deletePromptOption = (type, id) => apiClient.delete(`/ai-reviews/prompt-options/${type}/${id}`)

export const getAnalyticsSummary = () => apiClient.get('/ai-reviews/analytics/summary')
export const getAnalyticsGenerations = ({ page = 1, limit = 20 } = {}) =>
    apiClient.get('/ai-reviews/analytics/generations', { params: { page, limit } })
