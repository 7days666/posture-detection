import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Profile from './pages/Profile'
import AIDetect from './pages/AIDetect'
import HealthEducation from './pages/HealthEducation'
import DataTracking from './pages/DataTracking'
import HealthReport from './pages/HealthReport'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import PointsShop from './pages/PointsShop'
import Maintenance from './pages/Maintenance'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

// 检查是否需要引导流程
function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  const onboarded = localStorage.getItem('onboarded')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  if (!onboarded) {
    return <Navigate to="/onboarding" replace />
  }
  
  return <>{children}</>
}

// 检查是否已登录
function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  const [siteOpen, setSiteOpen] = useState<boolean | null>(null)
  
  useEffect(() => {
    // 检查站点状态
    const checkSite = async () => {
      try {
        const res = await axios.get(`${API_BASE}/admin/check-site`)
        setSiteOpen(res.data.isOpen !== false)
      } catch {
        setSiteOpen(true) // 出错时默认开放
      }
    }
    checkSite()
  }, [])
  
  // 加载中
  if (siteOpen === null) {
    return null
  }
  
  // 站点关闭时，只允许访问管理后台
  if (!siteOpen) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Maintenance />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={
        <RequireAuth>
          <Onboarding />
        </RequireAuth>
      } />
      <Route path="/home" element={
        <RequireOnboarding>
          <Home />
        </RequireOnboarding>
      } />
      <Route path="/profile" element={
        <RequireOnboarding>
          <Profile />
        </RequireOnboarding>
      } />
      <Route path="/ai-detect" element={
        <RequireOnboarding>
          <AIDetect />
        </RequireOnboarding>
      } />
      <Route path="/education" element={
        <RequireOnboarding>
          <HealthEducation />
        </RequireOnboarding>
      } />
      <Route path="/tracking" element={
        <RequireOnboarding>
          <DataTracking />
        </RequireOnboarding>
      } />
      <Route path="/report" element={
        <RequireOnboarding>
          <HealthReport />
        </RequireOnboarding>
      } />
      <Route path="/health-report" element={
        <RequireOnboarding>
          <HealthReport />
        </RequireOnboarding>
      } />
      <Route path="/points" element={
        <RequireOnboarding>
          <PointsShop />
        </RequireOnboarding>
      } />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App
