import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import type { CartController } from '../controllers/cart.controller'

const addToCartSchema = z.object({
  session_id: z.string().min(1),
  product_id: z.number().int().positive(),
  quantity: z.number().int().min(1).default(1),
})

export const createCartRouter = (controller: CartController): Router => {
  const router = Router()
  router.get('/:sessionId', controller.get)
  router.post('/', validate(addToCartSchema), controller.add)
  router.delete('/:sessionId/:itemId', controller.remove)
  return router
}
