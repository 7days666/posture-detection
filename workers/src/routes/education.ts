import { Hono } from 'hono'
import { verifyJWT } from '../utils/jwt'

type Bindings = {
  DB: D1Database
}

export const educationRoutes = new Hono<{ Bindings: Bindings }>()

// 中间件：验证 token（可选）
const optionalAuthMiddleware = async (c: any, next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    const payload = verifyJWT(token)
    if (payload) {
      c.set('userId', payload.id)
    }
  }
  await next()
}

// 中间件：必须验证 token
const authMiddleware = async (c: any, next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: '未授权' }, 401)
  }
  const token = authHeader.replace('Bearer ', '')
  const payload = verifyJWT(token)
  if (!payload) {
    return c.json({ success: false, message: 'Token无效' }, 401)
  }
  c.set('userId', payload.id)
  await next()
}

// 获取教育内容列表（公开）
educationRoutes.get('/contents', optionalAuthMiddleware, async (c) => {
  try {
    const category = c.req.query('category')
    const type = c.req.query('type')

    let query = 'SELECT * FROM education_contents WHERE is_published = 1'
    const params: any[] = []

    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }
    if (type) {
      query += ' AND content_type = ?'
      params.push(type)
    }

    query += ' ORDER BY created_at DESC'

    const results = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({
      success: true,
      data: results.results
    })
  } catch (error) {
    console.error('获取教育内容错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 获取单个教育内容详情
educationRoutes.get('/contents/:id', optionalAuthMiddleware, async (c) => {
  try {
    const contentId = c.req.param('id')

    const content = await c.env.DB.prepare(`
      SELECT * FROM education_contents WHERE id = ? AND is_published = 1
    `).bind(contentId).first()

    if (!content) {
      return c.json({ success: false, message: '内容不存在' }, 404)
    }

    // 增加浏览次数
    await c.env.DB.prepare(`
      UPDATE education_contents SET view_count = view_count + 1 WHERE id = ?
    `).bind(contentId).run()

    return c.json({
      success: true,
      data: content
    })
  } catch (error) {
    console.error('获取教育内容详情错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 记录学习进度
educationRoutes.post('/progress', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const { content_id, content_type, content_title, progress, duration_seconds } = body

    // 检查是否已有记录
    const existing = await c.env.DB.prepare(`
      SELECT id, progress FROM education_records
      WHERE user_id = ? AND content_id = ?
    `).bind(userId, content_id).first<{ id: number; progress: number }>()

    if (existing) {
      // 更新进度（只能增加，不能减少）
      const newProgress = Math.max(existing.progress, progress || 0)
      const completed = newProgress >= 100 ? 1 : 0

      await c.env.DB.prepare(`
        UPDATE education_records
        SET progress = ?, completed = ?, duration_seconds = duration_seconds + ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(newProgress, completed, duration_seconds || 0, existing.id).run()
    } else {
      // 创建新记录
      await c.env.DB.prepare(`
        INSERT INTO education_records (user_id, content_id, content_type, content_title, progress, completed, duration_seconds)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        userId,
        content_id,
        content_type,
        content_title || '',
        progress || 0,
        progress >= 100 ? 1 : 0,
        duration_seconds || 0
      ).run()
    }

    return c.json({ success: true, message: '学习进度已保存' })
  } catch (error) {
    console.error('保存学习进度错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 获取用户学习记录
educationRoutes.get('/my-progress', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')

    const results = await c.env.DB.prepare(`
      SELECT * FROM education_records
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `).bind(userId).all()

    // 统计数据
    const statsResult = await c.env.DB.prepare(`
      SELECT
        COUNT(*) as total_started,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as total_completed,
        SUM(duration_seconds) as total_seconds
      FROM education_records WHERE user_id = ?
    `).bind(userId).first<{ total_started: number; total_completed: number; total_seconds: number }>()

    return c.json({
      success: true,
      data: results.results,
      stats: {
        total_started: statsResult?.total_started || 0,
        total_completed: statsResult?.total_completed || 0,
        total_minutes: Math.round((statsResult?.total_seconds || 0) / 60)
      }
    })
  } catch (error) {
    console.error('获取学习记录错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 获取推荐内容（基于用户的检测结果）
educationRoutes.get('/recommendations', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')

    // 获取用户最新检测结果
    const latestAssessment = await c.env.DB.prepare(`
      SELECT risk_level, head_forward_angle, shoulder_level_diff
      FROM posture_assessments
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(userId).first<{ risk_level: string; head_forward_angle: number; shoulder_level_diff: number }>()

    // 根据风险等级推荐内容
    let query = 'SELECT * FROM education_contents WHERE is_published = 1'

    if (latestAssessment?.risk_level) {
      query += ` AND (target_risk_level = '${latestAssessment.risk_level}' OR target_risk_level = 'all')`
    }

    query += ' ORDER BY view_count DESC LIMIT 5'

    const results = await c.env.DB.prepare(query).all()

    return c.json({
      success: true,
      data: results.results,
      based_on: latestAssessment ? {
        risk_level: latestAssessment.risk_level,
        head_forward_angle: latestAssessment.head_forward_angle,
        shoulder_level_diff: latestAssessment.shoulder_level_diff
      } : null
    })
  } catch (error) {
    console.error('获取推荐内容错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})
