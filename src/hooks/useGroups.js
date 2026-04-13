import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as groupApi from '../apis/group.api'

export const useUserGroups = () => {
    return useQuery({
        queryKey: ['groups'],
        queryFn: groupApi.getUserGroups,
        staleTime: 30000,
    })
}

export const useCreateGroup = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: groupApi.createGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] })
        },
    })
}

export const useAddBusinessToGroup = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ groupId, businessId }) => groupApi.addBusinessToGroup(groupId, businessId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] })
        },
    })
}

export const useRemoveBusinessFromGroup = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ groupId, businessId }) => groupApi.removeBusinessFromGroup(groupId, businessId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] })
        },
    })
}
