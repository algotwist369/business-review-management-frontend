import React, { useState } from 'react'
import AddReviewModal from '../component/AddReviewModel'
import BusinessReviewTable from '../component/BusinessReviewTable';
import BusinessTable from '../component/BusinessTable';
import BusinessGroupsPanel from '../component/BusinessGroupsPanel';
import UnAuthorizeHomePage from '../component/UnAuthorizeHomePage';

const Home = ({ onLoginClick, user }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [preselectedBusiness, setPreselectedBusiness] = useState(null);

    const handleEdit = (review) => {
        setPreselectedBusiness(null)
        setEditingReview(review)
    }

    const handleGroupAddReview = (business) => {
        setEditingReview(null)
        setPreselectedBusiness(business)
        setShowModal(true)
    }

    return (
        <div className='max-w-7xl mx-auto my-8'>
            {!user ? (
                <UnAuthorizeHomePage onLoginClick={onLoginClick} />
            ) : (
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
        </div>
    )
}
export default Home
