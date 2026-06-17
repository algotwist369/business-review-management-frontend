import React, { useState } from 'react'
import AddReviewModal from '../component/AddReviewModel'
import BusinessReviewTable from '../component/BusinessReviewTable';
import BusinessTable from '../component/BusinessTable';
import BusinessGroupsPanel from '../component/BusinessGroupsPanel';
import UnAuthorizeHomePage from '../component/UnAuthorizeHomePage';
import GbpUpdatesTable from '../component/GbpUpdatesTable';
import { Tabs, Tab, Box } from '@mui/material';

const Home = ({ onLoginClick, user }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [preselectedBusiness, setPreselectedBusiness] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    const handleEdit = (review) => {
        setPreselectedBusiness(null)
        setEditingReview(review)
    }

    const handleGroupAddReview = (business) => {
        setEditingReview(null)
        setPreselectedBusiness(business)
        setShowModal(true)
    }

    if (!user) {
        return (
            <div className='max-w-7xl mx-auto my-4 px-3 sm:my-8 sm:px-4'>
                <UnAuthorizeHomePage onLoginClick={onLoginClick} />
            </div>
        )
    }

    const isClientUser = user?.role === 'user';
    const userScopes = user?.scopes || ['review_management'];

    const hasReviewScope = !isClientUser || userScopes.includes('review_management');
    const hasGbpScope = isClientUser && userScopes.includes('gbp_record_management');
    const showTabs = hasReviewScope && hasGbpScope;

    return (
        <div className='max-w-7xl mx-auto my-4 px-3 sm:my-8 sm:px-4'>
            {showTabs && (
                <Box sx={{ borderBottom: 1, borderColor: '#333', mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, val) => setActiveTab(val)}
                        textColor="inherit"
                        sx={{
                            '& .MuiTabs-indicator': { backgroundColor: '#fff' },
                            '& .MuiTab-root': { fontWeight: 600, color: '#aaa', '&.Mui-selected': { color: '#fff' } }
                        }}
                    >
                        <Tab label="Review Management" />
                        <Tab label="GBP Monthly Updates" />
                    </Tabs>
                </Box>
            )}

            {((!showTabs && hasReviewScope) || (showTabs && activeTab === 0)) && (
                <>
                    <BusinessTable />
                    {user?.role === 'user' && <BusinessGroupsPanel onAddReview={handleGroupAddReview} />}
                    <BusinessReviewTable
                        onEdit={handleEdit}
                        setShowModal={setShowModal}
                        userId={user._id || user.id}
                        isAdmin={['admin', 'super_admin'].includes(user?.role)}
                    />

                    <AddReviewModal
                        showModal={showModal}
                        setShowModal={setShowModal}
                        initialData={editingReview}
                        preselectedBusiness={preselectedBusiness}
                    />
                </>
            )}

            {((!showTabs && hasGbpScope) || (showTabs && activeTab === 1)) && (
                <GbpUpdatesTable user={user} />
            )}
        </div>
    )
}
export default Home
