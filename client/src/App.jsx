import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Cart from './components/Cart'
import CheckoutModal from './components/CheckoutModal'
import Menu from './pages/Menu'
import AdminDashboard from './pages/AdminDashboard'
import LoginPortal from './pages/LoginPortal'

export default function App() {
  const [role, setRole] = useState(localStorage.getItem('userRole') || null)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const handleSelectRole = (selectedRole) => {
    localStorage.setItem('userRole', selectedRole)
    setRole(selectedRole)
  }

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    setRole(null)
    setCartOpen(false)
    setCheckoutOpen(false)
  }

  if (!role) {
    return <LoginPortal onSelectRole={handleSelectRole} />
  }

  const openCheckout = () => {
    setCartOpen(false)
    setCheckoutOpen(true)
  }

  return (
    <BrowserRouter>
      <CartProvider>
        <Navbar role={role} onLogout={handleLogout} onCartOpen={() => setCartOpen(true)} />

        <Routes>
          {role === 'student' ? (
            <>
              <Route path="/" element={<Menu />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </>
          )}
        </Routes>

        {role === 'student' && (
          <>
            <Cart
              isOpen={cartOpen}
              onClose={() => setCartOpen(false)}
              onCheckout={openCheckout}
            />
            <CheckoutModal
              isOpen={checkoutOpen}
              onClose={() => setCheckoutOpen(false)}
            />
          </>
        )}
      </CartProvider>
    </BrowserRouter>
  )
}
