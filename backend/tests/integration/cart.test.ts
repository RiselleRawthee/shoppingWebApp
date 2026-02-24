import request from 'supertest'
import { buildApp } from '../../src/app'
import { clearDatabase, createProduct, testPrisma } from './setup'

const app = buildApp()
const SESSION = 'test-session-123'

beforeEach(async () => { await clearDatabase() })
afterAll(async () => { await testPrisma.$disconnect() })

describe('GET /cart/:sessionId', () => {
  it('returns empty cart for new session', async () => {
    const res = await request(app).get(`/cart/${SESSION}`).expect(200)
    expect(res.body).toEqual({ items: [], total_price: 0, item_count: 0 })
  })
})

describe('POST /cart', () => {
  it('adds item to cart and returns 201', async () => {
    const product = await createProduct()
    const res = await request(app)
      .post('/cart')
      .send({ session_id: SESSION, product_id: product.id, quantity: 1 })
      .expect(201)
    expect(res.body.product_id).toBe(product.id)
    expect(res.body.quantity).toBe(1)
  })

  it('increments quantity when same product added again', async () => {
    const product = await createProduct()
    await request(app).post('/cart').send({ session_id: SESSION, product_id: product.id, quantity: 1 })
    await request(app).post('/cart').send({ session_id: SESSION, product_id: product.id, quantity: 1 })
    const cart = await request(app).get(`/cart/${SESSION}`).expect(200)
    expect(cart.body.items[0].quantity).toBe(2)
    expect(cart.body.items).toHaveLength(1)
  })

  it('returns 404 when product does not exist', async () => {
    const res = await request(app)
      .post('/cart')
      .send({ session_id: SESSION, product_id: 99999, quantity: 1 })
      .expect(404)
    expect(res.body.message).toBe('Product not found')
  })

  it('computes total_price correctly', async () => {
    const product = await createProduct({ price: 100 })
    await request(app).post('/cart').send({ session_id: SESSION, product_id: product.id, quantity: 3 })
    const cart = await request(app).get(`/cart/${SESSION}`).expect(200)
    expect(cart.body.total_price).toBe(300)
  })

  it('computes item_count correctly across multiple quantities', async () => {
    const p1 = await createProduct({ price: 50 })
    const p2 = await createProduct({ price: 75 })
    await request(app).post('/cart').send({ session_id: SESSION, product_id: p1.id, quantity: 2 })
    await request(app).post('/cart').send({ session_id: SESSION, product_id: p2.id, quantity: 3 })
    const cart = await request(app).get(`/cart/${SESSION}`).expect(200)
    expect(cart.body.item_count).toBe(5)
  })
})

describe('DELETE /cart/:sessionId/:itemId', () => {
  it('removes item from cart and returns 204', async () => {
    const product = await createProduct()
    const addRes = await request(app)
      .post('/cart')
      .send({ session_id: SESSION, product_id: product.id, quantity: 1 })
    await request(app).delete(`/cart/${SESSION}/${addRes.body.id}`).expect(204)
    const cart = await request(app).get(`/cart/${SESSION}`).expect(200)
    expect(cart.body.items).toHaveLength(0)
  })

  it('returns 404 for unknown cart item', async () => {
    const res = await request(app).delete(`/cart/${SESSION}/99999`).expect(404)
    expect(res.body.message).toBe('Cart item not found')
  })
})
