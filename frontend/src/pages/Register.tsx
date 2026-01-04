import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { SuccessIcon, PhoneIcon, LockIcon, ErrorIcon } from '../components/Icons'

export default function Register() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!phone || !password || !confirmPwd) {
      setError('请填写完整信息')
      return
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号')
      return
    }

    if (password.length < 6) {
      setError('密码至少6位')
      return
    }

    if (password !== confirmPwd) {
      setError('两次密码不一致')
      return
    }

    setLoading(true)
    try {
      const res = await register({ phone, password })
      if (res.data.success) {
        setShowSuccess(true)
      } else {
        setError(res.data.message || '注册失败')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || '网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleGoLogin = () => {
    navigate('/login')
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
          <div className="logo-img">
            <img src="/logo.png" alt="脊安守护" />
          </div>
          <h1>脊安守护</h1>
          <p>儿童青少年体态检测平台</p>
        </div>

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
                placeholder="请设置密码（至少6位）"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>确认密码</label>
            <div className="input-wrapper">
              <span className="input-icon"><LockIcon /></span>
              <input
                type="password"
                className="form-input"
                placeholder="请再次输入密码"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading && <span className="btn-spinner"></span>}
            {loading ? '注册中' : '注 册'}
          </button>
        </form>

        <div className="auth-footer">
          已有账号？<Link to="/login">立即登录</Link>
        </div>
      </div>

      {showSuccess && (
        <div className="modal-overlay" onClick={handleGoLogin}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">
              <SuccessIcon />
            </div>
            <h2>注册成功</h2>
            <p>恭喜您，账号注册成功！<br/>现在可以登录体验平台功能了</p>
            <button className="modal-btn" onClick={handleGoLogin}>
              立即登录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
