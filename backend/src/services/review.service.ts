import { AppError } from '../errors/AppError'
import type { ReviewRepository, CreateReviewData } from '../repositories/review.repository'
import type { ProductRepository } from '../repositories/product.repository'
import type { Review } from '@prisma/client'

export interface ReviewListResult {
  reviews: Review[]
  average_rating: number
  total_reviews: number
}

export class ReviewService {
  constructor(
    private readonly reviewRepo: ReviewRepository,
    private readonly productRepo: ProductRepository,
  ) {}

  async getReviews(productId: number): Promise<ReviewListResult> {
    const product = await this.productRepo.findById(productId)
    if (!product) throw new AppError('Product not found', 404)

    const reviews = await this.reviewRepo.findByProduct(productId)
    const total_reviews = reviews.length
    const average_rating =
      total_reviews > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total_reviews) * 10) / 10
        : 0

    return { reviews, average_rating, total_reviews }
  }

  async createReview(productId: number, data: CreateReviewData): Promise<Review> {
    const product = await this.productRepo.findById(productId)
    if (!product) throw new AppError('Product not found', 404)

    try {
      return await this.reviewRepo.create(productId, data)
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        throw new AppError('You have already reviewed this product', 409)
      }
      throw err
    }
  }
}
