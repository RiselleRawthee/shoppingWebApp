import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const CreateReviewRequestSchema = z
  .object({
    reviewer_name: z.string().min(1).openapi({ example: 'Jane Doe' }),
    rating: z.number().int().min(1).max(5).openapi({ example: 4 }),
    comment: z.string().optional().openapi({ example: 'Great product!' }),
  })
  .openapi('CreateReviewRequest')

export const ReviewResponseSchema = z
  .object({
    id: z.number().int().openapi({ example: 1 }),
    product_id: z.number().int().openapi({ example: 1 }),
    reviewer_name: z.string().openapi({ example: 'Jane Doe' }),
    rating: z.number().int().openapi({ example: 4 }),
    comment: z.string().nullable().openapi({ example: 'Great product!' }),
    created_at: z.string().openapi({ example: '2025-01-01T00:00:00.000Z' }),
  })
  .openapi('ReviewResponse')

export const ReviewListResponseSchema = z
  .object({
    reviews: z.array(ReviewResponseSchema),
    average_rating: z.number().openapi({ example: 4.2 }),
    total_reviews: z.number().int().openapi({ example: 5 }),
  })
  .openapi('ReviewListResponse')
