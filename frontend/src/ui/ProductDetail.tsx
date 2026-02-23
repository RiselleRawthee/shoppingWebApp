import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProduct } from '../hooks/useProducts'
import { useCart } from '../hooks/useCart'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorAlert } from '../components/ui/ErrorAlert'
import { EmptyState } from '../components/ui/EmptyState'
import { BackLink } from '../components/ui/BackLink'
import { ProductImage } from '../components/ui/ProductImage'
import { Badge } from '../components/ui/Badge'
import { Price } from '../components/ui/Price'
import { StockBadge } from '../components/ui/StockBadge'
import { Button } from '../components/ui/Button'
import { ReviewSection } from '../components/ReviewSection'

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

  if (loading) return <LoadingSpinner message="Loading product..." />
  if (error) return <ErrorAlert message={error} />
  if (!product) return <EmptyState title="Product not found" action={{ label: '← Back to products', href: '/' }} />

  return (
    <div>
      <BackLink to="/" label="← Back to products" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden">
          <ProductImage src={product.image_url} alt={product.name} size="detail" />
        </div>
        <div className="flex flex-col justify-center">
          <Badge label={product.category} />
          <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-3">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="flex items-center gap-4 mb-6">
            <Price amount={product.price} size="lg" />
            <StockBadge stock={product.stock} />
          </div>
          <Button
            onClick={() => void handleAddToCart()}
            disabled={product.stock === 0}
            loading={cartLoading}
            fullWidth
          >
            {added ? 'Added to cart!' : 'Add to Cart'}
          </Button>
        </div>
      </div>
      <ReviewSection productId={product.id} />
    </div>
  )
}
