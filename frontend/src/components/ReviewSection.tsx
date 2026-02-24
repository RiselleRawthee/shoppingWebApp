// TODO [SL-17]: Implement product reviews and star ratings
interface ReviewSectionProps {
  productId: number
}

export function ReviewSection({ productId: _productId }: ReviewSectionProps) {
  return (
    <div className="mt-10 border-t pt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h2>
      <p className="text-gray-500">Reviews coming soon.</p>
    </div>
  )
}
