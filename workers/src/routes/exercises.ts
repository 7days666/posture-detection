import { Hono } from 'hono'
import { verifyJWT } from '../utils/jwt'

type Bindings = {
  DB: D1Database
}

export const exerciseRoutes = new Hono<{ Bindings: Bindings }>()

// 中间件：验证 token
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

exerciseRoutes.use('/*', authMiddleware)

// 记录运动
exerciseRoutes.post('/', async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const {
      exercise_type,
      exercise_name,
      duration_minutes,
      completion_rate,
      calories_burned,
      difficulty_level,
      user_rating,
      notes
    } = body

    await c.env.DB.prepare(`
      INSERT INTO exercise_records (
        user_id, exercise_type, exercise_name, duration_minutes,
        completion_rate, calories_burned, difficulty_level, user_rating, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      exercise_type,
      exercise_name || null,
      duration_minutes || 0,
      completion_rate || 100,
      calories_burned || null,
      difficulty_level || 'medium',
      user_rating || null,
      notes || null
    ).run()

    return c.json({ success: true, message: '运动记录已保存' })
  } catch (error) {
    console.error('保存运动记录错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 获取运动历史
exerciseRoutes.get('/history', async (c) => {
  try {
    const userId = c.get('userId')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')

    const results = await c.env.DB.prepare(`
      SELECT * FROM exercise_records
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all()

    const countResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM exercise_records WHERE user_id = ?
    `).bind(userId).first<{ total: number }>()

    return c.json({
      success: true,
      data: results.results,
      total: countResult?.total || 0
    })
  } catch (error) {
    console.error('获取运动历史错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 获取运动统计
exerciseRoutes.get('/stats', async (c) => {
  try {
    const userId = c.get('userId')

    // 总运动次数
    const countResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM exercise_records WHERE user_id = ?
    `).bind(userId).first<{ total: number }>()

    // 总运动时长
    const durationResult = await c.env.DB.prepare(`
      SELECT SUM(duration_minutes) as total_minutes FROM exercise_records WHERE user_id = ?
    `).bind(userId).first<{ total_minutes: number }>()

    // 平均完成度
    const avgCompletionResult = await c.env.DB.prepare(`
      SELECT AVG(completion_rate) as avg_completion FROM exercise_records WHERE user_id = ?
    `).bind(userId).first<{ avg_completion: number }>()

    // 本周运动次数
    const weeklyResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as weekly_count FROM exercise_records
      WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
    `).bind(userId).first<{ weekly_count: number }>()

    // 运动类型分布
    const typeDistribution = await c.env.DB.prepare(`
      SELECT exercise_type, COUNT(*) as count
      FROM exercise_records WHERE user_id = ?
      GROUP BY exercise_type
    `).bind(userId).all()

    return c.json({
      success: true,
      data: {
        total_exercises: countResult?.total || 0,
        total_minutes: durationResult?.total_minutes || 0,
        avg_completion: Math.round(avgCompletionResult?.avg_completion || 0),
        weekly_count: weeklyResult?.weekly_count || 0,
        type_distribution: typeDistribution.results
      }
    })
  } catch (error) {
    console.error('获取运动统计错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})
