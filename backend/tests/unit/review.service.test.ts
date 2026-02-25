import { mockDeep } from 'jest-mock-extended'
import { Prisma } from '@prisma/client'
import type { ReviewRepository } from '../../src/repositories/review.repository'
import type { ProductRepository, ProductWithReviewData } from '../../src/repositories/product.repository'
import { ReviewService } from '../../src/services/review.service'

const mockProduct: ProductWithReviewData = {
  id: 1,
  name: 'Test Product',
  description: 'A test product',
  price: 99.99,
  image_url: 'https://example.com/img.jpg',
  category: 'Electronics',
  stock: 10,
  _count: { reviews: 0 },
  reviews: [],
}

const mockReview = {
  id: 1,
  product_id: 1,
  reviewer_name: 'Alice',
  rating: 5,
  comment: 'Great product',
  created_at: new Date('2025-01-15T10:00:00Z'),
}

describe('ReviewService', () => {
  const repo = mockDeep<ReviewRepository>()
  const productRepo = mockDeep<ProductRepository>()
  const service = new ReviewService(repo, productRepo)

  beforeEach(() => jest.clearAllMocks())

  describe('getReviews', () => {
    it('throws 404 when product not found', async () => {
      productRepo.findById.mockResolvedValue(null)
      await expect(service.getReviews(99)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Product not found',
      })
    })

    it('returns reviews with average_rating and total_reviews', async () => {
      productRepo.findById.mockResolvedValue(mockProduct)
      repo.findByProduct.mockResolvedValue([
        { ...mockReview, rating: 4 },
        { ...mockReview, id: 2, reviewer_name: 'Bob', rating: 5 },
      ])
      const result = await service.getReviews(1)
      expect(result.total_reviews).toBe(2)
      expect(result.average_rating).toBe(4.5)
      expect(result.reviews).toHaveLength(2)
    })

    it('returns average_rating null and total_reviews 0 when no reviews', async () => {
      productRepo.findById.mockResolvedValue(mockProduct)
      repo.findByProduct.mockResolvedValue([])
      const result = await service.getReviews(1)
      expect(result.total_reviews).toBe(0)
      expect(result.average_rating).toBeNull()
    })

    it('rounds average_rating to one decimal place', async () => {
      productRepo.findById.mockResolvedValue(mockProduct)
      repo.findByProduct.mockResolvedValue([
        { ...mockReview, rating: 3 },
        { ...mockReview, id: 2, reviewer_name: 'Bob', rating: 4 },
        { ...mockReview, id: 3, reviewer_name: 'Carol', rating: 5 },
      ])
      const result = await service.getReviews(1)
      expect(result.average_rating).toBe(4) // (3+4+5)/3 = 4.0
    })
  })

  describe('createReview', () => {
    it('throws 404 when product not found', async () => {
      productRepo.findById.mockResolvedValue(null)
      await expect(
        service.createReview(99, { reviewer_name: 'Alice', rating: 5 }),
      ).rejects.toMatchObject({ statusCode: 404, message: 'Product not found' })
    })

    it('creates and returns the review', async () => {
      productRepo.findById.mockResolvedValue(mockProduct)
      repo.create.mockResolvedValue(mockReview)
      const result = await service.createReview(1, { reviewer_name: 'Alice', rating: 5, comment: 'Great product' })
      expect(result).toEqual(mockReview)
      expect(repo.create).toHaveBeenCalledWith(1, { reviewer_name: 'Alice', rating: 5, comment: 'Great product' })
    })

    it('throws 409 when reviewer has already reviewed the product (P2002)', async () => {
      productRepo.findById.mockResolvedValue(mockProduct)
      const p2002 = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.0.0',
      })
      repo.create.mockRejectedValue(p2002)
      await expect(
        service.createReview(1, { reviewer_name: 'Alice', rating: 5 }),
      ).rejects.toMatchObject({ statusCode: 409, message: 'You have already reviewed this product' })
    })

    it('re-throws non-P2002 errors', async () => {
      productRepo.findById.mockResolvedValue(mockProduct)
      repo.create.mockRejectedValue(new Error('Unexpected DB error'))
      await expect(
        service.createReview(1, { reviewer_name: 'Alice', rating: 5 }),
      ).rejects.toThrow('Unexpected DB error')
    })
  })
})
