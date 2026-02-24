import { AppError } from '../errors/AppError'
import type { ReviewRepository } from '../repositories/review.repository'

// Stub service — to be implemented with SL-17
export class ReviewService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_repo: ReviewRepository) {}

  async getReviews(_productId: number): Promise<never> {
    throw new AppError('Not implemented', 501)
  }

  async createReview(_productId: number): Promise<never> {
    throw new AppError('Not implemented', 501)
  }
}
