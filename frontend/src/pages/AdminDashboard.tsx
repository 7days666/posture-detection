import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsers, getStats, resetUserPassword, deleteUser, getAssessments, deleteAssessment, cleanupBadData, clearUserAssessments, getAdminProducts, createProduct, updateProduct, deleteProduct, getAdminOrders, updateOrderStatus, getMakeupRequests, reviewMakeupRequest, getPointsStats, getSiteStatus, setSiteStatus } from '../api/admin'
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

interface Product {
  id: number
  name: string
  description: string | null
  imageUrl: string | null
  pointsRequired: number
  minConsecutiveMonths: number
  stock: number
  category: string | null
  isActive: boolean
  sortOrder: number
}

interface Order {
  id: number
  userId: number
  productName: string
  pointsSpent: number
  quantity: number
  status: string
  shippingInfo: any
  userPhone: string
  userName: string
  createdAt: string
}

interface MakeupRequest {
  id: number
  userId: number
  targetMonth: string
  status: string
  userPhone: string
  userName: string
  createdAt: string
}

interface PointsStats {
  totalPointsInCirculation: number
  totalPointsRedeemed: number
  pendingOrders: number
  pendingMakeupRequests: number
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'users' | 'assessments' | 'products' | 'orders' | 'makeup'>('users')
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
  
