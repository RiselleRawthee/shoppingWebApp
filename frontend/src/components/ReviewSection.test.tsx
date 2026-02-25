import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ReviewSection } from './ReviewSection'
import * as useReviewsModule from '../hooks/useReviews'
import type { Review } from '../types'

const mockReviews: Review[] = [
  {
    id: 1,
    product_id: 1,
    reviewer_name: 'Alice',
    rating: 5,
    comment: 'Excellent product!',
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 2,
    product_id: 1,
    reviewer_name: 'Bob',
    rating: 3,
    comment: null,
    created_at: '2025-01-16T10:00:00Z',
  },
]

const mockSubmitReview = vi.fn()

function mockUseReviews(overrides: Partial<ReturnType<typeof useReviewsModule.useReviews>> = {}) {
  vi.spyOn(useReviewsModule, 'useReviews').mockReturnValue({
    reviews: [],
    averageRating: null,
    totalReviews: 0,
    loading: false,
    error: null,
    submitReview: mockSubmitReview,
    ...overrides,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSubmitReview.mockResolvedValue(undefined)
})

describe('ReviewSection', () => {
  it('renders loading state', () => {
    mockUseReviews({ loading: true })
    render(<ReviewSection productId={1} />)
    expect(screen.getByText('Loading reviews...')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseReviews({ error: 'Failed to load reviews' })
    render(<ReviewSection productId={1} />)
    expect(screen.getByText('Failed to load reviews')).toBeInTheDocument()
  })

  it('renders "No reviews yet" when reviews list is empty', () => {
    mockUseReviews({ reviews: [], totalReviews: 0, averageRating: null })
    render(<ReviewSection productId={1} />)
    expect(screen.getByText(/No reviews yet/)).toBeInTheDocument()
  })

  it('renders reviews list with reviewer name and comment', () => {
    mockUseReviews({ reviews: mockReviews, averageRating: 4, totalReviews: 2 })
    render(<ReviewSection productId={1} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Excellent product!')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows average rating and review count', () => {
    mockUseReviews({ reviews: mockReviews, averageRating: 4, totalReviews: 2 })
    render(<ReviewSection productId={1} />)
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('(2 reviews)')).toBeInTheDocument()
  })

  it('renders the review submission form', () => {
    mockUseReviews()
    render(<ReviewSection productId={1} />)
    expect(screen.getByLabelText('Your name')).toBeInTheDocument()
    expect(screen.getByText('Submit Review')).toBeInTheDocument()
  })

  it('shows validation error when submitting without name or rating', async () => {
    mockUseReviews()
    render(<ReviewSection productId={1} />)
    fireEvent.click(screen.getByText('Submit Review'))
    expect(await screen.findByText('Please enter your name and select a star rating.')).toBeInTheDocument()
  })

  it('calls submitReview with correct args and shows success message', async () => {
    mockUseReviews()
    render(<ReviewSection productId={1} />)

    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Test User' } })
    fireEvent.click(screen.getByLabelText('5 stars'))
    fireEvent.change(screen.getByLabelText(/Comment/), { target: { value: 'Great!' } })
    fireEvent.click(screen.getByText('Submit Review'))

    await waitFor(() => {
      expect(mockSubmitReview).toHaveBeenCalledWith({
        reviewer_name: 'Test User',
        rating: 5,
        comment: 'Great!',
      })
    })
    expect(await screen.findByText(/Review submitted/)).toBeInTheDocument()
  })

  it('shows "already reviewed" error on 409', async () => {
    mockUseReviews()
    mockSubmitReview.mockRejectedValue({ response: { status: 409 } })
    render(<ReviewSection productId={1} />)

    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Alice' } })
    fireEvent.click(screen.getByLabelText('4 stars'))
    fireEvent.click(screen.getByText('Submit Review'))

    expect(await screen.findByText('You have already reviewed this product.')).toBeInTheDocument()
  })

  it('shows validation error message on 422', async () => {
    mockUseReviews()
    mockSubmitReview.mockRejectedValue({ response: { status: 422 } })
    render(<ReviewSection productId={1} />)

    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Bob' } })
    fireEvent.click(screen.getByLabelText('3 stars'))
    fireEvent.click(screen.getByText('Submit Review'))

    expect(
      await screen.findByText('Please check your input: rating must be between 1 and 5.'),
    ).toBeInTheDocument()
  })
})
