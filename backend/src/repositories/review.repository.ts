import type { PrismaClient } from '@prisma/client'

// Stub repository — to be implemented with SL-17
export class ReviewRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_db: PrismaClient) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findByProduct(_productId: number): Promise<[]> {
    return []
  }
}
