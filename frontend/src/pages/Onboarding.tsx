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

const currentYear = new Date().getFullYear()
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
    ageGroup: 'child', gender: '', birthYear: '', height: '', weight: '',
    isRapidGrowth: '', spineIssues: [], screenTime: '', exerciseFreq: '',
    dailyPosture: [], consentAgreed: false
  })

  const [teenForm, setTeenForm] = useState<TeenFormData>({
    ageGroup: 'teen', gender: '', birthYear: '', height: '', weight: '',
    schoolStage: '', heightGrowth: '', spineIssues: [], postureSymptoms: [],
    sittingHours: '', exerciseFreq: '', consentAgreed: false
  })

  const calculateAge = (birthYear: string) => birthYear ? currentYear - parseInt(birthYear) : null
  
  const calculateBMI = (height: string, weight: string) => {
    const h = parseFloat(height), w = parseFloat(weight)
    if (h > 0 && w > 0) return (w / ((h / 100) ** 2)).toFixed(1)
    return null
  }

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: '偏瘦', color: '#63b3ed' }
    if (bmi < 24) return { text: '正常', color: '#68d391' }
    if (bmi < 28) return { text: '偏胖', color: '#f6ad55' }
    return { text: '肥胖', color: '#fc8181' }
  }

  const toggleMultiSelect = (form: 'child' | 'teen', field: string, value: string) => {
    const setForm = form === 'child' ? setChildForm : setTeenForm
    const currentForm = form === 'child' ? childForm : teenForm
    const currentValues = (currentForm as any)[field] as string[]
    
    if (value === '无' || value === '无以上情况') {
      setForm((prev: any) => ({ ...prev, [field]: [value] }))
    } else {
      const filtered = currentValues.filter(v => v !== '无' && v !== '无以上情况')
      if (filtered.includes(value)) {
        setForm((prev: any) => ({ ...prev, [field]: filtered.filter(v => v !== value) }))
      } else {
        setForm((prev: any) => ({ ...prev, [field]: [...filtered, value] }))
      }
    }
  }

  // 儿童: 0-类型 1-基本信息(性别/出生/身高/体重) 2-生长+体态(快速生长/体态问题) 3-生活习惯(屏幕/运动/姿势) 4-知情同意
  // 青少年: 0-类型 1-基本信息(性别/出生/身高/体重) 2-学段+生长+体态(学段/身高增长/体态问题) 3-症状+生活(症状/久坐/运动) 4-知情同意
  const childSteps = ['类型选择', '基本信息', '生长发育', '生活习惯', '知情同意']
  const teenSteps = ['类型选择', '基本信息', '学段与体态', '生活习惯', '知情同意']
  const steps = ageGroup === 'teen' ? teenSteps : childSteps
  const totalSteps = 5

  const canProceed = () => {
    if (step === 0) return ageGroup !== null
    if (ageGroup === 'child') {
      if (step === 1) return childForm.gender && childForm.birthYear && childForm.height && childForm.weight
      if (step === 2) return childForm.isRapidGrowth && childForm.spineIssues.length > 0
      if (step === 3) return childForm.screenTime && childForm.exerciseFreq && childForm.dailyPosture.length > 0
      if (step === 4) return childForm.consentAgreed
    } else {
      if (step === 1) return teenForm.gender && teenForm.birthYear && teenForm.height && teenForm.weight
      if (step === 2) return teenForm.schoolStage && teenForm.heightGrowth && teenForm.spineIssues.length > 0
      if (step === 3) return teenForm.postureSymptoms.length > 0 && teenForm.sittingHours && teenForm.exerciseFreq
      if (step === 4) return teenForm.consentAgreed
    }
    return false
  }

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1)
    } else {
      setLoading(true)
      setError('')
      try {
        const form = ageGroup === 'child' ? childForm : teenForm
        const profileData: ProfileData = {
          ageGroup: ageGroup!, gender: form.gender, birthYear: form.birthYear,
          age: calculateAge(form.birthYear)?.toString() || '', height: form.height, weight: form.weight,
          spineIssues: (form as any).spineIssues.join(','), consentAgreed: true,
          ...(ageGroup === 'child' ? {
            isRapidGrowth: childForm.isRapidGrowth, screenTimeChild: childForm.screenTime,
            exerciseFreqChild: childForm.exerciseFreq, dailyPosture: childForm.dailyPosture.join(','),
          } : {
            schoolStage: teenForm.schoolStage, heightGrowth: teenForm.heightGrowth,
            sittingHours: teenForm.sittingHours, exerciseFreqTeen: teenForm.exerciseFreq,
            postureSymptoms: teenForm.postureSymptoms.join(','),
          }),
        }
        const res = await saveProfile(profileData)
        if (res.data.success) { localStorage.setItem('onboarded', 'true'); navigate('/home') }
        else setError(res.data.message || '保存失败')
      } catch (err: any) {
        setError(err.response?.data?.message || '网络错误')
      } finally { setLoading(false) }
    }
  }

  const handleBack = () => { if (step > 0) setStep(step - 1); else if (isEdit) navigate(-1) }

  // 步骤0 - 类型选择
  const renderStep0 = () => (
    <div className="step-panel">
      <h2>请选择检测对象类型</h2>
      <div className="type-cards">
        <div className={`type-card ${ageGroup === 'child' ? 'selected' : ''}`} onClick={() => setAgeGroup('child')}>
          <div className="type-icon">
            <svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="14" r="8" stroke="currentColor" strokeWidth="3"/><path d="M12 44c0-8 5-14 12-14s12 6 12 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
          </div>
          <h3>儿童</h3><p>6-12岁</p>
          {ageGroup === 'child' && <div className="check-mark"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#4ecdc4"/><path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg></div>}
        </div>
        <div className={`type-card ${ageGroup === 'teen' ? 'selected' : ''}`} onClick={() => setAgeGroup('teen')}>
          <div className="type-icon">
            <svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="12" r="7" stroke="currentColor" strokeWidth="3"/><path d="M24 19v16M16 27h16M18 44l6-9 6 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h3>青少年</h3><p>13-19岁</p>
          {ageGroup === 'teen' && <div className="check-mark"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#4ecdc4"/><path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg></div>}
        </div>
      </div>
    </div>
  )

  // 步骤1 - 基本信息（共用）
  const renderStep1 = () => {
    const form = ageGroup === 'child' ? childForm : teenForm
    const setForm = ageGroup === 'child' ? setChildForm : setTeenForm
    const birthYears = ageGroup === 'child' ? childBirthYears : teenBirthYears
    const bmi = calculateBMI(form.height, form.weight)
    
    return (
      <div className="step-panel">
        <h2>基本信息</h2>
        <div className="form-section">
          <label className="section-label">1. 性别</label>
          <div className="option-row">
            {['男', '女'].map(g => (
              <div key={g} className={`option-card ${form.gender === g ? 'selected' : ''}`} onClick={() => setForm((p: any) => ({ ...p, gender: g }))}>
                <span className="option-icon-svg">{g === '男' ? <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><circle cx="10" cy="14" r="5" stroke="#63b3ed" strokeWidth="2"/><path d="M14 10l6-6M20 4v5M15 4h5" stroke="#63b3ed" strokeWidth="2" strokeLinecap="round"/></svg> : <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><circle cx="12" cy="9" r="5" stroke="#f687b3" strokeWidth="2"/><path d="M12 14v7M9 18h6" stroke="#f687b3" strokeWidth="2" strokeLinecap="round"/></svg>}</span>
                <span>{g}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="form-section">
          <label className="section-label">2. 出生年份</label>
          <div className="select-wrapper">
            <select className="form-select" value={form.birthYear} onChange={e => setForm((p: any) => ({ ...p, birthYear: e.target.value }))}>
              <option value="">请选择出生年份</option>
              {birthYears.map(y => <option key={y} value={y}>{y}年</option>)}
            </select>
            {form.birthYear && <span className="age-display">（{calculateAge(form.birthYear)}岁）</span>}
          </div>
        </div>
        <div className="form-section">
          <label className="section-label">3. 身高</label>
          <p className="input-hint">最近一次体检数据即可</p>
          <div className="input-row">
            <input type="number" className="number-input" placeholder="请输入身高" value={form.height} onChange={e => setForm((p: any) => ({ ...p, height: e.target.value }))} min="50" max="250"/>
            <span className="input-unit">cm</span>
          </div>
        </div>
        <div className="form-section">
          <label className="section-label">4. 体重</label>
          <p className="input-hint">最近一次测量数据即可</p>
          <div className="input-row">
            <input type="number" className="number-input" placeholder="请输入体重" value={form.weight} onChange={e => setForm((p: any) => ({ ...p, weight: e.target.value }))} min="10" max="200"/>
            <span className="input-unit">kg</span>
          </div>
        </div>
        {bmi && (
          <div className="bmi-card">
            <div className="bmi-label">BMI 指数</div>
            <div className="bmi-value" style={{ color: getBMIStatus(parseFloat(bmi)).color }}>{bmi}</div>
            <div className="bmi-status" style={{ backgroundColor: getBMIStatus(parseFloat(bmi)).color }}>{getBMIStatus(parseFloat(bmi)).text}</div>
          </div>
        )}
      </div>
    )
  }

  // 儿童步骤2 - 生长发育 + 体态问题
  const renderChildStep2 = () => (
    <div className="step-panel">
      <h2>生长发育与体态</h2>
      <div className="form-section">
        <label className="section-label">5. 是否正处于快速生长期？</label>
        <div className="option-list">
          {[{ v: '是', d: '近一年身高增长 ≥ 5 cm' }, { v: '否', d: '' }, { v: '不确定', d: '' }].map(opt => (
            <div key={opt.v} className={`option-item ${childForm.isRapidGrowth === opt.v ? 'selected' : ''}`} onClick={() => setChildForm(p => ({ ...p, isRapidGrowth: opt.v }))}>
              <span className="option-radio"></span>
              <div className="option-text"><span>{opt.v}</span>{opt.d && <span className="option-desc">{opt.d}</span>}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="form-section">
        <label className="section-label">6. 是否曾被医生提示存在脊柱或体态问题？（可多选）</label>
        <div className="option-list">
          {['无', '脊柱侧弯', '含胸驼背', '高低肩', '扁平足', '其他'].map(opt => (
            <div key={opt} className={`option-item checkbox ${childForm.spineIssues.includes(opt) ? 'selected' : ''}`} onClick={() => toggleMultiSelect('child', 'spineIssues', opt)}>
              <span className="option-checkbox"></span><span>{opt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // 青少年步骤2 - 学段 + 生长 + 体态问题
  const renderTeenStep2 = () => (
    <div className="step-panel">
      <h2>学段与体态</h2>
      <div className="form-section">
        <label className="section-label">5. 学段</label>
        <div className="option-row">
          {['初中', '高中'].map(s => (
            <div key={s} className={`option-card ${teenForm.schoolStage === s ? 'selected' : ''}`} onClick={() => setTeenForm(p => ({ ...p, schoolStage: s }))}><span>{s}</span></div>
          ))}
        </div>
      </div>
      <div className="form-section">
        <label className="section-label">6. 近一年身高增长情况</label>
        <div className="option-list">
          {['≥5 cm', '<5 cm', '不确定'].map(opt => (
            <div key={opt} className={`option-item ${teenForm.heightGrowth === opt ? 'selected' : ''}`} onClick={() => setTeenForm(p => ({ ...p, heightGrowth: opt }))}>
              <span className="option-radio"></span><span>{opt}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="form-section">
        <label className="section-label">7. 是否曾被提示存在体态或脊柱问题？（可多选）</label>
        <div className="option-list">
          {['无', '脊柱侧弯', '高低肩', '含胸/驼背', '扁平足', '其他'].map(opt => (
            <div key={opt} className={`option-item checkbox ${teenForm.spineIssues.includes(opt) ? 'selected' : ''}`} onClick={() => toggleMultiSelect('teen', 'spineIssues', opt)}>
              <span className="option-checkbox"></span><span>{opt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // 儿童步骤3 - 生活习惯
  const renderChildStep3 = () => (
    <div className="step-panel">
      <h2>生活习惯</h2>
      <div className="form-section">
        <label className="section-label">7. 每日电子屏幕使用时间（学习+娱乐）</label>
        <div className="option-list">
          {['<1 小时', '1-2 小时', '≥2 小时'].map(opt => (
            <div key={opt} className={`option-item ${childForm.screenTime === opt ? 'selected' : ''}`} onClick={() => setChildForm(p => ({ ...p, screenTime: opt }))}>
              <span className="option-radio"></span><span>{opt}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="form-section">
        <label className="section-label">8. 每周中高强度体育活动（≥30分钟/次）</label>
        <div className="option-list">
          {['<1 次', '1-2 次', '3-4 次', '≥5 次'].map(opt => (
            <div key={opt} className={`option-item ${childForm.exerciseFreq === opt ? 'selected' : ''}`} onClick={() => setChildForm(p => ({ ...p, exerciseFreq: opt }))}>
              <span className="option-radio"></span><span>{opt}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="form-section">
        <label className="section-label">9. 是否存在以下日常姿势或行为？（可多选）</label>
        <div className="option-list">
          {['坐姿容易歪斜', '写字/看书时低头明显', '单肩背书包', '经常趴着或躺着使用电子设备', '无以上情况'].map(opt => (
            <div key={opt} className={`option-item checkbox ${childForm.dailyPosture.includes(opt) ? 'selected' : ''}`} onClick={() => toggleMultiSelect('child', 'dailyPosture', opt)}>
              <span className="option-checkbox"></span><span>{opt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // 青少年步骤3 - 症状 + 生活习惯
  const renderTeenStep3 = () => (
    <div className="step-panel">
      <h2>症状与生活习惯</h2>
      <div className="form-section">
        <label className="section-label">8. 是否出现以下情况？（可多选）</label>
        <div className="option-list">
          {['肩膀一高一低', '背部一侧更突出', '弯腰时背部不对称', '久坐或运动后背部不适', '无以上情况'].map(opt => (
            <div key={opt} className={`option-item checkbox ${teenForm.postureSymptoms.includes(opt) ? 'selected' : ''}`} onClick={() => toggleMultiSelect('teen', 'postureSymptoms', opt)}>
              <span className="option-checkbox"></span><span>{opt}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="form-section">
        <label className="section-label">9. 每日久坐/伏案时间</label>
        <div className="option-list">
          {['<2 小时', '2-4 小时', '4-6 小时', '≥6 小时'].map(opt => (
            <div key={opt} className={`option-item ${teenForm.sittingHours === opt ? 'selected' : ''}`} onClick={() => setTeenForm(p => ({ ...p, sittingHours: opt }))}>
              <span className="option-radio"></span><span>{opt}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="form-section">
        <label className="section-label">10. 每周中高强度体育活动（≥30分钟/次）</label>
        <div className="option-list">
          {['<1 次', '1-2 次', '3-4 次', '≥5 次'].map(opt => (
            <div key={opt} className={`option-item ${teenForm.exerciseFreq === opt ? 'selected' : ''}`} onClick={() => setTeenForm(p => ({ ...p, exerciseFreq: opt }))}>
              <span className="option-radio"></span><span>{opt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // 步骤4 - 知情同意（共用）
  const renderStep4 = () => {
    const form = ageGroup === 'child' ? childForm : teenForm
    const setForm = ageGroup === 'child' ? setChildForm : setTeenForm
    return (
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
          <div className={`consent-checkbox ${form.consentAgreed ? 'checked' : ''}`} onClick={() => setForm((p: any) => ({ ...p, consentAgreed: !p.consentAgreed }))}>
            <span className="checkbox-icon">
              {form.consentAgreed && <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </span>
            <span className="checkbox-label">我已知情并同意以上条款</span>
          </div>
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    if (step === 0) return renderStep0()
    if (step === 1) return renderStep1()
    if (step === 2) return ageGroup === 'child' ? renderChildStep2() : renderTeenStep2()
    if (step === 3) return ageGroup === 'child' ? renderChildStep3() : renderTeenStep3()
    if (step === 4) return renderStep4()
    return null
  }

  return (
    <div className="onboarding-container">
      <div className="progress-bar"><div className="progress-fill" style={{ width: `${((step + 1) / totalSteps) * 100}%` }}></div></div>
      <div className="step-indicator">
        {steps.map((s, i) => (
          <div key={s} className={`step-dot ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
            {i < step ? <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg> : <span>{i + 1}</span>}
          </div>
        ))}
      </div>
      <div className="step-content">
        {error && <div className="onboarding-error">{error}</div>}
        {renderStepContent()}
      </div>
      <div className="onboarding-footer">
        {(step > 0 || isEdit) && (
          <button className="back-btn" onClick={handleBack}>
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {step === 0 ? '取消' : '上一步'}
          </button>
        )}
        <button className={`next-btn ${!canProceed() || loading ? 'disabled' : ''}`} onClick={handleNext} disabled={!canProceed() || loading}>
          {loading ? '提交中...' : step === totalSteps - 1 ? '进入筛查' : '下一步'}
          {!loading && <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>
      </div>
    </div>
  )
}
