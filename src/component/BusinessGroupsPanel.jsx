import React, { useState } from 'react'
import {
    Paper,
    Box,
    Typography,
    TextField,
    CircularProgress,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
} from '@mui/material'
import ButtonComponent from './ButtonComponent'
import { useBusinesses } from '../hooks/useBusinesses'
import {
    useAddBusinessToGroup,
    useCreateGroup,
    useRemoveBusinessFromGroup,
    useUserGroups,
} from '../hooks/useGroups'

const BusinessGroupsPanel = () => {
    const [groupName, setGroupName] = useState('')
    const [selectedBusinessByGroup, setSelectedBusinessByGroup] = useState({})
    const { data: groupsData, isLoading: groupsLoading, isError: groupsError } = useUserGroups()
    const { data: businessData, isLoading: businessesLoading } = useBusinesses({ limit: 1000 })
    const createGroupMutation = useCreateGroup()
    const addBusinessMutation = useAddBusinessToGroup()
    const removeBusinessMutation = useRemoveBusinessFromGroup()

    const groups = groupsData || []
    const businesses = businessData?.data || []

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

    const handleAddBusiness = (groupId) => {
        const selectedBusinessId = selectedBusinessByGroup[groupId]
        if (!selectedBusinessId) return

        addBusinessMutation.mutate(
            { groupId, businessId: selectedBusinessId },
            {
                onError: (err) => alert(err.error || 'Failed to add business to group'),
            }
        )
    }

    const getSelectableBusinesses = (group) => {
        const existingIds = new Set((group.businessIds || []).map((b) => b._id))
        return businesses.filter((business) => !existingIds.has(business._id))
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

            {groups.map((group) => {
                const selectableBusinesses = getSelectableBusinesses(group)
                const selectedBusinessId = selectedBusinessByGroup[group._id] || ''

                return (
                    <Box key={group._id} sx={{ mb: 3 }}>
                        <Divider sx={{ borderColor: '#2a2a2a', mb: 2 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {group.groupName}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1, mb: 2 }}>
                            {(group.businessIds || []).length === 0 ? (
                                <Typography sx={{ color: '#aaa' }}>
                                    No businesses in this group.
                                </Typography>
                            ) : (
                                group.businessIds.map((business) => (
                                    <Chip
                                        key={business._id}
                                        label={business.business_name}
                                        onDelete={() =>
                                            removeBusinessMutation.mutate(
                                                { groupId: group._id, businessId: business._id },
                                                {
                                                    onError: (err) => alert(err.error || 'Failed to remove business'),
                                                }
                                            )
                                        }
                                        sx={{
                                            backgroundColor: '#1f1f1f',
                                            color: '#fff',
                                            '& .MuiChip-deleteIcon': { color: '#aaa' },
                                            '& .MuiChip-deleteIcon:hover': { color: '#f44336' },
                                        }}
                                    />
                                ))
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <FormControl size="small" sx={{ minWidth: 240 }}>
                                <InputLabel sx={{ color: '#aaa' }}>Add Business</InputLabel>
                                <Select
                                    label="Add Business"
                                    value={selectedBusinessId}
                                    onChange={(e) =>
                                        setSelectedBusinessByGroup((prev) => ({
                                            ...prev,
                                            [group._id]: e.target.value,
                                        }))
                                    }
                                    sx={{
                                        color: '#fff',
                                        '.MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                                        '.MuiSvgIcon-root': { color: '#aaa' },
                                    }}
                                >
                                    {selectableBusinesses.map((business) => (
                                        <MenuItem key={business._id} value={business._id}>
                                            {business.business_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <ButtonComponent
                                text={addBusinessMutation.isPending ? 'Adding...' : 'Add To Group'}
                                onClick={() => handleAddBusiness(group._id)}
                                disabled={!selectedBusinessId || addBusinessMutation.isPending}
                            />
                        </Box>
                    </Box>
                )
            })}
        </Paper>
    )
}

export default BusinessGroupsPanel
