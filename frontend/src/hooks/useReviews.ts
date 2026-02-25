import { useCallback, useEffect, useState } from 'react'
import { reviewsApi } from '../api/client'
import type { Review, CreateReviewRequest } from '../types'

interface UseReviewsResult {
  reviews: Review[]
  averageRating: number
  totalReviews: number
  loading: boolean
  error: string | null
  submitReview: (data: CreateReviewRequest) => Promise<void>
}

export function useReviews(productId: number): UseReviewsResult {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(() => {
    setLoading(true)
    setError(null)
    reviewsApi
      .list(productId)
      .then((data) => {
        setReviews(data.reviews)
        setAverageRating(data.average_rating)
        setTotalReviews(data.total_reviews)
      })
      .catch(() => setError('Failed to load reviews'))
      .finally(() => setLoading(false))
  }, [productId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const submitReview = async (data: CreateReviewRequest): Promise<void> => {
    await reviewsApi.create(productId, data)
    fetchReviews()
  }

  return { reviews, averageRating, totalReviews, loading, error, submitReview }
}
