import { AppError } from '../errors/AppError'
import type { CartRepository, CartItemWithProduct } from '../repositories/cart.repository'
import type { ProductRepository } from '../repositories/product.repository'

export interface AddToCartInput {
  session_id: string
  product_id: number
  quantity: number
}

export interface CartResult {
  items: CartItemWithProduct[]
  total_price: number
  item_count: number
}

export class CartService {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly productRepo: ProductRepository,
  ) {}

  async addToCart(input: AddToCartInput): Promise<CartItemWithProduct> {
    const product = await this.productRepo.findById(input.product_id)
    if (!product) throw new AppError('Product not found', 404)

    const existing = await this.cartRepo.findItem(input.session_id, input.product_id)
    if (existing) {
      await this.cartRepo.updateQuantity(existing.id, existing.quantity + input.quantity)
    } else {
      await this.cartRepo.createItem(input)
    }

    const items = await this.cartRepo.findBySession(input.session_id)
    const added = items.find((i) => i.product_id === input.product_id)
    if (!added) throw new AppError('Failed to retrieve cart item', 500)
    return added
  }

  async getCart(sessionId: string): Promise<CartResult> {
    const items = await this.cartRepo.findBySession(sessionId)
    const total_price = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    )
    const item_count = items.reduce((sum, item) => sum + item.quantity, 0)
    return { items, total_price, item_count }
  }

  async removeItem(sessionId: string, itemId: number): Promise<void> {
    const item = await this.cartRepo.findItemById(itemId)
    if (!item || item.session_id !== sessionId) {
      throw new AppError('Cart item not found', 404)
    }
    await this.cartRepo.deleteItem(itemId)
  }
}
