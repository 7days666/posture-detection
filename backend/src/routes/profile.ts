import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { findProfileByUserId, createProfile, updateProfile } from '../db.js'

const router = Router()
const JWT_SECRET = 'posture-detection-secret-key-2024'

// 验证 token 中间件
function authMiddleware(req: Request, res: Response, next: () => void) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    res.status(401).json({ success: false, message: '未登录' })
    return
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; phone: string }
    req.body.userId = decoded.id
    next()
  } catch {
    res.status(401).json({ success: false, message: 'token无效' })
  }
}

// 获取档案
router.get('/', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = req.body.userId
    const profile = findProfileByUserId(userId)
    
    if (!profile) {
      res.json({ success: true, data: null })
      return
    }
    
    res.json({ success: true, data: profile })
  } catch (error) {
    console.error('获取档案错误:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 创建或更新档案
router.post('/', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = req.body.userId
    const { ageGroup, gender, age, height, weight, hasSpineIssue, exerciseFrequency } = req.body
    
    if (!ageGroup || !gender || !age || !height || !weight) {
      res.status(400).json({ success: false, message: '请填写完整信息' })
      return
    }
    
    const existingProfile = findProfileByUserId(userId)
    
    let profile
    if (existingProfile) {
      profile = updateProfile(userId, { ageGroup, gender, age, height, weight, hasSpineIssue, exerciseFrequency })
    } else {
      profile = createProfile(userId, { ageGroup, gender, age, height, weight, hasSpineIssue, exerciseFrequency })
    }
    
    res.json({ success: true, message: existingProfile ? '更新成功' : '创建成功', data: profile })
  } catch (error) {
    console.error('保存档案错误:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 更新档案
router.put('/', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = req.body.userId
    const { ageGroup, gender, age, height, weight, hasSpineIssue, exerciseFrequency } = req.body
    
    const profile = updateProfile(userId, { ageGroup, gender, age, height, weight, hasSpineIssue, exerciseFrequency })
    
    if (!profile) {
      res.status(404).json({ success: false, message: '档案不存在' })
      return
    }
    
    res.json({ success: true, message: '更新成功', data: profile })
  } catch (error) {
    console.error('更新档案错误:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

export default router
