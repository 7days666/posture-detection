import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TabBar from '../components/TabBar'
import { ArrowRightIcon } from '../components/Icons'
import { getProfile, Profile as ProfileType } from '../api/profile'
import './Profile.css'

interface User {
  id: number
  name: string
  phone: string
}

const menuItems = [
  { label: '检测记录', icon: 'chart', path: '/tracking' },
  { label: '消息通知', icon: 'bell', path: '' },
  { label: '设置', icon: 'settings', path: '' },
]

const MenuIcon = ({ type }: { type: string }) => {
  const icons: Record<string, JSX.Element> = {
    chart: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="12" width="4" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
        <rect x="10" y="8" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="2"/>
        <rect x="17" y="4" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    bell: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M18 8c0-3.314-2.686-6-6-6S6 4.686 6 8c0 7-3 9-3 9h18s-3-2-3-9z" stroke="currentColor" strokeWidth="2"/>
        <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  }
  return icons[type] || null
}

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileType | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token) {
      navigate('/login')
      return
    }
    
    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetchProfile()
  }, [navigate])

  const fetchProfile = async () => {
    try {
      const res = await getProfile()
      if (res.data.success && res.data.data) {
        setProfile(res.data.data)
      }
    } catch (error) {
      console.error('获取档案失败:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('onboarded')
    navigate('/login')
  }

  const handleEditProfile = () => {
    navigate('/onboarding', { state: { edit: true, profile } })
  }

  const getAgeGroupLabel = () => {
    return profile?.ageGroup === 'child' ? '儿童' : '青少年'
  }

  const getGenderLabel = () => {
    return profile?.gender || '--'
  }

  // 获取运动频率
  const getExerciseFreq = () => {
    if (profile?.ageGroup === 'child') {
      return profile?.exerciseFreqChild || '--'
    }
    return profile?.exerciseFreqTeen || '--'
  }

  // 获取屏幕/久坐时间
  const getScreenOrSittingTime = () => {
    if (profile?.ageGroup === 'child') {
      return { label: '屏幕时间', value: profile?.screenTimeChild || '--' }
    }
    return { label: '久坐时间', value: profile?.sittingHours || '--' }
  }

  // 计算BMI
  const calculateBMI = () => {
    const height = parseFloat(profile?.height || '0')
    const weight = parseFloat(profile?.weight || '0')
    if (height > 0 && weight > 0) {
      const heightM = height / 100
      const bmi = weight / (heightM * heightM)
      return bmi.toFixed(1)
    }
    return null
  }

  // 获取BMI状态
  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: '偏瘦', color: '#63b3ed' }
    if (bmi < 24) return { text: '正常', color: '#68d391' }
    if (bmi < 28) return { text: '偏胖', color: '#f6ad55' }
    return { text: '肥胖', color: '#fc8181' }
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="header-bg-profile"></div>
        <div className="profile-avatar">
          <span>{user?.name?.charAt(0) || 'U'}</span>
          <div className="avatar-glow"></div>
        </div>
        <h2 className="profile-name">{user?.name || '用户'}</h2>
        <p className="profile-phone">{user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</p>
      </header>

      <div className="profile-content">
        {/* 档案信息卡片 */}
        <div className="info-card">
          <div className="info-card-header">
            <h3>个人档案</h3>
            <button className="edit-info-btn" onClick={handleEditProfile}>
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              编辑
            </button>
          </div>
          
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">类型</span>
              <span className="info-value">{getAgeGroupLabel()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">性别</span>
              <span className="info-value">{getGenderLabel()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">年龄</span>
              <span className="info-value">{profile?.age || '--'}岁</span>
            </div>
            <div className="info-item">
              <span className="info-label">{profile?.ageGroup === 'teen' ? '学段' : '生长期'}</span>
              <span className="info-value">
                {profile?.ageGroup === 'teen' ? (profile?.schoolStage || '--') : (profile?.isRapidGrowth || '--')}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">身高</span>
              <span className="info-value">{profile?.height || '--'} cm</span>
            </div>
            <div className="info-item">
              <span className="info-label">体重</span>
              <span className="info-value">{profile?.weight || '--'} kg</span>
            </div>
          </div>

          {/* BMI 显示 */}
          {calculateBMI() && (
            <div className="bmi-section">
              <div className="bmi-display">
                <div className="bmi-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                    <circle cx="12" cy="12" r="10" stroke={getBMIStatus(parseFloat(calculateBMI()!)).color} strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke={getBMIStatus(parseFloat(calculateBMI()!)).color} strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="bmi-info">
                  <span className="bmi-label">BMI 指数</span>
                  <div className="bmi-value-row">
                    <span className="bmi-number" style={{ color: getBMIStatus(parseFloat(calculateBMI()!)).color }}>
                      {calculateBMI()}
                    </span>
                    <span className="bmi-status-tag" style={{ backgroundColor: getBMIStatus(parseFloat(calculateBMI()!)).color }}>
                      {getBMIStatus(parseFloat(calculateBMI()!)).text}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="habits-section">
            <h4>生活习惯</h4>
            <div className="habits-grid">
              <div className="habit-item">
                <span className="habit-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <rect x="5" y="2" width="14" height="20" rx="2" stroke="#63b3ed" strokeWidth="2"/>
                    <path d="M9 18h6" stroke="#63b3ed" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
                <div>
                  <span className="habit-label">{getScreenOrSittingTime().label}</span>
                  <span className="habit-value">{getScreenOrSittingTime().value}</span>
                </div>
              </div>
              <div className="habit-item">
                <span className="habit-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <circle cx="12" cy="12" r="9" stroke="#68d391" strokeWidth="2"/>
                    <path d="M12 7v5l3 3" stroke="#68d391" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
                <div>
                  <span className="habit-label">运动频率</span>
                  <span className="habit-value">{getExerciseFreq()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="health-status">
            <div className="health-status-header">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>体态状况</span>
            </div>
            <p className="health-status-text">
              当前情况：<strong>{profile?.spineIssues || '未填写'}</strong>
            </p>
          </div>
        </div>

        {/* 菜单列表 */}
        <div className="menu-card">
          {menuItems.map((item, index) => (
            <div 
              key={item.label} 
              className="menu-item"
              style={{ '--delay': `${index * 0.05}s` } as React.CSSProperties}
              onClick={() => item.path && navigate(item.path)}
            >
              <span className="menu-icon">
                <MenuIcon type={item.icon} />
              </span>
              <span className="menu-label">{item.label}</span>
              <span className="menu-arrow"><ArrowRightIcon /></span>
            </div>
          ))}
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          退出登录
        </button>
      </div>

      <TabBar />
    </div>
  )
}
