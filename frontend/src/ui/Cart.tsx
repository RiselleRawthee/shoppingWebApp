import { useCart } from '../hooks/useCart'
import { EmptyState } from '../components/ui/EmptyState'
import { Price } from '../components/ui/Price'
import { CartItemRow } from '../components/CartItemRow'

export function Cart() {
  const { items, totalPrice, itemCount, loading, removeFromCart } = useCart()

  if (items.length === 0) {
    return (
      <EmptyState
        emoji="🛒"
        title="Your cart is empty"
        message="Add some products to get started."
        action={{ label: 'Browse products', href: '/' }}
      />
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
      </h1>
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onRemove={(id) => void removeFromCart(id)}
            loading={loading}
          />
        ))}
      </div>
      <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Total</p>
          <Price amount={totalPrice} size="lg" />
        </div>
        <button className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors">
          Proceed to Checkout
        </button>
      </div>
    </div>
  )
}
