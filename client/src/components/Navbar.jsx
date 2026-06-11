import { ShoppingBag, ChefHat, LayoutDashboard, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import styles from './Navbar.module.css'

export default function Navbar({ role, onLogout, onCartOpen }) {
  const { totalItems } = useCart()

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <ChefHat size={22} strokeWidth={1.8} />
          <span>Click<em>&</em>Collect</span>
        </div>

        <nav className={styles.nav}>
          {role === 'student' ? (
            <Link to="/" className={`${styles.navLink} ${styles.active}`}>
              Menu
            </Link>
          ) : (
            <Link to="/admin" className={`${styles.navLink} ${styles.active}`}>
              <LayoutDashboard size={15} />
              Admin
            </Link>
          )}

          <button className={styles.logoutBtn} onClick={onLogout} aria-label="Quitter le mode">
            <LogOut size={15} />
            <span>Quitter</span>
          </button>
        </nav>

        {role === 'student' && (
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
