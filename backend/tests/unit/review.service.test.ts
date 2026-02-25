import { mockDeep } from 'jest-mock-extended'
import type { ReviewRepository } from '../../src/repositories/review.repository'
import type { ProductRepository } from '../../src/repositories/product.repository'
import { ReviewService } from '../../src/services/review.service'

const mockProduct = {
  id: 1,
  name: 'Test Product',
  description: 'A test product',
  price: 99.99,
  image_url: 'https://example.com/product.jpg',
  category: 'Electronics',
  stock: 10,
  average_rating: 0,
  total_reviews: 0,
}

const mockReview = {
  id: 1,
  product_id: 1,
  reviewer_name: 'Alice',
  rating: 5,
  comment: 'Excellent!',
  created_at: new Date(),
}

describe('ReviewService', () => {
  const reviewRepo = mockDeep<ReviewRepository>()
  const productRepo = mockDeep<ProductRepository>()
  const service = new ReviewService(reviewRepo, productRepo)

  beforeEach(() => jest.clearAllMocks())

  describe('getReviews', () => {
    it('returns reviews with average_rating and total_reviews', async () => {
      productRepo.findById.mockResolvedValue(mockProduct)
      reviewRepo.findByProduct.mockResolvedValue([
        { ...mockReview, rating: 4 },
        { ...mockReview, id: 2, reviewer_name: 'Bob', rating: 5 },
      ])
      const result = await service.getReviews(1)
      expect(result.total_reviews).toBe(2)
      expect(result.average_rating).toBe(4.5)
      expect(result.reviews).toHaveLength(2)
    })

    it('returns 0 average and 0 total when no reviews', async () => {
      productRepo.findById.mockResolvedValue(mockProduct)
      reviewRepo.findByProduct.mockResolvedValue([])
      const result = await service.getReviews(1)
      expect(result.average_rating).toBe(0)
      expect(result.total_reviews).toBe(0)
    })

    it('throws 404 when product not found', async () => {
      productRepo.findById.mockResolvedValue(null)
      await expect(service.getReviews(99)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Product not found',
      })
    })
  })

  describe('createReview', () => {
    it('creates review successfully', async () => {
      productRepo.findById.mockResolvedValue(mockProduct)
      reviewRepo.create.mockResolvedValue(mockReview)
      const result = await service.createReview(1, { reviewer_name: 'Alice', rating: 5 })
      expect(result).toEqual(mockReview)
      expect(reviewRepo.create).toHaveBeenCalledWith(1, { reviewer_name: 'Alice', rating: 5 })
    })

    it('throws 404 when product not found', async () => {
      productRepo.findById.mockResolvedValue(null)
      await expect(
        service.createReview(99, { reviewer_name: 'Alice', rating: 5 }),
      ).rejects.toMatchObject({ statusCode: 404, message: 'Product not found' })
    })

    it('throws 409 on duplicate reviewer', async () => {
      productRepo.findById.mockResolvedValue(mockProduct)
      reviewRepo.create.mockRejectedValue({ code: 'P2002' })
      await expect(
        service.createReview(1, { reviewer_name: 'Alice', rating: 5 }),
      ).rejects.toMatchObject({ statusCode: 409 })
    })

    it('re-throws unknown errors', async () => {
      productRepo.findById.mockResolvedValue(mockProduct)
      const unknownError = new Error('DB connection lost')
      reviewRepo.create.mockRejectedValue(unknownError)
      await expect(
        service.createReview(1, { reviewer_name: 'Alice', rating: 5 }),
      ).rejects.toThrow('DB connection lost')
    })
  })
})
