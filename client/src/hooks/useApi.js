import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

export const getProducts = () => api.get('/products').then(r => r.data)
export const getProductsAll = () => api.get('/products/all').then(r => r.data)
export const addProduct = (payload) => api.post('/products', payload).then(r => r.data)
export const deleteProduct = (id) => api.delete(`/products/${id}`).then(r => r.data)
export const toggleProductAvailability = (id) => api.patch(`/products/${id}/availability`).then(r => r.data)

export const createOrder = (payload) => api.post('/orders', payload).then(r => r.data)
export const getOrders = () => api.get('/orders').then(r => r.data)
export const getOrderByTicket = (ticketNumber) =>
  api.get(`/orders/ticket/${encodeURIComponent(ticketNumber)}`).then(r => r.data)
export const getStudentOrders = (studentId) =>
  api.get(`/orders?studentId=${encodeURIComponent(studentId)}`).then(r => r.data)
export const updateStatus = (id, status) =>
  api.patch(`/orders/${id}/status`, { status }).then(r => r.data)
export const deleteOrder = (id) => api.delete(`/orders/${id}`).then(r => r.data)

export default api
