import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as gbpApi from '../apis/gbpUpdates.api';

export const useGbpUpdates = (params) => {
    return useQuery({
        queryKey: ['gbpUpdates', params],
        queryFn: () => gbpApi.getGbpUpdates(params),
    });
};

export const useGbpUpdatesSummary = (month) => {
    return useQuery({
        queryKey: ['gbpUpdatesSummary', month],
        queryFn: () => gbpApi.getGbpUpdatesSummary(month),
        enabled: !!month,
    });
};

export const useGbpUpdatesByBusiness = (businessId, month) => {
    return useQuery({
        queryKey: ['gbpUpdatesByBusiness', businessId, month],
        queryFn: () => gbpApi.getGbpUpdatesByBusiness(businessId, month),
        enabled: !!businessId,
    });
};

export const useCreateGbpUpdate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: gbpApi.createGbpUpdate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gbpUpdates'] });
            queryClient.invalidateQueries({ queryKey: ['gbpUpdatesSummary'] });
            queryClient.invalidateQueries({ queryKey: ['gbpUpdatesByBusiness'] });
        },
    });
};

export const useUpdateGbpUpdate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => gbpApi.updateGbpUpdate(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gbpUpdates'] });
            queryClient.invalidateQueries({ queryKey: ['gbpUpdatesSummary'] });
            queryClient.invalidateQueries({ queryKey: ['gbpUpdatesByBusiness'] });
        },
    });
};

export const useDeleteGbpUpdate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: gbpApi.deleteGbpUpdate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gbpUpdates'] });
            queryClient.invalidateQueries({ queryKey: ['gbpUpdatesSummary'] });
            queryClient.invalidateQueries({ queryKey: ['gbpUpdatesByBusiness'] });
        },
    });
};