  // 商品管理状态
  const [products, setProducts] = useState<Product[]>([])
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    pointsRequired: 30,
    minConsecutiveMonths: 3,
    stock: 10,
    category: '',
    sortOrder: 0
  })
  
  // 订单管理状态
  const [orders, setOrders] = useState<Order[]>([])
  const [pointsStats, setPointsStats] = useState<PointsStats | null>(null)
  
  // 补测申请状态
  const [makeupRequests, setMakeupRequests] = useState<MakeupRequest[]>([])
  
  // 站点状态
  const [siteOpen, setSiteOpen] = useState(true)

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
      // 分别加载数据，避免一个失败导致全部失败
      try {
        const usersRes = await getUsers()
        if (usersRes.data.success) {
          setUsers(usersRes.data.users)
        }
      } catch (e) { console.error('加载用户失败:', e) }

      try {
        const statsRes = await getStats()
        if (statsRes.data.success) {
          setStats(statsRes.data.stats)
        }
      } catch (e) { console.error('加载统计失败:', e) }

      try {
        const assessmentsRes = await getAssessments()
        if (assessmentsRes.data.success) {
          setAssessments(assessmentsRes.data.assessments)
        }
      } catch (e) { console.error('加载检测数据失败:', e) }

      try {
        const productsRes = await getAdminProducts()
        if (productsRes.data.success) {
          setProducts(productsRes.data.products)
        }
      } catch (e) { console.error('加载商品失败:', e) }

      try {
        const ordersRes = await getAdminOrders()
        if (ordersRes.data.success) {
          setOrders(ordersRes.data.orders)
        }
      } catch (e) { console.error('加载订单失败:', e) }

      try {
        const makeupRes = await getMakeupRequests()
        if (makeupRes.data.success) {
          setMakeupRequests(makeupRes.data.requests)
        }
      } catch (e) { console.error('加载补测申请失败:', e) }

      try {
        const pointsStatsRes = await getPointsStats()
        if (pointsStatsRes.data.success) {
          setPointsStats(pointsStatsRes.data.stats)
        }
      } catch (e) { console.error('加载积分统计失败:', e) }

      try {
        const siteRes = await getSiteStatus()
        if (siteRes.data.success) {
          setSiteOpen(siteRes.data.status === 'open')
        }
      } catch (e) { console.error('加载站点状态失败:', e) }
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
    if (!confirm('确定清理所有异常数据吗？\n\n将清理以下数据：\n1. 评分>=95但指标异常的记录\n2. 指标全为空的无效记录（检测失败的数据）')) return
    
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

  // ========== 商品管理 ==========
  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.pointsRequired) {
      setMessage('商品名称和所需积分必填')
      return
    }
    
    setActionLoading(true)
    try {
      if (editingProduct) {
        const res = await updateProduct(editingProduct.id, productForm)
        if (res.data.success) {
          setMessage('商品更新成功')
        }
      } else {
        const res = await createProduct(productForm)
        if (res.data.success) {
          setMessage('商品创建成功')
        }
      }
      setShowProductModal(false)
      setEditingProduct(null)
      setProductForm({
        name: '',
        description: '',
        imageUrl: '',
        pointsRequired: 30,
        minConsecutiveMonths: 3,
        stock: 10,
        category: '',
        sortOrder: 0
      })
      loadData()
    } catch (error) {
      setMessage('操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      pointsRequired: product.pointsRequired,
      minConsecutiveMonths: product.minConsecutiveMonths,
      stock: product.stock,
      category: product.category || '',
      sortOrder: product.sortOrder
    })
    setShowProductModal(true)
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('确定删除此商品吗？')) return
    
    try {
      const res = await deleteProduct(productId)
      if (res.data.success) {
        setMessage('商品已删除')
        loadData()
      }
    } catch (error) {
      setMessage('删除失败')
    }
  }

  const handleToggleProductActive = async (product: Product) => {
    try {
      const res = await updateProduct(product.id, { isActive: !product.isActive })
      if (res.data.success) {
        setMessage(product.isActive ? '商品已下架' : '商品已上架')
        loadData()
      }
    } catch (error) {
      setMessage('操作失败')
    }
  }

  // ========== 订单管理 ==========
  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await updateOrderStatus(orderId, status)
      if (res.data.success) {
        setMessage('订单状态已更新')
        loadData()
      }
    } catch (error) {
      setMessage('更新失败')
    }
  }

  // ========== 补测申请管理 ==========
  const handleReviewMakeup = async (requestId: number, approved: boolean) => {
    const reason = approved ? undefined : prompt('请输入拒绝原因') || undefined
    if (!approved && !reason) return
    
    try {
      const res = await reviewMakeupRequest(requestId, approved, reason)
      if (res.data.success) {
        setMessage(approved ? '已批准补测申请' : '已拒绝补测申请')
        loadData()
      }
    } catch (error) {
      setMessage('操作失败')
    }
  }

  // ========== 站点管理 ==========
  const handleToggleSite = async () => {
    const newStatus = siteOpen ? 'closed' : 'open'
    const confirmMsg = siteOpen 
      ? '确定要关闭站点吗？关闭后用户将无法访问。' 
      : '确定要开启站点吗？'
    
    if (!confirm(confirmMsg)) return
    
    setActionLoading(true)
    try {
      const res = await setSiteStatus(newStatus)
      if (res.data.success) {
        setSiteOpen(newStatus === 'open')
        setMessage(res.data.message)
      }
    } catch (error) {
      setMessage('操作失败')
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
    if (ageGroup === 'youth') return '青年'
    return '-'
  }

  const getOrderStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      shipped: '已发货',
      completed: '已完成',
      cancelled: '已取消'
    }
    return map[status] || status
  }

  const getMakeupStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待审核',
      approved: '已批准',
      rejected: '已拒绝'
    }
    return map[status] || status
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
        <div className="header-actions">
          <button 
            className={`site-toggle-btn ${siteOpen ? 'site-open' : 'site-closed'}`}
            onClick={handleToggleSite}
            disabled={actionLoading}
          >
            {siteOpen ? '🟢 站点运行中' : '🔴 站点已关闭'}
          </button>
          <button className="logout-btn" onClick={handleLogout}>退出登录</button>
        </div>
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
        <div className="stat-card">
          <div className="stat-value">{pointsStats?.totalPointsInCirculation || 0}</div>
          <div className="stat-label">流通积分</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pointsStats?.pendingOrders || 0}</div>
          <div className="stat-label">待处理订单</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pointsStats?.pendingMakeupRequests || 0}</div>
          <div className="stat-label">待审补测</div>
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
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          商品管理
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          兑换订单
        </button>
        <button 
          className={`tab-btn ${activeTab === 'makeup' ? 'active' : ''}`}
          onClick={() => setActiveTab('makeup')}
        >
          补测申请
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
                const isBadScore = a.overall_score >= 95 && (
                  (a.head_forward_angle && a.head_forward_angle > 15) ||
                  (a.shoulder_level_diff && a.shoulder_level_diff > 3) ||
                  (a.spine_curvature && a.spine_curvature > 15) ||
                  (a.pelvis_tilt && a.pelvis_tilt > 10)
                )
                // 判断是否是指标全为空的无效数据
                const isEmpty = !a.head_forward_angle && !a.shoulder_level_diff && !a.spine_curvature && !a.pelvis_tilt
                const isBad = isBadScore || isEmpty
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
                  <td>{isBad ? <span className="bad-tag">{isEmpty ? '无效' : '异常'}</span> : <span className="ok-tag">正常</span>}</td>
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

      {/* 商品管理 */}
      {activeTab === 'products' && (
        <div className="products-section">
          <div className="section-header">
            <h2>商品管理 ({products.length})</h2>
            <button 
              className="add-btn"
              onClick={() => {
                setEditingProduct(null)
                setProductForm({
                  name: '',
                  description: '',
                  imageUrl: '',
                  pointsRequired: 30,
                  minConsecutiveMonths: 3,
                  stock: 10,
                  category: '',
                  sortOrder: 0
                })
                setShowProductModal(true)
              }}
            >
              添加商品
            </button>
          </div>
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>图片</th>
                  <th>名称</th>
                  <th>所需积分</th>
                  <th>最低月数</th>
                  <th>库存</th>
                  <th>分类</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="product-thumb" />
                      ) : (
                        <span className="no-image">无图</span>
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>{product.pointsRequired}</td>
                    <td>{product.minConsecutiveMonths}个月</td>
                    <td>{product.stock}</td>
                    <td>{product.category || '-'}</td>
                    <td>
                      <span className={product.isActive ? 'ok-tag' : 'bad-tag'}>
                        {product.isActive ? '上架' : '下架'}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button className="action-btn reset-btn" onClick={() => handleEditProduct(product)}>
                        编辑
                      </button>
                      <button className="action-btn clear-btn" onClick={() => handleToggleProductActive(product)}>
                        {product.isActive ? '下架' : '上架'}
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteProduct(product.id)}>
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 兑换订单管理 */}
      {activeTab === 'orders' && (
        <div className="orders-section">
          <div className="section-header">
            <h2>兑换订单 ({orders.length})</h2>
          </div>
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>订单ID</th>
                  <th>用户</th>
                  <th>商品</th>
                  <th>积分</th>
                  <th>数量</th>
                  <th>收货信息</th>
                  <th>状态</th>
                  <th>时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.userPhone}</td>
                    <td>{order.productName}</td>
                    <td>{order.pointsSpent}</td>
                    <td>{order.quantity}</td>
                    <td className="shipping-cell">
                      {order.shippingInfo ? (
                        <span title={`${order.shippingInfo.name} ${order.shippingInfo.phone} ${order.shippingInfo.address}`}>
                          {order.shippingInfo.name} - {order.shippingInfo.address?.substring(0, 20)}...
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <span className={`status-tag status-${order.status}`}>
                        {getOrderStatusText(order.status)}
                      </span>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td className="action-cell">
                      {order.status === 'pending' && (
                        <button className="action-btn reset-btn" onClick={() => handleUpdateOrderStatus(order.id, 'processing')}>
                          处理
                        </button>
                      )}
                      {order.status === 'processing' && (
                        <button className="action-btn reset-btn" onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}>
                          发货
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button className="action-btn reset-btn" onClick={() => handleUpdateOrderStatus(order.id, 'completed')}>
                          完成
                        </button>
                      )}
                      {['pending', 'processing'].includes(order.status) && (
                        <button className="action-btn delete-btn" onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}>
                          取消
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 补测申请管理 */}
      {activeTab === 'makeup' && (
        <div className="makeup-section">
          <div className="section-header">
            <h2>补测申请 ({makeupRequests.length})</h2>
          </div>
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>用户</th>
                  <th>补测月份</th>
                  <th>状态</th>
                  <th>申请时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {makeupRequests.map(request => (
                  <tr key={request.id}>
                    <td>{request.id}</td>
                    <td>{request.userPhone}</td>
                    <td>{request.targetMonth}</td>
                    <td>
                      <span className={`status-tag status-${request.status}`}>
                        {getMakeupStatusText(request.status)}
                      </span>
                    </td>
                    <td>{formatDate(request.createdAt)}</td>
                    <td className="action-cell">
                      {request.status === 'pending' && (
                        <>
                          <button className="action-btn reset-btn" onClick={() => handleReviewMakeup(request.id, true)}>
                            批准
                          </button>
                          <button className="action-btn delete-btn" onClick={() => handleReviewMakeup(request.id, false)}>
                            拒绝
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 商品编辑弹窗 */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content product-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingProduct ? '编辑商品' : '添加商品'}</h3>
            <div className="product-form">
              <input
                type="text"
                placeholder="商品名称 *"
                value={productForm.name}
                onChange={e => setProductForm({...productForm, name: e.target.value})}
                className="modal-input"
              />
              <textarea
                placeholder="商品描述"
                value={productForm.description}
                onChange={e => setProductForm({...productForm, description: e.target.value})}
                className="modal-input"
              />
              <input
                type="text"
                placeholder="图片URL"
                value={productForm.imageUrl}
                onChange={e => setProductForm({...productForm, imageUrl: e.target.value})}
                className="modal-input"
              />
              <div className="form-row">
                <div className="form-group">
                  <label>所需积分 *</label>
                  <input
                    type="number"
                    value={productForm.pointsRequired}
                    onChange={e => setProductForm({...productForm, pointsRequired: parseInt(e.target.value) || 0})}
                    className="modal-input"
                  />
                </div>
                <div className="form-group">
                  <label>最低连续月数</label>
                  <input
                    type="number"
                    value={productForm.minConsecutiveMonths}
                    onChange={e => setProductForm({...productForm, minConsecutiveMonths: parseInt(e.target.value) || 3})}
                    className="modal-input"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>库存</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value) || 0})}
                    className="modal-input"
                  />
                </div>
                <div className="form-group">
                  <label>分类</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={e => setProductForm({...productForm, category: e.target.value})}
                    className="modal-input"
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowProductModal(false)}>取消</button>
              <button 
                className="confirm-btn" 
                onClick={handleSaveProduct}
                disabled={actionLoading}
              >
                {actionLoading ? '处理中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
