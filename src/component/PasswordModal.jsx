import React, { useState } from 'react'
import { Box, Button, Dialog, DialogContent, IconButton, TextField, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useUpdatePassword } from '../hooks/useUsers'
import { darkFieldSx, lightContainedButtonSx } from '../styles/darkMuiStyles'

const PasswordModal = ({ open, onClose, hasPassword, onPasswordSaved }) => {
    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
    })
    const updatePasswordMutation = useUpdatePassword()

    const closeModal = () => {
        setFormData({ current_password: '', new_password: '' })
        onClose()
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            await updatePasswordMutation.mutateAsync(formData)
            onPasswordSaved?.()
            closeModal()
        } catch (error) {
            alert(error.error || 'Password update failed')
        }
    }

    return (
        <Dialog
            open={open}
            onClose={closeModal}
            PaperProps={{ sx: { bgcolor: '#121212', color: '#fff', width: { xs: 'calc(100vw - 24px)', sm: 380 }, maxWidth: '100%', borderRadius: 2 } }}
        >
            <DialogContent sx={{ position: 'relative', p: { xs: 2.5, sm: 4 } }}>
                <IconButton onClick={closeModal} sx={{ position: 'absolute', top: 8, right: 8, color: '#aaa' }}>
                    <CloseIcon />
                </IconButton>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {hasPassword ? 'Change Password' : 'Set Password'}
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
                    {hasPassword && (
                        <TextField
                            label="Current Password"
                            type="password"
                            value={formData.current_password}
                            onChange={(event) => setFormData((current) => ({ ...current, current_password: event.target.value }))}
                            required
                            sx={darkFieldSx}
                        />
                    )}
                    <TextField
                        label="New Password"
                        type="password"
                        value={formData.new_password}
                        onChange={(event) => setFormData((current) => ({ ...current, new_password: event.target.value }))}
                        inputProps={{ minLength: 8 }}
                        required
                        sx={darkFieldSx}
                    />
                    <Button type="submit" variant="contained" disabled={updatePasswordMutation.isPending} sx={lightContainedButtonSx}>
                        {updatePasswordMutation.isPending ? 'Saving...' : 'Save Password'}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default PasswordModal
