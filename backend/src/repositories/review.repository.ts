import type { PrismaClient, Review } from '@prisma/client'

export interface CreateReviewInput {
  reviewer_name: string
  rating: number
  comment?: string
}

export class ReviewRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByProduct(productId: number): Promise<Review[]> {
    return this.db.review.findMany({
      where: { product_id: productId },
      orderBy: { created_at: 'desc' },
    })
  }

  async create(productId: number, data: CreateReviewInput): Promise<Review> {
    return this.db.review.create({
      data: {
        product_id: productId,
        reviewer_name: data.reviewer_name,
        rating: data.rating,
        comment: data.comment,
      },
    })
  }
}
