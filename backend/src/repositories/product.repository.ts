import type { PrismaClient } from '@prisma/client'

export type ProductWithReviewData = {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock: number
  _count: { reviews: number }
  reviews: { rating: number }[]
}

export class ProductRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(category?: string): Promise<ProductWithReviewData[]> {
    return this.db.product.findMany({
      where: category ? { category } : undefined,
      orderBy: { id: 'asc' },
      include: {
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
    })
  }

  async findById(id: number): Promise<ProductWithReviewData | null> {
    return this.db.product.findUnique({
      where: { id },
      include: {
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
    })
  }

  async findDistinctCategories(): Promise<string[]> {
    const rows = await this.db.product.findMany({
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    })
    return rows.map((r) => r.category)
  }
}
