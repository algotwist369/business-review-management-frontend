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
    CircularProgress,
    Typography,
    Select,
    MenuItem,
    FormControl,
    TableSortLabel,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import LinkIcon from '@mui/icons-material/Link'
import FilterListIcon from '@mui/icons-material/FilterList'
import { useBusinesses } from '../hooks/useBusinesses'

export default function BusinessTable() {
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [hasLinkFilter, setHasLinkFilter] = useState('all') // 'all', 'true', 'false'
    const [statusFilter, setStatusFilter] = useState('all')
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState('desc')

    // Debounce search effect
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

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    if (isLoading && !isFetching) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
    if (isError) return <Typography color="error" sx={{ p: 5 }}>Error: {error?.message || 'Something went wrong'}</Typography>

    const businesses = data?.data || []
    const totalCount = data?.total || 0

    return (
        <Paper sx={{ p: 3, backgroundColor: '#121212', color: '#fff', borderRadius: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Explore Businesses</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search by Name or Location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{
                            minWidth: 200,
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
                    <FormControl size="small" sx={{ minWidth: 150 }}>
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
                    <FormControl size="small" sx={{ minWidth: 150 }}>
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

            <TableContainer>
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
                            <TableCell sx={{ color: '#fff' }} align="center">
                                <TableSortLabel
                                    active={sortBy === 'business_link'}
                                    direction={sortBy === 'business_link' ? sortOrder : 'asc'}
                                    onClick={() => handleSort('business_link')}
                                    sx={{ 
                                        color: '#fff !important',
                                        '& .MuiTableSortLabel-icon': { color: '#fff !important' }
                                    }}
                                >
                                    <strong>Business Link</strong>
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {businesses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} sx={{ color: '#aaa', textAlign: 'center', py: 3 }}>
                                    No businesses found
                                </TableCell>
                            </TableRow>
                        ) : (
                            businesses.map((business) => (
                                <TableRow key={business._id} sx={{ '&:hover': { backgroundColor: '#1e1e1e' } }}>
                                    <TableCell sx={{ color: '#ddd' }}>{business.business_name}</TableCell>
                                    <TableCell sx={{ color: '#ddd' }}>{business.location}</TableCell>
                                    <TableCell align="center">
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
                                </TableRow>
                            ))
                        )}
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
        </Paper>
    )
}
