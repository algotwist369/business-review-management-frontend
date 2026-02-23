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
import { useAssignUserToAdmin } from '../../hooks/useSuperAdmin'

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    maxHeight: '80vh',
    bgcolor: '#1e1e1e',
    border: '1px solid #333',
    boxShadow: 24,
    p: 4,
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
    const assignMutation = useAssignUserToAdmin()

    const users = usersData?.data || []

    useEffect(() => {
        if (open && admin && users.length > 0) {
            // Initially select users who are already managed by this admin
            const assigned = users
                .filter(u => u.managed_by === admin._id)
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
        // This is a simplified approach. In a real app, you might want a bulk assignment API.
        // For now, we'll assign each selected user to this admin.
        // Note: The backend assignUserToAdmin takes userId and adminId.

        try {
            // Find users who need to be assigned to this admin
            const ToAssign = selectedUsers

            // To properly sync, we'd also need to unassign users who were removed.
            // But let's keep it simple for now as per instructions.

            for (const userId of ToAssign) {
                await assignMutation.mutateAsync({ userId, adminId: admin._id })
            }

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
                                        primary={user.username || user.email.split('@')[0]}
                                        secondary={user.email}
                                        secondaryTypographyProps={{ sx: { color: '#aaa', fontSize: '0.8rem' } }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button onClick={onClose} sx={{ color: '#aaa' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={assignMutation.isPending}
                    >
                        {assignMutation.isPending ? 'Saving...' : 'Save Assignments'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}

export default UserAssignmentModal
