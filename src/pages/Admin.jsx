import React, { useState } from 'react'
import { Box, Typography, Tabs, Tab, Container } from '@mui/material'
import AdminUsersTable from '../component/Admin/AdminUsersTable'
import AdminBusinessTable from '../component/Admin/AdminBusinessTable'
import BusinessReviewTable from '../component/BusinessReviewTable'
import AddReviewModal from '../component/AddReviewModel'
import ButtonComponent from '../component/ButtonComponent'
import AiDatasetManager from '../component/Admin/AiDatasetManager'
import AiLanguageManager from '../component/Admin/AiLanguageManager'
import AiAnalyticsDashboard from '../component/Admin/AiAnalyticsDashboard'
import AiPromptOptionsManager from '../component/Admin/AiPromptOptionsManager'
import ReviewPaymentActions from '../component/Admin/ReviewPaymentActions'
import GbpUpdatesTable from '../component/GbpUpdatesTable'

const Admin = ({ user }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  
  // Scoped User selection states for Reviews and GBP updates
  const [selectedUserForReview, setSelectedUserForReview] = useState(null)
  const [selectedUserForGbp, setSelectedUserForGbp] = useState(null)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
    // Clear selection if switching manually away from reviews
    if (newValue !== 2) {
      setSelectedUserForReview(null)
    }
    // Clear selection if switching manually away from GBP Updates
    if (newValue !== 3) {
      setSelectedUserForGbp(null)
    }
  }

  const handleEditReview = (review) => {
    setEditingReview(review)
  }

  const handleViewReviews = (targetUser) => {
    setSelectedUserForReview(targetUser)
    setActiveTab(2) // Switch to User Reviews tab
  }

  const handleViewGbpUpdates = (targetUser) => {
    setSelectedUserForGbp(targetUser)
    setActiveTab(3) // Switch to GBP Monthly Updates tab
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2.5, sm: 4 }, color: '#fff' }}>
      <Box sx={{ borderBottom: 1, borderColor: '#333', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          textColor="inherit"
          indicatorColor="primary"
          sx={{
            '& .MuiTabs-indicator': { backgroundColor: '#fff' },
            '& .MuiTab-root': { fontWeight: 600, fontSize: '0.9rem', minWidth: { xs: 'auto', sm: 90 }, px: { xs: 1.5, sm: 2 } },
            '& .MuiTabs-scrollButtons': { color: '#fff' }
          }}
        >
          <Tab label="Users" />
          <Tab label="Businesses" />
          <Tab label="User Reviews" />
          <Tab label="GBP Monthly Updates" />
          <Tab label="AI Datasets" />
          <Tab label="AI Languages" />
          <Tab label="AI Services & Keywords" />
          {user?.role === 'super_admin' && <Tab label="AI Analytics" />}
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>User Management</Typography>
            <AdminUsersTable 
              onViewReviews={handleViewReviews} 
              onViewGbpUpdates={handleViewGbpUpdates} 
              user={user} 
            />
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 2 }}>
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
            <ReviewPaymentActions user={user} />
            <BusinessReviewTable
              onEdit={handleEditReview}
              setShowModal={setShowReviewModal}
              userId={selectedUserForReview?._id || user?._id || user?.id}
              isAdmin={true}
            />
          </Box>
        )}
        {activeTab === 3 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 2 }}>
              <Typography variant="h6">
                {selectedUserForGbp ? `GBP Updates for: ${selectedUserForGbp.username || selectedUserForGbp.email}` : 'GBP Monthly Updates Sheet'}
              </Typography>
              {selectedUserForGbp && (
                <Box sx={{ color: '#aaa', fontSize: '0.9rem', textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ display: 'block' }}>Email: {selectedUserForGbp.email}</Typography>
                  <ButtonComponent
                    text="Back to All Updates"
                    onClick={() => setSelectedUserForGbp(null)}
                    sx={{ mt: 1, height: 30, fontSize: '0.7rem' }}
                  />
                </Box>
              )}
            </Box>
            <GbpUpdatesTable 
              user={user} 
              selectedUser={selectedUserForGbp} 
            />
          </Box>
        )}
        {activeTab === 4 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>AI Review Dataset Management</Typography>
            <AiDatasetManager />
          </Box>
        )}
        {activeTab === 5 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>AI Review Language Management</Typography>
            <AiLanguageManager />
          </Box>
        )}
        {activeTab === 6 && user?.role === 'super_admin' && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>AI Review Services and Keywords</Typography>
            <AiPromptOptionsManager />
          </Box>
        )}
        {activeTab === 7 && user?.role === 'super_admin' && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>AI Review Analytics</Typography>
            <AiAnalyticsDashboard />
          </Box>
        )}
        {activeTab === 6 && user?.role === 'admin' && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>AI Review Services and Keywords</Typography>
            <AiPromptOptionsManager />
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
