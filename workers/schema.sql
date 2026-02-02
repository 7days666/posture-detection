-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户档案表（重新设计）
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  age_group TEXT NOT NULL,
  gender TEXT NOT NULL,
  birth_year INTEGER,
  age INTEGER,
  height TEXT,
  weight TEXT,
  
  -- 儿童特有字段
  is_rapid_growth TEXT,
  screen_time_child TEXT,
  exercise_freq_child TEXT,
  daily_posture TEXT,
  
  -- 青少年特有字段
  school_stage TEXT,
  height_growth TEXT,
  sitting_hours TEXT,
  exercise_freq_teen TEXT,
  posture_symptoms TEXT,
  
  -- 共有字段
  spine_issues TEXT,
  
  -- 知情同意
  consent_agreed INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 体态检测记录表
CREATE TABLE IF NOT EXISTS posture_assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,

  -- 检测结果
  overall_score INTEGER,  -- 总体评分 0-100
  head_forward_angle REAL,  -- 头部前倾角度
  shoulder_level_diff REAL,  -- 肩膀高低差
  spine_curvature REAL,  -- 脊柱弯曲度
  pelvis_tilt REAL,  -- 骨盆倾斜

  -- 风险等级
  risk_level TEXT,  -- low, medium, high

  -- AI检测的关键点数据 (JSON)
  keypoints_data TEXT,

  -- AI生成的建议
  ai_suggestions TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 运动记录表
CREATE TABLE IF NOT EXISTS exercise_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,

  -- 运动信息
  exercise_type TEXT NOT NULL,  -- 运动类型
  exercise_name TEXT,  -- 运动名称
  duration_minutes INTEGER,  -- 运动时长(分钟)
  completion_rate INTEGER,  -- 完成度 0-100

  -- 运动效果评估
  calories_burned INTEGER,
  difficulty_level TEXT,  -- easy, medium, hard

  -- 用户反馈
  user_rating INTEGER,  -- 用户评分 1-5
  notes TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 健康教育学习记录表
CREATE TABLE IF NOT EXISTS education_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,

  -- 学习内容
  content_id TEXT NOT NULL,  -- 内容ID
  content_type TEXT NOT NULL,  -- article, video, course
  content_title TEXT,

  -- 学习进度
  progress INTEGER DEFAULT 0,  -- 进度 0-100
  completed INTEGER DEFAULT 0,

  -- 学习时长
  duration_seconds INTEGER DEFAULT 0,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 健康教育内容表
