import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRoutes } from './routes/auth'
import profileRoutes from './routes/profile'

export type Env = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Env }>()

// CORS
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// 路由
app.route('/api/auth', authRoutes)
app.route('/api/profile', profileRoutes)

// 健康检查
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', message: '儿童青少年体态检测平台 API 运行中' })
})

app.get('/', (c) => {
  return c.json({ message: 'Posture Detection API' })
})

export default app
