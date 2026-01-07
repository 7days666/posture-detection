import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
const childBirthYears = Array.from({ length: 7 }, (_, i) => currentYear - 12 + i)
const teenBirthYears = Array.from({ length: 7 }, (_, i) => currentYear - 19 + i)

// 动画配置
const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const }
  })
}

const cardVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 }
}

export default function Onboarding() {
  const navigate = useNavigate()
  const location = useLocation()
  const isEdit = location.state?.edit === true
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
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
    return (h > 0 && w > 0) ? (w / ((h / 100) ** 2)).toFixed(1) : null
  }
  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: '偏瘦', color: '#63b3ed', bg: 'rgba(99, 179, 237, 0.1)' }
    if (bmi < 24) return { text: '正常', color: '#48bb78', bg: 'rgba(72, 187, 120, 0.1)' }
    if (bmi < 28) return { text: '偏胖', color: '#ed8936', bg: 'rgba(237, 137, 54, 0.1)' }
    return { text: '肥胖', color: '#f56565', bg: 'rgba(245, 101, 101, 0.1)' }
  }

  const toggleMultiSelect = (form: 'child' | 'teen', field: string, value: string) => {
    const setForm = form === 'child' ? setChildForm : setTeenForm
    const currentForm = form === 'child' ? childForm : teenForm
    const currentValues = (currentForm as any)[field] as string[]
    if (value === '无' || value === '无以上情况') {
      setForm((prev: any) => ({ ...prev, [field]: [value] }))
    } else {
      const filtered = currentValues.filter(v => v !== '无' && v !== '无以上情况')
      setForm((prev: any) => ({ ...prev, [field]: filtered.includes(value) ? filtered.filter(v => v !== value) : [...filtered, value] }))
    }
  }

  const steps = ageGroup === 'teen' 
    ? ['类型选择', '基本信息', '学段与体态', '生活习惯', '知情同意']
    : ['类型选择', '基本信息', '生长发育', '生活习惯', '知情同意']
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
      setDirection(1)
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
      } catch (err: any) { setError(err.response?.data?.message || '网络错误') }
      finally { setLoading(false) }
    }
  }

  const handleBack = () => {
    if (step > 0) { setDirection(-1); setStep(step - 1) }
    else if (isEdit) navigate(-1)
  }

  // 选项卡组件
  const OptionCard = ({ selected, onClick, children, delay = 0 }: any) => (
    <motion.div
      className={`option-card ${selected ? 'selected' : ''}`}
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      custom={delay}
      onClick={onClick}
    >
      {children}
      <AnimatePresence>
        {selected && (
          <motion.div className="check-indicator" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <circle cx="12" cy="12" r="10" fill="#4ecdc4"/>
              <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

  // 单选项组件
  const RadioItem = ({ selected, onClick, children, desc, delay = 0 }: any) => (
    <motion.div
      className={`option-item ${selected ? 'selected' : ''}`}
      whileHover={{ backgroundColor: 'rgba(78, 205, 196, 0.05)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <motion.span className="option-radio" animate={{ borderColor: selected ? '#4ecdc4' : '#cbd5e0', backgroundColor: selected ? '#4ecdc4' : 'transparent' }}>
        <AnimatePresence>{selected && <motion.span className="radio-dot" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} />}</AnimatePresence>
      </motion.span>
      <div className="option-text"><span>{children}</span>{desc && <span className="option-desc">{desc}</span>}</div>
    </motion.div>
  )

  // 复选框组件
  const CheckboxItem = ({ selected, onClick, children, delay = 0 }: any) => (
    <motion.div
      className={`option-item checkbox ${selected ? 'selected' : ''}`}
      whileHover={{ backgroundColor: 'rgba(78, 205, 196, 0.05)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <motion.span className="option-checkbox" animate={{ borderColor: selected ? '#4ecdc4' : '#cbd5e0', backgroundColor: selected ? '#4ecdc4' : 'transparent' }}>
        <AnimatePresence>
          {selected && <motion.svg viewBox="0 0 24 24" fill="none" width="14" height="14" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round"/></motion.svg>}
        </AnimatePresence>
      </motion.span>
      <span>{children}</span>
    </motion.div>
  )

  // 步骤0 - 类型选择
  const renderStep0 = () => (
    <motion.div className="step-panel" key="step0" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <motion.h2 variants={itemVariants} custom={0} initial="hidden" animate="visible">请选择检测对象类型</motion.h2>
      <motion.p className="step-desc" variants={itemVariants} custom={1} initial="hidden" animate="visible">根据年龄段选择，我们将提供针对性的评估方案</motion.p>
      <div className="type-cards">
        <OptionCard selected={ageGroup === 'child'} onClick={() => setAgeGroup('child')} delay={2}>
          <motion.div className="type-icon" animate={{ color: ageGroup === 'child' ? '#4ecdc4' : '#a0aec0' }}>
            <svg viewBox="0 0 48 48" fill="none" width="56" height="56"><circle cx="24" cy="14" r="8" stroke="currentColor" strokeWidth="2.5"/><path d="M12 44c0-8 5-14 12-14s12 6 12 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </motion.div>
          <h3>儿童</h3><p>6-12岁学龄儿童</p>
        </OptionCard>
        <OptionCard selected={ageGroup === 'teen'} onClick={() => setAgeGroup('teen')} delay={3}>
          <motion.div className="type-icon" animate={{ color: ageGroup === 'teen' ? '#4ecdc4' : '#a0aec0' }}>
            <svg viewBox="0 0 48 48" fill="none" width="56" height="56"><circle cx="24" cy="12" r="7" stroke="currentColor" strokeWidth="2.5"/><path d="M24 19v16M16 27h16M18 44l6-9 6 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </motion.div>
          <h3>青少年</h3><p>13-19岁青少年</p>
        </OptionCard>
      </div>
    </motion.div>
  )

  // 步骤1 - 基本信息
  const renderStep1 = () => {
    const form = ageGroup === 'child' ? childForm : teenForm
    const setForm = ageGroup === 'child' ? setChildForm : setTeenForm
    const birthYears = ageGroup === 'child' ? childBirthYears : teenBirthYears
    const bmi = calculateBMI(form.height, form.weight)
    const bmiStatus = bmi ? getBMIStatus(parseFloat(bmi)) : null

    return (
      <motion.div className="step-panel" key="step1" variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <motion.h2 variants={itemVariants} custom={0} initial="hidden" animate="visible">基本信息</motion.h2>
        <motion.div className="form-section" variants={itemVariants} custom={1} initial="hidden" animate="visible">
          <label className="section-label"><span className="label-num">1</span>性别</label>
          <div className="gender-row">
            <OptionCard selected={form.gender === '男'} onClick={() => setForm((p: any) => ({ ...p, gender: '男' }))}>
              <div className="gender-icon male"><svg viewBox="0 0 24 24" fill="none" width="32" height="32"><circle cx="10" cy="14" r="5" stroke="currentColor" strokeWidth="2"/><path d="M14 10l6-6M20 4v5M15 4h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></div>
              <span>男</span>
            </OptionCard>
            <OptionCard selected={form.gender === '女'} onClick={() => setForm((p: any) => ({ ...p, gender: '女' }))}>
              <div className="gender-icon female"><svg viewBox="0 0 24 24" fill="none" width="32" height="32"><circle cx="12" cy="9" r="5" stroke="currentColor" strokeWidth="2"/><path d="M12 14v7M9 18h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></div>
              <span>女</span>
            </OptionCard>
          </div>
        </motion.div>
        <motion.div className="form-section" variants={itemVariants} custom={2} initial="hidden" animate="visible">
          <label className="section-label"><span className="label-num">2</span>出生年份</label>
          <div className="select-wrapper">
            <select className="form-select" value={form.birthYear} onChange={e => setForm((p: any) => ({ ...p, birthYear: e.target.value }))}>
              <option value="">请选择出生年份</option>
              {birthYears.map(y => <option key={y} value={y}>{y}年</option>)}
            </select>
            <AnimatePresence>
              {form.birthYear && <motion.span className="age-badge" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>{calculateAge(form.birthYear)}岁</motion.span>}
            </AnimatePresence>
          </div>
        </motion.div>
        <motion.div className="form-section" variants={itemVariants} custom={3} initial="hidden" animate="visible">
          <label className="section-label"><span className="label-num">3</span>身高 <span className="label-hint">最近一次体检数据即可</span></label>
          <div className="input-group"><input type="number" className="form-input" placeholder="请输入身高" value={form.height} onChange={e => setForm((p: any) => ({ ...p, height: e.target.value }))} /><span className="input-suffix">cm</span></div>
        </motion.div>
        <motion.div className="form-section" variants={itemVariants} custom={4} initial="hidden" animate="visible">
          <label className="section-label"><span className="label-num">4</span>体重 <span className="label-hint">最近一次测量数据即可</span></label>
          <div className="input-group"><input type="number" className="form-input" placeholder="请输入体重" value={form.weight} onChange={e => setForm((p: any) => ({ ...p, weight: e.target.value }))} /><span className="input-suffix">kg</span></div>
        </motion.div>
        <AnimatePresence>
          {bmi && bmiStatus && (
            <motion.div className="bmi-card" initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} style={{ backgroundColor: bmiStatus.bg }}>
              <div className="bmi-info"><span className="bmi-label">BMI 指数</span><span className="bmi-value" style={{ color: bmiStatus.color }}>{bmi}</span></div>
              <motion.span className="bmi-tag" style={{ backgroundColor: bmiStatus.color }} initial={{ scale: 0 }} animate={{ scale: 1 }}>{bmiStatus.text}</motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // 儿童步骤2
  const renderChildStep2 = () => (
    <motion.div className="step-panel" key="child-step2" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <motion.h2 variants={itemVariants} custom={0} initial="hidden" animate="visible">生长发育与体态</motion.h2>
      <motion.div className="form-section" variants={itemVariants} custom={1} initial="hidden" animate="visible">
        <label className="section-label"><span className="label-num">5</span>是否正处于快速生长期？</label>
        <div className="option-list">
          <RadioItem selected={childForm.isRapidGrowth === '是'} onClick={() => setChildForm(p => ({ ...p, isRapidGrowth: '是' }))} desc="近一年身高增长 ≥ 5 cm" delay={0}>是</RadioItem>
          <RadioItem selected={childForm.isRapidGrowth === '否'} onClick={() => setChildForm(p => ({ ...p, isRapidGrowth: '否' }))} delay={1}>否</RadioItem>
          <RadioItem selected={childForm.isRapidGrowth === '不确定'} onClick={() => setChildForm(p => ({ ...p, isRapidGrowth: '不确定' }))} delay={2}>不确定</RadioItem>
        </div>
      </motion.div>
      <motion.div className="form-section" variants={itemVariants} custom={2} initial="hidden" animate="visible">
        <label className="section-label"><span className="label-num">6</span>是否曾被医生提示存在脊柱或体态问题？<span className="label-hint">可多选</span></label>
        <div className="option-list">
          {['无', '脊柱侧弯', '含胸驼背', '高低肩', '扁平足', '其他'].map((opt, i) => (
            <CheckboxItem key={opt} selected={childForm.spineIssues.includes(opt)} onClick={() => toggleMultiSelect('child', 'spineIssues', opt)} delay={i}>{opt}</CheckboxItem>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )

  // 青少年步骤2
  const renderTeenStep2 = () => (
    <motion.div className="step-panel" key="teen-step2" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <motion.h2 variants={itemVariants} custom={0} initial="hidden" animate="visible">学段与体态</motion.h2>
      <motion.div className="form-section" variants={itemVariants} custom={1} initial="hidden" animate="visible">
        <label className="section-label"><span className="label-num">5</span>学段</label>
        <div className="gender-row">
          <OptionCard selected={teenForm.schoolStage === '初中'} onClick={() => setTeenForm(p => ({ ...p, schoolStage: '初中' }))}><span>初中</span></OptionCard>
          <OptionCard selected={teenForm.schoolStage === '高中'} onClick={() => setTeenForm(p => ({ ...p, schoolStage: '高中' }))}><span>高中</span></OptionCard>
        </div>
      </motion.div>
      <motion.div className="form-section" variants={itemVariants} custom={2} initial="hidden" animate="visible">
        <label className="section-label"><span className="label-num">6</span>近一年身高增长情况</label>
        <div className="option-list">
          {['≥5 cm', '<5 cm', '不确定'].map((opt, i) => (
            <RadioItem key={opt} selected={teenForm.heightGrowth === opt} onClick={() => setTeenForm(p => ({ ...p, heightGrowth: opt }))} delay={i}>{opt}</RadioItem>
          ))}
        </div>
      </motion.div>
      <motion.div className="form-section" variants={itemVariants} custom={3} initial="hidden" animate="visible">
        <label className="section-label"><span className="label-num">7</span>是否曾被提示存在体态或脊柱问题？<span className="label-hint">可多选</span></label>
        <div className="option-list">
          {['无', '脊柱侧弯', '高低肩', '含胸/驼背', '扁平足', '其他'].map((opt, i) => (
            <CheckboxItem key={opt} selected={teenForm.spineIssues.includes(opt)} onClick={() => toggleMultiSelect('teen', 'spineIssues', opt)} delay={i}>{opt}</CheckboxItem>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )

  // 儿童步骤3
  const renderChildStep3 = () => (
    <motion.div className="step-panel" key="child-step3" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <motion.h2 variants={itemVariants} custom={0} initial="hidden" animate="visible">生活习惯</motion.h2>
      <motion.div className="form-section" variants={itemVariants} custom={1} initial="hidden" animate="visible">
        <label className="section-label"><span className="label-num">7</span>每日电子屏幕使用时间（学习+娱乐）</label>
        <div className="option-list">
          {['<1 小时', '1-2 小时', '≥2 小时'].map((opt, i) => (
            <RadioItem key={opt} selected={childForm.screenTime === opt} onClick={() => setChildForm(p => ({ ...p, screenTime: opt }))} delay={i}>{opt}</RadioItem>
          ))}
        </div>
      </motion.div>
      <motion.div className="form-section" variants={itemVariants} custom={2} initial="hidden" animate="visible">
        <label className="section-label"><span className="label-num">8</span>每周中高强度体育活动（≥30分钟/次）</label>
        <div className="option-list">
          {['<1 次', '1-2 次', '3-4 次', '≥5 次'].map((opt, i) => (
            <RadioItem key={opt} selected={childForm.exerciseFreq === opt} onClick={() => setChildForm(p => ({ ...p, exerciseFreq: opt }))} delay={i}>{opt}</RadioItem>
          ))}
        </div>
      </motion.div>
      <motion.div className="form-section" variants={itemVariants} custom={3} initial="hidden" animate="visible">
        <label className="section-label"><span className="label-num">9</span>是否存在以下日常姿势或行为？<span className="label-hint">可多选</span></label>
        <div className="option-list">
          {['坐姿容易歪斜', '写字/看书时低头明显', '单肩背书包', '经常趴着或躺着使用电子设备', '无以上情况'].map((opt, i) => (
            <CheckboxItem key={opt} selected={childForm.dailyPosture.includes(opt)} onClick={() => toggleMultiSelect('child', 'dailyPosture', opt)} delay={i}>{opt}</CheckboxItem>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )

  // 青少年步骤3
  const renderTeenStep3 = () => (
    <motion.div className="step-panel" key="teen-step3" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <motion.h2 variants={itemVariants} custom={0} initial="hidden" animate="visible">症状与生活习惯</motion.h2>
      <motion.div className="form-section" variants={itemVariants} custom={1} initial="hidden" animate="visible">
        <label className="section-label"><span className="label-num">8</span>是否出现以下情况？<span className="label-hint">可多选</span></label>
        <div className="option-list">
          {['肩膀一高一低', '背部一侧更突出', '弯腰时背部不对称', '久坐或运动后背部不适', '无以上情况'].map((opt, i) => (
            <CheckboxItem key={opt} selected={teenForm.postureSymptoms.includes(opt)} onClick={() => toggleMultiSelect('teen', 'postureSymptoms', opt)} delay={i}>{opt}</CheckboxItem>
          ))}
        </div>
      </motion.div>
      <motion.div className="form-section" variants={itemVariants} custom={2} initial="hidden" animate="visible">
        <label className="section-label"><span className="label-num">9</span>每日久坐/伏案时间</label>
        <div className="option-list">
          {['<2 小时', '2-4 小时', '4-6 小时', '≥6 小时'].map((opt, i) => (
            <RadioItem key={opt} selected={teenForm.sittingHours === opt} onClick={() => setTeenForm(p => ({ ...p, sittingHours: opt }))} delay={i}>{opt}</RadioItem>
          ))}
        </div>
      </motion.div>
      <motion.div className="form-section" variants={itemVariants} custom={3} initial="hidden" animate="visible">
        <label className="section-label"><span className="label-num">10</span>每周中高强度体育活动（≥30分钟/次）</label>
        <div className="option-list">
          {['<1 次', '1-2 次', '3-4 次', '≥5 次'].map((opt, i) => (
            <RadioItem key={opt} selected={teenForm.exerciseFreq === opt} onClick={() => setTeenForm(p => ({ ...p, exerciseFreq: opt }))} delay={i}>{opt}</RadioItem>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )

  // 步骤4 - 知情同意
  const renderStep4 = () => {
    const form = ageGroup === 'child' ? childForm : teenForm
    const setForm = ageGroup === 'child' ? setChildForm : setTeenForm
    return (
      <motion.div className="step-panel consent-panel" key="step4" variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <motion.div className="consent-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <motion.div className="consent-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}>
            <svg viewBox="0 0 24 24" fill="none" width="56" height="56">
              <motion.path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#4ecdc4" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.8 }}/>
              <motion.path d="M9 12l2 2 4-4" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.4 }}/>
            </svg>
          </motion.div>
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>隐私与授权说明</motion.h2>
          <motion.div className="consent-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <p>本平台所收集的信息仅用于<strong>儿童青少年体态与脊柱健康风险评估及健康指导</strong>，不涉及任何商业用途。</p>
            <p>所有数据将进行<strong>匿名化处理</strong>，仅用于统计分析与健康服务支持。</p>
          </motion.div>
          <motion.div 
            className={`consent-checkbox ${form.consentAgreed ? 'checked' : ''}`} 
            onClick={() => setForm((p: any) => ({ ...p, consentAgreed: !p.consentAgreed }))}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span className="checkbox-box" animate={{ borderColor: form.consentAgreed ? '#4ecdc4' : '#cbd5e0', backgroundColor: form.consentAgreed ? '#4ecdc4' : 'transparent' }}>
              <AnimatePresence>
                {form.consentAgreed && <motion.svg viewBox="0 0 24 24" fill="none" width="18" height="18" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round"/></motion.svg>}
              </AnimatePresence>
            </motion.span>
            <span>我已知情并同意以上条款</span>
          </motion.div>
        </motion.div>
      </motion.div>
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
      <div className="progress-header">
        <motion.div className="progress-bar"><motion.div className="progress-fill" animate={{ width: `${((step + 1) / totalSteps) * 100}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} /></motion.div>
        <div className="step-dots">
          {steps.map((_, i) => (
            <motion.div key={i} className={`step-dot ${i <= step ? 'active' : ''}`} animate={{ scale: i === step ? 1.2 : 1, backgroundColor: i <= step ? '#4ecdc4' : '#e2e8f0' }} transition={{ duration: 0.3 }}>
              {i < step ? <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> : <span>{i + 1}</span>}
            </motion.div>
          ))}
        </div>
        <span className="step-label">{steps[step]}</span>
      </div>
      <div className="step-content">
        {error && <motion.div className="error-toast" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.div>}
        <AnimatePresence mode="wait" custom={direction}>{renderStepContent()}</AnimatePresence>
      </div>
      <motion.div className="footer-actions" initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.3 }}>
        {(step > 0 || isEdit) && (
          <motion.button className="btn-back" onClick={handleBack} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            上一步
          </motion.button>
        )}
        <motion.button className={`btn-next ${!canProceed() || loading ? 'disabled' : ''}`} onClick={handleNext} disabled={!canProceed() || loading} whileHover={canProceed() && !loading ? { scale: 1.02 } : {}} whileTap={canProceed() && !loading ? { scale: 0.98 } : {}}>
          {loading ? <span className="loading-spinner" /> : <>{step === totalSteps - 1 ? '进入筛查' : '下一步'}<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></>}
        </motion.button>
      </motion.div>
    </div>
  )
}
