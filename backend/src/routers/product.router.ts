import { Router } from 'express'
import type { ProductController } from '../controllers/product.controller'

export const createProductRouter = (controller: ProductController): Router => {
  const router = Router()
  router.get('/', controller.list)
  router.get('/:id', controller.getById)
  return router
}
