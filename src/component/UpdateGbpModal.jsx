/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box
} from '@mui/material'
import { useCreateGbpUpdate } from '../hooks/useGbpUpdates'

export default function UpdateGbpModal({ open, onClose, business, initialData, month, selectedUser }) {
    const [productCount, setProductCount] = useState(0)
    const [serviceCount, setServiceCount] = useState(0)
    const [mediaCount, setMediaCount] = useState(0)
    const [postStartDate, setPostStartDate] = useState('')
    const [postEndDate, setPostEndDate] = useState('')
    const [scheduledPostsCount, setScheduledPostsCount] = useState(0)
    const [updateLink, setUpdateLink] = useState('')
    const [status, setStatus] = useState('pending')
    const [remarks, setRemarks] = useState('')

    const createMutation = useCreateGbpUpdate()

    useEffect(() => {
        if (open) {
            setProductCount(initialData?.product_count || 0)
            setServiceCount(initialData?.service_count || 0)
            setMediaCount(initialData?.media_count || 0)
            setPostStartDate(initialData?.post_start_date ? new Date(initialData.post_start_date).toISOString().split('T')[0] : '')
            setPostEndDate(initialData?.post_end_date ? new Date(initialData.post_end_date).toISOString().split('T')[0] : '')
            setScheduledPostsCount(initialData?.scheduled_posts_count || 0)
            setUpdateLink(initialData?.update_link || '')
            setStatus(initialData?.status || 'pending')
            setRemarks(initialData?.remarks || '')
        }
    }, [open, initialData])

    const handleSave = () => {
        if (productCount < 0 || serviceCount < 0 || mediaCount < 0 || scheduledPostsCount < 0) {
            alert('Counts cannot be negative')
            return
        }

        const payload = {
            business_id: business?._id || initialData?.business_id?._id || initialData?.business_id,
            month,
            product_count: Number(productCount),
            service_count: Number(serviceCount),
            media_count: Number(mediaCount),
            post_start_date: postStartDate || null,
            post_end_date: postEndDate || null,
            scheduled_posts_count: Number(scheduledPostsCount),
            update_link: updateLink,
            status,
            remarks,
            user_id: selectedUser?._id || initialData?.user_id?._id || initialData?.user_id || undefined
        }

        createMutation.mutate(payload, {
            onSuccess: () => {
                onClose()
            },
            onError: (err) => {
                alert(err?.error || 'Failed to save monthly update record')
            }
        })
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    bgcolor: '#151515',
                    color: '#fff',
                    border: '1px solid #333',
                    width: 'min(550px, calc(100vw - 32px))',
                },
            }}
        >
            <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid #222' }}>
                Update Work: {business?.business_name || initialData?.business_id?.business_name || 'Business'} ({month})
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Product Updates Count"
                            value={productCount}
                            onChange={(e) => setProductCount(e.target.value)}
                            sx={textFieldStyle}
                        />
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Service Updates Count"
                            value={serviceCount}
                            onChange={(e) => setServiceCount(e.target.value)}
                            sx={textFieldStyle}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Media Count"
                            value={mediaCount}
                            onChange={(e) => setMediaCount(e.target.value)}
                            sx={textFieldStyle}
                        />
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Scheduled Posts Count"
                            value={scheduledPostsCount}
                            onChange={(e) => setScheduledPostsCount(e.target.value)}
                            sx={textFieldStyle}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Post Start Date"
                            InputLabelProps={{ shrink: true }}
                            value={postStartDate}
                            onChange={(e) => setPostStartDate(e.target.value)}
                            sx={textFieldStyle}
                        />
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Post End Date"
                            InputLabelProps={{ shrink: true }}
                            value={postEndDate}
                            onChange={(e) => setPostEndDate(e.target.value)}
                            sx={textFieldStyle}
                        />
                    </Box>

                    <TextField
                        fullWidth
                        size="small"
                        type="url"
                        label="GGBP Update Link"
                        value={updateLink}
                        onChange={(e) => setUpdateLink(e.target.value)}
                        sx={textFieldStyle}
                    />

                    <FormControl size="small" fullWidth sx={{ ...textFieldStyle, mt: 0.5 }}>
                        <InputLabel id="status-select-label" sx={{ color: '#aaa' }}>Status</InputLabel>
                        <Select
                            labelId="status-select-label"
                            value={status}
                            label="Status"
                            onChange={(e) => setStatus(e.target.value)}
                            sx={{
                                color: '#fff',
                                '.MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                                '.MuiSvgIcon-root': { color: '#aaa' }
                            }}
                            MenuProps={menuPropsStyle}
                        >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="suspended">Suspended</MenuItem>
                            <MenuItem value="404">404</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={3}
                        label="Remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        sx={textFieldStyle}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, borderTop: '1px solid #222' }}>
                <Button onClick={onClose} sx={{ color: '#bbb' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={createMutation.isPending}
                    variant="contained"
                    sx={{ bgcolor: '#fff', color: '#000', '&:hover': { bgcolor: '#eee' } }}
                >
                    {createMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const textFieldStyle = {
    input: { color: '#fff' },
    label: { color: '#aaa' },
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#444' },
        '&:hover fieldset': { borderColor: '#666' },
        '&.Mui-focused fieldset': { borderColor: '#fff' },
    },
    '& .MuiInputBase-inputMultiline': { color: '#fff' },
    '& input::-webkit-calendar-picker-indicator': {
        filter: 'invert(1)',
        cursor: 'pointer'
    }
}

const menuPropsStyle = {
    PaperProps: {
        sx: {
            bgcolor: '#1e1e1e',
            color: '#fff',
            border: '1px solid #333',
            '& .MuiMenuItem-root': {
                fontSize: '0.85rem',
                '&:hover': {
                    bgcolor: '#292929',
                },
                '&.Mui-selected': {
                    bgcolor: '#333 !important',
                    color: '#fff',
                    '&:hover': {
                        bgcolor: '#444 !important',
                    },
                },
            },
        },
    },
}
