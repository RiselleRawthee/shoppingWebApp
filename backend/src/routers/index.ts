import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import type { ProductController } from '../controllers/product.controller'
import type { CartController } from '../controllers/cart.controller'
import type { ReviewController } from '../controllers/review.controller'
import { createProductRouter } from './product.router'
import { createCartRouter } from './cart.router'
import { createReviewRouter } from './review.router'
import { openApiDocument } from '../docs/swagger'

interface Controllers {
  product: ProductController
  cart: CartController
  review: ReviewController
}

export const createRootRouter = (controllers: Controllers): Router => {
  const router = Router()

  router.get('/health', (_req, res) => res.json({ status: 'ok' }))
  router.get('/categories', controllers.product.getCategories)
  router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))
  router.use('/products', createProductRouter(controllers.product))
  router.use('/products/:productId/reviews', createReviewRouter(controllers.review))
  router.use('/cart', createCartRouter(controllers.cart))

  return router
}
