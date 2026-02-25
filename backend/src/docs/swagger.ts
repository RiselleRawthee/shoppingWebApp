import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { ProductSchema, ProductListResponseSchema } from '../schemas/product.schema'
import {
  AddToCartRequestSchema,
  CartItemResponseSchema,
  CartResponseSchema,
} from '../schemas/cart.schema'
import {
  CreateReviewRequestSchema,
  ReviewResponseSchema,
  ReviewListResponseSchema,
} from '../schemas/review.schema'

const registry = new OpenAPIRegistry()

registry.register('Product', ProductSchema)
registry.register('ProductListResponse', ProductListResponseSchema)
registry.register('AddToCartRequest', AddToCartRequestSchema)
registry.register('CartItemResponse', CartItemResponseSchema)
registry.register('CartResponse', CartResponseSchema)
registry.register('CreateReviewRequest', CreateReviewRequestSchema)
registry.register('ReviewResponse', ReviewResponseSchema)
registry.register('ReviewListResponse', ReviewListResponseSchema)

// Products
registry.registerPath({
  method: 'get',
  path: '/products',
  summary: 'List all products',
  tags: ['Products'],
  request: {
    query: z.object({ category: z.string().optional() }),
  },
  responses: {
    200: { description: 'Product list', content: { 'application/json': { schema: ProductListResponseSchema } } },
  },
})

registry.registerPath({
  method: 'get',
  path: '/products/{id}',
  summary: 'Get a product by ID',
  tags: ['Products'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Product detail', content: { 'application/json': { schema: ProductSchema } } },
    404: { description: 'Product not found' },
  },
})

// Cart
registry.registerPath({
  method: 'get',
  path: '/cart/{sessionId}',
  summary: 'Get cart for a session',
  tags: ['Cart'],
  request: { params: z.object({ sessionId: z.string() }) },
  responses: {
    200: { description: 'Cart contents', content: { 'application/json': { schema: CartResponseSchema } } },
  },
})

registry.registerPath({
  method: 'post',
  path: '/cart',
  summary: 'Add item to cart',
  tags: ['Cart'],
  request: { body: { content: { 'application/json': { schema: AddToCartRequestSchema } } } },
  responses: {
    201: { description: 'Item added', content: { 'application/json': { schema: CartItemResponseSchema } } },
    404: { description: 'Product not found' },
    422: { description: 'Validation error' },
  },
})

registry.registerPath({
  method: 'delete',
  path: '/cart/{sessionId}/{itemId}',
  summary: 'Remove item from cart',
  tags: ['Cart'],
  request: { params: z.object({ sessionId: z.string(), itemId: z.string() }) },
  responses: {
    204: { description: 'Item removed' },
    404: { description: 'Item not found' },
  },
})

// Reviews
registry.registerPath({
  method: 'get',
  path: '/products/{productId}/reviews',
  summary: 'Get reviews for a product',
  tags: ['Reviews'],
  request: { params: z.object({ productId: z.string() }) },
  responses: {
    200: { description: 'Review list', content: { 'application/json': { schema: ReviewListResponseSchema } } },
    404: { description: 'Product not found' },
  },
})

registry.registerPath({
  method: 'post',
  path: '/products/{productId}/reviews',
  summary: 'Submit a review for a product',
  tags: ['Reviews'],
  request: {
    params: z.object({ productId: z.string() }),
    body: { content: { 'application/json': { schema: CreateReviewRequestSchema } } },
  },
  responses: {
    201: { description: 'Review created', content: { 'application/json': { schema: ReviewResponseSchema } } },
    404: { description: 'Product not found' },
    409: { description: 'Duplicate reviewer' },
    422: { description: 'Validation error' },
  },
})

const generator = new OpenApiGeneratorV3(registry.definitions)

export const openApiDocument = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'ShopLite API',
    version: '1.0.0',
    description: 'ShopLite e-commerce REST API',
  },
  servers: [{ url: 'http://localhost:8000', description: 'Local development' }],
})
