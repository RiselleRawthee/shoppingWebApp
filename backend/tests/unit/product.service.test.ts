import { mockDeep } from 'jest-mock-extended'
import type { ProductRepository, ProductWithReviewData } from '../../src/repositories/product.repository'
import { ProductService } from '../../src/services/product.service'

const mockProductRow: ProductWithReviewData = {
  id: 1,
  name: 'Wireless Headphones',
  description: 'Premium headphones',
  price: 299.99,
  image_url: 'https://example.com/headphones.jpg',
  category: 'Electronics',
  stock: 25,
  _count: { reviews: 2 },
  reviews: [{ rating: 4 }, { rating: 5 }],
}

const expectedProduct = {
  id: 1,
  name: 'Wireless Headphones',
  description: 'Premium headphones',
  price: 299.99,
  image_url: 'https://example.com/headphones.jpg',
  category: 'Electronics',
  stock: 25,
  average_rating: 4.5,
  total_reviews: 2,
}

describe('ProductService', () => {
  const repo = mockDeep<ProductRepository>()
  const service = new ProductService(repo)

  beforeEach(() => jest.clearAllMocks())

  it('listProducts returns all products with total and computed stats', async () => {
    repo.findAll.mockResolvedValue([mockProductRow])
    const result = await service.listProducts()
    expect(result).toEqual({ products: [expectedProduct], total: 1 })
    expect(repo.findAll).toHaveBeenCalledWith(undefined)
  })

  it('listProducts filters by category', async () => {
    repo.findAll.mockResolvedValue([mockProductRow])
    const result = await service.listProducts('Electronics')
    expect(result.products).toHaveLength(1)
    expect(repo.findAll).toHaveBeenCalledWith('Electronics')
  })

  it('listProducts returns average_rating null when product has no reviews', async () => {
    repo.findAll.mockResolvedValue([{ ...mockProductRow, _count: { reviews: 0 }, reviews: [] }])
    const result = await service.listProducts()
    expect(result.products[0].average_rating).toBeNull()
    expect(result.products[0].total_reviews).toBe(0)
  })

  it('getProduct returns product with computed stats', async () => {
    repo.findById.mockResolvedValue(mockProductRow)
    const result = await service.getProduct(1)
    expect(result).toEqual(expectedProduct)
  })

  it('getProduct throws 404 when product not found', async () => {
    repo.findById.mockResolvedValue(null)
    await expect(service.getProduct(99)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Product not found',
    })
    expect(repo.findById).toHaveBeenCalledWith(99)
  })

  it('listCategories returns categories wrapped in object', async () => {
    repo.findCategories.mockResolvedValue(['Accessories', 'Electronics', 'Furniture'])
    const result = await service.listCategories()
    expect(result).toEqual({ categories: ['Accessories', 'Electronics', 'Furniture'] })
    expect(repo.findCategories).toHaveBeenCalledTimes(1)
  })

  it('listCategories returns empty categories when no products exist', async () => {
    repo.findCategories.mockResolvedValue([])
    const result = await service.listCategories()
    expect(result).toEqual({ categories: [] })
  })
})
