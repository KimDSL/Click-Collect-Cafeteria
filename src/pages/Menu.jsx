import { useState, useEffect } from 'react'
import { Search, AlertCircle } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../hooks/useApi'
import styles from './Menu.module.css'

const CATEGORIES = ['Tous', 'Plat', 'Boisson', 'Encas']

export default function Menu() {
  const [products, setProducts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [activeCategory, setActive] = useState('Tous')
  const [search, setSearch]         = useState('')

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setError('Impossible de charger le menu. Vérifiez la connexion au serveur.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'Tous' || p.category === activeCategory
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <main className={styles.page}>
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
    </main>
  )
}