export interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock: number
  average_rating: number | null
  total_reviews: number
}

export interface ProductListResponse {
  products: Product[]
  total: number
}

export interface CartItem {
  id: number
  session_id: string
  product_id: number
  quantity: number
  product: Product
}

export interface CartResponse {
  items: CartItem[]
  total_price: number
  item_count: number
}

export interface AddToCartRequest {
  product_id: number
  quantity: number
  session_id: string
}

export interface Review {
  id: number
  product_id: number
  reviewer_name: string
  rating: number
  comment: string | null
  created_at: string
}

export interface ReviewListResponse {
  reviews: Review[]
  average_rating: number | null
  total_reviews: number
}

export interface CreateReviewRequest {
  reviewer_name: string
  rating: number
  comment?: string
}

export interface CategoryListResponse {
  categories: string[]
}
