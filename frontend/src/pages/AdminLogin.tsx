import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../api/admin'
import { LockIcon, ErrorIcon } from '../components/Icons'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!password) {
      setError('请输入管理员密码')
      return
    }

    setLoading(true)
    try {
      const res = await adminLogin(password)
      if (res.data.success && res.data.token) {
        localStorage.setItem('adminToken', res.data.token)
        navigate('/admin/dashboard')
      } else {
        setError(res.data.message || '登录失败')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || '密码错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="admin-icon">
            <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#4ecdc4"/>
            </svg>
          </div>
          <h1>管理员后台</h1>
          <p>脊安守护管理系统</p>
        </div>

        {error && (
          <div className="error-msg">
            <ErrorIcon />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>管理员密码</label>
            <div className="input-wrapper">
              <span className="input-icon"><LockIcon /></span>
              <input
                type="password"
                className="form-input"
                placeholder="请输入管理员密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading && <span className="btn-spinner"></span>}
            {loading ? '登录中' : '进入后台'}
          </button>
        </form>

        <div className="auth-footer">
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: '#4ecdc4' }}>
            返回用户登录
          </span>
        </div>
      </div>
    </div>
  )
}