CREATE TABLE IF NOT EXISTS education_contents (
  id TEXT PRIMARY KEY,

  -- 内容信息
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL,  -- article, video, course
  category TEXT,  -- posture, exercise, prevention, nutrition

  -- 内容详情
  content_body TEXT,  -- 文章内容/视频链接/课程内容(JSON)
  thumbnail_url TEXT,
  duration_minutes INTEGER,  -- 视频/课程时长

  -- 目标人群
  target_age_group TEXT,  -- child, teen, all
  target_risk_level TEXT,  -- low, medium, high, all

  -- 元数据
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,

  is_published INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户健康目标表
CREATE TABLE IF NOT EXISTS health_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,

  -- 目标信息
  goal_type TEXT NOT NULL,  -- posture_improvement, exercise_frequency, education
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,

  -- 时间范围
  start_date DATE,
  end_date DATE,

  -- 状态
  status TEXT DEFAULT 'active',  -- active, completed, abandoned

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- AI预测记录表
CREATE TABLE IF NOT EXISTS ai_predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,

  -- 预测类型
  prediction_type TEXT NOT NULL,  -- risk_trend, behavior_impact, improvement_forecast

  -- 预测结果 (JSON格式)
  prediction_data TEXT NOT NULL,

  -- 置信度
  confidence_score REAL,

  -- 基于的数据范围
  data_start_date DATE,
  data_end_date DATE,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_posture_assessments_user_id ON posture_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_posture_assessments_created_at ON posture_assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_exercise_records_user_id ON exercise_records(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_records_created_at ON exercise_records(created_at);
CREATE INDEX IF NOT EXISTS idx_education_records_user_id ON education_records(user_id);
CREATE INDEX IF NOT EXISTS idx_education_contents_category ON education_contents(category);
CREATE INDEX IF NOT EXISTS idx_health_goals_user_id ON health_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_user_id ON ai_predictions(user_id);

-- =====================================================
-- 积分奖励制度相关表
-- =====================================================

-- 用户积分表
CREATE TABLE IF NOT EXISTS user_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  balance INTEGER DEFAULT 0,              -- 当前积分余额
  total_earned INTEGER DEFAULT 0,         -- 累计获得积分
  total_spent INTEGER DEFAULT 0,          -- 累计消费积分
  consecutive_months INTEGER DEFAULT 0,   -- 连续检测月数
  last_detection_month TEXT,              -- 最后检测月份 (YYYY-MM)
  streak_start_month TEXT,                -- 连续检测开始月份 (YYYY-MM)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 积分变动日志表
CREATE TABLE IF NOT EXISTS points_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  change_type TEXT NOT NULL,              -- detection, makeup, redeem, admin_adjust
  change_amount INTEGER NOT NULL,         -- 变动数量（正数增加，负数减少）
  balance_after INTEGER NOT NULL,         -- 变动后余额
  reference_id INTEGER,                   -- 关联ID（检测ID/订单ID等）
  reference_type TEXT,                    -- 关联类型
  description TEXT,                       -- 变动描述
  operator_id INTEGER,                    -- 操作人ID（管理员调整时）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 商品表
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                     -- 商品名称
  description TEXT,                       -- 商品描述
  image_url TEXT,                         -- 商品图片URL
  points_required INTEGER NOT NULL,       -- 所需积分
  min_consecutive_months INTEGER DEFAULT 3, -- 最低连续月数要求
  stock INTEGER DEFAULT 0,                -- 库存数量
  category TEXT,                          -- 商品分类
  is_active INTEGER DEFAULT 1,            -- 是否上架
  sort_order INTEGER DEFAULT 0,           -- 排序权重
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 兑换订单表
CREATE TABLE IF NOT EXISTS redemption_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,             -- 冗余存储商品名称
  points_spent INTEGER NOT NULL,          -- 消耗积分
  quantity INTEGER DEFAULT 1,             -- 兑换数量
  status TEXT DEFAULT 'pending',          -- pending, processing, shipped, completed, cancelled
  shipping_info TEXT,                     -- 收货信息（JSON）
  admin_notes TEXT,                       -- 管理员备注
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 补测申请表
CREATE TABLE IF NOT EXISTS makeup_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  target_month TEXT NOT NULL,             -- 补测目标月份 (YYYY-MM)
  status TEXT DEFAULT 'pending',          -- pending, approved, rejected
  assessment_id INTEGER,                  -- 关联的检测记录ID
  reviewed_by INTEGER,                    -- 审核人ID
  reviewed_at DATETIME,                   -- 审核时间
  reject_reason TEXT,                     -- 拒绝原因
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 积分相关索引
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_points_logs_user_id ON points_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_points_logs_change_type ON points_logs(change_type);
CREATE INDEX IF NOT EXISTS idx_points_logs_created_at ON points_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_points_required ON products(points_required);
CREATE INDEX IF NOT EXISTS idx_redemption_orders_user_id ON redemption_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_redemption_orders_status ON redemption_orders(status);
CREATE INDEX IF NOT EXISTS idx_redemption_orders_created_at ON redemption_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_makeup_requests_user_id ON makeup_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_makeup_requests_target_month ON makeup_requests(target_month);
CREATE INDEX IF NOT EXISTS idx_makeup_requests_status ON makeup_requests(status);
