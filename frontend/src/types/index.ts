export interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock: number
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
