import { useState } from 'react'
import { ChefHat, User, ShieldAlert, Lock, ArrowRight } from 'lucide-react'
import styles from './LoginPortal.module.css'

export default function LoginPortal({ onSelectRole }) {
  const [mode, setMode] = useState(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleAdminSubmit = (e) => {
    e.preventDefault()
    if (password === 'admin123') {
      onSelectRole('admin')
    } else {
      setError('Mot de passe incorrect.')
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoIcon}>
            <ChefHat size={32} />
          </div>
          <h1>Cafétéria ENSPM</h1>
          <p>Choisissez votre mode de connexion pour accéder aux services</p>
        </div>

        {!mode ? (
          <div className={styles.choices}>
            <button className={styles.choiceBtn} onClick={() => onSelectRole('student')}>
              <div className={styles.choiceIcon}>
                <User size={24} />
              </div>
              <div className={styles.choiceInfo}>
                <h3>Espace Étudiant</h3>
                <p>Consulter le menu et commander en ligne</p>
              </div>
              <ArrowRight size={18} className={styles.arrow} />
            </button>

            <button className={`${styles.choiceBtn} ${styles.adminBtn}`} onClick={() => setMode('admin')}>
              <div className={styles.choiceIcon}>
                <ShieldAlert size={24} />
              </div>
              <div className={styles.choiceInfo}>
                <h3>Espace Gérant</h3>
                <p>Gérer les commandes et disponibilités</p>
              </div>
              <ArrowRight size={18} className={styles.arrow} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleAdminSubmit} className={styles.form}>
            <h2>Accès Administrateur</h2>
            <p className={styles.formSub}>Veuillez saisir le mot de passe d'administration</p>

            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  setError('')
                }}
                className={styles.input}
                autoFocus
                required
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
              <button type="button" className={styles.backBtn} onClick={() => {
                setMode(null)
                setPassword('')
                setError('')
              }}>
                Retour
              </button>
              <button type="submit" className={styles.submitBtn}>
                Se connecter
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
