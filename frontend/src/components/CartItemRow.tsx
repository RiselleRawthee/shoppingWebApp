import type { CartItem } from '../types'
import { Price } from './ui/Price'
import { ProductImage } from './ui/ProductImage'

interface Props {
  item: CartItem
  onRemove: (itemId: number) => void
  loading?: boolean
}

export function CartItemRow({ item, onRemove, loading = false }: Props) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
      <div className="w-20 h-20 flex-shrink-0">
        <ProductImage src={item.product.image_url} alt={item.product.name} size="thumbnail" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{item.product.name}</h3>
        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
        <Price amount={item.product.price * item.quantity} size="sm" />
      </div>
      <button
        onClick={() => onRemove(item.id)}
        disabled={loading}
        className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors p-2"
        aria-label="Remove item"
      >
        ✕
      </button>
    </div>
  )
}
