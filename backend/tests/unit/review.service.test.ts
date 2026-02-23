import { mockDeep } from 'jest-mock-extended'
import type { ReviewRepository } from '../../src/repositories/review.repository'
import { ReviewService } from '../../src/services/review.service'

describe('ReviewService', () => {
  const repo = mockDeep<ReviewRepository>()
  const service = new ReviewService(repo)

  it('getReviews throws 501 Not Implemented', async () => {
    await expect(service.getReviews(1)).rejects.toMatchObject({
      statusCode: 501,
      message: 'Not implemented',
    })
  })

  it('createReview throws 501 Not Implemented', async () => {
    await expect(service.createReview(1)).rejects.toMatchObject({
      statusCode: 501,
    })
  })
})
