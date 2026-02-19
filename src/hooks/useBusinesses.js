import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as businessApi from '../apis/business.api';

export const useBusinesses = (params) => {
    return useQuery({
        queryKey: ['businesses', params],
        queryFn: () => businessApi.getAllBusinesses(params),
        keepPreviousData: true,
    });
};

export const useAddBusiness = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: businessApi.addBusiness,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businesses'] });
        },
    });
};

export const useEditBusiness = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => businessApi.editBusiness(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businesses'] });
        },
    });
};

export const useDeleteBusiness = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: businessApi.deleteBusiness,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businesses'] });
        },
    });
};

export const useUpdateBusinessStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, is_active }) => businessApi.updateBusinessStatus(id, is_active),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businesses'] });
        },
    });
};
