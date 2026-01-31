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
