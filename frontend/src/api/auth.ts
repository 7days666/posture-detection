import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

export interface LoginData {
  phone: string
  password: string
}

export interface RegisterData {
  phone: string
  password: string
  name: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: {
    id: number
    phone: string
    name: string
  }
}

export const login = (data: LoginData) => 
  api.post<AuthResponse>('/auth/login', data)

export const register = (data: RegisterData) => 
  api.post<AuthResponse>('/auth/register', data)
