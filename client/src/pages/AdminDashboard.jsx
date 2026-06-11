import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Clock, CheckCircle2, PackageCheck, AlertCircle, Plus, Trash2, Eye, EyeOff, Ticket, Search } from 'lucide-react'
import { getOrders, getOrderByTicket, updateStatus, getProductsAll, addProduct, deleteProduct, toggleProductAvailability } from '../hooks/useApi'
import styles from './AdminDashboard.module.css'

const STATUS_CONFIG = {
  'En attente': {
    label: 'En attente',
    next: 'Pret',
    nextLabel: 'Marquer Prêt',
    color: styles.statusPending,
    icon: <Clock size={14} />,
  },
  'Pret': {
    label: 'Prêt à récupérer',
    next: 'Termine',
    nextLabel: 'Terminer',
    color: styles.statusReady,
    icon: <PackageCheck size={14} />,
  },
  'Termine': {
    label: 'Terminée',
    next: null,
    color: styles.statusDone,
    icon: <CheckCircle2 size={14} />,
  },
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return `${Math.floor(diff)}s`
  if (diff < 3600) return `${Math.floor(diff/60)}min`
  return `${Math.floor(diff/3600)}h`
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [updating, setUpdating] = useState({})
  const [orderFilter, setOrderFilter] = useState('all')

  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newCategory, setNewCategory] = useState('Plat')
  const [newEmoji, setNewEmoji] = useState('🍛')
  const [addingProduct, setAddingProduct] = useState(false)

  const [ticketInput, setTicketInput] = useState('')
  const [lookupOrder, setLookupOrder] = useState(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState(null)
  const [validatingPayment, setValidatingPayment] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (activeTab === 'orders') {
        const data = await getOrders()
        setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      } else {
        const data = await getProductsAll()
        setProducts(data)
      }
    } catch {
      setError('Impossible de charger les données.')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleNextStatus = async (order) => {
    const cfg = STATUS_CONFIG[order.status]
    if (!cfg?.next) return

    setUpdating(u => ({ ...u, [order._id]: true }))
    try {
      const updated = await updateStatus(order._id, cfg.next)
      setOrders(prev =>
        prev.map(o => o._id === order._id ? { ...o, status: updated.data.status } : o)
      )
    } catch {
      alert('Erreur lors de la mise à jour du statut.')
    } finally {
      setUpdating(u => ({ ...u, [order._id]: false }))
    }
  }

  const handleTicketLookup = async (e) => {
    e.preventDefault()
    const code = ticketInput.trim()
    if (!code) return

    setLookupLoading(true)
    setLookupError(null)
    setLookupOrder(null)
    try {
      const res = await getOrderByTicket(code)
      if (res.success) {
        setLookupOrder(res.data)
      } else {
        setLookupError(res.message || 'Ticket introuvable.')
      }
    } catch (err) {
      setLookupError(err.response?.data?.message || 'Ticket introuvable.')
    } finally {
      setLookupLoading(false)
    }
  }

  const handleValidatePayment = async () => {
    if (!lookupOrder || lookupOrder.status === 'Termine') return

    setValidatingPayment(true)
    try {
      const updated = await updateStatus(lookupOrder._id, 'Termine')
      const newStatus = updated.data.status
      setLookupOrder(prev => ({ ...prev, status: newStatus }))
      setOrders(prev =>
        prev.map(o => o._id === lookupOrder._id ? { ...o, status: newStatus } : o)
      )
      setTicketInput('')
    } catch {
      alert('Erreur lors de la validation du paiement.')
    } finally {
      setValidatingPayment(false)
    }
  }

  const handleToggleAvailability = async (productId) => {
    try {
      const res = await toggleProductAvailability(productId)
      if (res.success) {
        setProducts(prev =>
          prev.map(p => p._id === productId ? { ...p, isAvailable: res.data.isAvailable } : p)
        )
      }
    } catch {
      alert('Erreur lors de la mise à jour de la disponibilité.')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce produit du menu ?')) return
    try {
      const res = await deleteProduct(productId)
      if (res.success) {
        setProducts(prev => prev.filter(p => p._id !== productId))
      }
    } catch {
      alert('Erreur lors de la suppression du produit.')
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!newName.trim() || !newPrice) return

    setAddingProduct(true)
    try {
      const payload = {
        name: newName.trim(),
        price: Number(newPrice),
        category: newCategory,
        emoji: newEmoji.trim() || '🍽️'
      }
      const res = await addProduct(payload)
      if (res.success) {
        setProducts(prev => [...prev, res.data])
        setNewName('')
        setNewPrice('')
        setNewEmoji('🍛')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'ajout.')
    } finally {
      setAddingProduct(false)
    }
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'En attente').length,
    ready: orders.filter(o => o.status === 'Pret').length,
    done: orders.filter(o => o.status === 'Termine').length,
  }

  const visibleOrders = orderFilter === 'all'
    ? orders
    : orders.filter(o => o.status === orderFilter)

  return (
    <main className={styles.page}>
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabLink} ${activeTab === 'orders' ? styles.tabLinkActive : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📋 Commandes
        </button>
        <button
          className={`${styles.tabLink} ${activeTab === 'products' ? styles.tabLinkActive : ''}`}
          onClick={() => setActiveTab('products')}
        >
          ⚙️ Gestion du Menu
        </button>
      </div>

      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>
            {activeTab === 'orders' ? 'Tableau de bord' : 'Gestion du Menu'}
          </h1>
          <p className={styles.subtitle}>
            {activeTab === 'orders'
              ? 'Gestion des commandes en temps réel'
              : 'Ajouter, masquer ou retirer des articles de la carte'
            }
          </p>
        </div>
        <button className={styles.refreshBtn} onClick={loadData} aria-label="Rafraîchir" disabled={loading}>
          <RefreshCw size={16} className={loading ? styles.spin : ''} />
          <span>Rafraîchir</span>
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'orders' ? (
        <>
          <section className={styles.paymentSection}>
            <div className={styles.paymentHeader}>
              <Ticket size={20} />
              <div>
                <h2>Encaissement</h2>
                <p>Saisissez le code ticket présenté par l'étudiant pour valider le paiement</p>
              </div>
            </div>

            <form onSubmit={handleTicketLookup} className={styles.ticketForm}>
              <input
                type="text"
                className={styles.ticketInput}
                placeholder="Ex: #ABC123"
                value={ticketInput}
                onChange={e => {
                  setTicketInput(e.target.value)
                  setLookupError(null)
                }}
                disabled={lookupLoading}
              />
              <button type="submit" className={styles.ticketSearchBtn} disabled={lookupLoading || !ticketInput.trim()}>
                {lookupLoading ? (
                  <RefreshCw size={16} className={styles.spin} />
                ) : (
                  <>
                    <Search size={16} />
                    <span>Rechercher</span>
                  </>
                )}
              </button>
            </form>

            {lookupError && (
              <div className={styles.lookupError}>
                <AlertCircle size={16} />
                <span>{lookupError}</span>
              </div>
            )}

            {lookupOrder && (
              <div className={styles.lookupResult}>
                <div className={styles.lookupResultHeader}>
                  <div>
                    <span className={styles.lookupTicket}>{lookupOrder.ticketNumber}</span>
                    <p className={styles.lookupStudent}>{lookupOrder.studentName}</p>
                    <p className={styles.lookupMatricule}>Matricule : {lookupOrder.studentId}</p>
                  </div>
                  <span className={`${styles.statusBadge} ${STATUS_CONFIG[lookupOrder.status]?.color || styles.statusPending}`}>
                    {STATUS_CONFIG[lookupOrder.status]?.icon}
                    {STATUS_CONFIG[lookupOrder.status]?.label || lookupOrder.status}
                  </span>
                </div>

                <ul className={styles.lookupItems}>
                  {lookupOrder.items?.map((item, i) => (
                    <li key={i}>
                      <span>{item.name}</span>
                      <span>× {item.quantity}</span>
                    </li>
                  ))}
                </ul>

                <div className={styles.lookupFooter}>
                  <strong>{lookupOrder.totalPrice?.toLocaleString('fr-FR')} FCFA</strong>
                  {lookupOrder.status === 'Termine' ? (
                    <span className={styles.alreadyPaid}>Paiement déjà validé</span>
                  ) : (
                    <button
                      className={styles.validatePayBtn}
                      onClick={handleValidatePayment}
                      disabled={validatingPayment}
                    >
                      {validatingPayment ? (
                        <RefreshCw size={14} className={styles.spin} />
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          Valider le paiement
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statNum}>{stats.total}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={`${styles.statCard} ${styles.statPending}`}>
              <span className={styles.statNum}>{stats.pending}</span>
              <span className={styles.statLabel}>En attente</span>
            </div>
            <div className={`${styles.statCard} ${styles.statReady}`}>
              <span className={styles.statNum}>{stats.ready}</span>
              <span className={styles.statLabel}>Prêts</span>
            </div>
            <div className={`${styles.statCard} ${styles.statDone}`}>
              <span className={styles.statNum}>{stats.done}</span>
              <span className={styles.statLabel}>Terminées</span>
            </div>
          </div>

          <div className={styles.filterRow}>
            {[
              { key: 'all', label: 'Toutes' },
              { key: 'En attente', label: 'En attente' },
              { key: 'Pret', label: 'Prêtes' },
              { key: 'Termine', label: 'Terminées' },
            ].map(f => (
              <button
                key={f.key}
                className={`${styles.filterBtn} ${orderFilter === f.key ? styles.filterActive : ''}`}
                onClick={() => setOrderFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {!loading && visibleOrders.length === 0 && !error && (
            <div className={styles.empty}>
              <span>📋</span>
              <p>Aucune commande à afficher</p>
            </div>
          )}

          <div className={styles.grid}>
            {visibleOrders.map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['En attente']
              const isUpdating = updating[order._id]

              return (
                <article key={order._id} className={`${styles.orderCard} fade-in-up`}>
                  <div className={styles.cardTop}>
                    <div>
                      <p className={styles.studentName}>{order.studentName}</p>
                      <p className={styles.orderId}>{order.ticketNumber || `#${order._id?.slice(-6).toUpperCase()}`}</p>
                      <p className={styles.studentMatricule}>Matricule: {order.studentId || 'N/A'}</p>
                    </div>
                    <span className={`${styles.statusBadge} ${cfg.color}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </div>

                  <ul className={styles.itemsList}>
                    {order.items?.map((item, i) => (
                      <li key={i} className={styles.orderItem}>
                        <span>{item.name || 'Article'}</span>
                        <span>× {item.quantity}</span>
                      </li>
                    ))}
                  </ul>

                  <div className={styles.cardBottom}>
                    <div>
                      <span className={styles.price}>
                        {order.totalPrice?.toLocaleString('fr-FR')} FCFA
                      </span>
                      <span className={styles.time}>
                        · il y a {timeAgo(order.createdAt)}
                      </span>
                    </div>
                    {cfg.next && (
                      <button
                        className={`${styles.actionBtn} ${order.status === 'En attente' ? styles.btnPrimary : styles.btnSuccess}`}
                        onClick={() => handleNextStatus(order)}
                        disabled={isUpdating}
                      >
                        {isUpdating
                          ? <RefreshCw size={14} className={styles.spin} />
                          : cfg.nextLabel
                        }
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </>
      ) : (
        <div className={styles.productsPanel}>
          <section className={styles.formSection}>
            <h2>Ajouter un nouveau produit</h2>
            <form onSubmit={handleAddProduct} className={styles.productForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nom du Produit</label>
                  <input
                    type="text"
                    placeholder="Ex: Beignets de Maïs"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                    className={styles.formInput}
                    disabled={addingProduct}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Prix (FCFA)</label>
                  <input
                    type="number"
                    placeholder="Ex: 250"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    required
                    className={styles.formInput}
                    disabled={addingProduct}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Catégorie</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className={styles.formSelect}
                    disabled={addingProduct}
                  >
                    <option value="Plat">Plat</option>
                    <option value="Boisson">Boisson</option>
                    <option value="Encas">Encas</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Emoji représentant</label>
                  <input
                    type="text"
                    placeholder="Ex: 🍩"
                    value={newEmoji}
                    onChange={e => setNewEmoji(e.target.value)}
                    className={styles.formInput}
                    disabled={addingProduct}
                  />
                </div>
              </div>

              <button type="submit" className={styles.addBtn} disabled={addingProduct}>
                <Plus size={16} />
                <span>Ajouter à la carte</span>
              </button>
            </form>
          </section>

          <section className={styles.listSection}>
            <h2>Articles de la carte</h2>
            <div className={styles.productsTableWrapper}>
              <table className={styles.productsTable}>
                <thead>
                  <tr>
                    <th>Emoji</th>
                    <th>Nom</th>
                    <th>Catégorie</th>
                    <th>Prix</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id} className={!product.isAvailable ? styles.disabledRow : ''}>
                      <td className={styles.emojiTd}>{product.emoji}</td>
                      <td className={styles.nameTd}>{product.name}</td>
                      <td>
                        <span className={styles.categoryBadge}>{product.category}</span>
                      </td>
                      <td className={styles.priceTd}>{product.price.toLocaleString('fr-FR')} FCFA</td>
                      <td>
                        <button
                          onClick={() => handleToggleAvailability(product._id)}
                          className={`${styles.statusToggle} ${product.isAvailable ? styles.activeStatus : styles.inactiveStatus}`}
                          title={product.isAvailable ? 'Masquer du menu' : 'Rendre disponible'}
                        >
                          {product.isAvailable ? (
                            <>
                              <Eye size={13} />
                              <span>Disponible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff size={13} />
                              <span>Masqué</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className={styles.deleteBtn}
                          title="Supprimer définitivement"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
