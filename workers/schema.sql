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
