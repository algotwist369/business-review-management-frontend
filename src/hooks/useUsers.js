import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userApi from '../apis/user.api';

export const useUsers = (params) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: () => userApi.getAllUsers(params),
        keepPreviousData: true,
    });
};

export const useUser = (id) => {
    return useQuery({
        queryKey: ['users', id],
        queryFn: () => userApi.getUserById(id),
        enabled: !!id,
    });
};

export const useUpdateUserStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, is_active }) => userApi.updateUserStatus(id, is_active),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: userApi.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useGoogleAuth = () => {
    return useMutation({
        mutationFn: userApi.googleAuth,
        onSuccess: (data) => {
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
        },
    });
};
