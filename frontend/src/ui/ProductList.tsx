import { useState } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorAlert } from '../components/ui/ErrorAlert'
import { CategoryFilter } from '../components/CategoryFilter'
import { ProductCard } from '../components/ProductCard'

export function ProductList() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined)
  const { products, total, loading, error } = useProducts(activeCategory)
  const { categories: rawCategories } = useCategories()

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat === 'All' ? undefined : cat)
  }

  if (loading) return <LoadingSpinner message="Loading products..." />
  if (error) return <ErrorAlert message={error} />

  const categoryItems = [{ label: 'All' }, ...rawCategories.map((c) => ({ label: c }))]

  return (
    <div>
      <CategoryFilter
        categories={categoryItems}
        activeValue={activeCategory}
        onChange={handleCategoryChange}
      />
      <p className="text-sm text-gray-500 mb-4">{total} products</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} to={`/products/${product.id}`} />
        ))}
      </div>
    </div>
  )
}
