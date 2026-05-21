import React, { useState, useEffect } from 'react'
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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TableSortLabel,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import LinkIcon from '@mui/icons-material/Link'
import FilterListIcon from '@mui/icons-material/FilterList'
import ButtonComponent from '../ButtonComponent'
import BusinessFormModal from './BusinessFormModal'
import { useBusinesses, useAddBusiness, useEditBusiness, useDeleteBusiness, useUpdateBusinessStatus } from '../../hooks/useBusinesses'

export default function AdminBusinessTable() {
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [hasLinkFilter, setHasLinkFilter] = useState('all') // 'all', 'true', 'false'
    const [statusFilter, setStatusFilter] = useState('all') // 'all', 'true', 'false'
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState('desc')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingBusiness, setEditingBusiness] = useState(null)

    // Debounce search effect: only trigger server search 500ms after last keystroke
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, 500)
        return () => clearTimeout(timer)
    }, [search])

    // Reset pagination when filters change
    useEffect(() => {
        setPage(0)
    }, [debouncedSearch, hasLinkFilter, statusFilter, sortBy, sortOrder])

    const { data, isLoading, isFetching, isError, error } = useBusinesses({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch,
        has_link: hasLinkFilter === 'all' ? undefined : hasLinkFilter,
        is_active: statusFilter === 'all' ? undefined : statusFilter,
        sortBy,
        sortOrder,
    })

    const handleSort = (property) => {
        const isAsc = sortBy === property && sortOrder === 'asc'
        setSortOrder(isAsc ? 'desc' : 'asc')
        setSortBy(property)
    }

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

    // During search (isFetching), the table remains visible and a smaller spinner is shown near search box.
    if (isLoading && !isFetching) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
    if (isError) return <Typography color="error" sx={{ p: 5 }}>Error: {error?.message || 'Something went wrong'}</Typography>

    const businesses = data?.data || []
    const totalCount = data?.total || 0

    return (
        <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#121212', color: '#fff', borderRadius: 3, minWidth: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                    <Typography variant="h6">Business Management</Typography>
                    <ButtonComponent text="Add Business" onClick={() => handleOpenModal()} />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search Name, Location, Code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{
                            minWidth: { xs: '100%', sm: 200 },
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
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                        <Select
                            value={hasLinkFilter}
                            onChange={(e) => setHasLinkFilter(e.target.value)}
                            displayEmpty
                            sx={{
                                color: '#fff',
                                '.MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                                '.MuiSvgIcon-root': { color: '#aaa' }
                            }}
                            startAdornment={
                                <InputAdornment position="start">
                                    <LinkIcon sx={{ color: '#aaa', fontSize: 20, mr: 1 }} />
                                </InputAdornment>
                            }
                        >
                            <MenuItem value="all">All Links</MenuItem>
                            <MenuItem value="true">With Link</MenuItem>
                            <MenuItem value="false">No Link</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            displayEmpty
                            sx={{
                                color: '#fff',
                                '.MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                                '.MuiSvgIcon-root': { color: '#aaa' }
                            }}
                            startAdornment={
                                <InputAdornment position="start">
                                    <FilterListIcon sx={{ color: '#aaa', fontSize: 20, mr: 1 }} />
                                </InputAdornment>
                            }
                        >
                            <MenuItem value="all">All Status</MenuItem>
                            <MenuItem value="true">Active Only</MenuItem>
                            <MenuItem value="false">Inactive Only</MenuItem>
                        </Select>
                    </FormControl>
                    {isFetching && <CircularProgress size={20} sx={{ color: '#fff' }} />}
                </Box>
            </Box>

            <TableContainer sx={{ overflowX: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#1e1e1e' }}>
                            <TableCell sx={{ color: '#fff' }}>
                                <TableSortLabel
                                    active={sortBy === 'business_name'}
                                    direction={sortBy === 'business_name' ? sortOrder : 'asc'}
                                    onClick={() => handleSort('business_name')}
                                    sx={{ 
                                        color: '#fff !important',
                                        '& .MuiTableSortLabel-icon': { color: '#fff !important' }
                                    }}
                                >
                                    <strong>Business Name</strong>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ color: '#fff' }}><strong>Location</strong></TableCell>
                            <TableCell sx={{ color: '#fff' }}><strong>Short Code</strong></TableCell>
                            <TableCell sx={{ color: '#fff' }}>
                                <TableSortLabel
                                    active={sortBy === 'business_link'}
                                    direction={sortBy === 'business_link' ? sortOrder : 'asc'}
                                    onClick={() => handleSort('business_link')}
                                    sx={{ 
                                        color: '#fff !important',
                                        '& .MuiTableSortLabel-icon': { color: '#fff !important' }
                                    }}
                                >
                                    <strong>Link</strong>
                                </TableSortLabel>
                            </TableCell>
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
                                 <TableCell sx={{ color: '#ddd' }}>
                                     {business.business_link ? (
                                         <IconButton 
                                             component="a" 
                                             href={business.business_link} 
                                             target="_blank" 
                                             rel="noopener noreferrer"
                                             sx={{ color: '#2196f3' }}
                                         >
                                             <LinkIcon />
                                         </IconButton>
                                     ) : '-'}
                                 </TableCell>
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
