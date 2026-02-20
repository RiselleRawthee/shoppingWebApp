import axios from 'axios'
import type { AddToCartRequest, CartResponse, ProductListResponse, Product } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export const productsApi = {
  list: (category?: string): Promise<ProductListResponse> =>
    api.get('/products', { params: category ? { category } : {} }).then((r) => r.data),

  get: (id: number): Promise<Product> =>
    api.get(`/products/${id}`).then((r) => r.data),
}

export const cartApi = {
  get: (sessionId: string): Promise<CartResponse> =>
    api.get(`/cart/${sessionId}`).then((r) => r.data),

  add: (payload: AddToCartRequest): Promise<CartResponse> =>
    api.post('/cart', payload).then((r) => r.data),

  remove: (sessionId: string, itemId: number): Promise<void> =>
    api.delete(`/cart/${sessionId}/${itemId}`),
}
