import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Profile from './pages/Profile'
import AIDetect from './pages/AIDetect'

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
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App
