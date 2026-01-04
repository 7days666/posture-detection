-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_no TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_user_no ON users(user_no);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
