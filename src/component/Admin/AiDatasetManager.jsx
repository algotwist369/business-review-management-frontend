import React, { useState } from 'react'
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import {
    useCreateDataset,
    useDatasets,
    useDeleteDataset,
    useUpdateDataset,
} from '../../hooks/useAiReviews'
import { darkFieldSx, darkOutlinedButtonSx, lightContainedButtonSx } from '../../styles/darkMuiStyles'

const emptyForm = { id: '', name: '', raw_text: '' }
const reviewDatasetExample = `The staff was friendly and the service was quick. I had a smooth experience from start to finish.
Very professional team. They explained everything clearly and completed the work on time.
Great experience overall. They were responsive, polite, and made the whole process stress-free.`

const AiDatasetManager = () => {
    const [formData, setFormData] = useState(emptyForm)
    const datasetsQuery = useDatasets()
    const createDatasetMutation = useCreateDataset()
    const updateDatasetMutation = useUpdateDataset()
    const deleteDatasetMutation = useDeleteDataset()

    const datasets = datasetsQuery.data || []

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        const content = await file.text()
        setFormData((current) => ({ ...current, raw_text: content }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            if (formData.id) {
                await updateDatasetMutation.mutateAsync({
                    id: formData.id,
                    data: { name: formData.name, raw_text: formData.raw_text },
                })
            } else {
                await createDatasetMutation.mutateAsync({
                    name: formData.name,
                    raw_text: formData.raw_text,
                })
            }
            setFormData(emptyForm)
        } catch (error) {
            alert(error.error || 'Dataset could not be saved')
        }
    }

    const handleEdit = (dataset) => {
        setFormData({
            id: dataset._id,
            name: dataset.name,
            raw_text: (dataset.examples || []).join('\n'),
        })
    }

    const handleStatusChange = async (dataset) => {
        try {
            await updateDatasetMutation.mutateAsync({
                id: dataset._id,
                data: { is_active: !dataset.is_active },
            })
        } catch (error) {
            alert(error.error || 'Dataset status could not be updated')
        }
    }

    const handleDelete = (id) => {
        if (window.confirm('Delete this dataset from generator options?')) {
            deleteDatasetMutation.mutate(id)
        }
    }

    return (
        <Box sx={{ display: 'grid', gap: 3 }}>
            <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#121212', color: '#fff', border: '1px solid #242424', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {formData.id ? 'Edit Review Dataset' : 'Upload Review Dataset'}
                </Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                    <TextField
                        label="Dataset Name"
                        value={formData.name}
                        onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                        required
                        sx={darkFieldSx}
                    />
                    <Button component="label" variant="outlined" sx={darkOutlinedButtonSx}>
                        Upload Text File
                        <input hidden type="file" accept=".txt,.csv,.md" onChange={handleFileChange} />
                    </Button>
                    <Box sx={{ p: 2, bgcolor: '#0d0d0d', border: '1px solid #242424', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                            Upload example. Use one review example per line.
                        </Typography>
                        <Typography component="pre" sx={{ m: 0, color: '#ddd', whiteSpace: 'pre-wrap', fontSize: '0.82rem', lineHeight: 1.6 }}>
                            {reviewDatasetExample}
                        </Typography>
                    </Box>
                    <TextField
                        label="Review Examples"
                        multiline
                        minRows={5}
                        value={formData.raw_text}
                        onChange={(event) => setFormData((current) => ({ ...current, raw_text: event.target.value }))}
                        placeholder="Use one review example per line."
                        required
                        sx={darkFieldSx}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button type="submit" variant="contained" disabled={createDatasetMutation.isPending || updateDatasetMutation.isPending} sx={lightContainedButtonSx}>
                            {formData.id ? 'Save Dataset' : 'Create Dataset'}
                        </Button>
                        {formData.id && <Button onClick={() => setFormData(emptyForm)} sx={darkOutlinedButtonSx}>Cancel</Button>}
                    </Box>
                </Box>
            </Paper>

            <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#121212', color: '#fff', border: '1px solid #242424', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Datasets</Typography>
                {datasetsQuery.isLoading ? <CircularProgress /> : (
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: '#fff' }}>Name</TableCell>
                                    <TableCell sx={{ color: '#fff' }}>Examples</TableCell>
                                    <TableCell sx={{ color: '#fff' }}>Status</TableCell>
                                    <TableCell sx={{ color: '#fff' }} align="center">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {datasets.map((dataset) => (
                                    <TableRow key={dataset._id}>
                                        <TableCell sx={{ color: '#ddd' }}>{dataset.name}</TableCell>
                                        <TableCell sx={{ color: '#ddd' }}>{dataset.examples?.length || 0}</TableCell>
                                        <TableCell>
                                            <Chip label={dataset.is_active ? 'Active' : 'Inactive'} color={dataset.is_active ? 'success' : 'default'} size="small" />
                                            <Switch checked={dataset.is_active} onChange={() => handleStatusChange(dataset)} />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton onClick={() => handleEdit(dataset)} sx={{ color: '#2196f3' }}><EditIcon /></IconButton>
                                            <IconButton onClick={() => handleDelete(dataset._id)} sx={{ color: '#f44336' }}><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    )
}

export default AiDatasetManager
