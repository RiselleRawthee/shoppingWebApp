import type { Request, Response, NextFunction } from 'express'
import type { ReviewService } from '../services/review.service'
import type { CreateReviewData } from '../repositories/review.repository'

export class ReviewController {
  constructor(private readonly service: ReviewService) {}

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = parseInt(String(req.params['productId'] ?? ''), 10)
      const result = await this.service.getReviews(productId)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = parseInt(String(req.params['productId'] ?? ''), 10)
      const result = await this.service.createReview(productId, req.body as CreateReviewData)
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }
}
