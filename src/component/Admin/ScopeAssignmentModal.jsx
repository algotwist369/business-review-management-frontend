import React, { useState, useEffect } from 'react'
import {
    Modal,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Checkbox,
    Button
} from '@mui/material'
import { useAssignScopesToUser } from '../../hooks/useUsers'

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: 'calc(100vw - 24px)', sm: 400 },
    bgcolor: '#1e1e1e',
    border: '1px solid #333',
    boxShadow: 24,
    p: { xs: 2.5, sm: 4 },
    borderRadius: 2,
    color: '#fff',
    display: 'flex',
    flexDirection: 'column'
}

const ScopeAssignmentModal = ({ open, onClose, user }) => {
    const [selectedScopes, setSelectedScopes] = useState([])
    const assignScopesMutation = useAssignScopesToUser()

    useEffect(() => {
        if (open && user) {
            setSelectedScopes(user.scopes || ['review_management'])
        }
    }, [open, user])

    const handleToggle = (scope) => {
        const currentIndex = selectedScopes.indexOf(scope)
        const newSelected = [...selectedScopes]

        if (currentIndex === -1) {
            newSelected.push(scope)
        } else {
            newSelected.splice(currentIndex, 1)
        }
        setSelectedScopes(newSelected)
    }

    const handleSave = async () => {
        if (selectedScopes.length === 0) {
            alert('At least one scope must be selected')
            return
        }

        assignScopesMutation.mutate(
            { id: user._id, scopes: selectedScopes },
            {
                onSuccess: () => {
                    onClose()
                },
                onError: (err) => {
                    alert(err?.error || 'Failed to assign scopes')
                }
            }
        )
    }

    const allScopes = [
        { id: 'review_management', name: 'Review Management', desc: 'Manage reviews and datasets' },
        { id: 'gbp_record_management', name: 'GBP Record Management', desc: 'Manage month-wise GBP updates' }
    ]

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                    Manage Scopes for {user?.username || user?.email}
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <List>
                        {allScopes.map((scope) => (
                            <ListItem key={scope.id} button onClick={() => handleToggle(scope.id)} sx={{ borderRadius: 1, mb: 1, bgcolor: '#151515' }}>
                                <Checkbox
                                    checked={selectedScopes.indexOf(scope.id) !== -1}
                                    sx={{ color: '#aaa', '&.Mui-checked': { color: '#fff' } }}
                                />
                                <ListItemText
                                    primary={scope.name}
                                    secondary={scope.desc}
                                    secondaryTypographyProps={{ sx: { color: '#888', fontSize: '0.75rem' } }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={onClose} sx={{ color: '#aaa' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={assignScopesMutation.isPending}
                        sx={{ bgcolor: '#fff', color: '#000', '&:hover': { bgcolor: '#eee' } }}
                    >
                        {assignScopesMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}

export default ScopeAssignmentModal
