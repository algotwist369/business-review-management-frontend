import React, { useState } from 'react'
import {
    Paper,
    Box,
    Typography,
    TextField,
    CircularProgress,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
} from '@mui/material'
import ButtonComponent from './ButtonComponent'
import { useBusinesses } from '../hooks/useBusinesses'
import {
    useAddBusinessToGroup,
    useCreateGroup,
    useRemoveBusinessFromGroup,
    useUserGroups,
} from '../hooks/useGroups'

const BusinessGroupsPanel = ({ onAddReview }) => {
    const [groupName, setGroupName] = useState('')
    const [activeGroupIndex, setActiveGroupIndex] = useState(0)
    const [showManageBusinesses, setShowManageBusinesses] = useState(false)
    const [selectedBusinessIds, setSelectedBusinessIds] = useState([])
    const [isSavingSelection, setIsSavingSelection] = useState(false)
    const { data: groupsData, isLoading: groupsLoading, isError: groupsError } = useUserGroups()
    const { data: businessData, isLoading: businessesLoading } = useBusinesses({ limit: 1000 })
    const createGroupMutation = useCreateGroup()
    const addBusinessMutation = useAddBusinessToGroup()
    const removeBusinessMutation = useRemoveBusinessFromGroup()

    const groups = groupsData || []
    const businesses = businessData?.data || []
    const activeGroup = groups[activeGroupIndex] || null

    const handleCreateGroup = () => {
        if (!groupName.trim()) {
            alert('Please enter a group name')
            return
        }

        createGroupMutation.mutate(
            { groupName: groupName.trim() },
            {
                onSuccess: () => setGroupName(''),
                onError: (err) => alert(err.error || 'Failed to create group'),
            }
        )
    }

    const handleOpenManageBusinesses = () => {
        if (!activeGroup) return
        setSelectedBusinessIds((activeGroup.businessIds || []).map((business) => business._id))
        setShowManageBusinesses(true)
    }

    const handleToggleBusiness = (businessId) => {
        setSelectedBusinessIds((prev) =>
            prev.includes(businessId) ? prev.filter((id) => id !== businessId) : [...prev, businessId]
        )
    }

    const handleToggleSelectAll = () => {
        if (selectedBusinessIds.length === businesses.length) {
            setSelectedBusinessIds([])
            return
        }
        setSelectedBusinessIds(businesses.map((business) => business._id))
    }

    const handleSaveBusinessSelection = async () => {
        if (!activeGroup) return

        try {
            setIsSavingSelection(true)
            const selectedSet = new Set(selectedBusinessIds)
            const currentSet = new Set((activeGroup.businessIds || []).map((business) => business._id))

            const toAdd = selectedBusinessIds.filter((id) => !currentSet.has(id))
            const toRemove = [...currentSet].filter((id) => !selectedSet.has(id))

            await Promise.all([
                ...toAdd.map((businessId) => addBusinessMutation.mutateAsync({ groupId: activeGroup._id, businessId })),
                ...toRemove.map((businessId) => removeBusinessMutation.mutateAsync({ groupId: activeGroup._id, businessId })),
            ])

            setShowManageBusinesses(false)
        } catch (err) {
            alert(err.error || 'Failed to update group businesses')
        } finally {
            setIsSavingSelection(false)
        }
    }

    return (
        <Paper sx={{ p: 3, backgroundColor: '#121212', color: '#fff', borderRadius: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Business Groups
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <TextField
                    size="small"
                    label="New Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    sx={{
                        minWidth: 260,
                        input: { color: '#fff' },
                        label: { color: '#aaa' },
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#444' },
                            '&:hover fieldset': { borderColor: '#666' },
                            '&.Mui-focused fieldset': { borderColor: '#fff' },
                        },
                    }}
                />
                <ButtonComponent
                    text={createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                    onClick={handleCreateGroup}
                    disabled={createGroupMutation.isPending}
                />
            </Box>

            {(groupsLoading || businessesLoading) && (
                <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={24} />
                </Box>
            )}

            {groupsError && (
                <Typography color="error" sx={{ mb: 2 }}>
                    Failed to load groups.
                </Typography>
            )}

            {!groupsLoading && groups.length === 0 && (
                <Typography sx={{ color: '#aaa' }}>
                    No groups created yet.
                </Typography>
            )}

            {groups.length > 0 && (
                <>
                    <Tabs
                        value={activeGroupIndex}
                        onChange={(e, nextIndex) => {
                            setActiveGroupIndex(nextIndex)
                            setShowManageBusinesses(false)
                        }}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            mb: 2,
                            '& .MuiTab-root': { color: '#aaa', textTransform: 'none', fontWeight: 600 },
                            '& .Mui-selected': { color: '#fff !important' },
                            '& .MuiTabs-indicator': { backgroundColor: '#fff' },
                        }}
                    >
                        {groups.map((group) => (
                            <Tab key={group._id} label={group.groupName} />
                        ))}
                    </Tabs>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ color: '#ddd', fontWeight: 600 }}>
                            {activeGroup?.groupName || 'Selected Group'}
                        </Typography>
                        <ButtonComponent
                            text={showManageBusinesses ? 'Close' : 'Add To Group'}
                            onClick={() => {
                                if (showManageBusinesses) {
                                    setShowManageBusinesses(false)
                                    return
                                }
                                handleOpenManageBusinesses()
                            }}
                        />
                    </Box>

                    {showManageBusinesses && (
                        <Paper sx={{ p: 2, backgroundColor: '#181818', border: '1px solid #333', mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography sx={{ color: '#ddd', fontWeight: 600 }}>Select Assigned Businesses</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Checkbox
                                            checked={businesses.length > 0 && selectedBusinessIds.length === businesses.length}
                                            indeterminate={selectedBusinessIds.length > 0 && selectedBusinessIds.length < businesses.length}
                                            onChange={handleToggleSelectAll}
                                            sx={{ color: '#aaa', '&.Mui-checked': { color: '#fff' } }}
                                        />
                                        <Typography sx={{ color: '#aaa' }}>Select All</Typography>
                                    </Box>
                                    <ButtonComponent
                                        text={isSavingSelection ? 'Saving...' : 'Save Selection'}
                                        onClick={handleSaveBusinessSelection}
                                        disabled={isSavingSelection}
                                    />
                                </Box>
                            </Box>

                            {businesses.map((business) => (
                                <Box key={business._id} sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                                    <Checkbox
                                        checked={selectedBusinessIds.includes(business._id)}
                                        onChange={() => handleToggleBusiness(business._id)}
                                        sx={{ color: '#aaa', '&.Mui-checked': { color: '#fff' } }}
                                    />
                                    <Typography sx={{ color: '#ddd' }}>{business.business_name}</Typography>
                                </Box>
                            ))}
                        </Paper>
                    )}

                    {!activeGroup || (activeGroup.businessIds || []).length === 0 ? (
                        <Typography sx={{ color: '#aaa' }}>
                            No businesses in this group.
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#1e1e1e' }}>
                                        <TableCell sx={{ color: '#fff' }}><strong>Business Name</strong></TableCell>
                                        <TableCell sx={{ color: '#fff' }}><strong>Location</strong></TableCell>
                                        <TableCell sx={{ color: '#fff' }}><strong>Business Link</strong></TableCell>
                                        <TableCell sx={{ color: '#fff' }} align="center"><strong>Action</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {activeGroup.businessIds.map((business) => (
                                        <TableRow key={business._id} sx={{ '&:hover': { backgroundColor: '#1e1e1e' } }}>
                                            <TableCell sx={{ color: '#ddd' }}>{business.business_name}</TableCell>
                                            <TableCell sx={{ color: '#ddd' }}>{business.location || '-'}</TableCell>
                                            <TableCell sx={{ color: '#ddd' }}>
                                                {business.business_link ? (
                                                    <a
                                                        href={business.business_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: '#64b5f6' }}
                                                    >
                                                        Open Link
                                                    </a>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell align="center">
                                                <ButtonComponent
                                                    text="Add Review"
                                                    onClick={() => onAddReview?.(business)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </>
            )}
        </Paper>
    )
}

export default BusinessGroupsPanel
