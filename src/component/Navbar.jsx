import { ShoppingBag, ChefHat, LayoutDashboard } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import styles from './Navbar.module.css'

export default function Navbar({ onCartOpen }) {
  const { totalItems } = useCart()
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <ChefHat size={22} strokeWidth={1.8} />
          <span>Click<em>&</em>Collect</span>
        </Link>

        <nav className={styles.nav}>
          <Link to="/" className={`${styles.navLink} ${!isAdmin ? styles.active : ''}`}>
            Menu
          </Link>
          <Link to="/admin" className={`${styles.navLink} ${isAdmin ? styles.active : ''}`}>
            <LayoutDashboard size={15} />
            Admin
          </Link>
        </nav>

        {!isAdmin && (
          <button className={styles.cartBtn} onClick={onCartOpen} aria-label="Ouvrir le panier">
            <ShoppingBag size={20} strokeWidth={1.8} />
            {totalItems > 0 && (
              <span className={styles.badge}>{totalItems}</span>
            )}
          </button>
        )}
      </div>
    </header>
  )
}
