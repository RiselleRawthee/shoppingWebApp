import { useState } from 'react'
import { useReviews } from '../hooks/useReviews'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { ErrorAlert } from './ui/ErrorAlert'
import { Button } from './ui/Button'
import type { Review } from '../types'

interface ReviewSectionProps {
  productId: number
}

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const textSize = size === 'lg' ? 'text-xl' : 'text-sm'
  return (
    <span className={textSize} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </span>
  )
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1" role="group" aria-label="Select star rating">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          className={`text-2xl transition-colors ${
            star <= (hovered || value) ? 'text-yellow-400' : 'text-gray-300'
          }`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-white">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-gray-900 text-sm">{review.reviewer_name}</span>
        <span className="text-xs text-gray-400">
          {new Date(review.created_at).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
      <StarDisplay rating={review.rating} />
      {review.comment && <p className="mt-2 text-sm text-gray-600">{review.comment}</p>}
    </div>
  )
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const { reviews, averageRating, totalReviews, loading, error, submitReview } = useReviews(productId)

  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || rating === 0) {
      setSubmitError('Please enter your name and select a star rating.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitReview({ reviewer_name: name.trim(), rating, comment: comment.trim() || undefined })
      setSubmitSuccess(true)
      setName('')
      setRating(0)
      setComment('')
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        setSubmitError('You have already reviewed this product.')
      } else if (status === 422) {
        setSubmitError('Please check your input: rating must be between 1 and 5.')
      } else {
        setSubmitError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-10 border-t pt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h2>

      {/* Summary */}
      {totalReviews > 0 && averageRating !== null && (
        <div className="flex items-center gap-3 mb-6">
          <StarDisplay rating={Math.round(averageRating)} size="lg" />
          <span className="text-2xl font-bold text-gray-900">{averageRating}</span>
          <span className="text-gray-500 text-sm">
            ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <LoadingSpinner message="Loading reviews..." />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : reviews.length === 0 ? (
        <p className="text-gray-400 text-sm mb-6">No reviews yet. Be the first to review this product.</p>
      ) : (
        <div className="space-y-4 mb-8">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Submit form */}
      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 mt-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Add a Review</h3>
        {submitSuccess ? (
          <p className="text-green-600 font-medium">Review submitted! Thank you for your feedback.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="reviewer-name" className="block text-sm font-medium text-gray-700 mb-1">
                Your name
              </label>
              <input
                id="reviewer-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">Rating</p>
              <StarSelector value={rating} onChange={setRating} />
            </div>

            <div>
              <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-1">
                Comment <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {submitError && (
              <p className="text-sm text-red-600" role="alert">
                {submitError}
              </p>
            )}

            <Button onClick={() => void handleSubmit()} loading={submitting}>
              Submit Review
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
