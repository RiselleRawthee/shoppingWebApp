import { useState } from 'react'
import { useReviews } from '../hooks/useReviews'
import { Button } from './ui/Button'
import type { CreateReviewRequest } from '../types'
import type { AxiosError } from 'axios'

interface ReviewSectionProps {
  productId: number
}

function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="text-yellow-400">
      {Array.from({ length: max }, (_, i) => (
        <span key={i}>{i < Math.round(rating) ? '★' : '☆'}</span>
      ))}
    </span>
  )
}

function StarSelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="text-2xl text-yellow-400 focus:outline-none"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
        >
          {n <= (hovered || value) ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const { reviews, averageRating, totalReviews, loading, error, submitReview } = useReviews(productId)

  const [reviewerName, setReviewerName] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [ratingError, setRatingError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameError(null)
    setRatingError(null)
    setSubmitError(null)

    let valid = true
    if (!reviewerName.trim()) {
      setNameError('Name is required')
      valid = false
    }
    if (rating === 0) {
      setRatingError('Please select a star rating')
      valid = false
    }
    if (!valid) return

    const payload: CreateReviewRequest = {
      reviewer_name: reviewerName.trim(),
      rating,
      comment: comment.trim() || undefined,
    }

    setSubmitting(true)
    try {
      await submitReview(payload)
      setSubmitSuccess(true)
      setReviewerName('')
      setRating(0)
      setComment('')
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>
      const status = axiosErr.response?.status
      if (status === 409) {
        setSubmitError('You have already reviewed this product.')
      } else if (status === 422) {
        setSubmitError('Invalid input. Please check your rating and name.')
      } else {
        setSubmitError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-10 border-t pt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Customer Reviews</h2>

      {totalReviews > 0 && (
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
          <StarDisplay rating={averageRating} />
          <span className="font-medium text-gray-800">{averageRating.toFixed(1)}</span>
          <span>· {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</span>
        </div>
      )}

      {loading && <p className="text-gray-400 text-sm mb-6">Loading reviews…</p>}
      {error && <p className="text-red-500 text-sm mb-6">{error}</p>}

      {!loading && reviews.length === 0 && (
        <p className="text-gray-500 text-sm mb-6">No reviews yet. Be the first to review this product!</p>
      )}

      {reviews.length > 0 && (
        <ul className="space-y-4 mb-8">
          {reviews.map((review) => (
            <li key={review.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900 text-sm">{review.reviewer_name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <StarDisplay rating={review.rating} />
              {review.comment && (
                <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Add a Review</h3>
        {submitSuccess && (
          <p className="text-green-600 text-sm mb-4">Your review has been submitted. Thank you!</p>
        )}
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label htmlFor="reviewer-name" className="block text-sm font-medium text-gray-700 mb-1">
              Your name
            </label>
            <input
              id="reviewer-name"
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jane Doe"
            />
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <StarSelector value={rating} onChange={setRating} />
            {ratingError && <p className="text-red-500 text-xs mt-1">{ratingError}</p>}
          </div>

          <div>
            <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-1">
              Comment <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your experience…"
            />
          </div>

          {submitError && <p className="text-red-500 text-sm">{submitError}</p>}

          <Button type="submit" loading={submitting}>
            Submit Review
          </Button>
        </form>
      </div>
    </div>
  )
}
