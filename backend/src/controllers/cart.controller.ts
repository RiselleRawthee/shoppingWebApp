import type { Request, Response, NextFunction } from 'express'
import type { CartService } from '../services/cart.service'

export class CartController {
  constructor(private readonly service: CartService) {}

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getCart(String(req.params['sessionId'] ?? ''))
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  add = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.service.addToCart(req.body as {
        session_id: string
        product_id: number
        quantity: number
      })
      res.status(201).json(item)
    } catch (err) {
      next(err)
    }
  }

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sessionId = String(req.params['sessionId'] ?? '')
      const itemId = parseInt(String(req.params['itemId'] ?? ''), 10)
      await this.service.removeItem(sessionId, itemId)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  }
}
