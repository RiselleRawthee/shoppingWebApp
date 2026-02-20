import { useEffect, useState } from 'react'
import { productsApi } from '../api/client'
import type { Product } from '../types'

interface UseProductsResult {
  products: Product[]
  total: number
  loading: boolean
  error: string | null
}

export function useProducts(category?: string): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    productsApi
      .list(category)
      .then((data) => {
        setProducts(data.products)
        setTotal(data.total)
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false))
  }, [category])

  return { products, total, loading, error }
}


interface UseProductResult {
  product: Product | null
  loading: boolean
  error: string | null
}

export function useProduct(id: number): UseProductResult {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    productsApi
      .get(id)
      .then(setProduct)
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false))
  }, [id])

  return { product, loading, error }
}
