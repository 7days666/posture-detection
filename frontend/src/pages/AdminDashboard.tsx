import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsers, getStats, resetUserPassword, deleteUser } from '../api/admin'
import './AdminDashboard.css'

interface User {
  id: number
  phone: string
  password: string
  name: string
  created_at: string
  age_group?: string
  gender?: string
  age?: number
  height?: string
  weight?: string
}

interface Stats {
  totalUsers: number
  totalAssessments: number
  todayNewUsers: number
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/admin')
      return
    }
    loadData()
  }, [navigate])

  const loadData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([getUsers(), getStats()])
      if (usersRes.data.success) {
        setUsers(usersRes.data.users)
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.stats)
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return
    if (newPassword.length < 6) {
      setMessage('密码至少6位')
      return
    }
    
    setActionLoading(true)
    try {
      const res = await resetUserPassword(selectedUser.id, newPassword)
      if (res.data.success) {
        setMessage('密码重置成功')
        setShowResetModal(false)
        setNewPassword('')
        loadData()
      }
    } catch (error) {
      setMessage('重置失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    setActionLoading(true)
    try {
      const res = await deleteUser(selectedUser.id)
      if (res.data.success) {
        setMessage('用户已删除')
        setShowDeleteModal(false)
        loadData()
      }
    } catch (error) {
      setMessage('删除失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN')
  }

  const getGenderText = (gender?: string) => {
    if (gender === 'male') return '男'
    if (gender === 'female') return '女'
    return '-'
  }

  const getAgeGroupText = (ageGroup?: string) => {
    if (ageGroup === 'child') return '儿童'
    if (ageGroup === 'teen') return '青少年'
    return '-'
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>脊安守护 - 管理后台</h1>
        <button className="logout-btn" onClick={handleLogout}>退出登录</button>
      </header>

      {message && (
        <div className="admin-message" onClick={() => setMessage('')}>
          {message}
        </div>
      )}

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalUsers || 0}</div>
          <div className="stat-label">总用户数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalAssessments || 0}</div>
          <div className="stat-label">检测次数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.todayNewUsers || 0}</div>
          <div className="stat-label">今日新增</div>
        </div>
      </div>

      <div className="users-section">
        <h2>用户列表 ({users.length})</h2>
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>手机号</th>
                <th>密码(哈希)</th>
                <th>用户名</th>
                <th>年龄组</th>
                <th>性别</th>
                <th>年龄</th>
                <th>身高</th>
                <th>体重</th>
                <th>注册时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.phone}</td>
                  <td className="password-cell" title={user.password}>
                    {user.password.substring(0, 16)}...
                  </td>
                  <td>{user.name || '-'}</td>
                  <td>{getAgeGroupText(user.age_group)}</td>
                  <td>{getGenderText(user.gender)}</td>
                  <td>{user.age || '-'}</td>
                  <td>{user.height || '-'}</td>
                  <td>{user.weight || '-'}</td>
                  <td>{formatDate(user.created_at)}</td>
                  <td className="action-cell">
                    <button 
                      className="action-btn reset-btn"
                      onClick={() => {
                        setSelectedUser(user)
                        setShowResetModal(true)
                      }}
                    >
                      重置密码
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => {
                        setSelectedUser(user)
                        setShowDeleteModal(true)
                      }}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 重置密码弹窗 */}
      {showResetModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>重置密码</h3>
            <p>用户: {selectedUser.phone}</p>
            <input
              type="text"
              placeholder="输入新密码(至少6位)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="modal-input"
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowResetModal(false)}>取消</button>
              <button 
                className="confirm-btn" 
                onClick={handleResetPassword}
                disabled={actionLoading}
              >
                {actionLoading ? '处理中...' : '确认重置'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {showDeleteModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>确认删除</h3>
            <p>确定要删除用户 <strong>{selectedUser.phone}</strong> 吗？</p>
            <p className="warning-text">此操作将删除该用户的所有数据，不可恢复！</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>取消</button>
              <button 
                className="delete-confirm-btn" 
                onClick={handleDeleteUser}
                disabled={actionLoading}
              >
                {actionLoading ? '处理中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
