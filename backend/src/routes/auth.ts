import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { findUserByPhone, createUser } from '../db.js'

const router = Router()
const JWT_SECRET = 'posture-detection-secret-key-2024'

// 注册
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { phone, password, name } = req.body

    if (!phone || !password || !name) {
      res.status(400).json({ success: false, message: '请填写完整信息' })
      return
    }

    // 检查手机号是否已注册
    const existing = findUserByPhone(phone)
    if (existing) {
      res.status(400).json({ success: false, message: '该手机号已注册' })
      return
    }

    // 加密密码并创建用户
    const hashedPassword = await bcrypt.hash(password, 10)
    createUser(phone, hashedPassword, name)

    res.json({ success: true, message: '注册成功' })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body

    if (!phone || !password) {
      res.status(400).json({ success: false, message: '请填写完整信息' })
      return
    }

    // 查找用户
    const user = findUserByPhone(phone)
    if (!user) {
      res.status(400).json({ success: false, message: '用户不存在' })
      return
    }

    // 验证密码
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      res.status(400).json({ success: false, message: '密码错误' })
      return
    }

    // 生成 token
    const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' })

    res.json({
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
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

export default router
