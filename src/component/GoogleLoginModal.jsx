import React from 'react'
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'

export default function GoogleLoginModal({ open, onClose, onSuccess }) {

    const handleSuccess = (credentialResponse) => {
        const decoded = jwtDecode(credentialResponse.credential);
        const userData = {
            email: decoded.email,
            username: decoded.name,
            google_id: decoded.sub,
        };
        onSuccess(userData);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    backgroundColor: '#121212',
                    borderRadius: 4,
                    padding: 3,
                    minWidth: 380,
                    color: '#fff',
                },
            }}
        >
            <DialogContent sx={{ position: 'relative' }}>

                {/* Close Button */}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        color: '#aaa',
                    }}
                >
                    <CloseIcon />
                </IconButton>

                {/* Title */}
                <Box textAlign="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold">
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#aaa', mt: 1 }}>
                        Sign in to continue
                    </Typography>
                </Box>

                {/* Google Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={() => {
                            console.log('Login Failed');
                        }}
                        theme="filled_black"
                        shape="pill"
                    />
                </Box>

            </DialogContent>
        </Dialog>
    )
}
