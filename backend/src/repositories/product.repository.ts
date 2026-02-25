import type { PrismaClient, Product } from '@prisma/client'

export type ProductWithReviewData = Product & {
  average_rating: number
  total_reviews: number
}

export class ProductRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(category?: string): Promise<ProductWithReviewData[]> {
    const products = await this.db.product.findMany({
      where: category ? { category } : undefined,
      orderBy: { id: 'asc' },
      include: { reviews: { select: { rating: true } } },
    })
    return products.map((p) => {
      const { reviews, ...rest } = p
      const total_reviews = reviews.length
      const average_rating =
        total_reviews > 0
          ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total_reviews) * 10) / 10
          : 0
      return { ...rest, average_rating, total_reviews }
    })
  }

  async findById(id: number): Promise<ProductWithReviewData | null> {
    const product = await this.db.product.findUnique({
      where: { id },
      include: { reviews: { select: { rating: true } } },
    })
    if (!product) return null
    const { reviews, ...rest } = product
    const total_reviews = reviews.length
    const average_rating =
      total_reviews > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total_reviews) * 10) / 10
        : 0
    return { ...rest, average_rating, total_reviews }
  }
}
