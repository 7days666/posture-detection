import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface ProfileData {
  ageGroup: 'child' | 'teen'
  gender: string
  birthYear: string
  age: string
  height: string
  weight: string
  // 儿童字段
  isRapidGrowth?: string
  screenTimeChild?: string
  exerciseFreqChild?: string
  dailyPosture?: string
  // 青少年字段
  schoolStage?: string
  heightGrowth?: string
  sittingHours?: string
  exerciseFreqTeen?: string
  postureSymptoms?: string
  // 共有
  spineIssues: string
  consentAgreed: boolean
}

export interface Profile extends ProfileData {
  id: number
  userId: number
}

export const saveProfile = (data: ProfileData) => {
  return api.post('/profile', data)
}

export const getProfile = () => {
  return api.get<{ success: boolean; data: Profile | null; message?: string }>('/profile')
}
