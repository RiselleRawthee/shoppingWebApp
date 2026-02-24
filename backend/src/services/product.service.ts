import type { Product } from '@prisma/client'
import { AppError } from '../errors/AppError'
import type { ProductRepository } from '../repositories/product.repository'

export interface ProductListResult {
  products: Product[]
  total: number
}

export class ProductService {
  constructor(private readonly repo: ProductRepository) {}

  async listProducts(category?: string): Promise<ProductListResult> {
    const products = await this.repo.findAll(category)
    return { products, total: products.length }
  }

  async getProduct(id: number): Promise<Product> {
    const product = await this.repo.findById(id)
    if (!product) throw new AppError('Product not found', 404)
    return product
  }
}
