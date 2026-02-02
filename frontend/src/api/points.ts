/**
 * 积分系统 API
 */

import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// 获取积分概览
export const getPointsSummary = () => {
  return axios.get(`${API_BASE}/points/summary`, {
    headers: getAuthHeader()
  })
}

// 获取积分历史
export const getPointsHistory = (limit = 20, offset = 0) => {
  return axios.get(`${API_BASE}/points/history`, {
    headers: getAuthHeader(),
    params: { limit, offset }
  })
}

// 获取商品列表
export const getProducts = (category?: string) => {
  return axios.get(`${API_BASE}/points/products`, {
    headers: getAuthHeader(),
    params: category ? { category } : {}
  })
}

// 兑换商品
export const redeemProduct = (productId: number, quantity: number, shippingInfo: {
  name: string
  phone: string
  address: string
  postalCode?: string
  notes?: string
}) => {
  return axios.post(`${API_BASE}/points/redeem`, {
    productId,
    quantity,
    shippingInfo
  }, {
    headers: getAuthHeader()
  })
}

// 获取兑换订单
export const getOrders = () => {
  return axios.get(`${API_BASE}/points/orders`, {
    headers: getAuthHeader()
  })
}

// 检查补测资格
export const checkMakeupEligibility = () => {
  return axios.get(`${API_BASE}/points/makeup/check`, {
    headers: getAuthHeader()
  })
}

// 申请补测
export const applyMakeup = () => {
  return axios.post(`${API_BASE}/points/makeup/apply`, {}, {
    headers: getAuthHeader()
  })
}

// 获取补测申请记录
export const getMakeupRequests = () => {
  return axios.get(`${API_BASE}/points/makeup/requests`, {
    headers: getAuthHeader()
  })
}
