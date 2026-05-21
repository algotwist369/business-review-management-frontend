import React from 'react'
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Tabs,
    Tab,
    TextField,
    Button,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { darkFieldSx, lightContainedButtonSx } from '../styles/darkMuiStyles'

export default function GoogleLoginModal({ open, onClose, onSuccess, onEmailLogin, onSignup, emailLoading }) {
    const [activeTab, setActiveTab] = React.useState('login')
    const [formData, setFormData] = React.useState({
        email: '',
        username: '',
        password: '',
    })

    const handleSuccess = (credentialResponse) => {
        const decoded = jwtDecode(credentialResponse.credential);
        const userData = {
            email: decoded.email,
            username: decoded.name,
            google_id: decoded.sub,
        };
        onSuccess(userData);
    };

    const handleChange = (event) => {
        setFormData((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if (activeTab === 'signup') {
            onSignup(formData)
            return
        }
        onEmailLogin({
            email: formData.email,
            password: formData.password,
        })
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    backgroundColor: '#121212',
                    borderRadius: 4,
                    padding: 3,
                    width: { xs: 'calc(100vw - 24px)', sm: 380 },
                    maxWidth: '100%',
                    color: '#fff',
                },
            }}
        >
            <DialogContent sx={{ position: 'relative', px: { xs: 1, sm: 3 } }}>

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

                <Tabs
                    value={activeTab}
                    onChange={(_, value) => setActiveTab(value)}
                    sx={{
                        mb: 2,
                        '& .MuiTab-root': { color: '#aaa' },
                        '& .Mui-selected': { color: '#fff !important' },
                        '& .MuiTabs-indicator': { backgroundColor: '#fff' },
                    }}
                >
                    <Tab value="login" label="Login" />
                    <Tab value="signup" label="Signup" />
                </Tabs>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
                    {activeTab === 'signup' && (
                        <TextField
                            name="username"
                            label="Name"
                            value={formData.username}
                            onChange={handleChange}
                            size="small"
                            sx={darkFieldSx}
                        />
                    )}
                    <TextField
                        name="email"
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        size="small"
                        required
                        sx={darkFieldSx}
                    />
                    <TextField
                        name="password"
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        size="small"
                        inputProps={{ minLength: 8 }}
                        required
                        sx={darkFieldSx}
                    />
                    <Button type="submit" variant="contained" disabled={emailLoading} sx={lightContainedButtonSx}>
                        {emailLoading ? 'Working...' : activeTab === 'signup' ? 'Create Account' : 'Login'}
                    </Button>
                </Box>

                <Typography variant="body2" sx={{ color: '#aaa', textAlign: 'center', mb: 1 }}>
                    Or continue with Google
                </Typography>

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
