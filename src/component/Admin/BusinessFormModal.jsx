import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    CircularProgress,
} from '@mui/material'

export default function BusinessFormModal({ open, onClose, onSubmit, initialData, isPending }) {
    const [formData, setFormData] = useState({
        business_name: '',
        location: '',
        short_code: '',
    })

    useEffect(() => {
        if (initialData) {
            setFormData({
                business_name: initialData.business_name || '',
                location: initialData.location || '',
                short_code: initialData.short_code || '',
            })
        } else {
            setFormData({
                business_name: '',
                location: '',
                short_code: '',
            })
        }
    }, [initialData, open])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    backgroundColor: '#121212',
                    color: '#fff',
                    borderRadius: 3,
                    minWidth: 400
                }
            }}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle>{initialData ? 'Edit Business' : 'Add New Business'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                        <TextField
                            label="Business Name"
                            name="business_name"
                            value={formData.business_name}
                            onChange={handleChange}
                            required
                            fullWidth
                            variant="outlined"
                            sx={{
                                input: { color: '#fff' },
                                label: { color: '#aaa' },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#444' },
                                    '&:hover fieldset': { borderColor: '#666' },
                                    '&.Mui-focused fieldset': { borderColor: '#fff' },
                                },
                            }}
                        />
                        <TextField
                            label="Location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            fullWidth
                            variant="outlined"
                            sx={{
                                input: { color: '#fff' },
                                label: { color: '#aaa' },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#444' },
                                    '&:hover fieldset': { borderColor: '#666' },
                                    '&.Mui-focused fieldset': { borderColor: '#fff' },
                                },
                            }}
                        />
                        <TextField
                            label="Short Code"
                            name="short_code"
                            value={formData.short_code}
                            onChange={handleChange}
                            required
                            fullWidth
                            variant="outlined"
                            sx={{
                                input: { color: '#fff' },
                                label: { color: '#aaa' },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#444' },
                                    '&:hover fieldset': { borderColor: '#666' },
                                    '&.Mui-focused fieldset': { borderColor: '#fff' },
                                },
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={onClose} sx={{ color: '#aaa' }}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isPending}
                        sx={{
                            backgroundColor: '#fff',
                            color: '#000',
                            '&:hover': { backgroundColor: '#ccc' }
                        }}
                    >
                        {isPending ? <CircularProgress size={24} /> : (initialData ? 'Update' : 'Save')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
