import { AppError } from '../errors/AppError'
import type { ProductRepository, ProductWithReviewData } from '../repositories/product.repository'

export interface ProductWithStats {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock: number
  average_rating: number | null
  total_reviews: number
}

export interface ProductListResult {
  products: ProductWithStats[]
  total: number
}

function computeStats(p: ProductWithReviewData): ProductWithStats {
  const { _count, reviews, ...rest } = p
  const total_reviews = _count.reviews
  const average_rating =
    total_reviews > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total_reviews) * 10) / 10
      : null
  return { ...rest, average_rating, total_reviews }
}

export class ProductService {
  constructor(private readonly repo: ProductRepository) {}

  async listProducts(category?: string): Promise<ProductListResult> {
    const rows = await this.repo.findAll(category)
    const products = rows.map(computeStats)
    return { products, total: products.length }
  }

  async getProduct(id: number): Promise<ProductWithStats> {
    const row = await this.repo.findById(id)
    if (!row) throw new AppError('Product not found', 404)
    return computeStats(row)
  }
}
