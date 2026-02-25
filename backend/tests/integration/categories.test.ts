import request from 'supertest'
import { buildApp } from '../../src/app'
import { clearDatabase, createProduct, testPrisma } from './setup'

const app = buildApp()

beforeEach(async () => {
  await clearDatabase()
})

afterAll(async () => {
  await testPrisma.$disconnect()
})

describe('GET /categories', () => {
  it('returns empty list when no products exist', async () => {
    const res = await request(app).get('/categories').expect(200)
    expect(res.body).toEqual({ categories: [] })
  })

  it('returns sorted unique categories', async () => {
    await createProduct({ category: 'Furniture' })
    await createProduct({ category: 'Electronics' })
    await createProduct({ category: 'Accessories' })
    const res = await request(app).get('/categories').expect(200)
    expect(res.body).toEqual({ categories: ['Accessories', 'Electronics', 'Furniture'] })
  })

  it('deduplicates categories across multiple products', async () => {
    await createProduct({ category: 'Electronics' })
    await createProduct({ category: 'Electronics' })
    await createProduct({ category: 'Furniture' })
    const res = await request(app).get('/categories').expect(200)
    expect(res.body.categories).toEqual(['Electronics', 'Furniture'])
    expect(res.body.categories).toHaveLength(2)
  })

  it('response has correct shape', async () => {
    await createProduct({ category: 'Electronics' })
    const res = await request(app).get('/categories').expect(200)
    expect(res.body).toMatchObject({
      categories: expect.arrayContaining([expect.any(String)]),
    })
  })
})
