import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 体态检测相关API
export const assessmentAPI = {
  // 保存检测结果
  save: async (data: {
    overall_score: number
    head_forward_angle?: number
    shoulder_level_diff?: number
    spine_curvature?: number
    pelvis_tilt?: number
    risk_level: string
    keypoints_data?: any
    ai_suggestions?: string
  }) => {
    const response = await api.post('/api/assessments', data)
    return response.data
  },

  // 获取检测历史
  getHistory: async (limit = 20, offset = 0) => {
    const response = await api.get(`/api/assessments/history?limit=${limit}&offset=${offset}`)
    return response.data
  },

  // 获取最新检测结果
  getLatest: async () => {
    const response = await api.get('/api/assessments/latest')
    return response.data
  },

  // 获取统计数据
  getStats: async () => {
    const response = await api.get('/api/assessments/stats')
    return response.data
  }
}

// 运动记录相关API
export const exerciseAPI = {
  // 记录运动
  save: async (data: {
    exercise_type: string
    exercise_name?: string
    duration_minutes: number
    completion_rate?: number
    calories_burned?: number
    difficulty_level?: string
    user_rating?: number
    notes?: string
  }) => {
    const response = await api.post('/api/exercises', data)
    return response.data
  },

  // 获取运动历史
  getHistory: async (limit = 20, offset = 0) => {
    const response = await api.get(`/api/exercises/history?limit=${limit}&offset=${offset}`)
    return response.data
  },

  // 获取运动统计
  getStats: async () => {
    const response = await api.get('/api/exercises/stats')
    return response.data
  }
}

// 健康教育相关API
export const educationAPI = {
  // 获取教育内容列表
  getContents: async (category?: string, type?: string) => {
    let url = '/api/education/contents'
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (type) params.append('type', type)
    if (params.toString()) url += `?${params.toString()}`
    const response = await api.get(url)
    return response.data
  },

  // 获取单个内容详情
  getContent: async (id: string) => {
    const response = await api.get(`/api/education/contents/${id}`)
    return response.data
  },

  // 记录学习进度
  saveProgress: async (data: {
    content_id: string
    content_type: string
    content_title?: string
    progress: number
    duration_seconds?: number
  }) => {
    const response = await api.post('/api/education/progress', data)
    return response.data
  },

  // 获取我的学习记录
  getMyProgress: async () => {
    const response = await api.get('/api/education/my-progress')
    return response.data
  },

  // 获取推荐内容
  getRecommendations: async () => {
    const response = await api.get('/api/education/recommendations')
    return response.data
  }
}

// AI预测相关API
export const predictionAPI = {
  // 获取AI预测分析
  analyze: async () => {
    const response = await api.get('/api/predictions/analyze')
    return response.data
  },

  // 获取仪表盘数据
  getDashboard: async () => {
    const response = await api.get('/api/predictions/dashboard')
    return response.data
  }
}

export default api
