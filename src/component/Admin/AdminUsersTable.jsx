import React, { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    TextField,
    IconButton,
    Box,
    Switch,
    InputAdornment,
    CircularProgress,
    Typography,
    Checkbox,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SearchIcon from '@mui/icons-material/Search'
import { useUsers, useUpdateUserStatus, useDeleteUser } from '../../hooks/useUsers'

const AdminUsersTable = ({ onViewReviews }) => {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [selected, setSelected] = useState([])

    const { data, isLoading, isError, error } = useUsers({
        page: page + 1,
        limit: rowsPerPage,
    })

    const updateStatusMutation = useUpdateUserStatus()
    const deleteUserMutation = useDeleteUser()

    const rows = data?.data || []
    const totalCount = data?.total || 0

    const handleToggleStatus = (id, currentStatus) => {
        updateStatusMutation.mutate({ id, is_active: !currentStatus })
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUserMutation.mutate(id)
        }
    }

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const newSelected = rows.map((n) => n._id)
            setSelected(newSelected)
            return
        }
        setSelected([])
    }

    const handleSelectOne = (id) => {
        const selectedIndex = selected.indexOf(id)
        let newSelected = []

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id)
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1))
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1))
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            )
        }
        setSelected(newSelected)
    }

    const isSelected = (id) => selected.indexOf(id) !== -1

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (isError) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">Error loading users: {error.error || 'Unknown error'}</Typography>
            </Box>
        )
    }


    const filteredRows = rows.filter(row =>
        (row.username || '').toLowerCase().includes(search.toLowerCase()) ||
        (row.email || '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <Paper
            sx={{
                p: 3,
                backgroundColor: '#121212',
                color: '#fff',
                borderRadius: 3,
            }}
        >
            {/* 🔎 Search */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    size="small"
                    placeholder="Search User..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
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
            </Box>

            {/* 📋 Table */}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#1e1e1e' }}>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={selected.length > 0 && selected.length < filteredRows.length}
                                    checked={filteredRows.length > 0 && selected.length === filteredRows.length}
                                    onChange={handleSelectAll}
                                    sx={{ color: '#aaa', '&.Mui-checked': { color: '#fff' } }}
                                />
                            </TableCell>
                            <TableCell sx={{ color: '#fff' }}><strong>Username</strong></TableCell>
                            <TableCell sx={{ color: '#fff' }}><strong>Email</strong></TableCell>
                            <TableCell sx={{ color: '#fff' }}><strong>Role</strong></TableCell>
                            <TableCell sx={{ color: '#fff' }} align="center">
                                <strong>Total Reviews</strong>
                            </TableCell>
                            <TableCell sx={{ color: '#fff' }}>
                                <strong>Joined At</strong>
                            </TableCell>
                            <TableCell sx={{ color: '#fff' }}>
                                <strong>Last Login</strong>
                            </TableCell>
                            <TableCell sx={{ color: '#fff' }} align="center">
                                <strong>Status</strong>
                            </TableCell>
                            <TableCell sx={{ color: '#fff' }} align="center">
                                <strong>Action</strong>
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredRows.map((row) => (
                            <TableRow
                                key={row._id}
                                hover
                                role="checkbox"
                                aria-checked={isSelected(row._id)}
                                tabIndex={-1}
                                selected={isSelected(row._id)}
                                sx={{
                                    backgroundColor: '#181818',
                                    '&:hover': { backgroundColor: '#222' },
                                    '&.Mui-selected': { backgroundColor: '#2a2a2a !important' },
                                }}
                            >
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={isSelected(row._id)}
                                        onChange={() => handleSelectOne(row._id)}
                                        sx={{ color: '#aaa', '&.Mui-checked': { color: '#fff' } }}
                                    />
                                </TableCell>
                                <TableCell sx={{ color: '#ddd' }}>
                                    {row.username || row.email.split('@')[0]}
                                </TableCell>

                                <TableCell sx={{ color: '#ddd' }}>
                                    {row.email}
                                </TableCell>

                                <TableCell>
                                    <Box
                                        sx={{
                                            display: 'inline-block',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 1,
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            backgroundColor: row.role === 'admin' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                                            color: row.role === 'admin' ? '#ffc107' : '#2196f3',
                                            border: `1px solid ${row.role === 'admin' ? '#ffc107' : '#2196f3'}`,
                                        }}
                                    >
                                        {row.role}
                                    </Box>
                                </TableCell>

                                <TableCell sx={{ color: '#ddd' }} align="center">
                                    {row.total_reviews || 0}
                                </TableCell>

                                <TableCell sx={{ color: '#ddd' }}>
                                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
                                </TableCell>

                                <TableCell sx={{ color: '#ddd' }}>
                                    {row.last_login ? new Date(row.last_login).toLocaleDateString() : 'N/A'}
                                </TableCell>

                                <TableCell align="center">
                                    <Switch
                                        checked={row.is_active}
                                        onChange={() => handleToggleStatus(row._id, row.is_active)}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#4caf50',
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: '#4caf50',
                                            },
                                        }}
                                    />
                                </TableCell>

                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                        <IconButton
                                            onClick={() => onViewReviews(row)}
                                            sx={{ color: '#2196f3' }}
                                            title="View Reviews"
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(row._id)}
                                            sx={{ color: '#ff4d4d' }}
                                            title="Delete User"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 📄 Pagination */}
            <TablePagination
                component="div"
                count={search ? filteredRows.length : totalCount}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10))
                    setPage(0)
                }}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{
                    color: '#fff',
                    '.MuiTablePagination-selectIcon': { color: '#fff' },
                }}
            />
        </Paper>
    )
}

export default AdminUsersTable
