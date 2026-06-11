import { useState, useEffect } from 'react'
import { X, RefreshCw, Ticket } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { createOrder } from '../hooks/useApi'
import { normalizeMatricule, isValidMatricule, MATRICULE_ERROR } from '../utils/matricule'
import styles from './CheckoutModal.module.css'

export default function CheckoutModal({ isOpen, onClose }) {
  const { items, totalPrice, clearCart } = useCart()
  const [studentName, setStudentName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [orderTotal, setOrderTotal] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setStudentName('')
      setStudentId('')
      setError(null)
      setTicket(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!studentName.trim()) {
      setError('Le nom de l\'étudiant est requis.')
      return
    }

    const matriculeUpper = normalizeMatricule(studentId)
    if (!isValidMatricule(matriculeUpper)) {
      setError(MATRICULE_ERROR)
      return
    }

    setLoading(true)
    setError(null)
    setOrderTotal(totalPrice)

    try {
      const payload = {
        studentName: studentName.trim(),
        studentId: matriculeUpper,
        items: items.map(i => ({ productId: i._id, quantity: i.quantity }))
      }

      const res = await createOrder(payload)
      if (res.success) {
        localStorage.setItem('studentName', studentName.trim())
        localStorage.setItem('studentId', matriculeUpper)
        setTicket(res.data.ticketNumber)
        clearCart()
      } else {
        setError(res.message || 'Une erreur est survenue.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion au serveur.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStudentName('')
    setStudentId('')
    setError(null)
    setTicket(null)
    onClose()
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Fermer">
          <X size={16} />
        </button>

        {!ticket ? (
          <div>
            <div className={styles.modalHead}>
              <span className={styles.modalIcon}>📝</span>
              <h2>Finaliser la commande</h2>
              <p>Total à payer sur place : <strong>{totalPrice.toLocaleString('fr-FR')} FCFA</strong></p>
            </div>

            <ul className={styles.summary}>
              {items.map(item => (
                <li key={item._id}>
                  <span>{item.name} (x{item.quantity})</span>
                  <span>{(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</span>
                </li>
              ))}
            </ul>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div>
                <label className={styles.label}>Nom Complet *</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ex: ADAMOU Fadilatou"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className={styles.label}>Matricule * (Format: 23ENSPM0426)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ex: 23ENSPM0426"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? (
                  <RefreshCw size={16} className={styles.spin} />
                ) : (
                  <>Confirmer la commande</>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className={styles.success}>
            <div className={styles.ticketIcon}>
              <Ticket size={32} />
            </div>
            <h2>Commande validée !</h2>
            <p>Présentez ce numéro de ticket à la caisse pour le paiement et retrait :</p>
            <div className={styles.ticketNumber}>{ticket}</div>
            <p className={styles.ticketName}>Client : {studentName}</p>
            <div className={styles.notice}>
              Paiement physique de <strong>{orderTotal.toLocaleString('fr-FR')} FCFA</strong> lors du retrait.
            </div>
            <button className={styles.doneBtn} onClick={handleClose}>
              Retour au menu
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
