import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { saveProfile, ProfileData } from '../api/profile'
import './Onboarding.css'

type AgeGroup = 'child' | 'teen' | null

interface ChildFormData {
  ageGroup: 'child'
  gender: string
  birthYear: string
  height: string
  weight: string
  isRapidGrowth: string
  spineIssues: string[]
  screenTime: string
  exerciseFreq: string
  dailyPosture: string[]
  consentAgreed: boolean
}

interface TeenFormData {
  ageGroup: 'teen'
  gender: string
  birthYear: string
  height: string
  weight: string
  schoolStage: string
  heightGrowth: string
  spineIssues: string[]
  postureSymptoms: string[]
  sittingHours: string
  exerciseFreq: string
  consentAgreed: boolean
}

type FormData = ChildFormData | TeenFormData | { ageGroup: null }

const currentYear = new Date().getFullYear()

// 生成出生年份选项
const childBirthYears = Array.from({ length: 7 }, (_, i) => currentYear - 12 + i) // 6-12岁
const teenBirthYears = Array.from({ length: 7 }, (_, i) => currentYear - 19 + i) // 13-19岁

export default function Onboarding() {
  const navigate = useNavigate()
  const location = useLocation()
  const isEdit = location.state?.edit === true

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(null)
  
  const [childForm, setChildForm] = useState<ChildFormData>({
    ageGroup: 'child',
    gender: '',
    birthYear: '',
    height: '',
    weight: '',
    isRapidGrowth: '',
    spineIssues: [],
    screenTime: '',
    exerciseFreq: '',
    dailyPosture: [],
    consentAgreed: false
  })

  const [teenForm, setTeenForm] = useState<TeenFormData>({
    ageGroup: 'teen',
    gender: '',
    birthYear: '',
    height: '',
    weight: '',
    schoolStage: '',
    heightGrowth: '',
    spineIssues: [],
    postureSymptoms: [],
    sittingHours: '',
    exerciseFreq: '',
    consentAgreed: false
  })

  const form = ageGroup === 'child' ? childForm : teenForm
  const setForm = ageGroup === 'child' 
    ? (data: Partial<ChildFormData>) => setChildForm(prev => ({ ...prev, ...data }))
    : (data: Partial<TeenFormData>) => setTeenForm(prev => ({ ...prev, ...data }))

  // 计算年龄
  const calculateAge = (birthYear: string) => {
    if (!birthYear) return null
    return currentYear - parseInt(birthYear)
  }

  // 计算BMI
  const calculateBMI = () => {
    const height = parseFloat(form.height || '0')
    const weight = parseFloat(form.weight || '0')
    if (height > 0 && weight > 0) {
      const heightM = height / 100
      return (weight / (heightM * heightM)).toFixed(1)
    }
    return null
  }

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: '偏瘦', color: '#63b3ed' }
    if (bmi < 24) return { text: '正常', color: '#68d391' }
    if (bmi < 28) return { text: '偏胖', color: '#f6ad55' }
    return { text: '肥胖', color: '#fc8181' }
  }

  // 多选处理
  const toggleMultiSelect = (field: string, value: string) => {
    const currentValues = (form as any)[field] as string[]
    if (value === '无' || value === '无以上情况') {
      setForm({ [field]: [value] } as any)
    } else {
      const filtered = currentValues.filter(v => v !== '无' && v !== '无以上情况')
      if (filtered.includes(value)) {
        setForm({ [field]: filtered.filter(v => v !== value) } as any)
      } else {
        setForm({ [field]: [...filtered, value] } as any)
      }
    }
  }

  // 儿童步骤: 0-类型选择, 1-基本信息, 2-生长发育, 3-体态问题, 4-生活习惯, 5-知情同意
  // 青少年步骤: 0-类型选择, 1-基本信息, 2-学段生长, 3-体态问题, 4-生活习惯, 5-知情同意
  const childSteps = ['类型选择', '基本信息', '生长发育', '体态问题', '生活习惯', '知情同意']
  const teenSteps = ['类型选择', '基本信息', '学段生长', '体态问题', '生活习惯', '知情同意']
  const steps = ageGroup === 'teen' ? teenSteps : childSteps
  const totalSteps = 6

  const canProceed = () => {
    if (step === 0) return ageGroup !== null
    
    if (ageGroup === 'child') {
      if (step === 1) return childForm.gender && childForm.birthYear && childForm.height && childForm.weight
      if (step === 2) return childForm.isRapidGrowth !== ''
      if (step === 3) return childForm.spineIssues.length > 0
      if (step === 4) return childForm.screenTime && childForm.exerciseFreq && childForm.dailyPosture.length > 0
      if (step === 5) return childForm.consentAgreed
    } else {
      if (step === 1) return teenForm.gender && teenForm.birthYear && teenForm.height && teenForm.weight
      if (step === 2) return teenForm.schoolStage && teenForm.heightGrowth
      if (step === 3) return teenForm.spineIssues.length > 0 && teenForm.postureSymptoms.length > 0
      if (step === 4) return teenForm.sittingHours && teenForm.exerciseFreq
      if (step === 5) return teenForm.consentAgreed
    }
    return false
  }

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1)
    } else {
      // 提交数据
      setLoading(true)
      setError('')
      try {
        const formData = ageGroup === 'child' ? childForm : teenForm
        const profileData: ProfileData = {
          ageGroup: ageGroup!,
          gender: formData.gender,
          birthYear: formData.birthYear,
          age: calculateAge(formData.birthYear)?.toString() || '',
          height: formData.height,
          weight: formData.weight,
          ...(ageGroup === 'child' ? {
            isRapidGrowth: (formData as ChildFormData).isRapidGrowth,
            screenTimeChild: (formData as ChildFormData).screenTime,
            exerciseFreqChild: (formData as ChildFormData).exerciseFreq,
            dailyPosture: (formData as ChildFormData).dailyPosture.join(','),
          } : {
            schoolStage: (formData as TeenFormData).schoolStage,
            heightGrowth: (formData as TeenFormData).heightGrowth,
            sittingHours: (formData as TeenFormData).sittingHours,
            exerciseFreqTeen: (formData as TeenFormData).exerciseFreq,
            postureSymptoms: (formData as TeenFormData).postureSymptoms.join(','),
          }),
          spineIssues: (formData as any).spineIssues.join(','),
          consentAgreed: true
        }
        
        const res = await saveProfile(profileData)
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
    if (step > 0) setStep(step - 1)
    else if (isEdit) navigate(-1)
  }

  const handleAgeGroupSelect = (group: AgeGroup) => {
    setAgeGroup(group)
  }

  // 渲染步骤0 - 类型选择
  const renderStep0 = () => (
    <div className="step-panel">
      <h2>请选择检测对象类型</h2>
      <p className="step-desc">根据WHO标准，不同年龄段有不同的检测标准</p>
      
      <div className="type-cards">
        <div 
          className={`type-card ${ageGroup === 'child' ? 'selected' : ''}`}
          onClick={() => handleAgeGroupSelect('child')}
        >
          <div className="type-icon child-icon">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="14" r="8" stroke="currentColor" strokeWidth="3"/>
              <path d="M12 44c0-8 5-14 12-14s12 6 12 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <h3>儿童</h3>
          <p>6-12岁</p>
          <div className="check-mark">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#4ecdc4"/>
              <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div 
          className={`type-card ${ageGroup === 'teen' ? 'selected' : ''}`}
          onClick={() => handleAgeGroupSelect('teen')}
        >
          <div className="type-icon teen-icon">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="12" r="7" stroke="currentColor" strokeWidth="3"/>
              <path d="M24 19v16M16 27h16M18 44l6-9 6 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>青少年</h3>
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
  )

  // 渲染步骤1 - 基本信息（儿童和青少年共用）
  const renderStep1 = () => (
    <div className="step-panel">
      <h2>基本信息</h2>
      <p className="step-desc">请填写检测对象的基本信息</p>

      <div className="form-section">
        <label className="section-label">性别</label>
        <div className="option-row">
          {['男', '女'].map(g => (
            <div 
              key={g}
              className={`option-card ${form.gender === g ? 'selected' : ''}`}
              onClick={() => setForm({ gender: g })}
            >
              <span className="option-icon-svg">
                {g === '男' ? (
                  <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
                    <circle cx="10" cy="14" r="5" stroke="#63b3ed" strokeWidth="2"/>
                    <path d="M14 10l6-6M20 4v5M15 4h5" stroke="#63b3ed" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
                    <circle cx="12" cy="9" r="5" stroke="#f687b3" strokeWidth="2"/>
                    <path d="M12 14v7M9 18h6" stroke="#f687b3" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </span>
              <span>{g}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <label className="section-label">出生年份</label>
        <div className="select-wrapper">
          <select 
            className="form-select"
            value={form.birthYear}
            onChange={e => setForm({ birthYear: e.target.value })}
          >
            <option value="">请选择出生年份</option>
            {(ageGroup === 'child' ? childBirthYears : teenBirthYears).map(year => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>
          {form.birthYear && (
            <span className="age-display">（{calculateAge(form.birthYear)}岁）</span>
          )}
        </div>
      </div>

      <div className="form-section">
        <label className="section-label">身高</label>
        <p className="input-hint">最近一次体检数据即可</p>
        <div className="input-row">
          <input
            type="number"
            className="number-input"
            placeholder="请输入身高"
            value={form.height}
            onChange={e => setForm({ height: e.target.value })}
            min="50" max="250"
          />
          <span className="input-unit">cm</span>
        </div>
      </div>

      <div className="form-section">
        <label className="section-label">体重</label>
        <p className="input-hint">最近一次测量数据即可</p>
        <div className="input-row">
          <input
            type="number"
            className="number-input"
            placeholder="请输入体重"
            value={form.weight}
            onChange={e => setForm({ weight: e.target.value })}
            min="10" max="200"
          />
          <span className="input-unit">kg</span>
        </div>
      </div>

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
  )

  // 渲染步骤2 - 儿童：生长发育
  const renderChildStep2 = () => (
    <div className="step-panel">
      <h2>生长发育</h2>
      <p className="step-desc">了解生长发育情况有助于更准确的评估</p>

      <div className="form-section">
        <label className="section-label">是否正处于快速生长期？</label>
        <div className="option-list">
          {[
            { value: '是', desc: '近一年身高增长 ≥ 5 cm' },
            { value: '否', desc: '' },
            { value: '不确定', desc: '' }
          ].map(opt => (
            <div 
              key={opt.value}
              className={`option-item ${childForm.isRapidGrowth === opt.value ? 'selected' : ''}`}
              onClick={() => setChildForm(prev => ({ ...prev, isRapidGrowth: opt.value }))}
            >
              <span className="option-radio"></span>
              <div className="option-text">
                <span>{opt.value}</span>
                {opt.desc && <span className="option-desc">{opt.desc}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // 渲染步骤2 - 青少年：学段和生长
  const renderTeenStep2 = () => (
    <div className="step-panel">
      <h2>学段与生长</h2>
      <p className="step-desc">了解学习阶段和生长情况</p>

      <div className="form-section">
        <label className="section-label">学段</label>
        <div className="option-row">
          {['初中', '高中'].map(s => (
            <div 
              key={s}
              className={`option-card ${teenForm.schoolStage === s ? 'selected' : ''}`}
              onClick={() => setTeenForm(prev => ({ ...prev, schoolStage: s }))}
            >
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <label className="section-label">近一年身高增长情况</label>
        <div className="option-list">
          {['≥5 cm', '<5 cm', '不确定'].map(opt => (
            <div 
              key={opt}
              className={`option-item ${teenForm.heightGrowth === opt ? 'selected' : ''}`}
              onClick={() => setTeenForm(prev => ({ ...prev, heightGrowth: opt }))}
            >
              <span className="option-radio"></span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // 渲染步骤3 - 儿童：体态问题
  const renderChildStep3 = () => (
    <div className="step-panel">
      <h2>体态问题</h2>
      <p className="step-desc">是否曾被医生提示存在脊柱或体态问题？</p>

      <div className="form-section">
        <label className="section-label">请选择（可多选）</label>
        <div className="option-list">
          {['无', '脊柱侧弯', '含胸驼背', '高低肩', '扁平足', '其他'].map(opt => (
            <div 
              key={opt}
              className={`option-item checkbox ${childForm.spineIssues.includes(opt) ? 'selected' : ''}`}
              onClick={() => toggleMultiSelect('spineIssues', opt)}
            >
              <span className="option-checkbox"></span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // 渲染步骤3 - 青少年：体态问题
  const renderTeenStep3 = () => (
    <div className="step-panel">
      <h2>体态问题</h2>
      <p className="step-desc">了解当前体态状况</p>

      <div className="form-section">
        <label className="section-label">是否曾被提示存在体态或脊柱问题？（可多选）</label>
        <div className="option-list">
          {['无', '脊柱侧弯', '高低肩', '含胸/驼背', '扁平足', '其他'].map(opt => (
            <div 
              key={opt}
              className={`option-item checkbox ${teenForm.spineIssues.includes(opt) ? 'selected' : ''}`}
              onClick={() => toggleMultiSelect('spineIssues', opt)}
            >
              <span className="option-checkbox"></span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <label className="section-label">是否出现以下情况？（可多选）</label>
        <div className="option-list">
          {['肩膀一高一低', '背部一侧更突出', '弯腰时背部不对称', '久坐或运动后背部不适', '无以上情况'].map(opt => (
            <div 
              key={opt}
              className={`option-item checkbox ${teenForm.postureSymptoms.includes(opt) ? 'selected' : ''}`}
              onClick={() => toggleMultiSelect('postureSymptoms', opt)}
            >
              <span className="option-checkbox"></span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // 渲染步骤4 - 儿童：生活习惯
  const renderChildStep4 = () => (
    <div className="step-panel">
      <h2>生活习惯</h2>
      <p className="step-desc">了解日常习惯有助于更准确的评估</p>

      <div className="form-section">
        <label className="section-label">每日电子屏幕使用时间（学习+娱乐）</label>
        <div className="option-list">
          {['<1 小时', '1-2 小时', '≥2 小时'].map(opt => (
            <div 
              key={opt}
              className={`option-item ${childForm.screenTime === opt ? 'selected' : ''}`}
              onClick={() => setChildForm(prev => ({ ...prev, screenTime: opt }))}
            >
              <span className="option-radio"></span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <label className="section-label">每周中高强度体育活动（≥30分钟/次）</label>
        <div className="option-list">
          {['<1 次', '1-2 次', '3-4 次', '≥5 次'].map(opt => (
            <div 
              key={opt}
              className={`option-item ${childForm.exerciseFreq === opt ? 'selected' : ''}`}
              onClick={() => setChildForm(prev => ({ ...prev, exerciseFreq: opt }))}
            >
              <span className="option-radio"></span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <label className="section-label">是否存在以下日常姿势或行为？（可多选）</label>
        <div className="option-list">
          {['坐姿容易歪斜', '写字/看书时低头明显', '单肩背书包', '经常趴着或躺着使用电子设备', '无以上情况'].map(opt => (
            <div 
              key={opt}
              className={`option-item checkbox ${childForm.dailyPosture.includes(opt) ? 'selected' : ''}`}
              onClick={() => toggleMultiSelect('dailyPosture', opt)}
            >
              <span className="option-checkbox"></span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // 渲染步骤4 - 青少年：生活习惯
  const renderTeenStep4 = () => (
    <div className="step-panel">
      <h2>生活习惯</h2>
      <p className="step-desc">了解日常习惯有助于更准确的评估</p>

      <div className="form-section">
        <label className="section-label">每日久坐/伏案时间</label>
        <div className="option-list">
          {['<2 小时', '2-4 小时', '4-6 小时', '≥6 小时'].map(opt => (
            <div 
              key={opt}
              className={`option-item ${teenForm.sittingHours === opt ? 'selected' : ''}`}
              onClick={() => setTeenForm(prev => ({ ...prev, sittingHours: opt }))}
            >
              <span className="option-radio"></span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <label className="section-label">每周中高强度体育活动（≥30分钟/次）</label>
        <div className="option-list">
          {['<1 次', '1-2 次', '3-4 次', '≥5 次'].map(opt => (
            <div 
              key={opt}
              className={`option-item ${teenForm.exerciseFreq === opt ? 'selected' : ''}`}
              onClick={() => setTeenForm(prev => ({ ...prev, exerciseFreq: opt }))}
            >
              <span className="option-radio"></span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // 渲染步骤5 - 知情同意（共用）
  const renderStep5 = () => (
    <div className="step-panel consent-panel">
      <h2>隐私与授权说明</h2>
      
      <div className="consent-content">
        <div className="consent-icon">
          <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div className="consent-text">
          <p>本平台所收集的信息仅用于<strong>青少年体态与脊柱健康风险评估及健康指导</strong>，不涉及任何商业用途。</p>
          <p>所有数据将进行<strong>匿名化处理</strong>，仅用于统计分析与健康服务支持。</p>
        </div>

        <div 
          className={`consent-checkbox ${(ageGroup === 'child' ? childForm : teenForm).consentAgreed ? 'checked' : ''}`}
          onClick={() => {
            if (ageGroup === 'child') {
              setChildForm(prev => ({ ...prev, consentAgreed: !prev.consentAgreed }))
            } else {
              setTeenForm(prev => ({ ...prev, consentAgreed: !prev.consentAgreed }))
            }
          }}
        >
          <span className="checkbox-icon">
            {(ageGroup === 'child' ? childForm : teenForm).consentAgreed && (
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          <span className="checkbox-label">我已知情并同意以上条款</span>
        </div>
      </div>
    </div>
  )

  // 根据步骤渲染内容
  const renderStepContent = () => {
    if (step === 0) return renderStep0()
    if (step === 1) return renderStep1()
    if (step === 2) return ageGroup === 'child' ? renderChildStep2() : renderTeenStep2()
    if (step === 3) return ageGroup === 'child' ? renderChildStep3() : renderTeenStep3()
    if (step === 4) return ageGroup === 'child' ? renderChildStep4() : renderTeenStep4()
    if (step === 5) return renderStep5()
    return null
  }

  return (
    <div className="onboarding-container">
      {/* 进度条 */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${((step + 1) / totalSteps) * 100}%` }}></div>
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
        {renderStepContent()}
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
          {loading ? '提交中...' : step === totalSteps - 1 ? '进入筛查' : '下一步'}
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
