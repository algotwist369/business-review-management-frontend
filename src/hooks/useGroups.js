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

export const useGroupBusinesses = (groupId) => {
    return useQuery({
        queryKey: ['groupBusinesses', groupId],
        queryFn: () => groupApi.getBusinessesInGroup(groupId),
        enabled: !!groupId,
        staleTime: 30000,
    })
}

export const useAddBusinessToGroup = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ groupId, businessId }) => groupApi.addBusinessToGroup(groupId, businessId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['groups'] })
            queryClient.invalidateQueries({ queryKey: ['groupBusinesses', variables.groupId] })
        },
    })
}

export const useRemoveBusinessFromGroup = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ groupId, businessId }) => groupApi.removeBusinessFromGroup(groupId, businessId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['groups'] })
            queryClient.invalidateQueries({ queryKey: ['groupBusinesses', variables.groupId] })
        },
    })
}

export const useUpdateGroupName = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ groupId, groupName }) => groupApi.updateGroupName(groupId, groupName),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['groups'] })
            queryClient.invalidateQueries({ queryKey: ['groupBusinesses', variables.groupId] })
        },
    })
}

export const useDeleteGroup = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: groupApi.deleteGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] })
            queryClient.invalidateQueries({ queryKey: ['groupBusinesses'] })
        },
    })
}
