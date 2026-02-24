import { mockDeep } from 'jest-mock-extended'
import type { ProductRepository } from '../../src/repositories/product.repository'
import { ProductService } from '../../src/services/product.service'

const mockProduct = {
  id: 1,
  name: 'Wireless Headphones',
  description: 'Premium headphones',
  price: 299.99,
  image_url: 'https://example.com/headphones.jpg',
  category: 'Electronics',
  stock: 25,
}

describe('ProductService', () => {
  const repo = mockDeep<ProductRepository>()
  const service = new ProductService(repo)

  beforeEach(() => jest.clearAllMocks())

  it('listProducts returns all products with total', async () => {
    repo.findAll.mockResolvedValue([mockProduct])
    const result = await service.listProducts()
    expect(result).toEqual({ products: [mockProduct], total: 1 })
    expect(repo.findAll).toHaveBeenCalledWith(undefined)
  })

  it('listProducts filters by category', async () => {
    repo.findAll.mockResolvedValue([mockProduct])
    const result = await service.listProducts('Electronics')
    expect(result.products).toHaveLength(1)
    expect(repo.findAll).toHaveBeenCalledWith('Electronics')
  })

  it('getProduct returns product when found', async () => {
    repo.findById.mockResolvedValue(mockProduct)
    const result = await service.getProduct(1)
    expect(result).toEqual(mockProduct)
  })

  it('getProduct throws 404 when product not found', async () => {
    repo.findById.mockResolvedValue(null)
    await expect(service.getProduct(99)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Product not found',
    })
    expect(repo.findById).toHaveBeenCalledWith(99)
  })
})
