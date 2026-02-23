import { Router } from 'express'
import type { ReviewController } from '../controllers/review.controller'

export const createReviewRouter = (controller: ReviewController): Router => {
  const router = Router({ mergeParams: true })
  router.get('/', controller.get)
  router.post('/', controller.create)
  return router
}
