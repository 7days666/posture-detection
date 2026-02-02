import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const getAdminToken = () => localStorage.getItem('adminToken')

const adminApi = axios.create({
  baseURL: API_BASE,
})

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 管理员登录
export const adminLogin = (password: string) => {
  return adminApi.post('/admin/login', { password })
}

// 获取所有用户
export const getUsers = () => {
  return adminApi.get('/admin/users')
}

// 获取用户详情
export const getUserDetail = (userId: number) => {
  return adminApi.get(`/admin/users/${userId}`)
}

// 重置用户密码
export const resetUserPassword = (userId: number, newPassword: string) => {
  return adminApi.post(`/admin/users/${userId}/reset-password`, { newPassword })
}

// 删除用户
export const deleteUser = (userId: number) => {
  return adminApi.delete(`/admin/users/${userId}`)
}

// 获取统计数据
export const getStats = () => {
  return adminApi.get('/admin/stats')
}

// ========== 数据库管理 ==========

// 获取所有检测记录
export const getAssessments = () => {
  return adminApi.get('/admin/assessments')
}

// 删除单条检测记录
export const deleteAssessment = (assessmentId: number) => {
  return adminApi.delete(`/admin/assessments/${assessmentId}`)
}

// 清理异常数据
export const cleanupBadData = () => {
  return adminApi.post('/admin/assessments/cleanup')
}

// 清理用户的所有检测记录
export const clearUserAssessments = (userId: number) => {
  return adminApi.delete(`/admin/users/${userId}/assessments`)
}

// 调试：查看数据库实际值
export const debugAssessments = () => {
  return adminApi.get('/admin/assessments/debug')
}


// ========== 积分商品管理 ==========

// 获取所有商品
export const getAdminProducts = () => {
  return adminApi.get('/admin/products')
}

// 创建商品
export const createProduct = (data: {
  name: string
  description?: string
  imageUrl?: string
  pointsRequired: number
  minConsecutiveMonths?: number
  stock?: number
  category?: string
  sortOrder?: number
}) => {
  return adminApi.post('/admin/products', data)
}

// 更新商品
export const updateProduct = (productId: number, data: {
  name?: string
  description?: string
  imageUrl?: string
  pointsRequired?: number
  minConsecutiveMonths?: number
  stock?: number
  category?: string
  isActive?: boolean
  sortOrder?: number
}) => {
  return adminApi.put(`/admin/products/${productId}`, data)
}

// 删除商品
export const deleteProduct = (productId: number) => {
  return adminApi.delete(`/admin/products/${productId}`)
}

// ========== 兑换订单管理 ==========

// 获取所有订单
export const getAdminOrders = (status?: string) => {
  return adminApi.get('/admin/orders', { params: status ? { status } : {} })
}

// 更新订单状态
export const updateOrderStatus = (orderId: number, status: string, adminNotes?: string) => {
  return adminApi.put(`/admin/orders/${orderId}/status`, { status, adminNotes })
}

// ========== 补测申请管理 ==========

// 获取所有补测申请
export const getMakeupRequests = (status?: string) => {
  return adminApi.get('/admin/makeup-requests', { params: status ? { status } : {} })
}

// 审核补测申请
export const reviewMakeupRequest = (requestId: number, approved: boolean, rejectReason?: string) => {
  return adminApi.put(`/admin/makeup-requests/${requestId}/review`, { approved, rejectReason })
}

// ========== 积分统计 ==========

// 获取积分统计
export const getPointsStats = () => {
  return adminApi.get('/admin/points-stats')
}
