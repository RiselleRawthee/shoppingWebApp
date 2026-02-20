import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Lighting', 'Accessories']

export function ProductList() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined)
  const { products, total, loading, error } = useProducts(activeCategory)

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat === 'All' ? undefined : cat)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 text-lg">Loading products...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              (cat === 'All' && !activeCategory) || cat === activeCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-4">{total} products</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-gray-50 overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                {product.category}
              </span>
              <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">
                {product.name}
              </h3>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  R{product.price.toFixed(2)}
                </span>
                <span
                  className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}
                >
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
