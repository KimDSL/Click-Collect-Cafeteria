import { Plus, Check } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import styles from './ProductCard.module.css'

const CATEGORY_EMOJI = {
  'Plat':    '🍽️',
  'Boisson': '🥤',
  'Encas':   '🥪',
}

export default function ProductCard({ product }) {
  const { addItem, items } = useCart()
  const [added, setAdded] = useState(false)

  const inCart = items.find(i => i._id === product._id)
  const qty = inCart ? inCart.quantity : 0

  const handleAdd = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 900)
  }

  return (
    <article className={`${styles.card} fade-in-up`}>
      <div className={styles.topRow}>
        <span className={styles.emoji}>
          {CATEGORY_EMOJI[product.category] || '🍴'}
        </span>
        <span className={styles.category}>{product.category}</span>
      </div>

      <h3 className={styles.name}>{product.name}</h3>

      <div className={styles.footer}>
        <span className={styles.price}>
          {product.price.toLocaleString('fr-FR')} <em>FCFA</em>
        </span>
        <div className={styles.actions}>
          {qty > 0 && <span className={styles.qty}>{qty}</span>}
          <button
            className={`${styles.addBtn} ${added ? styles.added : ''}`}
            onClick={handleAdd}
            aria-label={`Ajouter ${product.name} au panier`}
          >
            {added ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    </article>
  )
}
