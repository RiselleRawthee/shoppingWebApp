import request from 'supertest'
import { buildApp } from '../../src/app'
import { clearDatabase, createProduct, testPrisma } from './setup'

const app = buildApp()

beforeEach(async () => { await clearDatabase() })
afterAll(async () => { await testPrisma.$disconnect() })

describe('GET /products/:id/reviews', () => {
  it('returns empty reviews list for a product with no reviews', async () => {
    const product = await createProduct()
    const res = await request(app).get(`/products/${product.id}/reviews`).expect(200)
    expect(res.body.reviews).toEqual([])
    expect(res.body.average_rating).toBe(0)
    expect(res.body.total_reviews).toBe(0)
  })

  it('returns reviews with computed average_rating and total_reviews', async () => {
    const product = await createProduct()
    await testPrisma.review.createMany({
      data: [
        { product_id: product.id, reviewer_name: 'Alice', rating: 4, comment: 'Good' },
        { product_id: product.id, reviewer_name: 'Bob', rating: 5, comment: 'Great' },
      ],
    })
    const res = await request(app).get(`/products/${product.id}/reviews`).expect(200)
    expect(res.body.total_reviews).toBe(2)
    expect(res.body.average_rating).toBe(4.5)
    expect(res.body.reviews).toHaveLength(2)
  })

  it('returns 404 for a non-existent product', async () => {
    const res = await request(app).get('/products/9999/reviews').expect(404)
    expect(res.body.message).toBe('Product not found')
  })
})

describe('POST /products/:id/reviews', () => {
  it('creates a review and returns 201', async () => {
    const product = await createProduct()
    const res = await request(app)
      .post(`/products/${product.id}/reviews`)
      .send({ reviewer_name: 'Alice', rating: 5, comment: 'Excellent!' })
      .expect(201)
    expect(res.body.reviewer_name).toBe('Alice')
    expect(res.body.rating).toBe(5)
    expect(res.body.product_id).toBe(product.id)
  })

  it('creates a review without an optional comment', async () => {
    const product = await createProduct()
    const res = await request(app)
      .post(`/products/${product.id}/reviews`)
      .send({ reviewer_name: 'Bob', rating: 3 })
      .expect(201)
    expect(res.body.comment).toBeNull()
  })

  it('returns 404 for a non-existent product', async () => {
    await request(app)
      .post('/products/9999/reviews')
      .send({ reviewer_name: 'Alice', rating: 5 })
      .expect(404)
  })

  it('returns 409 when the same reviewer submits twice', async () => {
    const product = await createProduct()
    await request(app)
      .post(`/products/${product.id}/reviews`)
      .send({ reviewer_name: 'Alice', rating: 5 })
      .expect(201)
    const res = await request(app)
      .post(`/products/${product.id}/reviews`)
      .send({ reviewer_name: 'Alice', rating: 3 })
      .expect(409)
    expect(res.body.message).toMatch(/already reviewed/i)
  })

  it('returns 422 when rating is out of range', async () => {
    const product = await createProduct()
    await request(app)
      .post(`/products/${product.id}/reviews`)
      .send({ reviewer_name: 'Alice', rating: 6 })
      .expect(422)
  })

  it('returns 422 when reviewer_name is missing', async () => {
    const product = await createProduct()
    await request(app)
      .post(`/products/${product.id}/reviews`)
      .send({ rating: 4 })
      .expect(422)
  })
})
