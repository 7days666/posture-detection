import { useState, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login } from '../api/auth'
import { LogoIcon, AIDetectIcon, HealthRecordIcon, GuidanceIcon, PhoneIcon, LockIcon, ErrorIcon, CheckCircleIcon } from '../components/Icons'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const justRegistered = location.state?.registered

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!phone || !password) {
      setError('请填写完整信息')
      return
    }

    setLoading(true)
    try {
      const res = await login({ phone, password })
      if (res.data.success && res.data.token) {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        // 检查是否已完成引导
        const onboarded = localStorage.getItem('onboarded')
        navigate(onboarded ? '/home' : '/onboarding')
      } else {
        setError(res.data.message || '登录失败')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || '网络错误，请稍后重试')
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
          <div className="icon">
            <LogoIcon />
          </div>
          <h1>儿童青少年体态检测平台</h1>
          <p>专业守护孩子健康成长</p>
        </div>

        {justRegistered && (
          <div className="success-msg">
            <CheckCircleIcon />
            注册成功，请登录您的账号
          </div>
        )}

        {error && (
          <div className="error-msg">
            <ErrorIcon />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>手机号</label>
            <div className="input-wrapper">
              <span className="input-icon"><PhoneIcon /></span>
              <input
                type="tel"
                className="form-input"
                placeholder="请输入手机号"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                maxLength={11}
              />
            </div>
          </div>

          <div className="form-group">
            <label>密码</label>
            <div className="input-wrapper">
              <span className="input-icon"><LockIcon /></span>
              <input
                type="password"
                className="form-input"
                placeholder="请输入密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading && <span className="btn-spinner"></span>}
            {loading ? '登录中' : '登 录'}
          </button>
        </form>

        <div className="auth-footer">
          还没有账号？<Link to="/register">立即注册</Link>
        </div>
      </div>

      <div className="features">
        <div className="feature-item">
          <div className="icon"><AIDetectIcon /></div>
          <span>AI检测</span>
        </div>
        <div className="feature-item">
          <div className="icon"><HealthRecordIcon /></div>
          <span>健康档案</span>
        </div>
        <div className="feature-item">
          <div className="icon"><GuidanceIcon /></div>
          <span>专业指导</span>
        </div>
      </div>
    </div>
  )
}
