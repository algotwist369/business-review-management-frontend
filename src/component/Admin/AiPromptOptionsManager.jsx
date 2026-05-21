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
    useCreatePromptOptions,
    useDeletePromptOption,
    usePromptOptions,
    useUpdatePromptOption,
} from '../../hooks/useAiReviews'
import { darkFieldSx, darkOutlinedButtonSx, lightContainedButtonSx } from '../../styles/darkMuiStyles'

const optionTypes = [
    {
        type: 'service',
        title: 'Services',
        label: 'Service',
        placeholder: 'Dental cleaning',
        example: `Dental Cleaning
Root Canal Treatment
Teeth Whitening
Emergency Dental Care`,
    },
    {
        type: 'seo_keyword',
        title: 'Local SEO Keywords',
        label: 'Local SEO Keyword',
        placeholder: 'dentist in Pune',
        example: `best dentist in Pune
dental clinic near me
emergency dentist in Pune
family dental clinic in Pune`,
    },
]

const PromptOptionPanel = ({ type, title, label, placeholder, example }) => {
    const [bulkText, setBulkText] = useState('')
    const [editing, setEditing] = useState(null)
    const optionsQuery = usePromptOptions(type)
    const createOptionsMutation = useCreatePromptOptions(type)
    const updateOptionMutation = useUpdatePromptOption(type)
    const deleteOptionMutation = useDeletePromptOption(type)
    const options = optionsQuery.data || []

    const saveBulkOptions = async (event) => {
        event.preventDefault()
        try {
            await createOptionsMutation.mutateAsync({ raw_text: bulkText })
            setBulkText('')
        } catch (error) {
            alert(error.error || `${title} could not be saved`)
        }
    }

    const loadOptionFile = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        setBulkText(await file.text())
    }

    const saveEdit = async (event) => {
        event.preventDefault()
        try {
            await updateOptionMutation.mutateAsync({
                id: editing._id,
                data: { value: editing.value },
            })
            setEditing(null)
        } catch (error) {
            alert(error.error || `${label} could not be updated`)
        }
    }

    return (
        <Paper sx={{ p: { xs: 2, sm: 3 }, minWidth: 0, bgcolor: '#121212', color: '#fff', border: '1px solid #242424', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
            <Box component="form" onSubmit={saveBulkOptions} sx={{ display: 'grid', gap: 1.5, mb: 3 }}>
                <TextField
                    label={`Add ${title}`}
                    value={bulkText}
                    onChange={(event) => setBulkText(event.target.value)}
                    placeholder={`Use one ${label.toLowerCase()} per line. ${placeholder}`}
                    multiline
                    minRows={3}
                    required
                    sx={darkFieldSx}
                />
                <Box sx={{ p: 2, bgcolor: '#0d0d0d', border: '1px solid #242424', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                        Upload example. Use one {label.toLowerCase()} per line.
                    </Typography>
                    <Typography component="pre" sx={{ m: 0, color: '#ddd', whiteSpace: 'pre-wrap', fontSize: '0.82rem', lineHeight: 1.6 }}>
                        {example}
                    </Typography>
                </Box>
                <Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button component="label" variant="outlined" sx={darkOutlinedButtonSx}>
                            Upload Text List
                            <input hidden type="file" accept=".txt,.csv,.md" onChange={loadOptionFile} />
                        </Button>
                        <Button type="submit" variant="contained" disabled={createOptionsMutation.isPending} sx={lightContainedButtonSx}>
                            Add {title}
                        </Button>
                    </Box>
                </Box>
            </Box>

            {editing && (
                <Box component="form" onSubmit={saveEdit} sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <TextField
                        label={`Edit ${label}`}
                        value={editing.value}
                        onChange={(event) => setEditing((current) => ({ ...current, value: event.target.value }))}
                        required
                        sx={{ ...darkFieldSx, flex: 1, minWidth: { xs: '100%', sm: 240 } }}
                    />
                    <Button type="submit" variant="contained" sx={lightContainedButtonSx}>Save</Button>
                    <Button onClick={() => setEditing(null)} sx={darkOutlinedButtonSx}>Cancel</Button>
                </Box>
            )}

            {optionsQuery.isLoading ? <CircularProgress /> : (
                <TableContainer sx={{ maxHeight: 420, overflowX: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: '#fff', bgcolor: '#1e1e1e' }}>{label}</TableCell>
                                <TableCell sx={{ color: '#fff', bgcolor: '#1e1e1e' }}>Status</TableCell>
                                <TableCell sx={{ color: '#fff', bgcolor: '#1e1e1e' }} align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {options.map((option) => (
                                <TableRow key={option._id}>
                                    <TableCell sx={{ color: '#ddd' }}>{option.value}</TableCell>
                                    <TableCell>
                                        <Chip label={option.is_active ? 'Active' : 'Inactive'} color={option.is_active ? 'success' : 'default'} size="small" />
                                        <Switch
                                            checked={option.is_active}
                                            onChange={() => updateOptionMutation.mutate({
                                                id: option._id,
                                                data: { is_active: !option.is_active },
                                            })}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton onClick={() => setEditing(option)} sx={{ color: '#2196f3' }}><EditIcon /></IconButton>
                                        <IconButton onClick={() => deleteOptionMutation.mutate(option._id)} sx={{ color: '#f44336' }}><DeleteIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    )
}

const AiPromptOptionsManager = () => (
    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' } }}>
        {optionTypes.map((optionType) => <PromptOptionPanel key={optionType.type} {...optionType} />)}
    </Box>
)

export default AiPromptOptionsManager
