import React, { useState, useEffect } from 'react'
import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
    Field,
    Label,
    Input,
} from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import ButtonComponent from './ButtonComponent';
import { useBusinesses } from '../hooks/useBusinesses'
import { useAddReview, useEditReview } from '../hooks/useReviews'

const AddReviewModal = ({ showModal, setShowModal, initialData = null }) => {
    const isEdit = !!initialData
    const [query, setQuery] = useState('')
    const [selectedBusiness, setSelectedBusiness] = useState(null)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [reviewCount, setReviewCount] = useState('')
    const [reviewLink, setReviewLink] = useState('')

    const { data: businessData, isLoading: businessesLoading } = useBusinesses({ limit: 1000 })
    const addReviewMutation = useAddReview()
    const editReviewMutation = useEditReview()

    useEffect(() => {
        if (initialData) {
            setSelectedBusiness(initialData.business_id)
            setSelectedDate(initialData.review_date ? new Date(initialData.review_date).toISOString().split('T')[0] : '')
            setReviewCount(initialData.review_count || '')
            // Join array of links with comma for editing
            setReviewLink(initialData.review_link?.join(', ') || '')
        } else {
            setSelectedBusiness(null)
            setSelectedDate(new Date().toISOString().split('T')[0])
            setReviewCount('')
            setReviewLink('')
        }
    }, [initialData, showModal])

    if (!showModal) return null

    const businesses = businessData?.data || []
    const filteredBusinesses =
        query === ''
            ? businesses
            : businesses.filter((b) =>
                b.business_name.toLowerCase().includes(query.toLowerCase())
            )

    const handleSubmit = () => {
        if (!selectedBusiness || !reviewCount) {
            alert('Please select a business and enter review count')
            return
        }

        // Split comma-separated string back into array and clean up
        const parsedLinks = reviewLink
            ? reviewLink.split(',').map(link => link.trim()).filter(link => link !== '')
            : []

        const payload = {
            business_id: selectedBusiness._id,
            review_date: selectedDate,
            review_count: Number(reviewCount),
            review_link: parsedLinks,
        }

        if (isEdit) {
            editReviewMutation.mutate({ id: initialData._id, data: payload }, {
                onSuccess: () => {
                    setShowModal(false)
                },
                onError: (err) => {
                    alert(err.error || 'Failed to update review')
                }
            })
        } else {
            addReviewMutation.mutate(payload, {
                onSuccess: () => {
                    setShowModal(false)
                    setSelectedBusiness(null)
                    setReviewCount('')
                    setReviewLink('')
                },
                onError: (err) => {
                    alert(err.error || 'Failed to add review')
                }
            })
        }
    }

    const isPending = addReviewMutation.isPending || editReviewMutation.isPending

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
            <div className="w-[500px] bg-black border border-white/10 p-6 rounded-2xl shadow-2xl space-y-5 text-white">

                <h2 className="text-2xl font-bold text-center">{isEdit ? 'Edit Review' : 'Add Review'}</h2>

                {/* Dropdown */}
                <Combobox value={selectedBusiness} onChange={setSelectedBusiness} onClose={() => setQuery('')}>
                    <div className="relative">
                        <ComboboxInput
                            className="w-full rounded-lg bg-black border border-white/20 px-3 py-2 text-white placeholder-white/50 "
                            displayValue={(b) => b?.business_name}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={businessesLoading ? "Loading Businesses..." : "Select Business"}
                        />
                        <ComboboxButton className="absolute inset-y-0 right-0 px-2 flex items-center">
                            <ChevronDownIcon className="w-5 h-5 text-white" />
                        </ComboboxButton>
                    </div>

                    <ComboboxOptions className="mt-2 max-h-40 overflow-auto rounded-lg bg-black border border-white/20 shadow-lg">
                        {filteredBusinesses.map((b) => (
                            <ComboboxOption
                                key={b._id}
                                value={b}
                                className={({ active }) =>
                                    clsx(
                                        'flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md',
                                        active ? 'bg-white/10' : ''
                                    )
                                }
                            >
                                <CheckIcon className="w-4 h-4 opacity-0 data-[selected]:opacity-100 text-white" />
                                {b.business_name}
                            </ComboboxOption>
                        ))}
                    </ComboboxOptions>
                </Combobox>

                {/* Date Field */}
                {selectedBusiness && (
                    <Field>
                        <Label className="text-sm font-medium">
                            Select Date
                        </Label>
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="mt-2 w-full rounded-lg bg-black border border-white/20 px-3 py-2 text-white  
                            
                            [&::-webkit-calendar-picker-indicator]:invert
                            [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                    </Field>
                )}

                {/* Review Input */}
                {selectedDate && (
                    <Field className={"flex flex-col gap-4"}>
                        <div>
                            <Label className="text-sm font-medium">
                                Review Count
                            </Label>
                            <Input
                                type="number"
                                value={reviewCount}
                                onChange={(e) => setReviewCount(e.target.value)}
                                placeholder="Enter Number of reviews"
                                className="mt-2 w-full rounded-lg bg-black border border-white/20 px-3 py-2 placeholder-white/50 "
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">
                                Review Link (Optional)
                            </Label>
                            <Input
                                type="text"
                                value={reviewLink}
                                onChange={(e) => setReviewLink(e.target.value)}
                                placeholder="Enter Review Links (comma separated)"
                                className="mt-2 w-full rounded-lg bg-black border border-white/20 px-3 py-2 placeholder-white/50 "
                            />
                        </div>
                    </Field>

                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                    <ButtonComponent
                        text="Cancel"
                        onClick={() => setShowModal(false)}
                    />

                    <ButtonComponent
                        text={isPending ? "Submitting..." : "Submit"}
                        onClick={handleSubmit}
                        disabled={isPending}
                    />
                </div>
            </div>
        </div>
    )
}

export default AddReviewModal
