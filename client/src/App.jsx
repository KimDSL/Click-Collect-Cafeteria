import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Cart from './components/Cart'
import CheckoutModal from './components/CheckoutModal'
import Menu from './pages/Menu'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const openCheckout = () => {
    setCartOpen(false)
    setCheckoutOpen(true)
  }

  return (
    <BrowserRouter>
      <CartProvider>
        <Navbar onCartOpen={() => setCartOpen(true)} />

        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>

        <Cart
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          onCheckout={openCheckout}
        />

        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
        />
      </CartProvider>
    </BrowserRouter>
  )
}
