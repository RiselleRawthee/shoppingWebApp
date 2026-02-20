// TODO [SL-17]: Implement product review section
//
// This component should:
//   1. Display existing reviews (from useReviews hook) with star ratings + commenter name
//   2. Show average star rating at the top
//   3. Render a form for submitting a new review:
//      - Star picker (1–5, required)
//      - Comment textarea (optional, max 500 chars)
//      - Reviewer name text input (required)
//      - Submit button (disabled while loading or if required fields empty)
//   4. After successful submit: clear the form, refresh the reviews list
//   5. Show inline error if submission fails (e.g. duplicate review → "You've already reviewed this product")
//
// Props: { productId: number }
// See frontend/CLAUDE.md for component standards (Tailwind only, no inline styles, no `any` types).
// See the Notion design specs page for the exact UI design.

interface Props {
  productId: number
}

export function ReviewSection({ productId: _productId }: Props) {
  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <p className="text-gray-400 italic">Reviews coming soon (SL-17)</p>
    </div>
  )
}
