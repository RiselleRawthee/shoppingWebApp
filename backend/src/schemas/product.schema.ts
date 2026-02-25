import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const ProductSchema = z
  .object({
    id: z.number().int().openapi({ example: 1 }),
    name: z.string().openapi({ example: 'Wireless Headphones' }),
    description: z.string().openapi({ example: 'Premium noise-cancelling headphones' }),
    price: z.number().openapi({ example: 299.99 }),
    image_url: z.string().url().openapi({ example: 'https://example.com/headphones.jpg' }),
    category: z.string().openapi({ example: 'Electronics' }),
    stock: z.number().int().openapi({ example: 25 }),
    average_rating: z.number().nullable().openapi({ example: 4.2 }),
    total_reviews: z.number().int().openapi({ example: 5 }),
  })
  .openapi('Product')

export const ProductListResponseSchema = z
  .object({
    products: z.array(ProductSchema),
    total: z.number().int().openapi({ example: 10 }),
  })
  .openapi('ProductListResponse')

export const CategoryListResponseSchema = z
  .object({
    categories: z.array(z.string()).openapi({ example: ['Accessories', 'Electronics', 'Furniture', 'Lighting'] }),
  })
  .openapi('CategoryListResponse')
