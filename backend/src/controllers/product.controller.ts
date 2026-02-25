import type { Request, Response, NextFunction } from 'express'
import type { ProductService } from '../services/product.service'

export class ProductController {
  constructor(private readonly service: ProductService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = typeof req.query['category'] === 'string' ? req.query['category'] : undefined
      const result = await this.service.listProducts(category)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(String(req.params['id'] ?? ''), 10)
      const product = await this.service.getProduct(id)
      res.json(product)
    } catch (err) {
      next(err)
    }
  }

  listCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.listCategories()
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}
