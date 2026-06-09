import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import styles from './Cart.module.css'

export default function Cart({ isOpen, onClose, onCheckout }) {
  const { items, totalPrice, updateQty, removeItem } = useCart()

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.visible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`${styles.drawer} ${isOpen ? styles.open : ''}`} role="dialog"
        aria-modal="true" aria-label="Panier">
        <div className={styles.header}>
          <div className={styles.title}>
            <ShoppingBag size={18} />
            <span>Mon Panier</span>
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🛒</span>
              <p>Votre panier est vide</p>
              <small>Ajoutez des articles depuis le menu</small>
            </div>
          ) : (
            <ul className={styles.list}>
              {items.map(item => (
                <li key={item._id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemPrice}>
                      {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <div className={styles.itemControls}>
                    <div className={styles.qtyControl}>
                      <button
                        onClick={() => updateQty(item._id, item.quantity - 1)}
                        aria-label="Diminuer"
                      ><Minus size={13} /></button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item._id, item.quantity + 1)}
                        aria-label="Augmenter"
                      ><Plus size={13} /></button>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeItem(item._id)}
                      aria-label="Supprimer"
                    ><Trash2 size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.total}>
              <span>Total</span>
              <span className={styles.totalAmount}>
                {totalPrice.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <button className={styles.checkoutBtn} onClick={onCheckout}>
              Valider la commande
            </button>
          </div>
        )}
      </aside>
    </>
  )
}