import { render, screen } from '@testing-library/react'
import { StockBadge } from './StockBadge'

describe('StockBadge', () => {
  it('shows stock count when in stock', () => {
    render(<StockBadge stock={10} />)
    expect(screen.getByText('10 in stock')).toBeInTheDocument()
    expect(screen.getByText('10 in stock')).toHaveClass('text-green-600')
  })

  it('shows out of stock when stock is 0', () => {
    render(<StockBadge stock={0} />)
    expect(screen.getByText('Out of stock')).toBeInTheDocument()
    expect(screen.getByText('Out of stock')).toHaveClass('text-red-500')
  })
})
