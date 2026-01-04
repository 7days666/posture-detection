import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import { initDB } from './db.js'

const app = express()
const PORT = 4000

app.use(cors())
app.use(express.json())

// 初始化数据库
initDB()

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)

// 健康检查
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', message: '儿童青少年体态检测平台 API 运行中' })
})

app.listen(PORT, () => {
  console.log(`🚀 后端服务已启动: http://localhost:${PORT}`)
})
