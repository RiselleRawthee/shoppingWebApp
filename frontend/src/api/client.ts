import axios from 'axios'
import type { AddToCartRequest, CartResponse, ProductListResponse, Product, ReviewListResponse, Review, CreateReviewRequest } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

export const productsApi = {
  list: (category?: string): Promise<ProductListResponse> =>
    api.get('/products', { params: category ? { category } : {} }).then((r) => r.data),

  get: (id: number): Promise<Product> =>
    api.get(`/products/${id}`).then((r) => r.data),
}

export const reviewsApi = {
  list: (productId: number): Promise<ReviewListResponse> =>
    api.get(`/products/${productId}/reviews`).then((r) => r.data),

  create: (productId: number, payload: CreateReviewRequest): Promise<Review> =>
    api.post(`/products/${productId}/reviews`, payload).then((r) => r.data),
}

export const cartApi = {
  get: (sessionId: string): Promise<CartResponse> =>
    api.get(`/cart/${sessionId}`).then((r) => r.data),

  add: (payload: AddToCartRequest): Promise<CartResponse> =>
    api.post('/cart', payload).then((r) => r.data),

  remove: (sessionId: string, itemId: number): Promise<void> =>
    api.delete(`/cart/${sessionId}/${itemId}`),
}
