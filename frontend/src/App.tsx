import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { ProductList } from './components/ProductList'
import { ProductDetail } from './components/ProductDetail'
import { Cart } from './components/Cart'
import './index.css'

function NavBar() {
  const location = useLocation()
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">
          ShopLite
        </Link>
        <nav className="flex gap-6 text-sm font-medium text-gray-600">
          <Link
            to="/"
            className={`hover:text-blue-600 transition-colors ${
              location.pathname === '/' ? 'text-blue-600' : ''
            }`}
          >
            Products
          </Link>
          <Link
            to="/cart"
            className={`hover:text-blue-600 transition-colors ${
              location.pathname === '/cart' ? 'text-blue-600' : ''
            }`}
          >
            Cart
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
