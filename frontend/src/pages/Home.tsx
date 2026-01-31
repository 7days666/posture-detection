import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TabBar from '../components/TabBar'
import { getProfile, Profile } from '../api/profile'
import {
  ReportIcon, ArchiveIcon,
  AIIcon, FollowUpIcon, SurveyIcon, ShopIcon
} from '../components/Icons'
import './Home.css'

interface User {
  id: number
  name: string
  phone: string
}

const features = [
  { icon: ReportIcon, label: '我的报告', color: '#4ecdc4', path: '/report' },
  { icon: ArchiveIcon, label: '档案管理', color: '#f6ad55', path: '/archive' },
  { icon: AIIcon, label: 'AI体态检测', color: '#68d391', path: '/ai-detect' },
  { icon: FollowUpIcon, label: '随访管理', color: '#b794f4', path: '/follow-up' },
  { icon: SurveyIcon, label: '问卷调查', color: '#f687b3', path: '/survey' },
  { icon: ShopIcon, label: '商城', color: '#fbd38d', path: '/shop' },
]

export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

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

    // 从后端获取档案
    fetchProfile()
  }, [navigate])

  const fetchProfile = async () => {
    try {
      const res = await getProfile()
      if (res.data.success && res.data.data) {
        setProfile(res.data.data)
        localStorage.setItem('onboarded', 'true')
      } else {
        // 没有档案，跳转到引导页
        navigate('/onboarding')
      }
    } catch (error) {
      console.error('获取档案失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFeatureClick = (path: string) => {
    if (path === '/ai-detect') {
      navigate(path)
    } else {
      console.log('Navigate to:', path)
    }
  }

  const handleEditProfile = () => {
    navigate('/onboarding', { state: { edit: true, profile } })
  }

  const getAgeGroupLabel = () => {
    return profile?.ageGroup === 'child' ? '儿童' : '青少年'
  }

  const getGenderLabel = () => {
    return profile?.gender === '男' ? '男' : '女'
  }

  // 获取运动频率
  const getExerciseFreq = () => {
    if (profile?.ageGroup === 'child') {
      return profile?.exerciseFreqChild || '--'
    }
    return profile?.exerciseFreqTeen || '--'
  }

  // 获取体态问题
  const getSpineIssues = () => {
    if (!profile?.spineIssues || profile.spineIssues === '无') return null
    return profile.spineIssues
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-bg"></div>
        <h1>脊安守护</h1>
      </header>

      <div className="home-content">
        {/* 用户档案卡片 */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar-home">
              <span>{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="profile-info">
              <h3>{user?.name || '用户'}</h3>
              <span className="profile-tag">{getAgeGroupLabel()} · {getGenderLabel()} · {profile?.age}岁</span>
            </div>
            <button className="edit-btn" onClick={handleEditProfile}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{profile?.height || '--'}</span>
              <span className="stat-label">身高(cm)</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">{profile?.weight || '--'}</span>
              <span className="stat-label">体重(kg)</span>
            </div>
            <div className="stat-divider"></div>
            {calculateBMI() ? (
              <div className="stat-item">
                <span className="stat-value" style={{ color: getBMIStatus(parseFloat(calculateBMI()!)).color }}>
                  {calculateBMI()}
                </span>
                <span className="stat-label">
                  BMI · {getBMIStatus(parseFloat(calculateBMI()!)).text}
                </span>
              </div>
            ) : (
              <div className="stat-item">
                <span className="stat-value">--</span>
                <span className="stat-label">BMI</span>
              </div>
            )}
          </div>

          <div className="profile-extra">
            <div className="extra-item">
              <span className="extra-label">{profile?.ageGroup === 'teen' ? '学段' : '生长期'}</span>
              <span className="extra-value">
                {profile?.ageGroup === 'teen' ? (profile?.schoolStage || '--') : (profile?.isRapidGrowth || '--')}
              </span>
            </div>
            <div className="extra-item">
              <span className="extra-label">运动频率</span>
              <span className="extra-value">{getExerciseFreq()}</span>
            </div>
          </div>

          {getSpineIssues() && (
            <div className="health-alert">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <circle cx="12" cy="12" r="10" stroke="#f6ad55" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="#f6ad55" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>体态状况：{getSpineIssues()}</span>
            </div>
          )}
        </div>

        {/* 功能网格 */}
        <div className="feature-grid">
          {features.map((item, index) => (
            <div
              key={item.label}
              className="feature-item"
              style={{ '--delay': `${index * 0.05}s` } as React.CSSProperties}
              onClick={() => handleFeatureClick(item.path)}
            >
              <div className="feature-icon" style={{ '--icon-color': item.color } as React.CSSProperties}>
                <item.icon color={item.color} />
              </div>
              <span className="feature-label">{item.label}</span>
            </div>
          ))}
        </div>

        {/* 健康提示 */}
        <div className="health-tip">
          <div className="tip-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" className="tip-svg">
              <circle cx="12" cy="12" r="10" stroke="#4ecdc4" strokeWidth="2"/>
              <path d="M12 7V13" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="17" r="1" fill="#4ecdc4"/>
            </svg>
          </div>
          <div className="tip-content">
            <span className="tip-title">健康小贴士</span>
            <p>定期进行体态检测，及早发现脊柱侧弯等问题，是保护孩子健康成长的重要措施。</p>
          </div>
        </div>
      </div>

      <TabBar />
    </div>
  )
}
