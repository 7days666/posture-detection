import { Hono } from 'hono'
import { hashPassword, verifyPassword } from '../utils/password'
import { signJWT } from '../utils/jwt'

type Bindings = {
  DB: D1Database
}

export const authRoutes = new Hono<{ Bindings: Bindings }>()

// 注册
authRoutes.post('/register', async (c) => {
  try {
    const { phone, password } = await c.req.json()

    if (!phone || !password) {
      return c.json({ success: false, message: '请填写完整信息' }, 400)
    }

    // 检查手机号是否已注册
    const existing = await c.env.DB.prepare(
      'SELECT id FROM users WHERE phone = ?'
    ).bind(phone).first()

    if (existing) {
      return c.json({ success: false, message: '该手机号已注册' }, 400)
    }

    // 获取当前用户数量生成编号
    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM users'
    ).first<{ count: number }>()
    const userCount = countResult?.count || 0
    const userNo = `U${String(userCount + 1).padStart(6, '0')}` // 生成编号如 U000001

    // 加密密码并创建用户
    const hashedPassword = await hashPassword(password)
    await c.env.DB.prepare(
      'INSERT INTO users (phone, password, name) VALUES (?, ?, ?)'
    ).bind(phone, hashedPassword, userNo).run()

    return c.json({ success: true, message: '注册成功' })
  } catch (error) {
    console.error('注册错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})

// 登录
authRoutes.post('/login', async (c) => {
  try {
    const { phone, password } = await c.req.json()

    if (!phone || !password) {
      return c.json({ success: false, message: '请填写完整信息' }, 400)
    }

    // 查找用户
    const user = await c.env.DB.prepare(
      'SELECT id, phone, password, name FROM users WHERE phone = ?'
    ).bind(phone).first<{ id: number; phone: string; password: string; name: string }>()

    if (!user) {
      return c.json({ success: false, message: '用户不存在' }, 400)
    }

    // 验证密码
    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      return c.json({ success: false, message: '密码错误' }, 400)
    }

    // 生成 token
    const token = signJWT({ id: user.id, phone: user.phone })

    return c.json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name
      }
    })
  } catch (error) {
    console.error('登录错误:', error)
    return c.json({ success: false, message: '服务器错误' }, 500)
  }
})
