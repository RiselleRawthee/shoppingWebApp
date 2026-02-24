import type { PrismaClient, Product } from '@prisma/client'

export class ProductRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(category?: string): Promise<Product[]> {
    return this.db.product.findMany({
      where: category ? { category } : undefined,
      orderBy: { id: 'asc' },
    })
  }

  async findById(id: number): Promise<Product | null> {
    return this.db.product.findUnique({ where: { id } })
  }
}
