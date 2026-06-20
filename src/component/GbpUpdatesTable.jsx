import React, { useState, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    IconButton,
    Box,
    InputAdornment,
    CircularProgress,
    Typography,
    Card,
    CardContent,
    Select,
    MenuItem,
    FormControl,
    TablePagination,
    Autocomplete
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
import LinkIcon from '@mui/icons-material/Link'
import FilterListIcon from '@mui/icons-material/FilterList'
import SortIcon from '@mui/icons-material/Sort'
import DeleteIcon from '@mui/icons-material/Delete'
import { useBusinesses } from '../hooks/useBusinesses'
import { useGbpUpdates, useGbpUpdatesSummary, useDeleteGbpUpdate } from '../hooks/useGbpUpdates'
import UpdateGbpModal from './UpdateGbpModal'

const getCurrentMonthStr = () => {
    const d = new Date()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    return `${d.getFullYear()}-${month}`
}

export default function GbpUpdatesTable({ selectedUser }) {
    const [month, setMonth] = useState(getCurrentMonthStr())
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedBusiness, setSelectedBusiness] = useState(null)
    const [selectedUpdate, setSelectedUpdate] = useState(null)

    // Filtering, Sorting and Pagination States
    const [selectedLocation, setSelectedLocation] = useState('all')
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [sortBy, setSortBy] = useState('name') // 'name', 'location'
    const [sortOrder, setSortOrder] = useState('asc') // 'asc', 'desc'
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Debounce search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, 500)
        return () => clearTimeout(timer)
    }, [search])

    // Reset page on search or filter change during render to prevent cascading renders
    const [lastFilterKey, setLastFilterKey] = useState('')
    const currentFilterKey = `${debouncedSearch}-${selectedLocation}-${selectedStatus}-${sortBy}-${sortOrder}-${month}`
    if (lastFilterKey !== currentFilterKey) {
        setPage(0)
        setLastFilterKey(currentFilterKey)
    }

    // Load active businesses for user/admin
    const { data: businessesData, isLoading: loadingBusinesses } = useBusinesses({
        page: 1,
        limit: 1000, // Load all to handle client-side sorting and pagination
        is_active: true
    })

    // Load existing GBP updates for selected month
    const { data: updatesData, isLoading: loadingUpdates } = useGbpUpdates({
        month,
        page: 1,
        limit: 1000
    })

    // Load monthly summary statistics
    const { data: summaryData } = useGbpUpdatesSummary(month)
    const deleteMutation = useDeleteGbpUpdate()

    const isLoading = loadingBusinesses || loadingUpdates

    const businesses = React.useMemo(() => businessesData?.data || [], [businessesData])
    const updates = React.useMemo(() => updatesData?.data || [], [updatesData])

    // Extract unique locations for the location filter dropdown
    const locations = React.useMemo(() => {
        return Array.from(new Set(businesses.map(b => b.location).filter(Boolean))).sort()
    }, [businesses])

    // Filter businesses if viewing a specific user's assignments
    const displayBusinesses = React.useMemo(() => {
        if (!selectedUser) return businesses
        const assignedIds = (selectedUser.assigned_businesses || []).map(id => id.toString())
        return businesses.filter(b => assignedIds.includes(b._id.toString()))
    }, [businesses, selectedUser])

    // Merge displayBusinesses and updates
    const mergedRows = React.useMemo(() => {
        return displayBusinesses.map(business => {
            const update = updates.find(u => {
                const bId = u.business_id?._id || u.business_id
                const matchesBusiness = bId && bId.toString() === business._id.toString()
                if (!matchesBusiness) return false

                // If viewing a specific user, filter records created for that user
                if (selectedUser) {
                    const uId = u.user_id?._id || u.user_id
                    return uId && uId.toString() === selectedUser._id.toString()
                }
                return true
            })

            return {
                business,
                update: update || {
                    business_id: business._id,
                    month,
                    product_count: 0,
                    service_count: 0,
                    media_count: 0,
                    scheduled_posts_count: 0,
                    status: 'pending',
                    remarks: '',
                    post_start_date: null,
                    post_end_date: null,
                    update_link: ''
                }
            }
        })
    }, [displayBusinesses, updates, selectedUser, month])

    // Client-side Search, Location filtering, and Sorting
    const filteredRows = React.useMemo(() => {
        let filtered = mergedRows.filter(row => {
            const name = (row.business.business_name || '').toLowerCase()
            const loc = (row.business.location || '').toLowerCase()
            const code = (row.business.short_code || '').toLowerCase()
            const searchLower = debouncedSearch.toLowerCase()

            return name.includes(searchLower) || loc.includes(searchLower) || code.includes(searchLower)
        })

        if (selectedLocation !== 'all') {
            filtered = filtered.filter(row => row.business.location === selectedLocation)
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(row => (row.update.status || 'pending') === selectedStatus)
        }

        filtered.sort((a, b) => {
            let valA = ''
            let valB = ''

            if (sortBy === 'name') {
                valA = a.business.business_name || ''
                valB = b.business.business_name || ''
            } else if (sortBy === 'location') {
                valA = a.business.location || ''
                valB = b.business.location || ''
            }

            return sortOrder === 'asc'
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA)
        })

        return filtered
    }, [mergedRows, debouncedSearch, selectedLocation, selectedStatus, sortBy, sortOrder])

    // Compute or load summary statistics (calculate on frontend if viewing a target user)
    const displaySummary = React.useMemo(() => {
        if (!selectedUser) return summaryData

        const summary = {
            total_records: mergedRows.length,
            status_counts: {
                pending: 0,
                in_progress: 0,
                completed: 0,
                suspended: 0,
                404: 0
            },
            total_product_count: 0,
            total_service_count: 0,
            total_media_count: 0,
            total_scheduled_posts_count: 0
        }

        mergedRows.forEach(row => {
            const stat = row.update.status || 'pending'
            if (summary.status_counts[stat] !== undefined) {
                summary.status_counts[stat]++
            }
            summary.total_product_count += row.update.product_count || 0
            summary.total_service_count += row.update.service_count || 0
            summary.total_media_count += row.update.media_count || 0
            summary.total_scheduled_posts_count += row.update.scheduled_posts_count || 0
        })

        return summary
    }, [mergedRows, selectedUser, summaryData])

    // Paginated rows
    const paginatedRows = React.useMemo(() => {
        return filteredRows.slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage)
    }, [filteredRows, page, rowsPerPage])

    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-GB') // DD/MM/YYYY
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed':
                return { bg: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', border: '#4caf50' }
            case 'in_progress':
                return { bg: 'rgba(33, 150, 243, 0.1)', color: '#2196f3', border: '#2196f3' }
            case 'suspended':
                return { bg: 'rgba(255, 152, 0, 0.1)', color: '#ff9800', border: '#ff9800' }
            case '404':
                return { bg: 'rgba(244, 67, 54, 0.1)', color: '#f44336', border: '#f44336' }
            default:
                return { bg: 'rgba(255, 193, 7, 0.1)', color: '#ffc107', border: '#ffc107' }
        }
    }

    const handleEditClick = (row) => {
        setSelectedBusiness(row.business)
        setSelectedUpdate(row.update._id ? row.update : null)
        setModalOpen(true)
    }

    const handleDeleteClick = (id) => {
        if (window.confirm('Are you sure you want to clear/delete this monthly update record?')) {
            deleteMutation.mutate(id, {
                onError: (err) => {
                    alert(err?.error || 'Failed to delete record')
                }
            })
        }
    }

    return (
        <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#121212', color: '#fff', borderRadius: 3, mb: 4 }}>
            {/* 📊 Summary Metrics */}
            {displaySummary && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <Card sx={{ ...cardStyle, flex: '1 1 150px' }}>
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Typography variant="caption" color="text.#ffff" sx={{ display: 'block', mb: 0.5 }}>Total Locations</Typography>
                            <Typography variant="h6" fontWeight="bold">{displaySummary.total_records || 0}</Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ ...cardStyle, flex: '1 1 150px' }}>
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Typography variant="caption" color="#4caf50" sx={{ display: 'block', mb: 0.5 }}>Completed</Typography>
                            <Typography variant="h6" fontWeight="bold" color="#4caf50">{displaySummary.status_counts?.completed || 0}</Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ ...cardStyle, flex: '1 1 150px' }}>
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Typography variant="caption" color="#2196f3" sx={{ display: 'block', mb: 0.5 }}>In Progress</Typography>
                            <Typography variant="h6" fontWeight="bold" color="#2196f3">{displaySummary.status_counts?.in_progress || 0}</Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ ...cardStyle, flex: '1 1 150px' }}>
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Typography variant="caption" color="#ffc107" sx={{ display: 'block', mb: 0.5 }}>Pending</Typography>
                            <Typography variant="h6" fontWeight="bold" color="#ffc107">{displaySummary.status_counts?.pending || 0}</Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ ...cardStyle, flex: '1 1 180px' }}>
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Typography variant="caption" color="#f44336" sx={{ display: 'block', mb: 0.5 }}>Suspended / 404</Typography>
                            <Typography variant="h6" fontWeight="bold" color="#f44336">
                                {(displaySummary.status_counts?.suspended || 0) + (displaySummary.status_counts?.['404'] || 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* 🔎 Filters & Sorting */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
                <TextField
                    size="small"
                    type="month"
                    label="Select Month"
                    InputLabelProps={{ shrink: true }}
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    sx={{
                        width: { xs: '100%', sm: 180 },
                        input: { color: '#fff' },
                        label: { color: '#aaa' },
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#444' },
                            '&:hover fieldset': { borderColor: '#666' },
                            '&.Mui-focused fieldset': { borderColor: '#fff' },
                        },
                        // Custom CSS to invert calendar picker icon color to white
                        '& input::-webkit-calendar-picker-indicator': {
                            filter: 'invert(1)',
                            cursor: 'pointer'
                        }
                    }}
                />

                <TextField
                    size="small"
                    placeholder="Search by Name, Location, Short Code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                        flexGrow: { xs: 1, sm: 0 },
                        minWidth: { xs: '100%', sm: 300 },
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

                {/* Location Filter with Search & Fixed Scrollable Height */}
                <Autocomplete
                    size="small"
                    options={['all', ...locations]}
                    getOptionLabel={(option) => option === 'all' ? 'All Locations' : option}
                    value={selectedLocation}
                    onChange={(event, newValue) => {
                        setSelectedLocation(newValue || 'all')
                    }}
                    disableClearable
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: '#1e1e1e',
                                color: '#fff',
                                border: '1px solid #333',
                            }
                        }
                    }}
                    ListboxProps={{
                        sx: {
                            maxHeight: 250,
                            overflowY: 'auto',
                            bgcolor: '#1e1e1e',
                            color: '#fff',
                            '& .MuiAutocomplete-option': {
                                fontSize: '0.85rem',
                                '&:hover': {
                                    bgcolor: '#292929',
                                },
                                '&[aria-selected="true"]': {
                                    bgcolor: '#333 !important',
                                    color: '#fff',
                                    '&:hover': {
                                        bgcolor: '#444 !important',
                                    },
                                },
                            },
                        }
                    }}
                    sx={{
                        minWidth: { xs: '100%', sm: 180 },
                        '& .MuiAutocomplete-popupIndicator': {
                            color: '#aaa',
                        },
                        '& .MuiAutocomplete-clearIndicator': {
                            color: '#aaa',
                        },
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Location"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: '#fff',
                                    '& fieldset': { borderColor: '#444' },
                                    '&:hover fieldset': { borderColor: '#666' },
                                    '&.Mui-focused fieldset': { borderColor: '#fff' },
                                },
                            }}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <>
                                        <InputAdornment position="start" sx={{ pl: 0.5, mr: -0.5 }}>
                                            <FilterListIcon sx={{ color: '#aaa', fontSize: 20 }} />
                                        </InputAdornment>
                                        {params.InputProps.startAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />

                {/* Sort Option */}
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
                    <Select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                            const [by, order] = e.target.value.split('-')
                            setSortBy(by)
                            setSortOrder(order)
                        }}
                        sx={selectStyle}
                        startAdornment={
                            <InputAdornment position="start">
                                <SortIcon sx={{ color: '#aaa', fontSize: 20 }} />
                            </InputAdornment>
                        }
                        MenuProps={menuPropsStyle}
                    >
                        <MenuItem value="name-asc">Name (A-Z)</MenuItem>
                        <MenuItem value="name-desc">Name (Z-A)</MenuItem>
                        <MenuItem value="location-asc">Location (A-Z)</MenuItem>
                        <MenuItem value="location-desc">Location (Z-A)</MenuItem>
                    </Select>
                </FormControl>

                {/* Status Filter */}
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
                    <Select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        sx={selectStyle}
                        MenuProps={menuPropsStyle}
                    >
                        <MenuItem value="all">All Statuses</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="suspended">Suspended</MenuItem>
                        <MenuItem value="404">404</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* 📋 Table */}
            <TableContainer sx={{ overflowX: 'auto', borderRadius: 1, border: '1px solid #222' }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1e1e1e' }}>
                                <TableCell sx={{ color: '#fff' }}><strong>Business Name</strong></TableCell>
                                <TableCell sx={{ color: '#fff' }}><strong>Product</strong></TableCell>
                                <TableCell sx={{ color: '#fff' }}><strong>Service</strong></TableCell>
                                <TableCell sx={{ color: '#fff' }}><strong>Media</strong></TableCell>
                                <TableCell sx={{ color: '#fff' }}><strong>Post Range</strong></TableCell>
                                <TableCell sx={{ color: '#fff' }} align="center"><strong>Scheduled</strong></TableCell>
                                <TableCell sx={{ color: '#fff' }} align="center"><strong>Status</strong></TableCell>
                                <TableCell sx={{ color: '#fff' }}><strong>Remark</strong></TableCell>
                                <TableCell sx={{ color: '#fff' }} align="center"><strong>Link</strong></TableCell>
                                <TableCell sx={{ color: '#fff' }} align="center"><strong>Action</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} sx={{ color: '#aaa', textAlign: 'center', py: 3 }}>
                                        No matching monthly update records found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedRows.map((row) => {
                                    const { business, update } = row
                                    const statusStyle = getStatusStyle(update.status)

                                    return (
                                        <TableRow key={business._id} sx={{ backgroundColor: '#181818', '&:hover': { backgroundColor: '#222' } }}>
                                            <TableCell sx={{ color: '#ddd', fontWeight: 500 }}>
                                                {business.business_name}
                                                <Typography variant="caption" sx={{ display: 'block', color: '#666', fontSize: '0.7rem' }}>
                                                    Loc: {business.location || 'N/A'} | Code: {business.short_code || 'N/A'}
                                                    {update._id && update.user_id && ` | User: ${update.user_id.username || update.user_id.email.split('@')[0]}`}
                                                </Typography>
                                            </TableCell>

                                            <TableCell sx={{ color: update.product_count > 0 ? '#4caf50' : '#888' }}>
                                                {update.product_count > 0 ? `Done(${update.product_count})` : 'Pending'}
                                            </TableCell>

                                            <TableCell sx={{ color: update.service_count > 0 ? '#4caf50' : '#888' }}>
                                                {update.service_count > 0 ? `Done(${update.service_count})` : 'Pending'}
                                            </TableCell>

                                            <TableCell sx={{ color: update.media_count > 0 ? '#4caf50' : '#888' }}>
                                                {update.media_count > 0 ? `Done(${update.media_count})` : 'Pending'}
                                            </TableCell>

                                            <TableCell sx={{ color: '#bbb', fontSize: '0.85rem' }}>
                                                {update.post_start_date ? `${formatDate(update.post_start_date)} - ${formatDate(update.post_end_date)}` : '-'}
                                            </TableCell>

                                            <TableCell sx={{ color: '#ddd' }} align="center">
                                                {update.scheduled_posts_count || 0}
                                            </TableCell>

                                            <TableCell align="center">
                                                <Box
                                                    sx={{
                                                        display: 'inline-block',
                                                        px: 1.25,
                                                        py: 0.25,
                                                        borderRadius: 10,
                                                        fontSize: '0.72rem',
                                                        fontWeight: 'bold',
                                                        textTransform: 'uppercase',
                                                        backgroundColor: statusStyle.bg,
                                                        color: statusStyle.color,
                                                        border: `1px solid ${statusStyle.color}`,
                                                    }}
                                                >
                                                    {update.status}
                                                </Box>
                                            </TableCell>

                                            <TableCell sx={{ color: '#aaa', fontSize: '0.85rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={update.remarks}>
                                                {update.remarks || '-'}
                                            </TableCell>

                                            <TableCell sx={{ color: '#aaa', fontSize: '0.85rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={update.remarks}>
                                                {business.business_link && (
                                                    <IconButton
                                                        component="a"
                                                        href={business.business_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        sx={{ color: '#4caf50' }}
                                                        title="View Business Profile Link"
                                                    >
                                                        <LinkIcon sx={{ fontSize: 22 }} />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                    <IconButton
                                                        onClick={() => handleEditClick(row)}
                                                        sx={{ color: '#00bcd4' }}
                                                        title="Update monthly record"
                                                    >
                                                        <EditIcon sx={{ fontSize: 20 }} />
                                                    </IconButton>
                                                    {update._id && (
                                                        <IconButton
                                                            onClick={() => handleDeleteClick(update._id)}
                                                            sx={{ color: '#ff4d4d' }}
                                                            title="Clear monthly record data"
                                                        >
                                                            <DeleteIcon sx={{ fontSize: 20 }} />
                                                        </IconButton>
                                                    )}
                                                    {update.update_link && (
                                                        <IconButton
                                                            component="a"
                                                            href={update.update_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            sx={{ color: '#2196f3' }}
                                                            title="View Monthly Update Link"
                                                        >
                                                            <LinkIcon sx={{ fontSize: 20 }} />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>

            {/* 📄 Pagination */}
            <TablePagination
                component="div"
                count={filteredRows.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10))
                    setPage(0)
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{
                    color: '#fff',
                    '.MuiTablePagination-selectIcon': { color: '#fff' },
                }}
            />

            <UpdateGbpModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                business={selectedBusiness}
                initialData={selectedUpdate}
                month={month}
                selectedUser={selectedUser}
            />
        </Paper>
    )
}

const cardStyle = {
    backgroundColor: '#181818',
    color: '#fff',
    border: '1px solid #222',
    boxShadow: 'none'
}

const selectStyle = {
    color: '#fff',
    '.MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
    '.MuiSvgIcon-root': { color: '#aaa' }
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
