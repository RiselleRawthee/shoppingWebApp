import { render, screen } from '@testing-library/react'
import { Price } from './Price'

describe('Price', () => {
  it('formats amount with R prefix and 2 decimal places', () => {
    render(<Price amount={299.99} />)
    expect(screen.getByText('R299.99')).toBeInTheDocument()
  })

  it('formats whole numbers with 2 decimal places', () => {
    render(<Price amount={100} />)
    expect(screen.getByText('R100.00')).toBeInTheDocument()
  })

  it('applies small size class', () => {
    render(<Price amount={99} size="sm" />)
    expect(screen.getByText('R99.00')).toHaveClass('text-sm')
  })

  it('applies large size class', () => {
    render(<Price amount={99} size="lg" />)
    expect(screen.getByText('R99.00')).toHaveClass('text-4xl')
  })
})
