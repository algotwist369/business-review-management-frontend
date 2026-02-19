import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as reviewApi from '../apis/review.api';

export const useReviewsByUser = (userId, params) => {
    return useQuery({
        queryKey: ['reviews', userId, params],
        queryFn: () => reviewApi.getReviewsByUser(userId, params),
        enabled: !!userId,
        keepPreviousData: true,
    });
};

export const useReviewStats = () => {
    return useQuery({
        queryKey: ['reviewStats'],
        queryFn: reviewApi.getReviewStats,
    });
};

export const useAddReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: reviewApi.addReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            queryClient.invalidateQueries({ queryKey: ['reviewStats'] });
        },
    });
};

export const useEditReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => reviewApi.editReview(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
        },
    });
};

export const useDeleteReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: reviewApi.deleteReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            queryClient.invalidateQueries({ queryKey: ['reviewStats'] });
        },
    });
};

export const useMarkAsPaid = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: reviewApi.markAsPaid,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
        },
    });
};

export const useMarkAsPaidCustomDate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: reviewApi.markAsPaidCustomDate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
        },
    });
};
