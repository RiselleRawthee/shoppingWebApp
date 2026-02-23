import { PrismaClient } from '@prisma/client'
import type { Product, Prisma } from '@prisma/client'

export const testPrisma = new PrismaClient()

export const clearDatabase = async (): Promise<void> => {
  await testPrisma.review.deleteMany()
  await testPrisma.cartItem.deleteMany()
  await testPrisma.product.deleteMany()
}

export const createProduct = async (overrides: Partial<Prisma.ProductCreateInput> = {}): Promise<Product> =>
  testPrisma.product.create({
    data: {
      name: 'Test Product',
      description: 'A test product',
      price: 99.99,
      image_url: 'https://example.com/product.jpg',
      category: 'Electronics',
      stock: 10,
      ...overrides,
    },
  })
