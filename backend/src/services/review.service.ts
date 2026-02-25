import { Prisma } from '@prisma/client'
import type { Review } from '@prisma/client'
import { AppError } from '../errors/AppError'
import type { ReviewRepository, CreateReviewInput } from '../repositories/review.repository'
import type { ProductRepository } from '../repositories/product.repository'

export interface ReviewListResult {
  reviews: Review[]
  average_rating: number | null
  total_reviews: number
}

export class ReviewService {
  constructor(
    private readonly repo: ReviewRepository,
    private readonly productRepo: ProductRepository,
  ) {}

  async getReviews(productId: number): Promise<ReviewListResult> {
    const product = await this.productRepo.findById(productId)
    if (!product) throw new AppError('Product not found', 404)

    const reviews = await this.repo.findByProduct(productId)
    const total_reviews = reviews.length
    const average_rating =
      total_reviews > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total_reviews) * 10) / 10
        : null

    return { reviews, average_rating, total_reviews }
  }

  async createReview(productId: number, data: CreateReviewInput): Promise<Review> {
    const product = await this.productRepo.findById(productId)
    if (!product) throw new AppError('Product not found', 404)

    try {
      return await this.repo.create(productId, data)
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError('You have already reviewed this product', 409)
      }
      throw err
    }
  }
}
