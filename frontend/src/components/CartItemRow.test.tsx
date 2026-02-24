import { render, screen, fireEvent } from '@testing-library/react'
import { CartItemRow } from './CartItemRow'
import type { CartItem } from '../types'

const mockItem: CartItem = {
  id: 1,
  session_id: 'test-session',
  product_id: 1,
  quantity: 2,
  product: {
    id: 1,
    name: 'Wireless Headphones',
    description: 'Premium headphones',
    price: 299.99,
    image_url: 'https://example.com/headphones.jpg',
    category: 'Electronics',
    stock: 25,
  },
}

describe('CartItemRow', () => {
  it('renders product name', () => {
    render(<CartItemRow item={mockItem} onRemove={vi.fn()} />)
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()
  })

  it('renders quantity', () => {
    render(<CartItemRow item={mockItem} onRemove={vi.fn()} />)
    expect(screen.getByText('Qty: 2')).toBeInTheDocument()
  })

  it('renders subtotal price (price * quantity)', () => {
    render(<CartItemRow item={mockItem} onRemove={vi.fn()} />)
    expect(screen.getByText('R599.98')).toBeInTheDocument()
  })

  it('calls onRemove with item id when remove button clicked', () => {
    const onRemove = vi.fn()
    render(<CartItemRow item={mockItem} onRemove={onRemove} />)
    fireEvent.click(screen.getByRole('button', { name: /remove/i }))
    expect(onRemove).toHaveBeenCalledWith(1)
  })

  it('disables remove button when loading', () => {
    render(<CartItemRow item={mockItem} onRemove={vi.fn()} loading />)
    expect(screen.getByRole('button', { name: /remove/i })).toBeDisabled()
  })
})
