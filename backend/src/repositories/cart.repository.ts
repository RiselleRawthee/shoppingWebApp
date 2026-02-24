import type { PrismaClient, CartItem } from '@prisma/client'

export type CartItemWithProduct = Awaited<
  ReturnType<CartRepository['findBySession']>
>[number]

export class CartRepository {
  constructor(private readonly db: PrismaClient) {}

  async findBySession(sessionId: string) {
    return this.db.cartItem.findMany({
      where: { session_id: sessionId },
      include: { product: true },
      orderBy: { created_at: 'asc' },
    })
  }

  async findItem(sessionId: string, productId: number): Promise<CartItem | null> {
    return this.db.cartItem.findFirst({
      where: { session_id: sessionId, product_id: productId },
    })
  }

  async findItemById(id: number): Promise<CartItem | null> {
    return this.db.cartItem.findUnique({ where: { id } })
  }

  async createItem(data: {
    session_id: string
    product_id: number
    quantity: number
  }): Promise<CartItem> {
    return this.db.cartItem.create({ data })
  }

  async updateQuantity(id: number, quantity: number): Promise<CartItem> {
    return this.db.cartItem.update({ where: { id }, data: { quantity } })
  }

  async deleteItem(id: number): Promise<void> {
    await this.db.cartItem.delete({ where: { id } })
  }
}
