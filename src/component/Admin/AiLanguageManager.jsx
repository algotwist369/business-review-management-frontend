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
    useCreateLanguage,
    useDeleteLanguage,
    useLanguages,
    useUpdateLanguage,
} from '../../hooks/useAiReviews'
import { darkFieldSx, darkOutlinedButtonSx, lightContainedButtonSx } from '../../styles/darkMuiStyles'
import { detectLanguageCode } from '../../utils/languageCodes'

const emptyLanguage = { id: '', name: '', code: '' }

const AiLanguageManager = () => {
    const [formData, setFormData] = useState(emptyLanguage)
    const languagesQuery = useLanguages()
    const createLanguageMutation = useCreateLanguage()
    const updateLanguageMutation = useUpdateLanguage()
    const deleteLanguageMutation = useDeleteLanguage()

    const languages = languagesQuery.data || []

    const handleNameChange = (event) => {
        const name = event.target.value
        setFormData((current) => ({
            ...current,
            name,
            code: detectLanguageCode(name) || current.code,
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            if (formData.id) {
                await updateLanguageMutation.mutateAsync({
                    id: formData.id,
                    data: { name: formData.name, code: formData.code },
                })
            } else {
                await createLanguageMutation.mutateAsync({
                    name: formData.name,
                    code: formData.code,
                })
            }
            setFormData(emptyLanguage)
        } catch (error) {
            alert(error.error || 'Language could not be saved')
        }
    }

    return (
        <Box sx={{ display: 'grid', gap: 3 }}>
            <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#121212', color: '#fff', border: '1px solid #242424', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{formData.id ? 'Edit Language' : 'Add Language'}</Typography>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 220px auto' } }}>
                    <TextField
                        label="Language Name"
                        value={formData.name}
                        onChange={handleNameChange}
                        required
                        sx={darkFieldSx}
                    />
                    <TextField
                        label="Code"
                        value={formData.code}
                        onChange={(event) => setFormData((current) => ({ ...current, code: event.target.value }))}
                        placeholder="Auto fills for known language names"
                        required
                        sx={darkFieldSx}
                    />
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button type="submit" variant="contained" disabled={createLanguageMutation.isPending || updateLanguageMutation.isPending} sx={lightContainedButtonSx}>
                            Save
                        </Button>
                        {formData.id && <Button onClick={() => setFormData(emptyLanguage)} sx={darkOutlinedButtonSx}>Cancel</Button>}
                    </Box>
                </Box>
            </Paper>
            <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#121212', color: '#fff', border: '1px solid #242424', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Languages</Typography>
                {languagesQuery.isLoading ? <CircularProgress /> : (
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: '#fff' }}>Name</TableCell>
                                    <TableCell sx={{ color: '#fff' }}>Code</TableCell>
                                    <TableCell sx={{ color: '#fff' }}>Status</TableCell>
                                    <TableCell sx={{ color: '#fff' }} align="center">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {languages.map((language) => (
                                    <TableRow key={language._id}>
                                        <TableCell sx={{ color: '#ddd' }}>{language.name}</TableCell>
                                        <TableCell sx={{ color: '#ddd' }}>{language.code}</TableCell>
                                        <TableCell>
                                            <Chip label={language.is_active ? 'Active' : 'Inactive'} color={language.is_active ? 'success' : 'default'} size="small" />
                                            <Switch
                                                checked={language.is_active}
                                                onChange={() => updateLanguageMutation.mutate({
                                                    id: language._id,
                                                    data: { is_active: !language.is_active },
                                                })}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton onClick={() => setFormData({ id: language._id, name: language.name, code: language.code })} sx={{ color: '#2196f3' }}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => deleteLanguageMutation.mutate(language._id)} sx={{ color: '#f44336' }}>
                                                <DeleteIcon />
                                            </IconButton>
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

export default AiLanguageManager
