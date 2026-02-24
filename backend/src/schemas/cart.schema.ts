import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { ProductSchema } from './product.schema'

extendZodWithOpenApi(z)

export const AddToCartRequestSchema = z
  .object({
    session_id: z.string().min(1).openapi({ example: 'shoplite-session-abc123' }),
    product_id: z.number().int().positive().openapi({ example: 1 }),
    quantity: z.number().int().min(1).default(1).openapi({ example: 1 }),
  })
  .openapi('AddToCartRequest')

export const CartItemResponseSchema = z
  .object({
    id: z.number().int().openapi({ example: 1 }),
    session_id: z.string().openapi({ example: 'shoplite-session-abc123' }),
    product_id: z.number().int().openapi({ example: 1 }),
    quantity: z.number().int().openapi({ example: 2 }),
    product: ProductSchema,
  })
  .openapi('CartItemResponse')

export const CartResponseSchema = z
  .object({
    items: z.array(CartItemResponseSchema),
    total_price: z.number().openapi({ example: 599.98 }),
    item_count: z.number().int().openapi({ example: 2 }),
  })
  .openapi('CartResponse')
