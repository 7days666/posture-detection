import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPointsSummary, getProducts, getPointsHistory, redeemProduct, getOrders, checkMakeupEligibility, applyMakeup } from '../api/points'
import TabBar from '../components/TabBar'
import './PointsShop.css'

interface PointsSummary {
  balance: number
  consecutiveMonths: number
  nextReward: number
  canRedeem: boolean
  totalEarned: number
  totalSpent: number
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
}

interface PointsLog {
  id: number
  changeType: string
  changeAmount: number
  balanceAfter: number
  description: string | null
  createdAt: string
}

interface Order {
  id: number
  productName: string
  pointsSpent: number
  quantity: number
  status: string
  createdAt: string
}

export default function PointsShop() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'shop' | 'history' | 'orders'>('shop')
  const [summary, setSummary] = useState<PointsSummary | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [history, setHistory] = useState<PointsLog[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showRedeemModal, setShowRedeemModal] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  })
  const [message, setMessage] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [canMakeup, setCanMakeup] = useState(false)
  const [makeupReason, setMakeupReason] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    loadData()
  }, [navigate])

  const loadData = async () => {
    try {
      const [summaryRes, productsRes] = await Promise.all([
        getPointsSummary(),
        getProducts()
      ])
      
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.summary)
      }
      if (productsRes.data.success) {
        setProducts(productsRes.data.products)
      }

      // 检查补测资格
      try {
        const makeupRes = await checkMakeupEligibility()
        if (makeupRes.data.success) {
          setCanMakeup(makeupRes.data.canApply)
          setMakeupReason(makeupRes.data.reason || '')
        }
      } catch (e) {
        // 忽略补测检查错误
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      const res = await getPointsHistory()
      if (res.data.success) {
        setHistory(res.data.logs)
      }
    } catch (error) {
      console.error('加载历史失败:', error)
    }
  }

  const loadOrders = async () => {
    try {
      const res = await getOrders()
      if (res.data.success) {
        setOrders(res.data.orders)
      }
    } catch (error) {
      console.error('加载订单失败:', error)
    }
  }

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory()
    } else if (activeTab === 'orders') {
      loadOrders()
    }
  }, [activeTab])

  const handleRedeem = async () => {
    if (!selectedProduct) return
    
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      setMessage('请填写完整收货信息')
      return
    }

    setActionLoading(true)
    try {
      const res = await redeemProduct(selectedProduct.id, 1, shippingInfo)
      if (res.data.success) {
        setMessage(`兑换成功！消耗${res.data.pointsSpent}积分`)
        setShowRedeemModal(false)
        setSelectedProduct(null)
        setShippingInfo({ name: '', phone: '', address: '', notes: '' })
        loadData()
      } else {
        setMessage(res.data.message || '兑换失败')
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || '兑换失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleApplyMakeup = async () => {
    setActionLoading(true)
    try {
      const res = await applyMakeup()
      if (res.data.success) {
        setMessage('补测申请已提交')
        setCanMakeup(false)
      } else {
        setMessage(res.data.message || '申请失败')
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || '申请失败')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      shipped: '已发货',
      completed: '已完成',
      cancelled: '已取消'
    }
    return map[status] || status
  }

  const getChangeTypeText = (type: string) => {
    const map: Record<string, string> = {
      detection: '检测奖励',
      makeup: '补测奖励',
      redeem: '积分兑换',
      admin_adjust: '管理员调整'
    }
    return map[type] || type
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN')
  }

  if (loading) {
    return (
      <div className="points-loading">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="points-shop">
      {message && (
        <div className="points-message" onClick={() => setMessage('')}>
          {message}
        </div>
      )}

      {/* 积分概览卡片 */}
      <div className="points-summary-card">
        <div className="points-balance">
          <span className="label">当前积分</span>
          <span className="value">{summary?.balance || 0}</span>
        </div>
        <div className="points-info">
          <div className="info-item">
            <span className="label">连续检测</span>
            <span className="value">{summary?.consecutiveMonths || 0}个月</span>
          </div>
          <div className="info-item">
            <span className="label">下次奖励</span>
            <span className="value">+{summary?.nextReward || 10}分</span>
          </div>
          <div className="info-item">
            <span className="label">兑换资格</span>
            <span className={`value ${summary?.canRedeem ? 'can-redeem' : 'cannot-redeem'}`}>
              {summary?.canRedeem ? '已达标' : `还需${3 - (summary?.consecutiveMonths || 0)}个月`}
            </span>
          </div>
        </div>
        {canMakeup && (
          <button className="makeup-btn" onClick={handleApplyMakeup} disabled={actionLoading}>
            申请补测
          </button>
        )}
        {makeupReason && !canMakeup && (
          <div className="makeup-hint">{makeupReason}</div>
        )}
      </div>

      {/* 标签页 */}
      <div className="points-tabs">
        <button 
          className={`tab-btn ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          积分商城
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          积分明细
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          我的订单
        </button>
      </div>

      {/* 商品列表 */}
      {activeTab === 'shop' && (
        <div className="products-grid">
          {products.length === 0 ? (
            <div className="empty-state">暂无商品</div>
          ) : (
            products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    <div className="placeholder-image">🎁</div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  {product.description && (
                    <p className="product-desc">{product.description}</p>
                  )}
                  <div className="product-meta">
                    <span className="points-required">{product.pointsRequired}积分</span>
                    <span className="stock">库存: {product.stock}</span>
                  </div>
                  <div className="product-requirement">
                    需连续检测{product.minConsecutiveMonths}个月
                  </div>
                </div>
                <button 
                  className="redeem-btn"
                  disabled={
                    !summary?.canRedeem || 
                    (summary?.balance || 0) < product.pointsRequired ||
                    product.stock <= 0 ||
                    (summary?.consecutiveMonths || 0) < product.minConsecutiveMonths
                  }
                  onClick={() => {
                    setSelectedProduct(product)
                    setShowRedeemModal(true)
                  }}
                >
                  {product.stock <= 0 ? '已售罄' : 
                   (summary?.balance || 0) < product.pointsRequired ? '积分不足' :
                   (summary?.consecutiveMonths || 0) < product.minConsecutiveMonths ? '月数不足' :
                   '立即兑换'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 积分历史 */}
      {activeTab === 'history' && (
        <div className="history-list">
          {history.length === 0 ? (
            <div className="empty-state">暂无积分记录</div>
          ) : (
            history.map(log => (
              <div key={log.id} className="history-item">
                <div className="history-left">
                  <span className="history-type">{getChangeTypeText(log.changeType)}</span>
                  <span className="history-desc">{log.description}</span>
                  <span className="history-time">{formatDate(log.createdAt)}</span>
                </div>
                <div className={`history-amount ${log.changeAmount > 0 ? 'positive' : 'negative'}`}>
                  {log.changeAmount > 0 ? '+' : ''}{log.changeAmount}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 订单列表 */}
      {activeTab === 'orders' && (
        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="empty-state">暂无订单</div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="order-item">
                <div className="order-header">
                  <span className="order-id">订单号: {order.id}</span>
                  <span className={`order-status status-${order.status}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="order-content">
                  <span className="order-product">{order.productName} x{order.quantity}</span>
                  <span className="order-points">-{order.pointsSpent}积分</span>
                </div>
                <div className="order-time">{formatDate(order.createdAt)}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 兑换弹窗 */}
      {showRedeemModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowRedeemModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>确认兑换</h3>
            <div className="redeem-product-info">
              <p className="product-name">{selectedProduct.name}</p>
              <p className="product-points">消耗 {selectedProduct.pointsRequired} 积分</p>
            </div>
            <div className="shipping-form">
              <h4>收货信息</h4>
              <input
                type="text"
                placeholder="收货人姓名"
                value={shippingInfo.name}
                onChange={e => setShippingInfo({...shippingInfo, name: e.target.value})}
              />
              <input
                type="tel"
                placeholder="联系电话"
                value={shippingInfo.phone}
                onChange={e => setShippingInfo({...shippingInfo, phone: e.target.value})}
              />
              <textarea
                placeholder="收货地址"
                value={shippingInfo.address}
                onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})}
              />
              <input
                type="text"
                placeholder="备注（选填）"
                value={shippingInfo.notes}
                onChange={e => setShippingInfo({...shippingInfo, notes: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowRedeemModal(false)}>取消</button>
              <button 
                className="confirm-btn" 
                onClick={handleRedeem}
                disabled={actionLoading}
              >
                {actionLoading ? '处理中...' : '确认兑换'}
              </button>
            </div>
          </div>
        </div>
      )}

      <TabBar />
    </div>
  )
}
