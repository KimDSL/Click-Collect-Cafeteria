import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, AlertCircle, ShoppingBag, Trash2, Edit3, RefreshCw } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { getProducts, getStudentOrders, deleteOrder } from '../hooks/useApi'
import { normalizeMatricule, isValidMatricule, MATRICULE_ERROR } from '../utils/matricule'
import styles from './Menu.module.css'

const CATEGORIES = ['Tous', 'Plat', 'Boisson', 'Encas']

export default function Menu({ onCartOpen }) {
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab = location.pathname === '/orders' ? 'orders' : 'menu'

  const { totalPrice: cartTotal, totalItems: cartCount, addItem, updateQty, clearCart } = useCart()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActive] = useState('Tous')
  const [search, setSearch] = useState('')

  const [studentIdInput, setStudentIdInput] = useState(localStorage.getItem('studentId') || '')
  const [studentId, setStudentId] = useState(localStorage.getItem('studentId') || '')
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [ordersError, setOrdersError] = useState(null)
  const [matriculeError, setMatriculeError] = useState(null)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setError('Impossible de charger le menu. Vérifiez la connexion au serveur.'))
      .finally(() => setLoading(false))
  }, [])

  const loadOrders = useCallback(async (matricule) => {
    if (!matricule) return
    setLoadingOrders(true)
    setOrdersError(null)
    try {
      const data = await getStudentOrders(matricule)
      setOrders(data)
    } catch {
      setOrdersError('Impossible de charger vos commandes.')
    } finally {
      setLoadingOrders(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'orders' && studentId) {
      loadOrders(studentId)
    }
  }, [activeTab, studentId, loadOrders])

  const handleMatriculeSubmit = (e) => {
    e.preventDefault()
    const upperMatricule = normalizeMatricule(studentIdInput)
    if (!upperMatricule) return

    if (!isValidMatricule(upperMatricule)) {
      setMatriculeError(MATRICULE_ERROR)
      return
    }

    setMatriculeError(null)
    localStorage.setItem('studentId', upperMatricule)
    setStudentId(upperMatricule)
    loadOrders(upperMatricule)
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette commande ?')) return
    try {
      const res = await deleteOrder(orderId)
      if (res.success) {
        setOrders(prev => prev.filter(o => o._id !== orderId))
      } else {
        alert(res.message)
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'annulation.')
    }
  }

  const handleModifyOrder = async (order) => {
    if (!window.confirm('Modifier cette commande annulera la commande actuelle et chargera ses articles dans votre panier. Voulez-vous continuer ?')) {
      return
    }
    try {
      const res = await deleteOrder(order._id)
      if (res.success) {
        clearCart()
        order.items.forEach(item => {
          const product = products.find(p => p._id === item.productId) || {
            _id: item.productId,
            name: item.name,
            price: item.price,
            category: 'Plat',
            emoji: '🍽',
            isAvailable: true,
          }
          addItem(product)
          updateQty(item.productId, item.quantity)
        })
        setOrders(prev => prev.filter(o => o._id !== order._id))
        onCartOpen()
        navigate('/')
      } else {
        alert(res.message)
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la modification.')
    }
  }

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'Tous' || p.category === activeCategory
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <main className={styles.page}>
      {activeTab === 'menu' ? (
        <>
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>
              Cafétéria<br /><em>ENSPM</em>
            </h1>
            <p className={styles.heroSub}>
              Commandez à l'avance, évitez la file d'attente.
            </p>
          </div>

          <div className={styles.controls}>
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                type="search"
                placeholder="Rechercher un plat…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.tabs} role="tablist">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeCategory === cat}
                  className={`${styles.tab} ${activeCategory === cat ? styles.tabActive : ''}`}
                  onClick={() => setActive(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className={styles.grid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`${styles.skeletonCard} skeleton`} />
              ))}
            </div>
          )}

          {error && (
            <div className={styles.errorBanner}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className={styles.empty}>
              <span>🍽️</span>
              <p>Aucun article trouvé</p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className={styles.grid}>
              {filtered.map((product, i) => (
                <div key={product._id} style={{ animationDelay: `${i * 40}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {cartCount > 0 && (
            <div className={styles.floatingCartWrap}>
              <button className={styles.floatingCart} onClick={onCartOpen}>
                <div className={styles.floatingCartInfo}>
                  <ShoppingBag size={20} />
                  <span>{cartCount} {cartCount > 1 ? 'articles' : 'article'}</span>
                  <span className={styles.floatingCartDivider}>•</span>
                  <span>{cartTotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <span className={styles.floatingCartAction}>Voir le panier →</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.ordersSection}>
          {!studentId ? (
            <div className={styles.matriculePrompt}>
              <h2>Suivre mes commandes</h2>
              <p>Entrez votre matricule étudiant pour retrouver vos tickets en cours</p>
              <form onSubmit={handleMatriculeSubmit} className={styles.matriculeForm}>
                <input
                  type="text"
                  placeholder="Ex: 23ENSPM0426"
                  value={studentIdInput}
                  onChange={e => {
                    setStudentIdInput(e.target.value)
                    setMatriculeError(null)
                  }}
                  className={styles.matriculeInput}
                  required
                />
                <button type="submit" className={styles.matriculeSubmit}>
                  Rechercher
                </button>
              </form>
              {matriculeError && (
                <div className={styles.errorBanner}>
                  <AlertCircle size={18} />
                  <span>{matriculeError}</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className={styles.ordersHeader}>
                <div>
                  <h2>Mes Commandes</h2>
                  <p>Matricule actif : <strong>{studentId}</strong></p>
                </div>
                <div className={styles.ordersHeaderActions}>
                  <button onClick={() => loadOrders(studentId)} className={styles.refreshBtn} disabled={loadingOrders}>
                    <RefreshCw size={14} className={loadingOrders ? styles.spin : ''} />
                    <span>Actualiser</span>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem('studentId')
                      setStudentId('')
                      setStudentIdInput('')
                      setOrders([])
                    }}
                    className={styles.changeMatriculeBtn}
                  >
                    Changer de matricule
                  </button>
                </div>
              </div>

              {loadingOrders && (
                <div className={styles.loadingOrders}>
                  <RefreshCw size={24} className={styles.spin} />
                  <p>Chargement de vos commandes...</p>
                </div>
              )}

              {ordersError && (
                <div className={styles.errorBanner}>
                  <AlertCircle size={18} />
                  <span>{ordersError}</span>
                </div>
              )}

              {!loadingOrders && !ordersError && orders.length === 0 && (
                <div className={styles.emptyOrders}>
                  <span>📋</span>
                  <p>Vous n'avez pas de commande en cours.</p>
                  <button onClick={() => navigate('/')} className={styles.menuRedirectBtn}>
                    Commander maintenant
                  </button>
                </div>
              )}

              {!loadingOrders && !ordersError && orders.length > 0 && (
                <div className={styles.ordersGrid}>
                  {orders.map(order => (
                    <article key={order._id} className={styles.orderCard}>
                      <div className={styles.orderCardHeader}>
                        <div>
                          <span className={styles.ticketNumber}>{order.ticketNumber}</span>
                          <span className={styles.orderDate}>
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <span className={`${styles.statusBadge} ${
                          order.status === 'En attente' ? styles.statusPending :
                          order.status === 'Pret' ? styles.statusReady : styles.statusDone
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <ul className={styles.orderItems}>
                        {order.items?.map((item, i) => (
                          <li key={i}>
                            <span>{item.name}</span>
                            <span>× {item.quantity}</span>
                          </li>
                        ))}
                      </ul>

                      <div className={styles.orderCardFooter}>
                        <div className={styles.orderTotal}>
                          <span>Prix à payer au retrait :</span>
                          <strong>{order.totalPrice?.toLocaleString('fr-FR')} FCFA</strong>
                        </div>

                        {order.status === 'En attente' && (
                          <div className={styles.orderActions}>
                            <button
                              onClick={() => handleModifyOrder(order)}
                              className={styles.modifyBtn}
                              title="Modifier les articles"
                            >
                              <Edit3 size={14} />
                              Modifier
                            </button>
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className={styles.cancelBtn}
                              title="Annuler la commande"
                            >
                              <Trash2 size={14} />
                              Annuler
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
