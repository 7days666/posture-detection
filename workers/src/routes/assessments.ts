import { Hono } from 'hono'
import { verifyJWT } from '../utils/jwt'
import { addPointsForDetection } from '../services/pointsService'

type Bindings = {
  DB: D1Database
}

export const assessmentRoutes = new Hono<{ Bindings: Bindings }>()

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

assessmentRoutes.use('/*', authMiddleware)

// 保存检测结果
assessmentRoutes.post('/', async (c) => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const {
      overall_score,
      head_forward_angle,
      shoulder_level_diff,
      spine_curvature,
      pelvis_tilt,
      risk_level,
      keypoints_data,
      ai_suggestions
    } = body

    // 保存检测结果
    const insertResult = await c.env.DB.prepare(`
      INSERT INTO posture_assessments (
        user_id, overall_score, head_forward_angle, shoulder_level_diff,
        spine_curvature, pelvis_tilt, risk_level, keypoints_data, ai_suggestions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      overall_score,
      head_forward_angle || null,
      shoulder_level_diff || null,
      spine_curvature || null,
      pelvis_tilt || null,
      risk_level,
      keypoints_data ? JSON.stringify(keypoints_data) : null,
      ai_suggestions || null
    ).run()

    // 获取刚插入的检测记录ID
    const assessmentRow = await c.env.DB.prepare(`
      SELECT id FROM posture_assessments WHERE user_id = ? ORDER BY id DESC LIMIT 1
    `).bind(userId).first<{ id: number }>()

    // 添加积分奖励
    let pointsResult = null
    if (assessmentRow) {
      try {
        pointsResult = await addPointsForDetection(c.env.DB, userId, assessmentRow.id)
      } catch (pointsError) {
        console.error('添加积分失败:', pointsError)
        // 积分添加失败不影响检测结果保存
      }
    }

    return c.json({
      success: true,
      message: '检测结果已保存',
      points: pointsResult ? {
        earned: pointsResult.pointsEarned,
        alreadyDetectedThisMonth: pointsResult.alreadyDetectedThisMonth,
        newBalance: pointsResult.userPoints.balance,
        consecutiveMonths: pointsResult.userPoints.consecutiveMonths
      } : null
    })
  } catch (error) {
    console.error('保存检测结果错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 获取检测历史
assessmentRoutes.get('/history', async (c) => {
  try {
    const userId = c.get('userId')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')

    const results = await c.env.DB.prepare(`
      SELECT * FROM posture_assessments
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all()

    const countResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM posture_assessments WHERE user_id = ?
    `).bind(userId).first<{ total: number }>()

    return c.json({
      success: true,
      data: results.results,
      total: countResult?.total || 0
    })
  } catch (error) {
    console.error('获取检测历史错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 获取最新检测结果
assessmentRoutes.get('/latest', async (c) => {
  try {
    const userId = c.get('userId')

    const result = await c.env.DB.prepare(`
      SELECT * FROM posture_assessments
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(userId).first()

    return c.json({
      success: true,
      data: result || null
    })
  } catch (error) {
    console.error('获取最新检测结果错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 获取统计数据
assessmentRoutes.get('/stats', async (c) => {
  try {
    const userId = c.get('userId')

    // 获取总检测次数
    const countResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM posture_assessments WHERE user_id = ?
    `).bind(userId).first<{ total: number }>()

    // 获取平均分
    const avgResult = await c.env.DB.prepare(`
      SELECT AVG(overall_score) as avg_score FROM posture_assessments WHERE user_id = ?
    `).bind(userId).first<{ avg_score: number }>()

    // 获取最高分和最低分
    const minMaxResult = await c.env.DB.prepare(`
      SELECT MIN(overall_score) as min_score, MAX(overall_score) as max_score
      FROM posture_assessments WHERE user_id = ?
    `).bind(userId).first<{ min_score: number; max_score: number }>()

    // 获取最近5次评分用于趋势分析
    const recentScores = await c.env.DB.prepare(`
      SELECT overall_score, created_at FROM posture_assessments
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `).bind(userId).all()

    return c.json({
      success: true,
      data: {
        total_assessments: countResult?.total || 0,
        avg_score: Math.round(avgResult?.avg_score || 0),
        min_score: minMaxResult?.min_score || 0,
        max_score: minMaxResult?.max_score || 0,
        recent_scores: recentScores.results
      }
    })
  } catch (error) {
    console.error('获取统计数据错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})
