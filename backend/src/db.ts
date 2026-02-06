import { readFileSync, writeFileSync, existsSync } from 'fs'

const DB_FILE = 'data.json'

export interface User {
  id: number
  phone: string
  password: string
  name: string
  createdAt: string
}

export interface Profile {
  id: number
  userId: number
  ageGroup: 'child' | 'teen' | 'youth'
  gender: 'male' | 'female'
  age: string
  height: string
  weight: string
  grade: string
  sittingHours: string
  screenTime: string
  sleepHours: string
  exerciseFrequency: string
  hasSpineIssue: string
  createdAt: string
  updatedAt: string
}

interface DB {
  users: User[]
  profiles: Profile[]
  nextUserId: number
  nextProfileId: number
}

function loadDB(): DB {
  if (!existsSync(DB_FILE)) {
    return { users: [], profiles: [], nextUserId: 1, nextProfileId: 1 }
  }
  return JSON.parse(readFileSync(DB_FILE, 'utf-8'))
}

function saveDB(db: DB) {
  writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
}

// 用户相关
export function findUserByPhone(phone: string): User | undefined {
  const db = loadDB()
  return db.users.find(u => u.phone === phone)
}

export function findUserById(id: number): User | undefined {
  const db = loadDB()
  return db.users.find(u => u.id === id)
}

export function createUser(phone: string, password: string, name: string): User {
  const db = loadDB()
  const user: User = {
    id: db.nextUserId++,
    phone,
    password,
    name,
    createdAt: new Date().toISOString()
  }
  db.users.push(user)
  saveDB(db)
  return user
}

// 档案相关
export function findProfileByUserId(userId: number): Profile | undefined {
  const db = loadDB()
  return db.profiles.find(p => p.userId === userId)
}

export function createProfile(userId: number, data: Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Profile {
  const db = loadDB()
  const profile: Profile = {
    id: db.nextProfileId++,
    userId,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  db.profiles.push(profile)
  saveDB(db)
  return profile
}

export function updateProfile(userId: number, data: Partial<Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Profile | null {
  const db = loadDB()
  const index = db.profiles.findIndex(p => p.userId === userId)
  
  if (index === -1) return null
  
  db.profiles[index] = {
    ...db.profiles[index],
    ...data,
    updatedAt: new Date().toISOString()
  }
  saveDB(db)
  return db.profiles[index]
}

export function initDB() {
  if (!existsSync(DB_FILE)) {
    saveDB({ users: [], profiles: [], nextUserId: 1, nextProfileId: 1 })
  }
  console.log('✅ 数据库初始化完成')
}
