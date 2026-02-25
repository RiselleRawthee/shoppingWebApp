import { AppError } from '../errors/AppError'
import type { ProductRepository, ProductWithReviewData } from '../repositories/product.repository'

export interface ProductListResult {
  products: ProductWithReviewData[]
  total: number
}

export class ProductService {
  constructor(private readonly repo: ProductRepository) {}

  async listProducts(category?: string): Promise<ProductListResult> {
    const products = await this.repo.findAll(category)
    return { products, total: products.length }
  }

  async getProduct(id: number): Promise<ProductWithReviewData> {
    const product = await this.repo.findById(id)
    if (!product) throw new AppError('Product not found', 404)
    return product
  }
}
