import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ProductList } from './ProductList'
import * as useProductsModule from '../hooks/useProducts'
import * as useCategoriesModule from '../hooks/useCategories'
import type { Product } from '../types'

const mockProduct: Product = {
  id: 1,
  name: 'Wireless Headphones',
  description: 'Premium noise-cancelling headphones',
  price: 299.99,
  image_url: 'https://example.com/headphones.jpg',
  category: 'Electronics',
  stock: 25,
  average_rating: 4.5,
  total_reviews: 2,
}

function mockUseProducts(overrides: Partial<ReturnType<typeof useProductsModule.useProducts>> = {}) {
  vi.spyOn(useProductsModule, 'useProducts').mockReturnValue({
    products: [mockProduct],
    total: 1,
    loading: false,
    error: null,
    ...overrides,
  })
}

function mockUseCategories(overrides: Partial<ReturnType<typeof useCategoriesModule.useCategories>> = {}) {
  vi.spyOn(useCategoriesModule, 'useCategories').mockReturnValue({
    categories: ['Electronics', 'Furniture'],
    loading: false,
    error: null,
    ...overrides,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUseProducts()
  mockUseCategories()
})

describe('ProductList', () => {
  it('renders "All" pill plus dynamic categories from hook', () => {
    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Electronics' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Furniture' })).toBeInTheDocument()
  })

  it('renders product cards', () => {
    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>,
    )
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()
  })

  it('shows loading spinner when products are loading', () => {
    mockUseProducts({ products: [], total: 0, loading: true, error: null })
    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>,
    )
    expect(screen.getByText(/loading products/i)).toBeInTheDocument()
  })

  it('shows error alert when products fail to load', () => {
    mockUseProducts({ products: [], total: 0, loading: false, error: 'Failed to load products' })
    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>,
    )
    expect(screen.getByText('Failed to load products')).toBeInTheDocument()
  })

  it('shows only "All" pill when categories list is empty', () => {
    mockUseCategories({ categories: [], loading: false, error: null })
    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Electronics' })).not.toBeInTheDocument()
  })
})
