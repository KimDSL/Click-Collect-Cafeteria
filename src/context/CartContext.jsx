import { createContext, useContext, useReducer } from 'react'

const CartContext = createContext(null)

const initialState = { items: [] }

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i._id === action.product._id)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i._id === action.product._id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        }
      }
      return { ...state, items: [...state.items, { ...action.product, quantity: 1 }] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i._id !== action.id) }

    case 'UPDATE_QTY': {
      const qty = Math.max(0, action.qty)
      if (qty === 0)
        return { ...state, items: state.items.filter(i => i._id !== action.id) }
      return {
        ...state,
        items: state.items.map(i =>
          i._id === action.id ? { ...i, quantity: qty } : i
        )
      }
    }
    case 'CLEAR':
      return initialState

    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const addItem    = (product) => dispatch({ type: 'ADD_ITEM', product })
  const removeItem = (id)      => dispatch({ type: 'REMOVE_ITEM', id })
  const updateQty  = (id, qty) => dispatch({ type: 'UPDATE_QTY', id, qty })
  const clearCart  = ()        => dispatch({ type: 'CLEAR' })

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = state.items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items: state.items,
      totalItems,
      totalPrice,
      addItem,
      removeItem,
      updateQty,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
