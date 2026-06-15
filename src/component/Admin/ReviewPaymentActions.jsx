import React, { useState } from 'react'
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material'
import PaymentsIcon from '@mui/icons-material/Payments'
import MoneyOffIcon from '@mui/icons-material/MoneyOff'
import { useMarkAsPaidCustomDate, useMarkAsUnpaidCustomDate, usePaymentSetting } from '../../hooks/useReviews'

const inputSx = {
    width: { xs: '100%', sm: 180 },
    input: { color: '#fff' },
    label: { color: '#aaa' },
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#444' },
        '&:hover fieldset': { borderColor: '#666' },
        '&.Mui-focused fieldset': { borderColor: '#fff' },
    },
}

const actionButtonSx = {
    minHeight: 40,
    color: '#fff',
    borderColor: '#444',
    textTransform: 'none',
    fontWeight: 700,
    '&:hover': {
        borderColor: '#777',
        backgroundColor: '#242424',
    },
    '&.Mui-disabled': {
        color: '#777',
        borderColor: '#333',
    },
}

const ReviewPaymentActions = ({ user }) => {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [message, setMessage] = useState('')
    const paymentSettingQuery = usePaymentSetting(['admin', 'super_admin'].includes(user?.role))
    const markAsPaidCustomDateMutation = useMarkAsPaidCustomDate()
    const markAsUnpaidCustomDateMutation = useMarkAsUnpaidCustomDate()
    const isPending = markAsPaidCustomDateMutation.isPending || markAsUnpaidCustomDateMutation.isPending
    const perReviewPrice = paymentSettingQuery.data?.per_review_price || 0

    const scopeText = user?.role === 'super_admin'
        ? 'Applies to all users and all review records in the selected date range.'
        : 'Applies to your reviews and users assigned to you in the selected date range.'

    const formatCurrency = (value) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(Number(value) || 0)

    const runBulkAction = (type) => {
        setMessage('')

        if (!startDate || !endDate) {
            alert('Please select both start and end dates')
            return
        }

        const label = type === 'paid' ? 'paid' : 'unpaid'
        if (type === 'paid' && !perReviewPrice) {
            alert('Please set global per review price from the header first')
            return
        }

        const priceText = type === 'paid' ? ` at ${formatCurrency(perReviewPrice)} per review` : ''
        if (!window.confirm(`Are you sure you want to mark matching reviews from ${startDate} to ${endDate} as ${label}${priceText}?`)) {
            return
        }

        const mutation = type === 'paid' ? markAsPaidCustomDateMutation : markAsUnpaidCustomDateMutation
        mutation.mutate(
            { startDate, endDate },
            {
                onSuccess: (result) => {
                    const count = result?.modifiedCount ?? result?.matchedCount ?? 0
                    const amountText = type === 'paid' ? ` Total amount: ${formatCurrency(result?.totalAmount || 0)}.` : ''
                    setMessage(`${count} review record${count === 1 ? '' : 's'} marked as ${label}${priceText}.${amountText}`)
                },
                onError: (err) => alert(err?.error || `Failed to mark reviews as ${label}`),
            }
        )
    }

    return (
        <Box
            sx={{
                mb: 2,
                p: { xs: 2, sm: 2.5 },
                border: '1px solid #333',
                borderRadius: 2,
                backgroundColor: '#151515',
                color: '#fff',
            }}
        >
            <Stack spacing={1.5}>
                <Box>
                    <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700 }}>
                        Global Date-wise Payment Actions
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#bbb' }}>
                        {scopeText}
                    </Typography>
                    <Typography variant="caption" sx={{ color: perReviewPrice ? '#8bc34a' : '#ff9800' }}>
                        Current per review price: {perReviewPrice ? formatCurrency(perReviewPrice) : 'Not set'}
                    </Typography>
                </Box>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
                    <TextField
                        size="small"
                        type="date"
                        label="From"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={inputSx}
                    />
                    <TextField
                        size="small"
                        type="date"
                        label="To"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={inputSx}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<PaymentsIcon />}
                        disabled={isPending}
                        onClick={() => runBulkAction('paid')}
                        sx={{ ...actionButtonSx, borderColor: '#2e7d32' }}
                    >
                        {markAsPaidCustomDateMutation.isPending ? 'Marking Paid...' : 'Mark Paid'}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<MoneyOffIcon />}
                        disabled={isPending}
                        onClick={() => runBulkAction('unpaid')}
                        sx={{ ...actionButtonSx, borderColor: '#ef6c00' }}
                    >
                        {markAsUnpaidCustomDateMutation.isPending ? 'Marking Unpaid...' : 'Mark Unpaid'}
                    </Button>
                </Stack>

                {message && (
                    <Alert severity="success" sx={{ backgroundColor: 'rgba(76, 175, 80, 0.12)', color: '#d7ffd9', border: '1px solid rgba(76, 175, 80, 0.35)' }}>
                        {message}
                    </Alert>
                )}
            </Stack>
        </Box>
    )
}

export default ReviewPaymentActions
