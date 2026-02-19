import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const RefreshButton = () => {
    const queryClient = useQueryClient();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        // Invalidate all queries to trigger a refetch
        await queryClient.invalidateQueries();

        // Small delay to show the "refreshing" state if it's too fast
        setTimeout(() => {
            setIsRefreshing(false);
        }, 500);
    };

    return (
        <Tooltip title="Refresh Data">
            <IconButton
                onClick={handleRefresh}
                disabled={isRefreshing}
                sx={{
                    color: 'white',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                }}
            >
                {isRefreshing ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    <RefreshIcon />
                )}
            </IconButton>
        </Tooltip>
    );
};

export default RefreshButton;
