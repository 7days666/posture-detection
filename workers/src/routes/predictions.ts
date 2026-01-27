import { Hono } from 'hono'
import { verifyJWT } from '../utils/jwt'

type Bindings = {
  DB: D1Database
}

export const predictionRoutes = new Hono<{ Bindings: Bindings }>()

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

predictionRoutes.use('/*', authMiddleware)

// AI 预测分析
predictionRoutes.get('/analyze', async (c) => {
  try {
    const userId = c.get('userId')

    // 获取历史检测数据
    const assessments = await c.env.DB.prepare(`
      SELECT overall_score, risk_level, head_forward_angle, shoulder_level_diff,
             spine_curvature, pelvis_tilt, created_at
      FROM posture_assessments
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).bind(userId).all()

    // 获取运动数据
    const exercises = await c.env.DB.prepare(`
      SELECT exercise_type, duration_minutes, completion_rate, created_at
      FROM exercise_records
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(userId).all()

    // 获取学习数据
    const education = await c.env.DB.prepare(`
      SELECT content_type, progress, completed, duration_seconds
      FROM education_records
      WHERE user_id = ?
    `).bind(userId).all()

    const assessmentData = assessments.results as any[]
    const exerciseData = exercises.results as any[]
    const educationData = education.results as any[]

    // 计算预测
    const prediction = calculatePrediction(assessmentData, exerciseData, educationData)

    // 保存预测记录
    await c.env.DB.prepare(`
      INSERT INTO ai_predictions (user_id, prediction_type, prediction_data, confidence_score)
      VALUES (?, ?, ?, ?)
    `).bind(
      userId,
      'comprehensive',
      JSON.stringify(prediction),
      prediction.confidence
    ).run()

    return c.json({
      success: true,
      data: prediction
    })
  } catch (error) {
    console.error('AI预测分析错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 获取综合健康数据（用于数据追踪页面）
predictionRoutes.get('/dashboard', async (c) => {
  try {
    const userId = c.get('userId')

    // 获取检测统计
    const assessmentStats = await c.env.DB.prepare(`
      SELECT
        COUNT(*) as total,
        AVG(overall_score) as avg_score,
        MAX(overall_score) as max_score,
        MIN(overall_score) as min_score
      FROM posture_assessments WHERE user_id = ?
    `).bind(userId).first()

    // 获取最近检测记录
    const recentAssessments = await c.env.DB.prepare(`
      SELECT overall_score, risk_level, head_forward_angle, shoulder_level_diff, created_at
      FROM posture_assessments
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `).bind(userId).all()

    // 获取运动统计
    const exerciseStats = await c.env.DB.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(duration_minutes) as total_minutes,
        AVG(completion_rate) as avg_completion
      FROM exercise_records WHERE user_id = ?
    `).bind(userId).first()

    // 获取最近运动记录
    const recentExercises = await c.env.DB.prepare(`
      SELECT exercise_type, exercise_name, duration_minutes, completion_rate, created_at
      FROM exercise_records
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `).bind(userId).all()

    // 计算趋势
    const trend = calculateTrend(recentAssessments.results as any[])

    return c.json({
      success: true,
      data: {
        assessment: {
          stats: assessmentStats,
          recent: recentAssessments.results
        },
        exercise: {
          stats: exerciseStats,
          recent: recentExercises.results
        },
        trend
      }
    })
  } catch (error) {
    console.error('获取Dashboard数据错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 计算预测的辅助函数
function calculatePrediction(assessments: any[], exercises: any[], education: any[]) {
  // 当前风险等级
  const currentRisk = assessments[0]?.risk_level || 'medium'
  const currentScore = assessments[0]?.overall_score || 70

  // 计算评分趋势
  let scoreTrend = 'stable'
  if (assessments.length >= 2) {
    const recentAvg = assessments.slice(0, 3).reduce((sum, a) => sum + (a.overall_score || 0), 0) / Math.min(assessments.length, 3)
    const olderAvg = assessments.slice(-3).reduce((sum, a) => sum + (a.overall_score || 0), 0) / Math.min(assessments.length, 3)
    if (recentAvg > olderAvg + 3) scoreTrend = 'improving'
    else if (recentAvg < olderAvg - 3) scoreTrend = 'declining'
  }

  // 计算运动依从性
  const exerciseFrequency = exercises.length
  const avgCompletion = exercises.length > 0
    ? exercises.reduce((sum, e) => sum + (e.completion_rate || 0), 0) / exercises.length
    : 0

  // 计算学习进度
  const completedEducation = education.filter(e => e.completed).length
  const totalEducation = education.length

  // 预测未来4周的评分
  const weeklyPredictions = []
  let predictedScore = currentScore
  const weeklyImprovement = scoreTrend === 'improving' ? 2.5 : scoreTrend === 'declining' ? -1 : 0.5

  for (let week = 1; week <= 4; week++) {
    predictedScore = Math.min(100, Math.max(0, predictedScore + weeklyImprovement + (avgCompletion > 80 ? 1 : 0)))
    weeklyPredictions.push({
      week,
      score: Math.round(predictedScore),
      risk: predictedScore >= 80 ? 'low' : predictedScore >= 60 ? 'medium' : 'high'
    })
  }

  // 预测未来风险等级
  const predictedRisk = predictedScore >= 80 ? 'low' : predictedScore >= 60 ? 'medium' : 'high'

  // 置信度计算
  const confidence = Math.min(95, 50 + assessments.length * 5 + exercises.length * 2)

  // 行为影响分析
  const behaviorImpact = [
    {
      behavior: '规律运动',
      impact: `+${Math.round(avgCompletion * 0.1)}分`,
      description: exerciseFrequency >= 5 ? '运动频率良好，继续保持' : '建议增加运动频率',
      priority: exerciseFrequency >= 5 ? 'medium' : 'high',
      score: avgCompletion
    },
    {
      behavior: '健康学习',
      impact: `+${completedEducation * 2}分`,
      description: completedEducation > 0 ? '已完成健康知识学习' : '建议学习体态健康知识',
      priority: completedEducation > 0 ? 'low' : 'medium',
      score: totalEducation > 0 ? (completedEducation / totalEducation) * 100 : 0
    },
    {
      behavior: '定期检测',
      impact: `+${assessments.length}分`,
      description: assessments.length >= 3 ? '检测频率良好' : '建议定期进行体态检测',
      priority: assessments.length >= 3 ? 'low' : 'high',
      score: Math.min(100, assessments.length * 20)
    }
  ]

  // 调整建议
  const adjustments = []
  if (avgCompletion < 80) {
    adjustments.push({
      type: 'increase',
      suggestion: '提高运动完成度至80%以上',
      expectedImpact: '加速体态改善'
    })
  }
  if (exerciseFrequency < 5) {
    adjustments.push({
      type: 'add',
      suggestion: `增加每周运动次数（当前${exerciseFrequency}次，建议5次）`,
      expectedImpact: '增强矫正效果'
    })
  }
  if (completedEducation === 0) {
    adjustments.push({
      type: 'add',
      suggestion: '完成至少1个健康教育课程',
      expectedImpact: '提升健康意识'
    })
  }
  adjustments.push({
    type: 'monitor',
    suggestion: '持续监测体态变化，每周至少检测1次',
    expectedImpact: '及时发现问题'
  })

  return {
    riskTrend: {
      current: currentRisk,
      predicted: predictedRisk,
      confidence,
      timeframe: '4周后',
      factors: [
        { name: '运动频率', impact: exerciseFrequency >= 5 ? 'positive' : 'negative', score: Math.min(100, exerciseFrequency * 20) },
        { name: '完成度', impact: avgCompletion >= 80 ? 'positive' : 'negative', score: Math.round(avgCompletion) },
        { name: '学习进度', impact: completedEducation > 0 ? 'positive' : 'negative', score: totalEducation > 0 ? Math.round((completedEducation / totalEducation) * 100) : 0 }
      ]
    },
    futureForcast: weeklyPredictions,
    behaviorImpact,
    adjustments,
    confidence,
    scoreTrend,
    currentScore
  }
}

// 计算趋势
function calculateTrend(assessments: any[]) {
  if (assessments.length < 2) {
    return { direction: 'stable', change: 0, message: '数据不足，继续检测以获得趋势分析' }
  }

  const latest = assessments[0]?.overall_score || 0
  const oldest = assessments[assessments.length - 1]?.overall_score || 0
  const change = latest - oldest

  let direction = 'stable'
  let message = '体态状况保持稳定'

  if (change > 5) {
    direction = 'improving'
    message = `体态持续改善，评分提升${change}分`
  } else if (change < -5) {
    direction = 'declining'
    message = `体态需要关注，评分下降${Math.abs(change)}分`
  }

  return { direction, change, message }
}
