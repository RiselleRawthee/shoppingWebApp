import { useCallback, useEffect, useState } from 'react'
import { cartApi } from '../api/client'
import type { CartItem } from '../types'

const SESSION_ID = 'shoplite-session-' + Math.random().toString(36).slice(2)

interface UseCartResult {
  items: CartItem[]
  totalPrice: number
  itemCount: number
  loading: boolean
  addToCart: (productId: number, quantity?: number) => Promise<void>
  removeFromCart: (itemId: number) => Promise<void>
}

export function useCart(): UseCartResult {
  const [items, setItems] = useState<CartItem[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [itemCount, setItemCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    const data = await cartApi.get(SESSION_ID)
    setItems(data.items)
    setTotalPrice(data.total_price)
    setItemCount(data.item_count)
  }, [])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = useCallback(
    async (productId: number, quantity = 1) => {
      setLoading(true)
      try {
        await cartApi.add({ product_id: productId, quantity, session_id: SESSION_ID })
        await fetchCart()
      } finally {
        setLoading(false)
      }
    },
    [fetchCart],
  )

  const removeFromCart = useCallback(
    async (itemId: number) => {
      setLoading(true)
      try {
        await cartApi.remove(SESSION_ID, itemId)
        await fetchCart()
      } finally {
        setLoading(false)
      }
    },
    [fetchCart],
  )

  return { items, totalPrice, itemCount, loading, addToCart, removeFromCart }
}
