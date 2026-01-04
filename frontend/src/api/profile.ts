import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

// 请求拦截器添加 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface ProfileData {
  ageGroup: 'child' | 'teen'
  gender: 'male' | 'female'
  age: string
  height: string
  weight: string
  grade: string
  sittingHours: string
  screenTime: string
  sleepHours: string
  exerciseFrequency: string
  hasSpineIssue: string
}

export interface Profile extends ProfileData {
  id: number
  userId: number
  createdAt: string
  updatedAt: string
}

export interface ProfileResponse {
  success: boolean
  message?: string
  data: Profile | null
}

export const getProfile = () => 
  api.get<ProfileResponse>('/profile')

export const saveProfile = (data: ProfileData) => 
  api.post<ProfileResponse>('/profile', data)

export const updateProfile = (data: Partial<ProfileData>) => 
  api.put<ProfileResponse>('/profile', data)
