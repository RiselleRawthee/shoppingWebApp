import { Router } from 'express'
import { validate } from '../middleware/validate'
import { CreateReviewRequestSchema } from '../schemas/review.schema'
import type { ReviewController } from '../controllers/review.controller'

export const createReviewRouter = (controller: ReviewController): Router => {
  const router = Router({ mergeParams: true })
  router.get('/', controller.get)
  router.post('/', validate(CreateReviewRequestSchema), controller.create)
  return router
}
