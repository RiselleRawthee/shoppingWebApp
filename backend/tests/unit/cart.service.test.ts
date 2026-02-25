import { mockDeep } from 'jest-mock-extended'
import type { CartRepository } from '../../src/repositories/cart.repository'
import type { ProductRepository } from '../../src/repositories/product.repository'
import { CartService } from '../../src/services/cart.service'

const mockProduct = {
  id: 1,
  name: 'Wireless Headphones',
  description: 'Premium headphones',
  price: 299.99,
  image_url: 'https://example.com/headphones.jpg',
  category: 'Electronics',
  stock: 25,
  average_rating: 4.0,
  total_reviews: 5,
}

const mockCartItem = {
  id: 1,
  session_id: 'session-abc',
  product_id: 1,
  quantity: 1,
  created_at: new Date(),
  product: mockProduct,
}

describe('CartService', () => {
  const cartRepo = mockDeep<CartRepository>()
  const productRepo = mockDeep<ProductRepository>()
  const service = new CartService(cartRepo, productRepo)

  beforeEach(() => jest.clearAllMocks())

  it('addToCart creates new item when none exists', async () => {
    productRepo.findById.mockResolvedValue(mockProduct)
    cartRepo.findItem.mockResolvedValue(null)
    cartRepo.createItem.mockResolvedValue(mockCartItem)
    cartRepo.findBySession.mockResolvedValue([mockCartItem])

    const result = await service.addToCart({ session_id: 'session-abc', product_id: 1, quantity: 1 })
    expect(cartRepo.createItem).toHaveBeenCalled()
    expect(result.product_id).toBe(1)
  })

  it('addToCart increments quantity when item exists', async () => {
    productRepo.findById.mockResolvedValue(mockProduct)
    cartRepo.findItem.mockResolvedValue(mockCartItem)
    cartRepo.updateQuantity.mockResolvedValue({ ...mockCartItem, quantity: 2 })
    cartRepo.findBySession.mockResolvedValue([{ ...mockCartItem, quantity: 2 }])

    await service.addToCart({ session_id: 'session-abc', product_id: 1, quantity: 1 })
    expect(cartRepo.updateQuantity).toHaveBeenCalledWith(1, 2)
    expect(cartRepo.createItem).not.toHaveBeenCalled()
  })

  it('addToCart throws 404 when product not found', async () => {
    productRepo.findById.mockResolvedValue(null)
    await expect(
      service.addToCart({ session_id: 'session-abc', product_id: 99, quantity: 1 }),
    ).rejects.toMatchObject({ statusCode: 404 })
  })

  it('getCart returns items with computed total_price and item_count', async () => {
    const items = [
      { ...mockCartItem, quantity: 2, product: { ...mockProduct, price: 100 } },
      { ...mockCartItem, id: 2, quantity: 1, product: { ...mockProduct, price: 50 } },
    ]
    cartRepo.findBySession.mockResolvedValue(items)

    const result = await service.getCart('session-abc')
    expect(result.total_price).toBe(250)
    expect(result.item_count).toBe(3)
  })

  it('removeItem throws 404 when item not found', async () => {
    cartRepo.findItemById.mockResolvedValue(null)
    await expect(service.removeItem('session-abc', 99)).rejects.toMatchObject({ statusCode: 404 })
  })
})
