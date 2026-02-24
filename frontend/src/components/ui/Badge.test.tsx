import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders the label', () => {
    render(<Badge label="Electronics" />)
    expect(screen.getByText('Electronics')).toBeInTheDocument()
  })

  it('applies category styles by default', () => {
    render(<Badge label="Electronics" />)
    expect(screen.getByText('Electronics')).toHaveClass('text-blue-600')
  })

  it('applies danger styles when variant is danger', () => {
    render(<Badge label="Out of stock" variant="danger" />)
    expect(screen.getByText('Out of stock')).toHaveClass('text-red-500')
  })
})
