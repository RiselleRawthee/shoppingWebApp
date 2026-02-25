import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { Badge } from './ui/Badge'
import { Price } from './ui/Price'
import { StockBadge } from './ui/StockBadge'
import { ProductImage } from './ui/ProductImage'

interface Props {
  product: Product
  to: string
}

export function ProductCard({ product, to }: Props) {
  return (
    <Link
      to={to}
      className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-gray-50 overflow-hidden">
        <ProductImage src={product.image_url} alt={product.name} size="card" hoverZoom />
      </div>
      <div className="p-4">
        <Badge label={product.category} />
        <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
        <div className="mt-1">
          {product.total_reviews > 0 ? (
            <span className="text-xs text-yellow-500">
              ★ {product.average_rating} · {product.total_reviews} {product.total_reviews === 1 ? 'review' : 'reviews'}
            </span>
          ) : (
            <span className="text-xs text-gray-400">No reviews yet</span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Price amount={product.price} size="md" />
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </Link>
  )
}
