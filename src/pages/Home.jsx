import React, { useState } from 'react'
import AddReviewModal from '../component/AddReviewModel'
import BusinessReviewTable from '../component/BusinessReviewTable';
import BusinessTable from '../component/BusinessTable';
import BusinessGroupsPanel from '../component/BusinessGroupsPanel';
import UnAuthorizeHomePage from '../component/UnAuthorizeHomePage';

const Home = ({ onLoginClick, user }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingReview, setEditingReview] = useState(null);

    const handleEdit = (review) => {
        setEditingReview(review)
    }

    return (
        <div className='max-w-7xl mx-auto my-8'>
            {!user ? (
                <UnAuthorizeHomePage onLoginClick={onLoginClick} />
            ) : (
                <>
                    <BusinessTable />
                    {user?.role === 'user' && <BusinessGroupsPanel />}
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
                    />
                </>
            )}
        </div>
    )
}
export default Home
