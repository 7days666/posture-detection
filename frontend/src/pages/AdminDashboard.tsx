import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsers, getStats, resetUserPassword, deleteUser, getAssessments, deleteAssessment, cleanupBadData, clearUserAssessments } from '../api/admin'
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

interface Assessment {
  id: number
  user_id: number
  overall_score: number
  risk_level: string
  head_forward_angle?: number
  shoulder_level_diff?: number
  spine_curvature?: number
  pelvis_tilt?: number
  created_at: string
  phone?: string
  name?: string
}

interface Stats {
  totalUsers: number
  totalAssessments: number
  todayNewUsers: number
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'users' | 'assessments'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
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
      const [usersRes, statsRes, assessmentsRes] = await Promise.all([
        getUsers(), 
        getStats(),
        getAssessments()
      ])
      if (usersRes.data.success) {
        setUsers(usersRes.data.users)
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.stats)
      }
      if (assessmentsRes.data.success) {
        setAssessments(assessmentsRes.data.assessments)
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

  // 删除单条检测记录
  const handleDeleteAssessment = async (id: number) => {
    if (!confirm('确定删除这条检测记录吗？')) return
    
    try {
      const res = await deleteAssessment(id)
      if (res.data.success) {
        setMessage('检测记录已删除')
        loadData()
      }
    } catch (error) {
      setMessage('删除失败')
    }
  }

  // 清理异常数据
  const handleCleanupBadData = async () => {
    if (!confirm('确定清理所有异常数据吗？（评分>=95但指标异常的记录）')) return
    
    setActionLoading(true)
    try {
      const res = await cleanupBadData()
      if (res.data.success) {
        setMessage(res.data.message)
        loadData()
      }
    } catch (error) {
      setMessage('清理失败')
    } finally {
      setActionLoading(false)
    }
  }

  // 清理用户的所有检测记录
  const handleClearUserAssessments = async (userId: number, phone: string) => {
    if (!confirm(`确定清理用户 ${phone} 的所有检测记录吗？`)) return
    
    try {
      const res = await clearUserAssessments(userId)
      if (res.data.success) {
        setMessage('已清理该用户的检测记录')
        loadData()
      }
    } catch (error) {
      setMessage('清理失败')
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

      {/* 标签页切换 */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          用户管理
        </button>
        <button 
          className={`tab-btn ${activeTab === 'assessments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assessments')}
        >
          检测数据
        </button>
      </div>

      {/* 用户列表 */}
      {activeTab === 'users' && (
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
                    <button 
                      className="action-btn clear-btn"
                      onClick={() => handleClearUserAssessments(user.id, user.phone)}
                    >
                      清检测
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* 检测数据管理 */}
      {activeTab === 'assessments' && (
      <div className="assessments-section">
        <div className="section-header">
          <h2>检测记录 ({assessments.length})</h2>
          <button 
            className="cleanup-btn"
            onClick={handleCleanupBadData}
            disabled={actionLoading}
          >
            {actionLoading ? '处理中...' : '清理异常数据'}
          </button>
        </div>
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>用户</th>
                <th>评分</th>
                <th>风险</th>
                <th>头部前倾</th>
                <th>肩膀高低差</th>
                <th>脊柱弯曲</th>
                <th>骨盆倾斜</th>
                <th>检测时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map(a => {
                // 判断是否是异常数据
                const isBad = a.overall_score >= 95 && (
                  (a.head_forward_angle && a.head_forward_angle > 15) ||
                  (a.shoulder_level_diff && a.shoulder_level_diff > 3) ||
                  (a.spine_curvature && a.spine_curvature > 15) ||
                  (a.pelvis_tilt && a.pelvis_tilt > 10)
                )
                return (
                <tr key={a.id} className={isBad ? 'bad-row' : ''}>
                  <td>{a.id}</td>
                  <td>{a.phone || a.user_id}</td>
                  <td className={a.overall_score >= 80 ? 'score-good' : a.overall_score >= 60 ? 'score-warn' : 'score-bad'}>
                    {a.overall_score}
                  </td>
                  <td>{a.risk_level === 'low' ? '低' : a.risk_level === 'medium' ? '中' : '高'}</td>
                  <td>{a.head_forward_angle?.toFixed(1) || '-'}°</td>
                  <td>{a.shoulder_level_diff?.toFixed(1) || '-'}cm</td>
                  <td>{a.spine_curvature?.toFixed(1) || '-'}°</td>
                  <td>{a.pelvis_tilt?.toFixed(1) || '-'}°</td>
                  <td>{formatDate(a.created_at)}</td>
                  <td>{isBad ? <span className="bad-tag">异常</span> : <span className="ok-tag">正常</span>}</td>
                  <td>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteAssessment(a.id)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

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
