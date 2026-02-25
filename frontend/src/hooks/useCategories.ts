import { useEffect, useState } from 'react'
import { categoriesApi } from '../api/client'

interface UseCategoriesResult {
  categories: string[]
  loading: boolean
  error: string | null
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    categoriesApi
      .list()
      .then((data) => setCategories(data.categories))
      .catch(() => setError('Failed to load categories'))
      .finally(() => setLoading(false))
  }, [])

  return { categories, loading, error }
}
