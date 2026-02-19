import React, { useState } from 'react'
import { Box, Typography, Tabs, Tab, Container } from '@mui/material'
import AdminUsersTable from '../component/Admin/AdminUsersTable'
import AdminBusinessTable from '../component/Admin/AdminBusinessTable'
import BusinessReviewTable from '../component/BusinessReviewTable'
import AddReviewModal from '../component/AddReviewModel'
import ButtonComponent from '../component/ButtonComponent'

const Admin = ({ user }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [selectedUserForReview, setSelectedUserForReview] = useState(null)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
    // Clear selection if switching manually away from reviews
    if (newValue !== 2) {
      setSelectedUserForReview(null)
    }
  }

  const handleEditReview = (review) => {
    setEditingReview(review)
  }

  const handleViewReviews = (targetUser) => {
    setSelectedUserForReview(targetUser)
    setActiveTab(2) // Switch to User Reviews tab
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, color: '#fff' }}>
      <Box sx={{ borderBottom: 1, borderColor: '#333', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="primary"
          sx={{
            '& .MuiTabs-indicator': { backgroundColor: '#fff' },
            '& .MuiTab-root': { fontWeight: 600, fontSize: '0.9rem' }
          }}
        >
          <Tab label="Users" />
          <Tab label="Businesses" />
          <Tab label="User Reviews" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>User Management</Typography>
            <AdminUsersTable onViewReviews={handleViewReviews} />
          </Box>
        )}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Business Management</Typography>
            <AdminBusinessTable />
          </Box>
        )}
        {activeTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {selectedUserForReview ? `Reviews for: ${selectedUserForReview.username || selectedUserForReview.email}` : 'My Reviews'}
              </Typography>
              {selectedUserForReview && (
                <Box sx={{ color: '#aaa', fontSize: '0.9rem', textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ display: 'block' }}>Email: {selectedUserForReview.email}</Typography>
                  <ButtonComponent
                    text="Back to My Reviews"
                    onClick={() => setSelectedUserForReview(null)}
                    sx={{ mt: 1, height: 30, fontSize: '0.7rem' }}
                  />
                </Box>
              )}
            </Box>
            <BusinessReviewTable
              onEdit={handleEditReview}
              setShowModal={setShowReviewModal}
              userId={selectedUserForReview?._id || user?._id || user?.id}
              isAdmin={true}
            />
          </Box>
        )}
      </Box>

      <AddReviewModal
        showModal={showReviewModal}
        setShowModal={setShowReviewModal}
        initialData={editingReview}
      />
    </Container>
  )
}

export default Admin