import React, { useState, useEffect } from 'react'
import {
    Modal,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Checkbox,
    Button,
    CircularProgress,
    TextField,
    InputAdornment
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useUsers } from '../../hooks/useUsers'
import { useAssignUsersToAdminBulk } from '../../hooks/useSuperAdmin'

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: 'calc(100vw - 24px)', sm: 500 },
    maxHeight: '80vh',
    bgcolor: '#1e1e1e',
    border: '1px solid #333',
    boxShadow: 24,
    p: { xs: 2, sm: 4 },
    borderRadius: 2,
    color: '#fff',
    display: 'flex',
    flexDirection: 'column'
}

const UserAssignmentModal = ({ open, onClose, admin }) => {
    const [search, setSearch] = useState('')
    const [selectedUsers, setSelectedUsers] = useState([])

    // Fetch all users (unpaged or large limit for selection)
    const { data: usersData, isLoading } = useUsers({ page: 1, limit: 100 })
    const assignBulkMutation = useAssignUsersToAdminBulk()

    const users = usersData?.data || []

    useEffect(() => {
        if (open && admin && users.length > 0) {
            // Initially select users who are already managed by this admin
            const assigned = users
                .filter(u => {
                    if (Array.isArray(u.managed_by)) {
                        return u.managed_by.some(id => id?.toString() === admin._id?.toString());
                    }
                    return u.managed_by?.toString() === admin._id?.toString();
                })
                .map(u => u._id)
            setSelectedUsers(assigned)
        }
    }, [open, admin, users])

    const handleToggle = (userId) => {
        const currentIndex = selectedUsers.indexOf(userId)
        const newSelected = [...selectedUsers]

        if (currentIndex === -1) {
            newSelected.push(userId)
        } else {
            newSelected.splice(currentIndex, 1)
        }
        setSelectedUsers(newSelected)
    }

    const handleSave = async () => {
        try {
            await assignBulkMutation.mutateAsync({ adminId: admin._id, userIds: selectedUsers })
            onClose()
        } catch (error) {
            console.error('Assignment failed', error)
        }
    }

    const filteredUsers = users.filter(u =>
        u.role === 'user' &&
        ((u.username || '').toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                    Assign Users to {admin?.username || admin?.email}
                </Typography>

                <TextField
                    size="small"
                    placeholder="Search Users..."
                    fullWidth
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                        mb: 2,
                        input: { color: '#fff' },
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#444' },
                            '&:hover fieldset': { borderColor: '#666' },
                            '&.Mui-focused fieldset': { borderColor: '#fff' },
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#aaa' }} />
                            </InputAdornment>
                        ),
                    }}
                />

                <Box sx={{ flex: 1, overflowY: 'auto', mb: 2, minHeight: 200 }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : (
                        <List>
                            {filteredUsers.map((user) => (
                                <ListItem key={user._id} button onClick={() => handleToggle(user._id)}>
                                    <Checkbox
                                        checked={selectedUsers.indexOf(user._id) !== -1}
                                        sx={{ color: '#aaa', '&.Mui-checked': { color: '#fff' } }}
                                    />
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{user.username || user.email.split('@')[0]}</span>
                                                {!user.is_active && (
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            px: 0.8,
                                                            py: 0.2,
                                                            borderRadius: 0.5,
                                                            fontSize: '0.65rem',
                                                            backgroundColor: 'rgba(244, 67, 54, 0.15)',
                                                            color: '#f44336',
                                                            border: '1px solid #f44336',
                                                            fontWeight: 'bold',
                                                            textTransform: 'uppercase'
                                                        }}
                                                    >
                                                        Inactive
                                                    </Box>
                                                )}
                                            </Box>
                                        }
                                        secondary={user.email}
                                        secondaryTypographyProps={{ sx: { color: '#aaa', fontSize: '0.8rem' } }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
                    <Button onClick={onClose} sx={{ color: '#aaa' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={assignBulkMutation.isPending}
                    >
                        {assignBulkMutation.isPending ? 'Saving...' : 'Save Assignments'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}

export default UserAssignmentModal
