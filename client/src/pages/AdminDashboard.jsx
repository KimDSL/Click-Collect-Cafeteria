import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Clock, CheckCircle2, PackageCheck, AlertCircle } from 'lucide-react'
import { getOrders, updateStatus } from '../hooks/useApi'
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
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState({})
  const [filter, setFilter] = useState('all')

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    getOrders()
      .then(data => setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .catch(() => setError('Impossible de charger les commandes.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleNext = async (order) => {
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

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'En attente').length,
    ready: orders.filter(o => o.status === 'Pret').length,
    done: orders.filter(o => o.status === 'Termine').length,
  }

  const visible = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter)

  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>Tableau de bord</h1>
          <p className={styles.subtitle}>Gestion des commandes en temps réel</p>
        </div>
        <button className={styles.refreshBtn} onClick={load} aria-label="Rafraîchir">
          <RefreshCw size={16} className={loading ? styles.spin : ''} />
          <span>Rafraîchir</span>
        </button>
      </div>

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
            className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {!loading && visible.length === 0 && !error && (
        <div className={styles.empty}>
          <span>📋</span>
          <p>Aucune commande à afficher</p>
        </div>
      )}

      <div className={styles.grid}>
        {visible.map(order => {
          const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['En attente']
          const isUpdating = updating[order._id]

          return (
            <article key={order._id} className={`${styles.orderCard} fade-in-up`}>
              <div className={styles.cardTop}>
                <div>
                  <p className={styles.studentName}>{order.studentName}</p>
                  <p className={styles.orderId}>{order.ticketNumber || `#${order._id?.slice(-6).toUpperCase()}`}</p>
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
                    onClick={() => handleNext(order)}
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
    </main>
  )
}
