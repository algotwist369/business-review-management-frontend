import React, { useMemo, useState } from 'react'
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Container,
    FormControlLabel,
    Paper,
    TextField,
    Typography,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined'
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined'
import { useBusinesses } from '../hooks/useBusinesses'
import { useAiReviewOptions, useGenerateAiReview, useSaveAiReviewFeedback } from '../hooks/useAiReviews'
import {
    darkFieldSx,
    darkAutocompleteSlotProps,
    darkOutlinedButtonSx,
    lightContainedButtonSx,
} from '../styles/darkMuiStyles'

const AiReviewGenerator = ({ user }) => {
    const canGenerate = user?.role === 'super_admin' || user?.ai_review_access
    const [formData, setFormData] = useState({
        business_id: '',
        service_ids: [],
        seo_keyword_ids: [],
        language_ids: [],
        tone: 'natural customer voice',
        use_dataset_reference: false,
        dataset_id: '',
    })
    const [generation, setGeneration] = useState(null)
    const [copied, setCopied] = useState(false)

    const businessesQuery = useBusinesses({ page: 1, limit: 10000, is_active: true })
    const optionsQuery = useAiReviewOptions(canGenerate)
    const generateMutation = useGenerateAiReview()
    const feedbackMutation = useSaveAiReviewFeedback()

    const businesses = useMemo(() => businessesQuery.data?.data || [], [businessesQuery.data?.data])
    const languages = useMemo(() => optionsQuery.data?.languages || [], [optionsQuery.data?.languages])
    const datasets = useMemo(() => optionsQuery.data?.datasets || [], [optionsQuery.data?.datasets])
    const serviceOptions = useMemo(() => optionsQuery.data?.services || [], [optionsQuery.data?.services])
    const keywordOptions = useMemo(() => optionsQuery.data?.seo_keywords || [], [optionsQuery.data?.seo_keywords])
    const selectedBusiness = businesses.find((business) => business._id === formData.business_id) || null
    const selectedDataset = datasets.find((dataset) => dataset._id === formData.dataset_id) || null
    const selectedLanguages = languages.filter((language) => formData.language_ids.includes(language._id))
    const selectedServices = serviceOptions.filter((service) => formData.service_ids.includes(service._id))
    const selectedKeywords = keywordOptions.filter((keyword) => formData.seo_keyword_ids.includes(keyword._id))

    const handleSubmit = async (event) => {
        event.preventDefault()
        setCopied(false)
        try {
            const result = await generateMutation.mutateAsync({
                ...formData,
                dataset_id: formData.use_dataset_reference ? formData.dataset_id : undefined,
            })
            setGeneration(result)
        } catch (error) {
            alert(error.error || 'Review generation failed')
        }
    }

    const copyReview = async () => {
        await navigator.clipboard.writeText(generation.review)
        setCopied(true)
    }

    const saveFeedback = async (feedback_status) => {
        try {
            const result = await feedbackMutation.mutateAsync({ id: generation.id, feedback_status })
            setGeneration((current) => ({ ...current, feedback_status: result.feedback_status }))
        } catch (error) {
            alert(error.error || 'Feedback could not be saved')
        }
    }

    if (!canGenerate) {
        return (
            <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 3, sm: 5 } }}>
                <Alert severity="info">AI review generation is not enabled for this account.</Alert>
            </Container>
        )
    }

    return (
        <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2.5, sm: 4 }, color: '#fff' }}>
            <Typography variant="h5" sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '1.35rem', sm: '1.5rem' } }}>AI Review Generator</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(360px, 1fr) 1fr' }, gap: { xs: 2, sm: 3 } }}>
                <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, sm: 3 }, minWidth: 0, bgcolor: '#121212', color: '#fff', border: '1px solid #242424', borderRadius: 3 }}>
                    <Box sx={{ display: 'grid', gap: 2 }}>
                        <Autocomplete
                            options={businesses}
                            value={selectedBusiness}
                            onChange={(_, business) => setFormData((current) => ({
                                ...current,
                                business_id: business?._id || '',
                            }))}
                            getOptionLabel={(business) =>
                                `${business.business_name || ''}${business.location ? ` - ${business.location}` : ''}${business.short_code ? ` (${business.short_code})` : ''}`
                            }
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            loading={businessesQuery.isLoading}
                            slotProps={darkAutocompleteSlotProps}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Business"
                                    placeholder="Search business name, location or short code"
                                    required
                                    sx={darkFieldSx}
                                />
                            )}
                        />
                        <Autocomplete
                            multiple
                            disableCloseOnSelect
                            options={serviceOptions}
                            value={selectedServices}
                            onChange={(_, nextServices) => setFormData((current) => ({
                                ...current,
                                service_ids: nextServices.map((service) => service._id),
                            }))}
                            getOptionLabel={(service) => service.value || ''}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            slotProps={darkAutocompleteSlotProps}
                            renderOption={(props, service, { selected }) => (
                                <li {...props} key={service._id}>
                                    <Checkbox checked={selected} sx={{ color: '#aaa', '&.Mui-checked': { color: '#fff' } }} />
                                    {service.value}
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Services"
                                    placeholder="Search and select services"
                                    sx={darkFieldSx}
                                />
                            )}
                        />
                        <Autocomplete
                            multiple
                            disableCloseOnSelect
                            options={keywordOptions}
                            value={selectedKeywords}
                            onChange={(_, nextKeywords) => setFormData((current) => ({
                                ...current,
                                seo_keyword_ids: nextKeywords.map((keyword) => keyword._id),
                            }))}
                            getOptionLabel={(keyword) => keyword.value || ''}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            slotProps={darkAutocompleteSlotProps}
                            renderOption={(props, keyword, { selected }) => (
                                <li {...props} key={keyword._id}>
                                    <Checkbox checked={selected} sx={{ color: '#aaa', '&.Mui-checked': { color: '#fff' } }} />
                                    {keyword.value}
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Local SEO Keywords"
                                    placeholder="Search and select keywords"
                                    sx={darkFieldSx}
                                />
                            )}
                        />
                        <Autocomplete
                            multiple
                            disableCloseOnSelect
                            options={languages}
                            value={selectedLanguages}
                            onChange={(_, nextLanguages) => setFormData((current) => ({
                                ...current,
                                language_ids: nextLanguages.map((language) => language._id),
                            }))}
                            getOptionLabel={(language) => `${language.name || ''}${language.code ? ` (${language.code})` : ''}`}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            slotProps={darkAutocompleteSlotProps}
                            renderOption={(props, language, { selected }) => (
                                <li {...props} key={language._id}>
                                    <Checkbox checked={selected} sx={{ color: '#aaa', '&.Mui-checked': { color: '#fff' } }} />
                                    {language.name} ({language.code})
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Languages"
                                    placeholder="Search and select languages"
                                    required={selectedLanguages.length === 0}
                                    sx={darkFieldSx}
                                />
                            )}
                        />
                        <FormControlLabel
                            control={(
                                <Checkbox
                                    checked={formData.use_dataset_reference}
                                    onChange={(event) => setFormData((current) => ({
                                        ...current,
                                        use_dataset_reference: event.target.checked,
                                    }))}
                                />
                            )}
                            label="Use dataset reference"
                        />
                        {formData.use_dataset_reference && (
                            <Autocomplete
                                options={datasets}
                                value={selectedDataset}
                                onChange={(_, dataset) => setFormData((current) => ({
                                    ...current,
                                    dataset_id: dataset?._id || '',
                                }))}
                                getOptionLabel={(dataset) => dataset.name || ''}
                                isOptionEqualToValue={(option, value) => option._id === value._id}
                                slotProps={darkAutocompleteSlotProps}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Dataset"
                                        placeholder="Search datasets"
                                        required
                                        sx={darkFieldSx}
                                    />
                                )}
                            />
                        )}
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={generateMutation.isPending || optionsQuery.isLoading || businessesQuery.isLoading}
                            sx={lightContainedButtonSx}
                        >
                            {generateMutation.isPending ? 'Generating...' : 'Generate Review'}
                        </Button>
                    </Box>
                </Paper>

                <Paper sx={{ p: { xs: 2, sm: 3 }, minWidth: 0, bgcolor: '#121212', color: '#fff', border: '1px solid #242424', borderRadius: 3, minHeight: { xs: 280, sm: 360 } }}>
                    <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 2 }}>
                        <Typography variant="h6">Generated Review</Typography>
                        {generation && (
                            <Button startIcon={<ContentCopyIcon />} onClick={copyReview} sx={darkOutlinedButtonSx}>
                                {copied ? 'Copied' : 'Copy'}
                            </Button>
                        )}
                    </Box>
                    {generateMutation.isPending && <CircularProgress />}
                    {!generation && !generateMutation.isPending && (
                        <Typography sx={{ color: '#aaa' }}>Your generated review will appear here.</Typography>
                    )}
                    {generation && (
                        <>
                            <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, mb: 3 }}>
                                {generation.review}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Typography sx={{ color: '#aaa', mr: 1 }}>Feedback</Typography>
                                <Button
                                    variant={generation.feedback_status === 'helpful' ? 'contained' : 'outlined'}
                                    startIcon={<ThumbUpAltOutlinedIcon />}
                                    onClick={() => saveFeedback('helpful')}
                                    disabled={feedbackMutation.isPending}
                                    sx={generation.feedback_status === 'helpful' ? lightContainedButtonSx : darkOutlinedButtonSx}
                                >
                                    Helpful
                                </Button>
                                <Button
                                    variant={generation.feedback_status === 'not_helpful' ? 'contained' : 'outlined'}
                                    startIcon={<ThumbDownAltOutlinedIcon />}
                                    onClick={() => saveFeedback('not_helpful')}
                                    disabled={feedbackMutation.isPending}
                                    sx={generation.feedback_status === 'not_helpful' ? lightContainedButtonSx : darkOutlinedButtonSx}
                                >
                                    Not helpful
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>
            </Box>
        </Container>
    )
}

export default AiReviewGenerator
