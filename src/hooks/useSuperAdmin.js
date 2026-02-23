import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as superAdminApi from '../apis/superAdmin.api';

export const useAssignUserToAdmin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: superAdminApi.assignUserToAdmin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, role }) => superAdminApi.updateUserRole(id, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};
