import { Hono } from 'hono'
import { hashPassword } from '../utils/password'

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
    
    // 2. 清理指标全为空的无效数据（检测失败的记录）
    const emptyRecords = await c.env.DB.prepare(`
      SELECT id FROM posture_assessments 
      WHERE head_forward_angle IS NULL 
      AND shoulder_level_diff IS NULL 
      AND spine_curvature IS NULL 
      AND pelvis_tilt IS NULL
    `).all()
    
    const emptyCount = emptyRecords.results?.length || 0
    
    if (emptyCount > 0) {
      await c.env.DB.prepare(`
        DELETE FROM posture_assessments 
        WHERE head_forward_angle IS NULL 
        AND shoulder_level_diff IS NULL 
        AND spine_curvature IS NULL 
        AND pelvis_tilt IS NULL
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
