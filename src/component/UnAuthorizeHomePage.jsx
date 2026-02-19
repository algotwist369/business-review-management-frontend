import React from 'react'
import { Box, Typography, Button } from '@mui/material'

const UnAuthorizeHomePage = ({onLoginClick}) => {
    return (
        <Box
            sx={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0f0f0f',
                color: '#fff',
                textAlign: 'center',
                px: 3,
            }}
        >
            <Box>
                <Typography
                    variant="h3"
                    fontWeight="bold"
                    gutterBottom
                >
                    Welcome to Your Dashboard
                </Typography>

                <Typography
                    variant="h6"
                    sx={{ color: '#aaa', mb: 4 }}
                >
                    Login to see your data or start adding new business reviews.
                </Typography>

                <Button
                    onClick={onLoginClick}
                    variant="contained"
                    sx={{
                        backgroundColor: '#fff',
                        color: '#000',
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                            backgroundColor: '#e0e0e0',
                        },
                    }}
                >
                    Get Started
                </Button>
            </Box>
        </Box>
    )
}

export default UnAuthorizeHomePage
