import React, { useState, useEffect } from 'react'
import {
    Modal,
    Box,
    Typography,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    Checkbox,
    Button,
    CircularProgress,
    TextField,
    InputAdornment
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useBusinesses } from '../../hooks/useBusinesses'
import { useAssignBusinessesToUser } from '../../hooks/useUsers'

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: 'calc(100vw - 24px)', sm: 500 },
    maxHeight: '80vh',
    bgcolor: '#1e1e1e',
    border: '1px solid #333',
    boxShadow: 24,
    p: { xs: 2, sm: 4 },
    borderRadius: 2,
    color: '#fff',
    display: 'flex',
    flexDirection: 'column'
}

const BusinessAssignmentModal = ({ open, onClose, user }) => {
    const [search, setSearch] = useState('')
    const [selectedBusinesses, setSelectedBusinesses] = useState([])
    const [activeTab, setActiveTab] = useState('all')

    // Fetch all businesses and search globally from backend
    const { data: businessesData, isLoading } = useBusinesses({
        page: 1,
        limit: 10000,
        search: search.trim(),
    })
    const assignMutation = useAssignBusinessesToUser()

    const businesses = businessesData?.data || []

    useEffect(() => {
        if (open && user) {
            // Ensure we work with strings for comparison
            const assigned = (user.assigned_businesses || []).map(id => 
                typeof id === 'object' ? id._id.toString() : id.toString()
            )
            setSelectedBusinesses(assigned)
            setActiveTab('all')
        }
    }, [open, user])

    const handleToggle = (businessId) => {
        const id = businessId.toString()
        const currentIndex = selectedBusinesses.indexOf(id)
        const newSelected = [...selectedBusinesses]

        if (currentIndex === -1) {
            newSelected.push(id)
        } else {
            newSelected.splice(currentIndex, 1)
        }
        setSelectedBusinesses(newSelected)
    }

    const handleSave = async () => {
        try {
            await assignMutation.mutateAsync({ 
                id: user._id, 
                businessIds: selectedBusinesses 
            })
            onClose()
        } catch (error) {
            console.error('Business assignment failed', error)
        }
    }

    const filteredBusinesses = businesses
    const assignedBusinessesOnly = businesses.filter((business) =>
        selectedBusinesses.includes(business._id?.toString())
    )
    const displayedBusinesses = activeTab === 'assigned' ? assignedBusinessesOnly : filteredBusinesses

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                    Assign Businesses to {user?.username || user?.email}
                </Typography>

                <TextField
                    size="small"
                    placeholder="Search Businesses..."
                    fullWidth
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                        mb: 2,
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

                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        mb: 1,
                        minHeight: 36,
                        '& .MuiTab-root': { color: '#aaa', minHeight: 36, py: 0.5 },
                        '& .Mui-selected': { color: '#fff !important' },
                        '& .MuiTabs-indicator': { backgroundColor: '#fff' },
                    }}
                >
                    <Tab value="all" label={`All Businesses (${filteredBusinesses.length})`} />
                    <Tab value="assigned" label={`Assigned Businesses (${assignedBusinessesOnly.length})`} />
                </Tabs>

                <Box sx={{ flex: 1, overflowY: 'auto', mb: 2, minHeight: 200 }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : (
                        <List>
                            {displayedBusinesses.map((business) => (
                                <ListItem key={business._id} button onClick={() => handleToggle(business._id)}>
                                    <Checkbox
                                        checked={selectedBusinesses.includes(business._id?.toString())}
                                        sx={{ color: '#aaa', '&.Mui-checked': { color: '#fff' } }}
                                    />
                                    <ListItemText
                                        primary={business.business_name}
                                        secondary={`${business.location} (${business.short_code})`}
                                        slotProps={{
                                            secondary: { sx: { color: '#aaa', fontSize: '0.8rem' } },
                                        }}
                                    />
                                </ListItem>
                            ))}
                            {!displayedBusinesses.length && (
                                <ListItem>
                                    <ListItemText
                                        primary={activeTab === 'assigned' ? 'No assigned businesses found' : 'No businesses found'}
                                        secondary={activeTab === 'assigned' ? 'Assign businesses from the All Businesses tab.' : 'Try a different search term.'}
                                        slotProps={{
                                            secondary: { sx: { color: '#aaa', fontSize: '0.8rem' } },
                                        }}
                                    />
                                </ListItem>
                            )}
                        </List>
                    )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
                    <Button onClick={onClose} sx={{ color: '#aaa' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={assignMutation.isPending}
                    >
                        {assignMutation.isPending ? 'Saving...' : 'Save Assignments'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}

export default BusinessAssignmentModal
