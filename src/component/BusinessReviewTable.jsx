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
    CircularProgress,
    Typography,
    Checkbox,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import ButtonComponent from './ButtonComponent'
import {
    useReviewsByUser,
    useDeleteReview,
    useMarkAsPaid,
    useMarkAsPaidCustomDate,
    useMarkAsUnpaid,
    useMarkAsUnpaidCustomDate,
} from '../hooks/useReviews'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PaymentsIcon from '@mui/icons-material/Payments'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import MoneyOffIcon from '@mui/icons-material/MoneyOff'

export default function BusinessReviewTable({ onEdit, setShowModal, userId, isAdmin = false }) {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [selected, setSelected] = useState([])
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [filterType, setFilterType] = useState('all')

    const { data, isLoading, isError, error } = useReviewsByUser(userId, {
        page: page + 1,
        limit: rowsPerPage,
        filterType,
        startDate: filterType === 'custom' ? startDate : undefined,
        endDate: filterType === 'custom' ? endDate : undefined,
    })

    const deleteMutation = useDeleteReview()
    const markAsPaidMutation = useMarkAsPaid()
    const markAsPaidCustomDateMutation = useMarkAsPaidCustomDate()
    const markAsUnpaidMutation = useMarkAsUnpaid()
    const markAsUnpaidCustomDateMutation = useMarkAsUnpaidCustomDate()
    const isBulkPaymentUpdating = markAsPaidCustomDateMutation.isPending || markAsUnpaidCustomDateMutation.isPending

    const rows = data?.data || []
    const totalCount = data?.total_business || 0
    const stats = {
        totalReviews: data?.total_review_count || 0,
        paidReviews: data?.total_paid_review_count || 0,
        pendingReviews: data?.total_pending_review_count || 0,
        paidAmount: data?.total_paid_amount || 0,
        paidReviewsLocked: data?.total_paid_review_count_locked || 0,
        totalEntries: data?.total_business || 0,
        paidEntries: data?.total_paid_business || 0,
        adjustmentUnpaid: data?.adjustment_unpaid || 0,
        adjustmentExtraPaid: data?.adjustment_extra_paid || 0,
    }

    const formatCurrency = (value) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(Number(value) || 0)

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            deleteMutation.mutate(id)
        }
    }

    const handleMarkAsPaid = (row) => {
        const payableReviews = row?.review_count || 0
        if (window.confirm(`Mark ${payableReviews} review${payableReviews === 1 ? '' : 's'} as paid using the saved global price?`)) {
            markAsPaidMutation.mutate(
                { id: row._id },
                {
                    onError: (err) => alert(err?.error || 'Failed to mark review as paid'),
                }
            )
        }
    }

    const handleMarkAsUnpaid = (id) => {
        if (window.confirm('Are you sure you want to mark this review as unpaid?')) {
            markAsUnpaidMutation.mutate(id)
        }
    }

    const handleBulkMarkAsPaid = () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates')
            return
        }
        if (!userId) {
            alert('User is required to update reviews')
            return
        }
        if (window.confirm(`Are you sure you want to mark reviews from ${startDate} to ${endDate} as paid using the saved global price?`)) {
            markAsPaidCustomDateMutation.mutate(
                { startDate, endDate, userId },
                {
                    onSuccess: (result) => {
                        alert(`Marked ${result?.paidReviewCount || 0} reviews as paid.\nTotal amount: ${formatCurrency(result?.totalAmount || 0)}`)
                    },
                    onError: (err) => alert(err?.error || 'Failed to mark reviews as paid'),
                }
            )
        }
    }

    const handleBulkMarkAsUnpaid = () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates')
            return
        }
        if (!userId) {
            alert('User is required to update reviews')
            return
        }
        if (window.confirm(`Are you sure you want to mark reviews from ${startDate} to ${endDate} as unpaid?`)) {
            markAsUnpaidCustomDateMutation.mutate(
                { startDate, endDate, userId },
                {
                    onError: (err) => alert(err?.error || 'Failed to mark reviews as unpaid'),
                }
            )
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

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

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
                <Typography color="error">Error loading reviews: {error.error || 'Unknown error'}</Typography>
            </Box>
        )
    }


    const filteredRows = rows.filter(row =>
        (row.business_id?.business_name || '').toLowerCase().includes(search.toLowerCase())
    )

    const StatItem = ({ label, value, color = '#fff' }) => (
        <Box sx={{ textAlign: 'center', px: 2, borderRight: '1px solid #333', '&:last-child': { borderRight: 'none' } }}>
            <Typography variant="caption" sx={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 }}>
                {label}
            </Typography>
            <Typography variant="h6" sx={{ color, fontWeight: 'bold' }}>
                {value}
            </Typography>
        </Box>
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
            {/* 📊 Stats Summary */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    backgroundColor: '#181818',
                    py: 2,
                    mb: 3,
                    borderRadius: 2,
                    border: '1px solid #333'
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Total Reviews
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                            {stats.totalReviews - stats.adjustmentUnpaid + stats.adjustmentExtraPaid}
                        </Typography>
                        {stats.adjustmentUnpaid > 0 && (
                            <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                +{stats.adjustmentUnpaid}
                            </Typography>
                        )}
                        {stats.adjustmentExtraPaid > 0 && (
                            <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                                -{stats.adjustmentExtraPaid}
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Paid Reviews
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                            {stats.paidReviewsLocked}
                        </Typography>
                        {stats.adjustmentUnpaid > 0 && (
                            <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                +{stats.adjustmentUnpaid}
                            </Typography>
                        )}
                        {stats.adjustmentExtraPaid > 0 && (
                            <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                                -{stats.adjustmentExtraPaid}
                            </Typography>
                        )}
                    </Box>
                </Box>

                <StatItem label="Total Business" value={stats.totalEntries} />
                <StatItem label="Paid Business" value={stats.paidEntries} color="#4caf50" />
                <StatItem label="Pending Reviews" value={stats.pendingReviews} color="#ff9800" />
                <StatItem label="Paid Amount" value={formatCurrency(stats.paidAmount)} color="#8bc34a" />
            </Box>

            {/* 🔎 Filters & Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
                    <TextField
                        size="small"
                        placeholder="Search Business..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{
                            width: { xs: '100%', sm: 'auto' },
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

                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
                        <InputLabel sx={{ color: '#aaa' }}>Filter By</InputLabel>
                        <Select
                            value={filterType}
                            label="Filter By"
                            onChange={(e) => setFilterType(e.target.value)}
                            sx={{
                                color: '#fff',
                                '.MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                                '.MuiSvgIcon-root': { color: '#aaa' }
                            }}
                        >
                            <MenuItem value="all">All Time</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                            <MenuItem value="custom">Custom Date</MenuItem>
                        </Select>
                    </FormControl>

                    {filterType === 'custom' && (
                        <>
                            <TextField
                                size="small"
                                type="date"
                                label="From"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    width: { xs: '100%', sm: 'auto' },
                                    input: { color: '#fff' },
                                    label: { color: '#aaa' },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#444' },
                                    }
                                }}
                            />

                            <TextField
                                size="small"
                                type="date"
                                label="To"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    width: { xs: '100%', sm: 'auto' },
                                    input: { color: '#fff' },
                                    label: { color: '#aaa' },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#444' },
                                    }
                                }}
                            />
                        </>
                    )}

                    {isAdmin && filterType === 'custom' && startDate && endDate && (
                        <>
                            <ButtonComponent
                                text={markAsPaidCustomDateMutation.isPending ? 'Marking Paid...' : 'Mark Range as Paid'}
                                onClick={handleBulkMarkAsPaid}
                                disabled={isBulkPaymentUpdating}
                                variant="contained"
                                color="success"
                                sx={{ backgroundColor: '#2e7d32', '&:hover': { backgroundColor: '#1b5e20' } }}
                            />
                            <ButtonComponent
                                text={markAsUnpaidCustomDateMutation.isPending ? 'Marking Unpaid...' : 'Mark Range as Unpaid'}
                                onClick={handleBulkMarkAsUnpaid}
                                disabled={isBulkPaymentUpdating}
                                variant="contained"
                                color="warning"
                                sx={{ backgroundColor: '#ef6c00', '&:hover': { backgroundColor: '#e65100' } }}
                            />
                        </>
                    )}
                </Box>

                <ButtonComponent
                    text="Add Review"
                    onClick={() => {
                        onEdit(null)
                        setShowModal(true)
                    }}
                />
            </Box>

            {/* 📋 Table */}
            <TableContainer sx={{ overflowX: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#1e1e1e' }}>
                            {isAdmin && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selected.length > 0 && selected.length < filteredRows.length}
                                        checked={filteredRows.length > 0 && selected.length === filteredRows.length}
                                        onChange={handleSelectAll}
                                        sx={{ color: '#aaa', '&.Mui-checked': { color: '#fff' } }}
                                    />
                                </TableCell>
                            )}
                            <TableCell sx={{ color: '#fff' }}><strong>Business Name</strong></TableCell>
                            <TableCell sx={{ color: '#fff' }}><strong>Short Code</strong></TableCell>
                            <TableCell sx={{ color: '#fff' }}><strong>Location</strong></TableCell>
                            <TableCell sx={{ color: '#fff' }}><strong>Date</strong></TableCell>
                            <TableCell sx={{ color: '#fff' }} align="center">
                                <strong>No. of Reviews</strong>
                            </TableCell>
                            <TableCell sx={{ color: '#fff' }} align="center">
                                <strong>Status</strong>
                            </TableCell>
                            <TableCell sx={{ color: '#fff' }}>
                                <strong>Last Updated</strong>
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
                                {isAdmin && (
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={isSelected(row._id)}
                                            onChange={() => handleSelectOne(row._id)}
                                            sx={{ color: '#aaa', '&.Mui-checked': { color: '#fff' } }}
                                        />
                                    </TableCell>
                                )}
                                <TableCell sx={{ color: '#ddd' }}>
                                    {row.business_id?.business_name || 'N/A'}
                                </TableCell>
                                <TableCell sx={{ color: '#ddd' }}>
                                    {row.business_id?.short_code || 'N/A'}
                                </TableCell>
                                <TableCell sx={{ color: '#ddd' }}>
                                    {row.business_id?.location || 'N/A'}
                                </TableCell>
                                <TableCell sx={{ color: '#ddd' }}>
                                    {row.review_date ? new Date(row.review_date).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell sx={{ color: '#ddd' }} align="center">
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                        {row.review_count}
                                        {row.is_paid && row.paid_review_count > 0 && row.review_count > row.paid_review_count && (
                                            <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                                +{row.review_count - row.paid_review_count}
                                            </Typography>
                                        )}
                                        {row.is_paid && row.paid_review_count > 0 && row.review_count < row.paid_review_count && (
                                            <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                                                -{row.paid_review_count - row.review_count}
                                            </Typography>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                        {row.is_paid ? (
                                            <Tooltip title="Paid">
                                                <CheckCircleIcon sx={{ color: '#4caf50' }} />
                                            </Tooltip>
                                        ) : (
                                            <Tooltip title="Unpaid">
                                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f44336', display: 'inline-block' }} />
                                            </Tooltip>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: '#aaa', fontSize: '0.75rem' }}>
                                    {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : 'N/A'}
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                        {isAdmin && !row.is_paid && (
                                            <IconButton
                                                onClick={() => handleMarkAsPaid(row)}
                                                sx={{ color: '#4caf50' }}
                                                title="Mark as Paid"
                                                disabled={markAsPaidMutation.isPending}
                                            >
                                                <PaymentsIcon />
                                            </IconButton>
                                        )}
                                        {isAdmin && row.is_paid && row.review_count > row.paid_review_count && (
                                            <IconButton
                                                onClick={() => handleMarkAsPaid(row)}
                                                sx={{ color: '#4caf50' }}
                                                title="Pay Adjustment"
                                                disabled={markAsPaidMutation.isPending}
                                            >
                                                <PaymentsIcon />
                                            </IconButton>
                                        )}
                                        {isAdmin && row.is_paid && row.paid_review_count > 0 && row.review_count < row.paid_review_count && (
                                            <IconButton
                                                onClick={() => handleMarkAsPaid(row)}
                                                sx={{ color: '#2196f3' }}
                                                title="Settle"
                                                disabled={markAsPaidMutation.isPending}
                                            >
                                                <DoneAllIcon />
                                            </IconButton>
                                        )}
                                        {isAdmin && row.is_paid && (
                                            <IconButton
                                                onClick={() => handleMarkAsUnpaid(row._id)}
                                                sx={{ color: '#ff9800' }}
                                                title="Mark as Unpaid"
                                                disabled={markAsUnpaidMutation.isPending}
                                            >
                                                <MoneyOffIcon />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            onClick={() => {
                                                onEdit(row)
                                                setShowModal(true)
                                            }}
                                            sx={{ color: '#aaa' }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(row._id)}
                                            sx={{ color: '#f44336' }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ color: '#aaa', py: 4 }}>
                                    No reviews found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 📄 Pagination */}
            <TablePagination
                component="div"
                count={search ? filteredRows.length : totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50, 100, 200, 500]}
                sx={{
                    color: '#fff',
                    '.MuiTablePagination-selectIcon': { color: '#fff' },
                }}
            />
        </Paper>
    )
}
