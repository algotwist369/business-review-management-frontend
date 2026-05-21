import React, { useState } from 'react'
import {
    Box,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useAiAnalyticsGenerations, useAiAnalyticsSummary } from '../../hooks/useAiReviews'

const analyticsPaperSx = {
    p: { xs: 2, sm: 3 },
    bgcolor: '#121212',
    color: '#fff',
    border: '1px solid #242424',
    borderRadius: 3,
}

const analyticsHeaderCellSx = {
    color: '#fff',
    bgcolor: '#1e1e1e',
    borderColor: '#2d2d2d',
    fontWeight: 700,
}

const analyticsCellSx = {
    color: '#f0f0f0',
    borderColor: '#252525',
}

const analyticsChipSx = {
    mr: 1,
    mb: 1,
    bgcolor: '#232323',
    color: '#fff',
    border: '1px solid #3a3a3a',
}

const AiAnalyticsDashboard = () => {
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [detailModal, setDetailModal] = useState(null)
    const summaryQuery = useAiAnalyticsSummary()
    const generationsQuery = useAiAnalyticsGenerations({ page: page + 1, limit: rowsPerPage })

    const summary = summaryQuery.data
    const generations = generationsQuery.data?.data || []

    if (summaryQuery.isLoading) return <CircularProgress />

    return (
        <Box sx={{ display: 'grid', gap: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Paper sx={{ ...analyticsPaperSx, p: 2 }}>
                    <Typography sx={{ color: '#ddd' }}>Generated Reviews</Typography>
                    <Typography variant="h4" sx={{ color: '#fff' }}>{summary?.totals?.generated_reviews || 0}</Typography>
                </Paper>
                <Paper sx={{ ...analyticsPaperSx, p: 2 }}>
                    <Typography sx={{ color: '#ddd' }}>Dataset Referenced</Typography>
                    <Typography variant="h4" sx={{ color: '#fff' }}>{summary?.totals?.dataset_referenced_reviews || 0}</Typography>
                </Paper>
                <Paper sx={{ ...analyticsPaperSx, p: 2 }}>
                    <Typography sx={{ color: '#ddd' }}>Pending Feedback</Typography>
                    <Typography variant="h4" sx={{ color: '#fff' }}>{summary?.totals?.pending_feedback || 0}</Typography>
                </Paper>
            </Box>

            <Paper sx={analyticsPaperSx}>
                <Typography variant="h6" sx={{ mb: 2, color: '#fff' }}>Generation Counts By User</Typography>
                <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={analyticsHeaderCellSx}>User</TableCell>
                                <TableCell sx={analyticsHeaderCellSx}>Role</TableCell>
                                <TableCell sx={analyticsHeaderCellSx}>Generated</TableCell>
                                <TableCell sx={analyticsHeaderCellSx}>Helpful</TableCell>
                                <TableCell sx={analyticsHeaderCellSx}>Not Helpful</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(summary?.users || []).map((row) => (
                                <TableRow key={row._id}>
                                    <TableCell sx={analyticsCellSx}>{row.user_email || row._id}</TableCell>
                                    <TableCell sx={analyticsCellSx}>{row.user_role}</TableCell>
                                    <TableCell sx={analyticsCellSx}>{row.generated_reviews}</TableCell>
                                    <TableCell sx={analyticsCellSx}>{row.helpful}</TableCell>
                                    <TableCell sx={analyticsCellSx}>{row.not_helpful}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Paper sx={analyticsPaperSx}>
                <Typography variant="h6" sx={{ mb: 2, color: '#fff' }}>Available Reference Data</Typography>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                    <Box>
                        <Typography sx={{ color: '#ddd', mb: 1 }}>Datasets</Typography>
                        {(summary?.datasets || []).map((dataset) => (
                            <Chip
                                key={dataset._id}
                                label={`${dataset.name}${dataset.is_active ? '' : ' - inactive'}`}
                                size="small"
                                sx={analyticsChipSx}
                            />
                        ))}
                    </Box>
                    <Box>
                        <Typography sx={{ color: '#ddd', mb: 1 }}>Languages</Typography>
                        {(summary?.languages || []).map((language) => (
                            <Chip
                                key={language._id}
                                label={`${language.name} (${language.code})${language.is_active ? '' : ' - inactive'}`}
                                size="small"
                                sx={analyticsChipSx}
                            />
                        ))}
                    </Box>
                    <Box>
                        <Typography sx={{ color: '#ddd', mb: 1 }}>Services</Typography>
                        {(summary?.services || []).map((service) => (
                            <Chip
                                key={service._id}
                                label={`${service.value}${service.is_active ? '' : ' - inactive'}`}
                                size="small"
                                sx={analyticsChipSx}
                            />
                        ))}
                    </Box>
                    <Box>
                        <Typography sx={{ color: '#ddd', mb: 1 }}>Local SEO Keywords</Typography>
                        {(summary?.seo_keywords || []).map((keyword) => (
                            <Chip
                                key={keyword._id}
                                label={`${keyword.value}${keyword.is_active ? '' : ' - inactive'}`}
                                size="small"
                                sx={analyticsChipSx}
                            />
                        ))}
                    </Box>
                </Box>
            </Paper>

            <Paper sx={analyticsPaperSx}>
                <Typography variant="h6" sx={{ mb: 2, color: '#fff' }}>Generated Review Records</Typography>
                {generationsQuery.isLoading ? <CircularProgress /> : (
                    <>
                        <TableContainer sx={{ overflowX: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={analyticsHeaderCellSx}>Created</TableCell>
                                        <TableCell sx={analyticsHeaderCellSx}>User</TableCell>
                                        <TableCell sx={analyticsHeaderCellSx}>Business</TableCell>
                                        <TableCell sx={analyticsHeaderCellSx}>Languages</TableCell>
                                        <TableCell sx={analyticsHeaderCellSx}>Dataset</TableCell>
                                        <TableCell sx={analyticsHeaderCellSx} align="center">Prompt Data</TableCell>
                                        <TableCell sx={analyticsHeaderCellSx} align="center">Generated Review</TableCell>
                                        <TableCell sx={analyticsHeaderCellSx}>Feedback</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {generations.map((generation) => (
                                        <TableRow key={generation._id}>
                                            <TableCell sx={{ ...analyticsCellSx, whiteSpace: 'nowrap' }}>
                                                {new Date(generation.createdAt).toLocaleString()}
                                            </TableCell>
                                            <TableCell sx={analyticsCellSx}>{generation.user_email}</TableCell>
                                            <TableCell sx={analyticsCellSx}>{generation.business_name}</TableCell>
                                            <TableCell sx={analyticsCellSx}>
                                                {(generation.selected_languages || []).map((language) => language.name).join(', ')}
                                            </TableCell>
                                            <TableCell sx={analyticsCellSx}>
                                                {generation.dataset_reference_used ? generation.dataset_name || 'Referenced' : 'No'}
                                            </TableCell>
                                            <TableCell sx={analyticsCellSx} align="center">
                                                <IconButton
                                                    onClick={() => setDetailModal({
                                                        title: 'Prompt Data',
                                                        content: generation.prompt_toon,
                                                    })}
                                                    sx={{ color: '#fff' }}
                                                    title="View prompt data"
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </TableCell>
                                            <TableCell sx={analyticsCellSx} align="center">
                                                <IconButton
                                                    onClick={() => setDetailModal({
                                                        title: 'Generated Review',
                                                        content: generation.generated_review,
                                                    })}
                                                    sx={{ color: '#fff' }}
                                                    title="View generated review"
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </TableCell>
                                            <TableCell sx={analyticsCellSx}>
                                                <Chip label={generation.feedback_status} size="small" sx={{ ...analyticsChipSx, mb: 0, mr: 0 }} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={generationsQuery.data?.total || 0}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={(_, nextPage) => setPage(nextPage)}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(parseInt(event.target.value, 10))
                                setPage(0)
                            }}
                            sx={{
                                color: '#fff',
                                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { color: '#fff' },
                                '& .MuiTablePagination-select': { color: '#fff' },
                                '& .MuiTablePagination-selectIcon': { color: '#fff' },
                                '& .MuiIconButton-root': { color: '#fff' },
                                '& .MuiIconButton-root.Mui-disabled': { color: '#666' },
                            }}
                        />
                    </>
                )}
            </Paper>

            <Dialog
                open={!!detailModal}
                onClose={() => setDetailModal(null)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: '#121212',
                        color: '#fff',
                        border: '1px solid #242424',
                        borderRadius: 3,
                    },
                }}
            >
                <DialogTitle sx={{ pr: 7, color: '#fff' }}>
                    {detailModal?.title}
                    <IconButton
                        onClick={() => setDetailModal(null)}
                        sx={{ position: 'absolute', top: 8, right: 8, color: '#aaa' }}
                        title="Close"
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            bgcolor: '#0d0d0d',
                            color: '#f0f0f0',
                            borderColor: '#2d2d2d',
                            whiteSpace: 'pre-wrap',
                            overflowWrap: 'anywhere',
                            lineHeight: 1.7,
                        }}
                    >
                        {detailModal?.content || '-'}
                    </Paper>
                </DialogContent>
            </Dialog>
        </Box>
    )
}

export default AiAnalyticsDashboard
