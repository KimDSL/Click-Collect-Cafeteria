import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Products
export const getProducts = () => api.get('/products').then(r => r.data)

// Orders
export const createOrder  = (payload) => api.post('/orders', payload).then(r => r.data)
export const getOrders    = ()         => api.get('/orders').then(r => r.data)
export const updateStatus = (id, status) =>
  api.patch(`/orders/${id}/status`, { status }).then(r => r.data)

export default api