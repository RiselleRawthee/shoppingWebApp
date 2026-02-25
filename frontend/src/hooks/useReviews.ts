import { useCallback, useEffect, useState } from 'react'
import { reviewsApi } from '../api/client'
import type { CreateReviewRequest, Review } from '../types'

interface UseReviewsResult {
  reviews: Review[]
  averageRating: number | null
  totalReviews: number
  loading: boolean
  error: string | null
  submitReview: (data: CreateReviewRequest) => Promise<void>
}

export function useReviews(productId: number): UseReviewsResult {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState<number | null>(null)
  const [totalReviews, setTotalReviews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await reviewsApi.list(productId)
      setReviews(data.reviews)
      setAverageRating(data.average_rating)
      setTotalReviews(data.total_reviews)
    } catch {
      setError('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    void fetchReviews()
  }, [fetchReviews])

  const submitReview = useCallback(
    async (data: CreateReviewRequest): Promise<void> => {
      await reviewsApi.create(productId, data)
      await fetchReviews()
    },
    [productId, fetchReviews],
  )

  return { reviews, averageRating, totalReviews, loading, error, submitReview }
}
