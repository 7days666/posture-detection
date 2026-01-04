import { Hono } from 'hono'
import { verifyJWT } from '../utils/jwt'

type Env = {
  DB: D1Database
}

const profileRoutes = new Hono<{ Bindings: Env }>()

// JWT 验证中间件
profileRoutes.use('/*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: '未授权' }, 401)
  }
  
  const token = authHeader.substring(7)
  const payload = verifyJWT(token)
  
  if (!payload) {
    return c.json({ success: false, message: 'Token 无效' }, 401)
  }
  
  c.set('userId' as never, payload.id as never)
  await next()
})

// 保存档案
profileRoutes.post('/', async (c) => {
  try {
    const userId = c.get('userId' as never) as number
    const data = await c.req.json()
    
    console.log('Received data:', JSON.stringify(data))
    
    // 转换数据类型
    const birthYear = data.birthYear ? parseInt(data.birthYear) : null
    const age = data.age ? parseInt(data.age) : null
    
    // 检查是否已有档案
    const existing = await c.env.DB.prepare(
      'SELECT id FROM profiles WHERE user_id = ?'
    ).bind(userId).first()

    if (existing) {
      // 更新档案
      await c.env.DB.prepare(`
        UPDATE profiles SET
          age_group = ?, gender = ?, birth_year = ?, age = ?,
          height = ?, weight = ?,
          is_rapid_growth = ?, screen_time_child = ?, exercise_freq_child = ?, daily_posture = ?,
          school_stage = ?, height_growth = ?, sitting_hours = ?, exercise_freq_teen = ?, posture_symptoms = ?,
          spine_issues = ?, consent_agreed = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).bind(
        data.ageGroup, data.gender, birthYear, age,
        data.height, data.weight,
        data.isRapidGrowth || null, data.screenTimeChild || null, data.exerciseFreqChild || null, data.dailyPosture || null,
        data.schoolStage || null, data.heightGrowth || null, data.sittingHours || null, data.exerciseFreqTeen || null, data.postureSymptoms || null,
        data.spineIssues || null, data.consentAgreed ? 1 : 0,
        userId
      ).run()
    } else {
      // 创建新档案
      await c.env.DB.prepare(`
        INSERT INTO profiles (
          user_id, age_group, gender, birth_year, age, height, weight,
          is_rapid_growth, screen_time_child, exercise_freq_child, daily_posture,
          school_stage, height_growth, sitting_hours, exercise_freq_teen, posture_symptoms,
          spine_issues, consent_agreed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        userId, data.ageGroup, data.gender, birthYear, age,
        data.height, data.weight,
        data.isRapidGrowth || null, data.screenTimeChild || null, data.exerciseFreqChild || null, data.dailyPosture || null,
        data.schoolStage || null, data.heightGrowth || null, data.sittingHours || null, data.exerciseFreqTeen || null, data.postureSymptoms || null,
        data.spineIssues || null, data.consentAgreed ? 1 : 0
      ).run()
    }

    return c.json({ success: true, message: '保存成功' })
  } catch (error: any) {
    console.error('Save profile error:', error.message || error)
    return c.json({ success: false, message: '保存失败: ' + (error.message || '未知错误') }, 500)
  }
})

// 获取档案
profileRoutes.get('/', async (c) => {
  try {
    const userId = c.get('userId' as never) as number
    
    const result = await c.env.DB.prepare(
      'SELECT * FROM profiles WHERE user_id = ?'
    ).bind(userId).first()

    if (!result) {
      return c.json({ success: true, data: null })
    }

    // 转换字段名为驼峰
    const profileData = {
      id: result.id,
      userId: result.user_id,
      ageGroup: result.age_group,
      gender: result.gender,
      birthYear: result.birth_year,
      age: result.age,
      height: result.height,
      weight: result.weight,
      isRapidGrowth: result.is_rapid_growth,
      screenTimeChild: result.screen_time_child,
      exerciseFreqChild: result.exercise_freq_child,
      dailyPosture: result.daily_posture,
      schoolStage: result.school_stage,
      heightGrowth: result.height_growth,
      sittingHours: result.sitting_hours,
      exerciseFreqTeen: result.exercise_freq_teen,
      postureSymptoms: result.posture_symptoms,
      spineIssues: result.spine_issues,
      consentAgreed: result.consent_agreed === 1
    }

    return c.json({ success: true, data: profileData })
  } catch (error) {
    console.error('Get profile error:', error)
    return c.json({ success: false, message: '获取失败' }, 500)
  }
})

export default profileRoutes
