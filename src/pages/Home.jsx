import React, { useState } from 'react'
import AddReviewModal from '../component/AddReviewModel'
import BusinessReviewTable from '../component/BusinessReviewTable';
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
                    <BusinessReviewTable
                        onEdit={handleEdit}
                        setShowModal={setShowModal}
                        userId={user._id || user.id}
                        isAdmin={user?.role === 'admin'}
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
