import request from 'supertest'
import { buildApp } from '../../src/app'
import { clearDatabase, createProduct, testPrisma } from './setup'

const app = buildApp()

beforeEach(async () => { await clearDatabase() })
afterAll(async () => { await testPrisma.$disconnect() })

describe('GET /products', () => {
  it('returns empty list when no products exist', async () => {
    const res = await request(app).get('/products').expect(200)
    expect(res.body).toEqual({ products: [], total: 0 })
  })

  it('returns all products', async () => {
    await createProduct({ name: 'Headphones' })
    await createProduct({ name: 'Keyboard' })
    const res = await request(app).get('/products').expect(200)
    expect(res.body.total).toBe(2)
    expect(res.body.products).toHaveLength(2)
  })

  it('filters by category', async () => {
    await createProduct({ category: 'Electronics' })
    await createProduct({ category: 'Furniture' })
    const res = await request(app).get('/products?category=Electronics').expect(200)
    expect(res.body.total).toBe(1)
    expect(res.body.products[0].category).toBe('Electronics')
  })

  it('returns correct count for filtered category', async () => {
    await createProduct({ category: 'Electronics' })
    await createProduct({ category: 'Electronics' })
    await createProduct({ category: 'Furniture' })
    const res = await request(app).get('/products?category=Electronics').expect(200)
    expect(res.body.total).toBe(2)
  })
})

describe('GET /products/:id', () => {
  it('returns product by id', async () => {
    const product = await createProduct({ name: 'Wireless Headphones', price: 299.99 })
    const res = await request(app).get(`/products/${product.id}`).expect(200)
    expect(res.body.name).toBe('Wireless Headphones')
    expect(res.body.price).toBe(299.99)
  })

  it('returns 404 for unknown product id', async () => {
    const res = await request(app).get('/products/99999').expect(404)
    expect(res.body.message).toBe('Product not found')
  })

  it('response includes all required fields', async () => {
    const product = await createProduct()
    const res = await request(app).get(`/products/${product.id}`).expect(200)
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      description: expect.any(String),
      price: expect.any(Number),
      image_url: expect.any(String),
      category: expect.any(String),
      stock: expect.any(Number),
    })
  })

  it('total count is accurate after multiple inserts', async () => {
    await createProduct()
    await createProduct()
    await createProduct()
    const res = await request(app).get('/products').expect(200)
    expect(res.body.total).toBe(3)
  })
})
