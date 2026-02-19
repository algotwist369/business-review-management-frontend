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
    InputAdornment,
    Switch,
    CircularProgress,
    Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import ButtonComponent from '../ButtonComponent'
import BusinessFormModal from './BusinessFormModal'
import { useBusinesses, useAddBusiness, useEditBusiness, useDeleteBusiness, useUpdateBusinessStatus } from '../../hooks/useBusinesses'

export default function AdminBusinessTable() {
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [search, setSearch] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingBusiness, setEditingBusiness] = useState(null)

    const { data, isLoading, isError, error } = useBusinesses({
        page: page + 1,
        limit: rowsPerPage,
    })

    const addMutation = useAddBusiness()
    const editMutation = useEditBusiness()
    const deleteMutation = useDeleteBusiness()
    const statusMutation = useUpdateBusinessStatus()

    const handleOpenModal = (business = null) => {
        setEditingBusiness(business)
        setModalOpen(true)
    }

    const handleCloseModal = () => {
        setEditingBusiness(null)
        setModalOpen(false)
    }

    const handleSubmit = (formData) => {
        if (editingBusiness) {
            editMutation.mutate({ id: editingBusiness._id, data: formData }, {
                onSuccess: () => handleCloseModal()
            })
        } else {
            addMutation.mutate(formData, {
                onSuccess: () => handleCloseModal()
            })
        }
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this business?')) {
            deleteMutation.mutate(id)
        }
    }

    const handleStatusToggle = (id, currentStatus) => {
        statusMutation.mutate({ id, is_active: !currentStatus })
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
    if (isError) return <Typography color="error" sx={{ p: 5 }}>Error: {error?.message || 'Something went wrong'}</Typography>

    const businesses = data?.data || []
    const totalCount = data?.total || 0
    return (
        <Paper sx={{ p: 3, backgroundColor: '#121212', color: '#fff', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <TextField
                    size="small"
                    placeholder="Search Business..."
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
                <ButtonComponent text="Add Business" onClick={() => handleOpenModal()} />
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#1e1e1e' }}>
                            <TableCell sx={{ color: '#fff' }}><strong>Business Name</strong></TableCell>
                            <TableCell sx={{ color: '#fff' }}><strong>Location</strong></TableCell>
                            <TableCell sx={{ color: '#fff' }}><strong>Short Code</strong></TableCell>
                            <TableCell sx={{ color: '#fff' }} align="center"><strong>Status</strong></TableCell>
                            <TableCell sx={{ color: '#fff' }} align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {businesses.map((business) => (
                            <TableRow key={business._id} sx={{ '&:hover': { backgroundColor: '#1e1e1e' } }}>
                                <TableCell sx={{ color: '#ddd' }}>{business.business_name}</TableCell>
                                <TableCell sx={{ color: '#ddd' }}>{business.location}</TableCell>
                                <TableCell sx={{ color: '#ddd' }}>{business.short_code}</TableCell>
                                <TableCell align="center">
                                    <Switch
                                        checked={business.is_active}
                                        onChange={() => handleStatusToggle(business._id, business.is_active)}
                                        color="primary"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => handleOpenModal(business)} sx={{ color: '#aaa' }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(business._id)} sx={{ color: '#f44336' }}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ color: '#fff', '.MuiTablePagination-selectIcon': { color: '#fff' } }}
            />

            <BusinessFormModal
                open={modalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                initialData={editingBusiness}
                isPending={addMutation.isPending || editMutation.isPending}
            />
        </Paper>
    )
}
