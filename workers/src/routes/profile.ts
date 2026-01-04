import { Hono } from 'hono'
import { verifyJWT } from '../utils/jwt'

type Bindings = {
  DB: D1Database
}

export const profileRoutes = new Hono<{ Bindings: Bindings }>()

// 验证中间件
async function getAuthUser(c: any): Promise<{ id: number; phone: string } | null> {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  return verifyJWT(token)
}

// 获取档案
profileRoutes.get('/', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) {
      return c.json({ success: false, message: '未登录' }, 401)
    }

    const profile = await c.env.DB.prepare(
      `SELECT id, user_id as userId, age_group as ageGroup, gender, age, height, weight, 
       grade, sitting_hours as sittingHours, screen_time as screenTime, 
       sleep_hours as sleepHours, exercise_frequency as exerciseFrequency, 
       has_spine_issue as hasSpineIssue, created_at as createdAt, updated_at as updatedAt
       FROM profiles WHERE user_id = ?`
    ).bind(user.id).first()

    return c.json({ success: true, data: profile || null })
  } catch (error) {
    console.error('获取档案错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 创建或更新档案
profileRoutes.post('/', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) {
      return c.json({ success: false, message: '未登录' }, 401)
    }

    const body = await c.req.json()
    const { ageGroup, gender, age, height, weight, grade, sittingHours, screenTime, sleepHours, exerciseFrequency, hasSpineIssue } = body

    if (!ageGroup || !gender || !age || !height || !weight) {
      return c.json({ success: false, message: '请填写完整信息' }, 400)
    }

    // 检查是否已有档案
    const existing = await c.env.DB.prepare(
      'SELECT id FROM profiles WHERE user_id = ?'
    ).bind(user.id).first()

    if (existing) {
      // 更新
      await c.env.DB.prepare(
        `UPDATE profiles SET age_group = ?, gender = ?, age = ?, height = ?, weight = ?, 
         grade = ?, sitting_hours = ?, screen_time = ?, sleep_hours = ?, 
         exercise_frequency = ?, has_spine_issue = ?, updated_at = datetime('now')
         WHERE user_id = ?`
      ).bind(ageGroup, gender, age, height, weight, grade || '', sittingHours || '', screenTime || '', sleepHours || '', exerciseFrequency || '', hasSpineIssue || '', user.id).run()

      return c.json({ success: true, message: '更新成功' })
    } else {
      // 创建
      await c.env.DB.prepare(
        `INSERT INTO profiles (user_id, age_group, gender, age, height, weight, grade, 
         sitting_hours, screen_time, sleep_hours, exercise_frequency, has_spine_issue)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(user.id, ageGroup, gender, age, height, weight, grade || '', sittingHours || '', screenTime || '', sleepHours || '', exerciseFrequency || '', hasSpineIssue || '').run()

      return c.json({ success: true, message: '创建成功' })
    }
  } catch (error) {
    console.error('保存档案错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 更新档案
profileRoutes.put('/', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) {
      return c.json({ success: false, message: '未登录' }, 401)
    }

    const body = await c.req.json()
    const { ageGroup, gender, age, height, weight, grade, sittingHours, screenTime, sleepHours, exerciseFrequency, hasSpineIssue } = body

    const result = await c.env.DB.prepare(
      `UPDATE profiles SET age_group = ?, gender = ?, age = ?, height = ?, weight = ?, 
       grade = ?, sitting_hours = ?, screen_time = ?, sleep_hours = ?, 
       exercise_frequency = ?, has_spine_issue = ?, updated_at = datetime('now')
       WHERE user_id = ?`
    ).bind(ageGroup, gender, age, height, weight, grade || '', sittingHours || '', screenTime || '', sleepHours || '', exerciseFrequency || '', hasSpineIssue || '', user.id).run()

    if (result.meta.changes === 0) {
      return c.json({ success: false, message: '档案不存在' }, 404)
    }

    return c.json({ success: true, message: '更新成功' })
  } catch (error) {
    console.error('更新档案错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})
