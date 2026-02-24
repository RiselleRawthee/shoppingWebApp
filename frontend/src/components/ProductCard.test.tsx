import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProductCard } from './ProductCard'
import type { Product } from '../types'

const mockProduct: Product = {
  id: 1,
  name: 'Wireless Headphones',
  description: 'Premium headphones',
  price: 299.99,
  image_url: 'https://example.com/headphones.jpg',
  category: 'Electronics',
  stock: 25,
}

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<MemoryRouter><ProductCard product={mockProduct} to="/products/1" /></MemoryRouter>)
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()
  })

  it('renders formatted price', () => {
    render(<MemoryRouter><ProductCard product={mockProduct} to="/products/1" /></MemoryRouter>)
    expect(screen.getByText('R299.99')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<MemoryRouter><ProductCard product={mockProduct} to="/products/1" /></MemoryRouter>)
    expect(screen.getByText('Electronics')).toBeInTheDocument()
  })

  it('links to the correct product URL', () => {
    render(<MemoryRouter><ProductCard product={mockProduct} to="/products/1" /></MemoryRouter>)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/products/1')
  })

  it('shows stock count', () => {
    render(<MemoryRouter><ProductCard product={mockProduct} to="/products/1" /></MemoryRouter>)
    expect(screen.getByText('25 in stock')).toBeInTheDocument()
  })
})
