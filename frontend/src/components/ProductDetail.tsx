import { useParams, Link } from 'react-router-dom'
import { useProduct } from '../hooks/useProducts'
import { useCart } from '../hooks/useCart'
import { useState } from 'react'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { product, loading, error } = useProduct(Number(id))
  const { addToCart, loading: cartLoading } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = async () => {
    if (!product) return
    await addToCart(product.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 text-lg">Loading...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Product not found.</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to products
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/" className="text-blue-600 hover:underline text-sm mb-6 inline-block">
        ← Back to products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <span className="text-sm text-blue-600 font-medium uppercase tracking-wide">
              {product.category}
            </span>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>

            <div className="mt-6">
              <span className="text-4xl font-bold text-gray-900">
                R{product.price.toFixed(2)}
              </span>
              <span
                className={`ml-4 text-sm font-medium ${
                  product.stock > 0 ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || cartLoading}
              className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {added ? 'Added to cart!' : cartLoading ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {/* TODO [SL-17]: Add ReviewSection component here */}
      {/* <ReviewSection productId={product.id} /> */}
    </div>
  )
}
