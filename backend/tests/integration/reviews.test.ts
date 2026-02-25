import request from 'supertest'
import { buildApp } from '../../src/app'
import { clearDatabase, createProduct, testPrisma } from './setup'

const app = buildApp()

beforeEach(async () => { await clearDatabase() })
afterAll(async () => { await testPrisma.$disconnect() })

describe('GET /products/:id/reviews', () => {
  it('returns 200 with empty reviews and null average_rating for a new product', async () => {
    const product = await createProduct()
    const res = await request(app).get(`/products/${product.id}/reviews`).expect(200)
    expect(res.body).toEqual({ reviews: [], average_rating: null, total_reviews: 0 })
  })

  it('returns 200 with reviews, average_rating and total_reviews after posting', async () => {
    const product = await createProduct()
    await testPrisma.review.create({
      data: { product_id: product.id, reviewer_name: 'Alice', rating: 4, comment: 'Good' },
    })
    await testPrisma.review.create({
      data: { product_id: product.id, reviewer_name: 'Bob', rating: 5, comment: null },
    })
    const res = await request(app).get(`/products/${product.id}/reviews`).expect(200)
    expect(res.body.total_reviews).toBe(2)
    expect(res.body.average_rating).toBe(4.5)
    expect(res.body.reviews).toHaveLength(2)
    expect(res.body.reviews[0]).toMatchObject({ reviewer_name: expect.any(String), rating: expect.any(Number) })
  })

  it('returns 404 for an unknown product', async () => {
    const res = await request(app).get('/products/99999/reviews').expect(404)
    expect(res.body.message).toBe('Product not found')
  })
})

describe('POST /products/:id/reviews', () => {
  it('returns 201 and the created review', async () => {
    const product = await createProduct()
    const res = await request(app)
      .post(`/products/${product.id}/reviews`)
      .send({ reviewer_name: 'Alice', rating: 5, comment: 'Excellent!' })
      .expect(201)
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      product_id: product.id,
      reviewer_name: 'Alice',
      rating: 5,
      comment: 'Excellent!',
    })
  })

  it('returns 201 without optional comment', async () => {
    const product = await createProduct()
    const res = await request(app)
      .post(`/products/${product.id}/reviews`)
      .send({ reviewer_name: 'Bob', rating: 4 })
      .expect(201)
    expect(res.body.reviewer_name).toBe('Bob')
    expect(res.body.comment).toBeNull()
  })

  it('returns 409 when the same reviewer posts twice for the same product', async () => {
    const product = await createProduct()
    await request(app)
      .post(`/products/${product.id}/reviews`)
      .send({ reviewer_name: 'Alice', rating: 5 })
      .expect(201)
    const res = await request(app)
      .post(`/products/${product.id}/reviews`)
      .send({ reviewer_name: 'Alice', rating: 3 })
      .expect(409)
    expect(res.body.message).toBe('You have already reviewed this product')
  })

  it('returns 422 when rating is out of 1–5 range', async () => {
    const product = await createProduct()
    const res = await request(app)
      .post(`/products/${product.id}/reviews`)
      .send({ reviewer_name: 'Bob', rating: 6 })
      .expect(422)
    expect(res.body.message).toBe('Validation error')
  })

  it('returns 422 when rating is below 1', async () => {
    const product = await createProduct()
    await request(app)
      .post(`/products/${product.id}/reviews`)
      .send({ reviewer_name: 'Bob', rating: 0 })
      .expect(422)
  })

  it('returns 422 when reviewer_name is missing', async () => {
    const product = await createProduct()
    const res = await request(app)
      .post(`/products/${product.id}/reviews`)
      .send({ rating: 4 })
      .expect(422)
    expect(res.body.message).toBe('Validation error')
  })

  it('returns 404 for an unknown product', async () => {
    const res = await request(app)
      .post('/products/99999/reviews')
      .send({ reviewer_name: 'Alice', rating: 5 })
      .expect(404)
    expect(res.body.message).toBe('Product not found')
  })
})
