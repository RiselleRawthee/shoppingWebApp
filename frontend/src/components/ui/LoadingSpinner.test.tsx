import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('shows default loading message', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows custom message when provided', () => {
    render(<LoadingSpinner message="Fetching products..." />)
    expect(screen.getByText('Fetching products...')).toBeInTheDocument()
  })
})
