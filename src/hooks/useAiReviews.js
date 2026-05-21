import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as aiReviewApi from '../apis/aiReview.api'

export const useAiReviewOptions = (enabled = true) => useQuery({
    queryKey: ['ai-review-options'],
    queryFn: aiReviewApi.getAiReviewOptions,
    enabled,
})

export const useGenerateAiReview = () => useMutation({
    mutationFn: aiReviewApi.generateAiReview,
})

export const useSaveAiReviewFeedback = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, feedback_status }) => aiReviewApi.saveAiReviewFeedback(id, feedback_status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-review-analytics'] })
        },
    })
}

export const useUpdateAiReviewPermission = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ userId, enabled }) => aiReviewApi.updateAiReviewPermission(userId, enabled),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })
}

export const useDatasets = () => useQuery({
    queryKey: ['ai-review-datasets'],
    queryFn: aiReviewApi.getDatasets,
})

export const useCreateDataset = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: aiReviewApi.createDataset,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-review-datasets'] })
            queryClient.invalidateQueries({ queryKey: ['ai-review-options'] })
        },
    })
}

export const useUpdateDataset = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => aiReviewApi.updateDataset(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-review-datasets'] })
            queryClient.invalidateQueries({ queryKey: ['ai-review-options'] })
        },
    })
}

export const useDeleteDataset = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: aiReviewApi.deleteDataset,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-review-datasets'] })
            queryClient.invalidateQueries({ queryKey: ['ai-review-options'] })
        },
    })
}

export const useLanguages = () => useQuery({
    queryKey: ['ai-review-languages'],
    queryFn: aiReviewApi.getLanguages,
})

export const useCreateLanguage = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: aiReviewApi.createLanguage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-review-languages'] })
            queryClient.invalidateQueries({ queryKey: ['ai-review-options'] })
        },
    })
}

export const useUpdateLanguage = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => aiReviewApi.updateLanguage(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-review-languages'] })
            queryClient.invalidateQueries({ queryKey: ['ai-review-options'] })
        },
    })
}

export const useDeleteLanguage = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: aiReviewApi.deleteLanguage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-review-languages'] })
            queryClient.invalidateQueries({ queryKey: ['ai-review-options'] })
        },
    })
}

export const usePromptOptions = (type) => useQuery({
    queryKey: ['ai-review-prompt-options', type],
    queryFn: () => aiReviewApi.getPromptOptions(type),
    enabled: !!type,
})

export const useCreatePromptOptions = (type) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data) => aiReviewApi.createPromptOptions(type, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-review-prompt-options', type] })
            queryClient.invalidateQueries({ queryKey: ['ai-review-options'] })
        },
    })
}

export const useUpdatePromptOption = (type) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => aiReviewApi.updatePromptOption(type, id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-review-prompt-options', type] })
            queryClient.invalidateQueries({ queryKey: ['ai-review-options'] })
        },
    })
}

export const useDeletePromptOption = (type) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => aiReviewApi.deletePromptOption(type, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-review-prompt-options', type] })
            queryClient.invalidateQueries({ queryKey: ['ai-review-options'] })
        },
    })
}

export const useAiAnalyticsSummary = () => useQuery({
    queryKey: ['ai-review-analytics', 'summary'],
    queryFn: aiReviewApi.getAnalyticsSummary,
})

export const useAiAnalyticsGenerations = (params) => useQuery({
    queryKey: ['ai-review-analytics', 'generations', params],
    queryFn: () => aiReviewApi.getAnalyticsGenerations(params),
    keepPreviousData: true,
})
