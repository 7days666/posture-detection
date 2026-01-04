# 儿童青少年体态检测平台

## 项目结构

```
├── frontend/          # React 前端 (Cloudflare Pages)
├── workers/           # Cloudflare Workers 后端 + D1 数据库
└── backend/           # 旧版 Express 后端 (已弃用)
```

## 本地开发

### 1. 安装依赖

```bash
# 前端
cd frontend && npm install

# Workers
cd workers && npm install
```

### 2. 初始化本地数据库

```bash
cd workers
npm run db:migrate:local
```

### 3. 启动开发服务器

```bash
# 终端1: 启动 Workers
cd workers && npm run dev

# 终端2: 启动前端
cd frontend && npm run dev
```

前端: http://localhost:3000
Workers: http://localhost:8787

## 部署到 Cloudflare

### 1. 登录 Cloudflare

```bash
npx wrangler login
```

### 2. 创建 D1 数据库

```bash
cd workers
npm run db:create
```

复制返回的 `database_id`，更新 `workers/wrangler.toml` 中的 `database_id`

### 3. 初始化生产数据库

```bash
npm run db:migrate
```

### 4. 部署 Workers

```bash
npm run deploy
```

记下返回的 Workers URL

### 5. 更新前端环境变量

编辑 `frontend/.env.production`，将 `VITE_API_URL` 改为你的 Workers URL

### 6. 部署前端到 Cloudflare Pages

1. 在 Cloudflare Dashboard 创建 Pages 项目
2. 连接 Git 仓库
3. 构建设置:
   - 构建命令: `cd frontend && npm install && npm run build`
   - 输出目录: `frontend/dist`
4. 添加环境变量: `VITE_API_URL` = 你的 Workers URL
