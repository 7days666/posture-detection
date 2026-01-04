import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { saveProfile, ProfileData } from '../api/profile'
import './Onboarding.css'

type AgeGroup = 'child' | 'teen' | null
type Gender = 'male' | 'female' | null

interface FormData {
  ageGroup: AgeGroup
  gender: Gender
  age: string
  height: string
  weight: string
  hasSpineIssue: string
  exerciseFrequency: string
  // 新增字段
  grade: string
  sittingHours: string
  screenTime: string
  sleepHours: string
}

const steps = ['类型选择', '基本信息', '生活习惯', '健康状况']

export default function Onboarding() {
  const navigate = useNavigate()
  const location = useLocation()
  const isEdit = location.state?.edit === true
  const initialData = location.state?.profile as FormData | undefined

  const [step, setStep] = useState(isEdit ? 1 : 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>(initialData || {
    ageGroup: null,
    gender: null,
    age: '',
    height: '',
    weight: '',
    hasSpineIssue: '',
    exerciseFrequency: '',
    grade: '',
    sittingHours: '',
    screenTime: '',
    sleepHours: ''
  })

  const handleAgeGroupSelect = (group: AgeGroup) => {
    // 切换类型时清空年龄和年级
    setFormData({ ...formData, ageGroup: group, age: '', grade: '' })
  }

  const handleGenderSelect = (gender: Gender) => {
    setFormData({ ...formData, gender: gender })
  }

  const handleOptionSelect = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const canProceed = () => {
    if (step === 0) return formData.ageGroup !== null
    if (step === 1) return formData.gender && formData.age && formData.height && formData.weight && formData.grade
    if (step === 2) return formData.sittingHours && formData.screenTime && formData.sleepHours && formData.exerciseFrequency
    if (step === 3) return formData.hasSpineIssue
    return false
  }

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      setLoading(true)
      setError('')
      try {
        const res = await saveProfile(formData as unknown as ProfileData)
        if (res.data.success) {
          localStorage.setItem('onboarded', 'true')
          navigate('/home')
        } else {
          setError(res.data.message || '保存失败')
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } }
        setError(error.response?.data?.message || '网络错误')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    } else if (isEdit) {
      navigate(-1)
    }
  }

  // 儿童期年龄选项 (2-12岁)
  const childAges = ['2岁', '3岁', '4岁', '5岁', '6岁', '7岁', '8岁', '9岁', '10岁', '11岁', '12岁']
  // 青少年期年龄选项 (13-19岁)
  const teenAges = ['13岁', '14岁', '15岁', '16岁', '17岁', '18岁', '19岁']

  // 年级选项
  const childGrades = ['幼儿园小班', '幼儿园中班', '幼儿园大班', '一年级', '二年级', '三年级', '四年级', '五年级', '六年级']
  const teenGrades = ['初一', '初二', '初三', '高一', '高二', '高三', '大一', '大二', '其他']

  // 计算BMI
  const calculateBMI = () => {
    const height = parseFloat(formData.height)
    const weight = parseFloat(formData.weight)
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
    <div className="onboarding-container">
      {/* 进度条 */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${((step + 1) / 4) * 100}%` }}></div>
      </div>

      {/* 步骤指示 */}
      <div className="step-indicator">
        {steps.map((s, i) => (
          <div key={s} className={`step-dot ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
            {i < step ? (
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <span>{i + 1}</span>
            )}
          </div>
        ))}
      </div>

      {/* 步骤内容 */}
      <div className="step-content">
        {error && <div className="onboarding-error">{error}</div>}

        {step === 0 && (
          <div className="step-panel" key="step0">
            <h2>请选择检测对象类型</h2>
            <p className="step-desc">根据WHO标准，不同年龄段有不同的检测标准</p>
            
            <div className="type-cards">
              <div 
                className={`type-card ${formData.ageGroup === 'child' ? 'selected' : ''}`}
                onClick={() => handleAgeGroupSelect('child')}
              >
                <div className="type-icon child-icon">
                  <svg viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="14" r="8" stroke="currentColor" strokeWidth="3"/>
                    <path d="M12 44c0-8 5-14 12-14s12 6 12 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>儿童期</h3>
                <p>2-12岁</p>
                <div className="check-mark">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#4ecdc4"/>
                    <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div 
                className={`type-card ${formData.ageGroup === 'teen' ? 'selected' : ''}`}
                onClick={() => handleAgeGroupSelect('teen')}
              >
                <div className="type-icon teen-icon">
                  <svg viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="12" r="7" stroke="currentColor" strokeWidth="3"/>
                    <path d="M24 19v16M16 27h16M18 44l6-9 6 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>青少年期</h3>
                <p>13-19岁</p>
                <div className="check-mark">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#4ecdc4"/>
                    <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="step-panel" key="step1">
            <h2>基本信息</h2>
            <p className="step-desc">请填写检测对象的基本信息</p>

            <div className="form-section">
              <label className="section-label">性别</label>
              <div className="option-row">
                <div 
                  className={`option-card ${formData.gender === 'male' ? 'selected' : ''}`}
                  onClick={() => handleGenderSelect('male')}
                >
                  <span className="option-icon-svg">
                    <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
                      <circle cx="10" cy="14" r="5" stroke="#63b3ed" strokeWidth="2"/>
                      <path d="M14 10l6-6M20 4v5M15 4h5" stroke="#63b3ed" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <span>男</span>
                </div>
                <div 
                  className={`option-card ${formData.gender === 'female' ? 'selected' : ''}`}
                  onClick={() => handleGenderSelect('female')}
                >
                  <span className="option-icon-svg">
                    <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
                      <circle cx="12" cy="9" r="5" stroke="#f687b3" strokeWidth="2"/>
                      <path d="M12 14v7M9 18h6" stroke="#f687b3" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <span>女</span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <label className="section-label">年龄</label>
              <div className="option-grid">
                {(formData.ageGroup === 'child' ? childAges : teenAges).map(age => (
                  <div 
                    key={age}
                    className={`option-chip ${formData.age === age ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect('age', age)}
                  >
                    {age}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="section-label">年级/学段</label>
              <div className="option-grid">
                {(formData.ageGroup === 'child' ? childGrades : teenGrades).map(g => (
                  <div 
                    key={g}
                    className={`option-chip ${formData.grade === g ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect('grade', g)}
                  >
                    {g}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="section-label">身高 (cm)</label>
              <div className="input-row">
                <input
                  type="number"
                  className="number-input"
                  placeholder="请输入身高"
                  value={formData.height}
                  onChange={e => setFormData({ ...formData, height: e.target.value })}
                  min="50"
                  max="250"
                />
                <span className="input-unit">cm</span>
              </div>
            </div>

            <div className="form-section">
              <label className="section-label">体重 (kg)</label>
              <div className="input-row">
                <input
                  type="number"
                  className="number-input"
                  placeholder="请输入体重"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                  min="10"
                  max="200"
                />
                <span className="input-unit">kg</span>
              </div>
            </div>

            {/* BMI 显示 */}
            {calculateBMI() && (
              <div className="bmi-card">
                <div className="bmi-label">BMI 指数</div>
                <div className="bmi-value" style={{ color: getBMIStatus(parseFloat(calculateBMI()!)).color }}>
                  {calculateBMI()}
                </div>
                <div className="bmi-status" style={{ backgroundColor: getBMIStatus(parseFloat(calculateBMI()!)).color }}>
                  {getBMIStatus(parseFloat(calculateBMI()!)).text}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="step-panel" key="step2">
            <h2>生活习惯</h2>
            <p className="step-desc">了解日常习惯有助于更准确的评估</p>

            <div className="form-section">
              <label className="section-label">每天久坐时间（学习/上课）</label>
              <div className="option-list">
                {['少于2小时', '2-4小时', '4-6小时', '6-8小时', '8小时以上'].map(opt => (
                  <div 
                    key={opt}
                    className={`option-item ${formData.sittingHours === opt ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect('sittingHours', opt)}
                  >
                    <span className="option-radio"></span>
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="section-label">每天电子屏幕使用时间</label>
              <div className="option-list">
                {['少于1小时', '1-2小时', '2-4小时', '4小时以上'].map(opt => (
                  <div 
                    key={opt}
                    className={`option-item ${formData.screenTime === opt ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect('screenTime', opt)}
                  >
                    <span className="option-radio"></span>
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="section-label">每天睡眠时间</label>
              <div className="option-list">
                {['少于6小时', '6-7小时', '7-8小时', '8-9小时', '9小时以上'].map(opt => (
                  <div 
                    key={opt}
                    className={`option-item ${formData.sleepHours === opt ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect('sleepHours', opt)}
                  >
                    <span className="option-radio"></span>
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="section-label">每周运动频率</label>
              <div className="option-list">
                {['几乎不运动', '1-2次', '3-4次', '5次以上', '每天都运动'].map(opt => (
                  <div 
                    key={opt}
                    className={`option-item ${formData.exerciseFrequency === opt ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect('exerciseFrequency', opt)}
                  >
                    <span className="option-radio"></span>
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-panel" key="step3">
            <h2>健康状况</h2>
            <p className="step-desc">帮助我们更好地了解当前体态情况</p>

            <div className="form-section">
              <label className="section-label">是否有以下体态问题？（可多选）</label>
              <div className="option-list">
                {[
                  '没有任何问题',
                  '头部前倾',
                  '圆肩/驼背',
                  '高低肩',
                  '脊柱侧弯',
                  '骨盆前倾/后倾',
                  'X型腿/O型腿',
                  '扁平足/高弓足',
                  '长短腿',
                  '其他体态问题',
                  '不确定'
                ].map(opt => (
                  <div 
                    key={opt}
                    className={`option-item ${formData.hasSpineIssue === opt ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect('hasSpineIssue', opt)}
                  >
                    <span className="option-radio"></span>
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="onboarding-footer">
        {(step > 0 || isEdit) && (
          <button className="back-btn" onClick={handleBack}>
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {step === 0 ? '取消' : '上一步'}
          </button>
        )}
        <button 
          className={`next-btn ${!canProceed() || loading ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={!canProceed() || loading}
        >
          {loading ? '保存中...' : step === 3 ? '完成' : '下一步'}
          {!loading && (
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
