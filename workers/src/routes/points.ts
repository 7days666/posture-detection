/**
 * 积分系统路由
 * 用户积分查询、商品列表、兑换、补测申请
 */

import { Hono } from 'hono'
import { verifyJWT } from '../utils/jwt'
import {
  getUserPoints,
  getOrCreateUserPoints,
  addPointsForDetection,
  getPointsHistory,
  getCurrentMonth,
  areMonthsConsecutive,
  calculatePoints,
  createPointsLog,
} from '../services/pointsService'
import {
  Product,
  ProductRow,
  RedemptionOrder,
  RedemptionOrderRow,
  MakeupRequest,
  MakeupRequestRow,
  PointsSummary,
  toProduct,
  toRedemptionOrder,
  toMakeupRequest,
} from '../types/points'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

type Variables = {
  userId: number
}

export const pointsRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// JWT认证中间件
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: '未登录' }, 401)
  }

  const token = authHeader.substring(7)
  const payload = verifyJWT(token)
  if (!payload) {
    return c.json({ success: false, message: '登录已过期' }, 401)
  }

  c.set('userId', payload.id)
  await next()
}

// ==================== 用户积分相关 ====================

// 获取用户积分概览
pointsRoutes.get('/summary', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const userPoints = await getOrCreateUserPoints(c.env.DB, userId)
    
    const summary: PointsSummary = {
      balance: userPoints.balance,
      consecutiveMonths: userPoints.consecutiveMonths,
      nextReward: calculatePoints(userPoints.consecutiveMonths + 1),
      canRedeem: userPoints.consecutiveMonths >= 3,
      totalEarned: userPoints.totalEarned,
      totalSpent: userPoints.totalSpent,
    }
    
    return c.json({ success: true, summary })
  } catch (error) {
    console.error('获取积分概览错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 获取积分历史
pointsRoutes.get('/history', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')
    
    const { logs, total } = await getPointsHistory(c.env.DB, userId, limit, offset)
    
    return c.json({ success: true, logs, total })
  } catch (error) {
    console.error('获取积分历史错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// ==================== 商品相关 ====================

// 获取商品列表（用户端）
pointsRoutes.get('/products', authMiddleware, async (c) => {
  try {
    const category = c.req.query('category')
    
    let query = `
      SELECT * FROM products 
      WHERE is_active = 1
    `
    const params: any[] = []
    
    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }
    
    query += ' ORDER BY sort_order ASC, points_required ASC'
    
    const stmt = params.length > 0 
      ? c.env.DB.prepare(query).bind(...params)
      : c.env.DB.prepare(query)
    
    const results = await stmt.all<ProductRow>()
    const products = results.results.map(toProduct)
    
    return c.json({ success: true, products })
  } catch (error) {
    console.error('获取商品列表错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 兑换商品
pointsRoutes.post('/redeem', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const { productId, quantity = 1, shippingInfo } = await c.req.json()
    
    if (!productId) {
      return c.json({ success: false, message: '请选择商品' }, 400)
    }
    
    if (!shippingInfo || !shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      return c.json({ success: false, message: '请填写完整收货信息' }, 400)
    }
    
    // 获取商品信息
    const productRow = await c.env.DB.prepare(
      'SELECT * FROM products WHERE id = ? AND is_active = 1'
    ).bind(productId).first<ProductRow>()
    
    if (!productRow) {
      return c.json({ success: false, message: '商品不存在或已下架' }, 400)
    }
    
    const product = toProduct(productRow)
    
    // 检查库存
    if (product.stock < quantity) {
      return c.json({ success: false, message: '库存不足' }, 400)
    }
    
    // 获取用户积分
    const userPoints = await getOrCreateUserPoints(c.env.DB, userId)
    
    // 检查连续月数
    if (userPoints.consecutiveMonths < product.minConsecutiveMonths) {
      return c.json({ 
        success: false, 
        message: `需连续检测${product.minConsecutiveMonths}个月才能兑换此商品` 
      }, 400)
    }
    
    // 检查积分余额
    const totalPoints = product.pointsRequired * quantity
    if (userPoints.balance < totalPoints) {
      return c.json({ success: false, message: '积分不足' }, 400)
    }
    
    // 扣减积分
    const newBalance = userPoints.balance - totalPoints
    await c.env.DB.prepare(`
      UPDATE user_points SET
        balance = ?,
        total_spent = total_spent + ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(newBalance, totalPoints, userId).run()
    
    // 扣减库存
    await c.env.DB.prepare(`
      UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(quantity, productId).run()
    
    // 创建订单
    await c.env.DB.prepare(`
      INSERT INTO redemption_orders (user_id, product_id, product_name, points_spent, quantity, shipping_info)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      userId, 
      productId, 
      product.name, 
      totalPoints, 
      quantity,
      JSON.stringify(shippingInfo)
    ).run()
    
    // 获取订单ID
    const orderRow = await c.env.DB.prepare(`
      SELECT id FROM redemption_orders WHERE user_id = ? ORDER BY id DESC LIMIT 1
    `).bind(userId).first<{ id: number }>()
    
    // 记录积分变动
    await createPointsLog(c.env.DB, {
      userId,
      changeType: 'redeem',
      changeAmount: -totalPoints,
      balanceAfter: newBalance,
      referenceId: orderRow?.id,
      referenceType: 'redemption_order',
      description: `兑换商品: ${product.name} x${quantity}`,
    })
    
    return c.json({ 
      success: true, 
      message: '兑换成功',
      orderId: orderRow?.id,
      pointsSpent: totalPoints,
      newBalance
    })
  } catch (error) {
    console.error('兑换商品错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 获取用户兑换订单
pointsRoutes.get('/orders', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    
    const results = await c.env.DB.prepare(`
      SELECT * FROM redemption_orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).bind(userId).all<RedemptionOrderRow>()
    
    const orders = results.results.map(toRedemptionOrder)
    
    return c.json({ success: true, orders })
  } catch (error) {
    console.error('获取订单列表错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})


// ==================== 补测申请相关 ====================

// 检查是否可以申请补测
pointsRoutes.get('/makeup/check', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const currentMonth = getCurrentMonth()
    const now = new Date()
    const currentDay = now.getDate()
    
    // 只有每月1-5日可以申请上月补测
    if (currentDay > 5) {
      return c.json({ 
        success: true, 
        canApply: false, 
        reason: '补测申请仅限每月1-5日' 
      })
    }
    
    // 计算上个月
    const [year, month] = currentMonth.split('-').map(Number)
    const prevMonth = month === 1 
      ? `${year - 1}-12` 
      : `${year}-${String(month - 1).padStart(2, '0')}`
    
    // 检查上月是否已检测
    const userPoints = await getOrCreateUserPoints(c.env.DB, userId)
    if (userPoints.lastDetectionMonth === prevMonth) {
      return c.json({ 
        success: true, 
        canApply: false, 
        reason: '上月已完成检测，无需补测' 
      })
    }
    
    // 检查是否已有待处理的补测申请
    const existingRequest = await c.env.DB.prepare(`
      SELECT * FROM makeup_requests 
      WHERE user_id = ? AND target_month = ? AND status = 'pending'
    `).bind(userId, prevMonth).first()
    
    if (existingRequest) {
      return c.json({ 
        success: true, 
        canApply: false, 
        reason: '已有待处理的补测申请' 
      })
    }
    
    // 检查本月是否已用过补测机会
    const usedThisMonth = await c.env.DB.prepare(`
      SELECT * FROM makeup_requests 
      WHERE user_id = ? AND target_month = ? AND status IN ('approved', 'pending')
    `).bind(userId, prevMonth).first()
    
    if (usedThisMonth) {
      return c.json({ 
        success: true, 
        canApply: false, 
        reason: '本月补测机会已使用' 
      })
    }
    
    return c.json({ 
      success: true, 
      canApply: true, 
      targetMonth: prevMonth 
    })
  } catch (error) {
    console.error('检查补测资格错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 提交补测申请
pointsRoutes.post('/makeup/apply', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const currentMonth = getCurrentMonth()
    const now = new Date()
    const currentDay = now.getDate()
    
    // 只有每月1-5日可以申请
    if (currentDay > 5) {
      return c.json({ success: false, message: '补测申请仅限每月1-5日' }, 400)
    }
    
    // 计算上个月
    const [year, month] = currentMonth.split('-').map(Number)
    const prevMonth = month === 1 
      ? `${year - 1}-12` 
      : `${year}-${String(month - 1).padStart(2, '0')}`
    
    // 检查是否已有申请
    const existingRequest = await c.env.DB.prepare(`
      SELECT * FROM makeup_requests 
      WHERE user_id = ? AND target_month = ?
    `).bind(userId, prevMonth).first()
    
    if (existingRequest) {
      return c.json({ success: false, message: '已提交过补测申请' }, 400)
    }
    
    // 创建补测申请
    await c.env.DB.prepare(`
      INSERT INTO makeup_requests (user_id, target_month, status)
      VALUES (?, ?, 'pending')
    `).bind(userId, prevMonth).run()
    
    return c.json({ success: true, message: '补测申请已提交，请等待审核' })
  } catch (error) {
    console.error('提交补测申请错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 获取用户补测申请记录
pointsRoutes.get('/makeup/requests', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    
    const results = await c.env.DB.prepare(`
      SELECT * FROM makeup_requests 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).bind(userId).all<MakeupRequestRow>()
    
    const requests = results.results.map(toMakeupRequest)
    
    return c.json({ success: true, requests })
  } catch (error) {
    console.error('获取补测申请错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 补测完成后添加积分（补测只获得基础10分，不影响连续月数）
pointsRoutes.post('/makeup/complete', authMiddleware, async (c) => {
  try {
  const userId = c.get('userId')
  const { assessmentId } = await c.req.json()
  
  // 查找已批准的补测申请
  const request = await c.env.DB.prepare(`
    SELECT * FROM makeup_requests 
    WHERE user_id = ? AND status = 'approved' AND assessment_id IS NULL
    ORDER BY created_at DESC LIMIT 1
  `).bind(userId).first<MakeupRequestRow>()
  
  if (!request) {
    return c.json({ success: false, message: '没有待完成的补测申请' }, 400)
  }
  
  // 更新补测申请
  await c.env.DB.prepare(`
    UPDATE makeup_requests SET assessment_id = ? WHERE id = ?
  `).bind(assessmentId, request.id).run()
  
  // 补测只获得基础10分
  const userPoints = await getOrCreateUserPoints(c.env.DB, userId)
  const pointsEarned = 10
  const newBalance = userPoints.balance + pointsEarned
  
  await c.env.DB.prepare(`
    UPDATE user_points SET
      balance = ?,
      total_earned = total_earned + ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).bind(newBalance, pointsEarned, userId).run()
  
  // 记录积分变动
  await createPointsLog(c.env.DB, {
    userId,
    changeType: 'makeup',
    changeAmount: pointsEarned,
    balanceAfter: newBalance,
    referenceId: assessmentId,
    referenceType: 'posture_assessment',
    description: `${request.target_month}月份补测奖励`,
  })
  
  return c.json({ 
    success: true, 
    pointsEarned,
    newBalance,
    message: '补测完成，获得10积分'
  })
  } catch (error) {
    console.error('补测完成错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})
