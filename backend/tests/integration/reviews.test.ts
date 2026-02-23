import request from 'supertest'
import { buildApp } from '../../src/app'
import { clearDatabase, createProduct, testPrisma } from './setup'

const app = buildApp()

beforeEach(async () => { await clearDatabase() })
afterAll(async () => { await testPrisma.$disconnect() })

describe('Reviews (SL-17 stub)', () => {
  it('POST /products/:id/reviews returns 501 Not Implemented', async () => {
    const product = await createProduct()
    const res = await request(app)
      .post(`/products/${product.id}/reviews`)
      .send({ reviewer_name: 'Alice', rating: 5 })
      .expect(501)
    expect(res.body.message).toBe('Not implemented')
  })

  it('GET /products/:id/reviews returns 501 Not Implemented', async () => {
    const product = await createProduct()
    const res = await request(app).get(`/products/${product.id}/reviews`).expect(501)
    expect(res.body.message).toBe('Not implemented')
  })
})
