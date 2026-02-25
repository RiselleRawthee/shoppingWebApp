import { Router } from 'express'
import type { ProductController } from '../controllers/product.controller'

export const createCategoriesRouter = (controller: ProductController): Router => {
  const router = Router()
  router.get('/', controller.listCategories)
  return router
}
