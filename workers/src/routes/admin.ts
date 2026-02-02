import { Hono } from 'hono'
import { hashPassword } from '../utils/password'
import {
  ProductRow,
  RedemptionOrderRow,
  MakeupRequestRow,
  toProduct,
  toRedemptionOrder,
  toMakeupRequest,
} from '../types/points'

type Bindings = {
  DB: D1Database
}

// 管理员密码 (简单实现，生产环境应该用数据库存储)
const ADMIN_PASSWORD = 'admin123456'

export const adminRoutes = new Hono<{ Bindings: Bindings }>()

// 管理员登录验证中间件
const adminAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return c.json({ success: false, message: '管理员认证失败' }, 401)
  }
  await next()
}

// 管理员登录
adminRoutes.post('/login', async (c) => {
  try {
    const { password } = await c.req.json()
    
    if (password === ADMIN_PASSWORD) {
      return c.json({ success: true, token: ADMIN_PASSWORD })
    }
    
    return c.json({ success: false, message: '密码错误' }, 400)
  } catch (error) {
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 获取所有用户列表
adminRoutes.get('/users', adminAuth, async (c) => {
  try {
    const users = await c.env.DB.prepare(`
      SELECT 
        u.id, u.phone, u.password, u.name, u.created_at,
        p.age_group, p.gender, p.age, p.height, p.weight
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY u.created_at DESC
    `).all()
    
    return c.json({ success: true, users: users.results })
  } catch (error) {
    console.error('获取用户列表错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 获取单个用户详情
adminRoutes.get('/users/:id', adminAuth, async (c) => {
  try {
    const userId = c.req.param('id')
    
    const user = await c.env.DB.prepare(`
      SELECT 
        u.id, u.phone, u.password, u.name, u.created_at,
        p.*
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `).bind(userId).first()
    
    if (!user) {
      return c.json({ success: false, message: '用户不存在' }, 404)
    }
    
    // 获取用户的检测记录数
    const assessmentCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM posture_assessments WHERE user_id = ?'
    ).bind(userId).first<{ count: number }>()
    
    return c.json({ 
      success: true, 
      user,
      stats: {
        assessmentCount: assessmentCount?.count || 0
      }
    })
  } catch (error) {
    console.error('获取用户详情错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 重置用户密码
adminRoutes.post('/users/:id/reset-password', adminAuth, async (c) => {
  try {
    const userId = c.req.param('id')
    const { newPassword } = await c.req.json()
    
    if (!newPassword || newPassword.length < 6) {
      return c.json({ success: false, message: '密码至少6位' }, 400)
    }
    
    const hashedPassword = await hashPassword(newPassword)
    
    await c.env.DB.prepare(
      'UPDATE users SET password = ? WHERE id = ?'
    ).bind(hashedPassword, userId).run()
    
    return c.json({ success: true, message: '密码重置成功' })
  } catch (error) {
    console.error('重置密码错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 删除用户
adminRoutes.delete('/users/:id', adminAuth, async (c) => {
  try {
    const userId = c.req.param('id')
    
    // 删除用户相关的所有数据
    await c.env.DB.prepare('DELETE FROM ai_predictions WHERE user_id = ?').bind(userId).run()
    await c.env.DB.prepare('DELETE FROM health_goals WHERE user_id = ?').bind(userId).run()
    await c.env.DB.prepare('DELETE FROM education_records WHERE user_id = ?').bind(userId).run()
    await c.env.DB.prepare('DELETE FROM exercise_records WHERE user_id = ?').bind(userId).run()
    await c.env.DB.prepare('DELETE FROM posture_assessments WHERE user_id = ?').bind(userId).run()
    await c.env.DB.prepare('DELETE FROM profiles WHERE user_id = ?').bind(userId).run()
    await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run()
    
    return c.json({ success: true, message: '用户已删除' })
  } catch (error) {
    console.error('删除用户错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 获取统计数据
adminRoutes.get('/stats', adminAuth, async (c) => {
  try {
    const userCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>()
    const assessmentCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM posture_assessments').first<{ count: number }>()
    const todayUsers = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = DATE('now')"
    ).first<{ count: number }>()
    
    return c.json({
      success: true,
      stats: {
        totalUsers: userCount?.count || 0,
        totalAssessments: assessmentCount?.count || 0,
        todayNewUsers: todayUsers?.count || 0
      }
    })
  } catch (error) {
    console.error('获取统计错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// ========== 数据库管理功能 ==========

// 获取所有检测记录
adminRoutes.get('/assessments', adminAuth, async (c) => {
  try {
    const assessments = await c.env.DB.prepare(`
      SELECT 
        a.id, a.user_id, a.overall_score, a.risk_level,
        a.head_forward_angle, a.shoulder_level_diff, 
        a.spine_curvature, a.pelvis_tilt,
        a.created_at,
        u.phone, u.name
      FROM posture_assessments a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `).all()
    
    return c.json({ success: true, assessments: assessments.results })
  } catch (error) {
    console.error('获取检测记录错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 删除单条检测记录
adminRoutes.delete('/assessments/:id', adminAuth, async (c) => {
  try {
    const assessmentId = c.req.param('id')
    
    await c.env.DB.prepare(
      'DELETE FROM posture_assessments WHERE id = ?'
    ).bind(assessmentId).run()
    
    return c.json({ success: true, message: '检测记录已删除' })
  } catch (error) {
    console.error('删除检测记录错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 调试：查看数据库中的实际值
adminRoutes.get('/assessments/debug', adminAuth, async (c) => {
  try {
    const records = await c.env.DB.prepare(`
      SELECT 
        id, 
        overall_score,
        head_forward_angle,
        shoulder_level_diff,
        spine_curvature,
        pelvis_tilt,
        typeof(head_forward_angle) as head_type,
        typeof(shoulder_level_diff) as shoulder_type,
        typeof(spine_curvature) as spine_type,
        typeof(pelvis_tilt) as pelvis_type
      FROM posture_assessments 
      ORDER BY id DESC
      LIMIT 20
    `).all()
    
    return c.json({ 
      success: true, 
      records: records.results,
      message: '调试数据'
    })
  } catch (error) {
    console.error('调试错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 清理异常数据（评分100但指标异常的数据，以及指标全为空的无效数据）
adminRoutes.post('/assessments/cleanup', adminAuth, async (c) => {
  try {
    let totalDeleted = 0
    
    // 1. 清理评分>=95但有异常指标的记录（这些是错误数据）
    const badRecords = await c.env.DB.prepare(`
      SELECT id FROM posture_assessments 
      WHERE overall_score >= 95 
      AND (
        head_forward_angle > 15 OR 
        shoulder_level_diff > 3 OR 
        spine_curvature > 15 OR 
        pelvis_tilt > 10
      )
    `).all()
    
    const badCount = badRecords.results?.length || 0
    
    if (badCount > 0) {
      await c.env.DB.prepare(`
        DELETE FROM posture_assessments 
        WHERE overall_score >= 95 
        AND (
          head_forward_angle > 15 OR 
          shoulder_level_diff > 3 OR 
          spine_curvature > 15 OR 
          pelvis_tilt > 10
        )
      `).run()
      totalDeleted += badCount
    }
    
    // 2. 清理指标全为空/0/空字符串的无效数据（检测失败的记录）
    // 处理 NULL, 0, '', 以及任何非正数的情况
    const emptyRecords = await c.env.DB.prepare(`
      SELECT id FROM posture_assessments 
      WHERE (head_forward_angle IS NULL OR head_forward_angle = 0 OR head_forward_angle = '' OR CAST(head_forward_angle AS REAL) <= 0)
      AND (shoulder_level_diff IS NULL OR shoulder_level_diff = 0 OR shoulder_level_diff = '' OR CAST(shoulder_level_diff AS REAL) <= 0)
      AND (spine_curvature IS NULL OR spine_curvature = 0 OR spine_curvature = '' OR CAST(spine_curvature AS REAL) <= 0)
      AND (pelvis_tilt IS NULL OR pelvis_tilt = 0 OR pelvis_tilt = '' OR CAST(pelvis_tilt AS REAL) <= 0)
    `).all()
    
    const emptyCount = emptyRecords.results?.length || 0
    
    if (emptyCount > 0) {
      await c.env.DB.prepare(`
        DELETE FROM posture_assessments 
        WHERE (head_forward_angle IS NULL OR head_forward_angle = 0 OR head_forward_angle = '' OR CAST(head_forward_angle AS REAL) <= 0)
        AND (shoulder_level_diff IS NULL OR shoulder_level_diff = 0 OR shoulder_level_diff = '' OR CAST(shoulder_level_diff AS REAL) <= 0)
        AND (spine_curvature IS NULL OR spine_curvature = 0 OR spine_curvature = '' OR CAST(spine_curvature AS REAL) <= 0)
        AND (pelvis_tilt IS NULL OR pelvis_tilt = 0 OR pelvis_tilt = '' OR CAST(pelvis_tilt AS REAL) <= 0)
      `).run()
      totalDeleted += emptyCount
    }
    
    return c.json({ 
      success: true, 
      message: `已清理 ${totalDeleted} 条异常数据（${badCount} 条指标异常，${emptyCount} 条指标为空）`,
      deletedCount: totalDeleted,
      details: {
        badScoreCount: badCount,
        emptyDataCount: emptyCount
      }
    })
  } catch (error) {
    console.error('清理数据错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 清理指定用户的所有检测记录
adminRoutes.delete('/users/:id/assessments', adminAuth, async (c) => {
  try {
    const userId = c.req.param('id')
    
    const result = await c.env.DB.prepare(
      'DELETE FROM posture_assessments WHERE user_id = ?'
    ).bind(userId).run()
    
    return c.json({ 
      success: true, 
      message: `已清理该用户的检测记录`
    })
  } catch (error) {
    console.error('清理用户检测记录错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// ========== 积分商品管理 ==========

// 获取所有商品（管理端）
adminRoutes.get('/products', adminAuth, async (c) => {
  try {
    const results = await c.env.DB.prepare(`
      SELECT * FROM products ORDER BY sort_order ASC, id DESC
    `).all<ProductRow>()
    
    const products = results.results.map(toProduct)
    return c.json({ success: true, products })
  } catch (error) {
    console.error('获取商品列表错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 创建商品
adminRoutes.post('/products', adminAuth, async (c) => {
  try {
    const { name, description, imageUrl, pointsRequired, minConsecutiveMonths = 3, stock = 0, category, sortOrder = 0 } = await c.req.json()
    
    if (!name || !pointsRequired) {
      return c.json({ success: false, message: '商品名称和所需积分必填' }, 400)
    }
    
    await c.env.DB.prepare(`
      INSERT INTO products (name, description, image_url, points_required, min_consecutive_months, stock, category, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).bind(name, description || null, imageUrl || null, pointsRequired, minConsecutiveMonths, stock, category || null, sortOrder).run()
    
    return c.json({ success: true, message: '商品创建成功' })
  } catch (error) {
    console.error('创建商品错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 更新商品
adminRoutes.put('/products/:id', adminAuth, async (c) => {
  try {
    const productId = c.req.param('id')
    const { name, description, imageUrl, pointsRequired, minConsecutiveMonths, stock, category, isActive, sortOrder } = await c.req.json()
    
    await c.env.DB.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        points_required = COALESCE(?, points_required),
        min_consecutive_months = COALESCE(?, min_consecutive_months),
        stock = COALESCE(?, stock),
        category = COALESCE(?, category),
        is_active = COALESCE(?, is_active),
        sort_order = COALESCE(?, sort_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      name ?? null, 
      description ?? null, 
      imageUrl ?? null, 
      pointsRequired ?? null, 
      minConsecutiveMonths ?? null, 
      stock ?? null, 
      category ?? null, 
      isActive !== undefined ? (isActive ? 1 : 0) : null,
      sortOrder ?? null,
      productId
    ).run()
    
    return c.json({ success: true, message: '商品更新成功' })
  } catch (error) {
    console.error('更新商品错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 删除商品
adminRoutes.delete('/products/:id', adminAuth, async (c) => {
  try {
    const productId = c.req.param('id')
    
    await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(productId).run()
    
    return c.json({ success: true, message: '商品已删除' })
  } catch (error) {
    console.error('删除商品错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// ========== 兑换订单管理 ==========

// 获取所有兑换订单
adminRoutes.get('/orders', adminAuth, async (c) => {
  try {
    const status = c.req.query('status')
    
    let query = `
      SELECT o.*, u.phone, u.name as user_name
      FROM redemption_orders o
      LEFT JOIN users u ON o.user_id = u.id
    `
    const params: any[] = []
    
    if (status) {
      query += ' WHERE o.status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY o.created_at DESC'
    
    const stmt = params.length > 0 
      ? c.env.DB.prepare(query).bind(...params)
      : c.env.DB.prepare(query)
    
    const results = await stmt.all()
    
    // 手动处理结果，因为有额外字段
    const orders = results.results.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      productId: row.product_id,
      productName: row.product_name,
      pointsSpent: row.points_spent,
      quantity: row.quantity,
      status: row.status,
      shippingInfo: row.shipping_info ? JSON.parse(row.shipping_info) : null,
      adminNotes: row.admin_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userPhone: row.phone,
      userName: row.user_name,
    }))
    
    return c.json({ success: true, orders })
  } catch (error) {
    console.error('获取订单列表错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 更新订单状态
adminRoutes.put('/orders/:id/status', adminAuth, async (c) => {
  try {
    const orderId = c.req.param('id')
    const { status, adminNotes } = await c.req.json()
    
    if (!['pending', 'processing', 'shipped', 'completed', 'cancelled'].includes(status)) {
      return c.json({ success: false, message: '无效的订单状态' }, 400)
    }
    
    await c.env.DB.prepare(`
      UPDATE redemption_orders SET
        status = ?,
        admin_notes = COALESCE(?, admin_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, adminNotes || null, orderId).run()
    
    return c.json({ success: true, message: '订单状态已更新' })
  } catch (error) {
    console.error('更新订单状态错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// ========== 补测申请管理 ==========

// 获取所有补测申请
adminRoutes.get('/makeup-requests', adminAuth, async (c) => {
  try {
    const status = c.req.query('status')
    
    let query = `
      SELECT m.*, u.phone, u.name as user_name
      FROM makeup_requests m
      LEFT JOIN users u ON m.user_id = u.id
    `
    const params: any[] = []
    
    if (status) {
      query += ' WHERE m.status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY m.created_at DESC'
    
    const stmt = params.length > 0 
      ? c.env.DB.prepare(query).bind(...params)
      : c.env.DB.prepare(query)
    
    const results = await stmt.all()
    
    const requests = results.results.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      targetMonth: row.target_month,
      status: row.status,
      assessmentId: row.assessment_id,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      rejectReason: row.reject_reason,
      createdAt: row.created_at,
      userPhone: row.phone,
      userName: row.user_name,
    }))
    
    return c.json({ success: true, requests })
  } catch (error) {
    console.error('获取补测申请错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 审核补测申请
adminRoutes.put('/makeup-requests/:id/review', adminAuth, async (c) => {
  try {
    const requestId = c.req.param('id')
    const { approved, rejectReason } = await c.req.json()
    
    const status = approved ? 'approved' : 'rejected'
    
    await c.env.DB.prepare(`
      UPDATE makeup_requests SET
        status = ?,
        reject_reason = ?,
        reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, approved ? null : rejectReason, requestId).run()
    
    return c.json({ success: true, message: approved ? '已批准补测申请' : '已拒绝补测申请' })
  } catch (error) {
    console.error('审核补测申请错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// ========== 积分统计 ==========

// 获取积分相关统计
adminRoutes.get('/points-stats', adminAuth, async (c) => {
  try {
    const totalPoints = await c.env.DB.prepare(
      'SELECT SUM(balance) as total FROM user_points'
    ).first<{ total: number }>()
    
    const totalRedeemed = await c.env.DB.prepare(
      'SELECT SUM(points_spent) as total FROM redemption_orders WHERE status != "cancelled"'
    ).first<{ total: number }>()
    
    const pendingOrders = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM redemption_orders WHERE status = "pending"'
    ).first<{ count: number }>()
    
    const pendingMakeup = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM makeup_requests WHERE status = "pending"'
    ).first<{ count: number }>()
    
    return c.json({
      success: true,
      stats: {
        totalPointsInCirculation: totalPoints?.total || 0,
        totalPointsRedeemed: totalRedeemed?.total || 0,
        pendingOrders: pendingOrders?.count || 0,
        pendingMakeupRequests: pendingMakeup?.count || 0,
      }
    })
  } catch (error) {
    console.error('获取积分统计错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})
