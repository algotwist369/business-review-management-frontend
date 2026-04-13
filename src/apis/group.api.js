import apiClient from './apiClient'

export const createGroup = (data) => apiClient.post('/groups', data)
export const getUserGroups = () => apiClient.get('/groups')
export const getBusinessesInGroup = (groupId) => apiClient.get(`/groups/${groupId}/businesses`)
export const addBusinessToGroup = (groupId, businessId) =>
    apiClient.patch(`/groups/${groupId}/add-business`, { businessId })
export const removeBusinessFromGroup = (groupId, businessId) =>
    apiClient.patch(`/groups/${groupId}/remove-business`, { businessId })
export const updateGroupName = (groupId, groupName) =>
    apiClient.patch(`/groups/${groupId}`, { groupName })
export const deleteGroup = (groupId) =>
    apiClient.delete(`/groups/${groupId}`)
