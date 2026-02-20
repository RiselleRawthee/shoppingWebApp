import { useCart } from '../hooks/useCart'

export function Cart() {
  const { items, totalPrice, itemCount, loading, removeFromCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-gray-500 text-lg">Your cart is empty.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
      </h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{item.product.name}</p>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              <p className="text-sm font-medium text-gray-900">
                R{(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => removeFromCart(item.id)}
              disabled={loading}
              className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors p-2"
              aria-label="Remove item"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-gray-900">R{totalPrice.toFixed(2)}</span>
        </div>

        <button className="w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors">
          Proceed to Checkout
        </button>
      </div>
    </div>
  )
}
