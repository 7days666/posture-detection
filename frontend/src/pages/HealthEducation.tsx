import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import TabBar from '../components/TabBar'
import {
  ArticleIcon,
  PostureIcon,
  PreventionIcon,
  BackpackIcon,
  VideoIcon,
  CourseIcon,
  LessonCompleteIcon,
  LessonPendingIcon,
  CalendarIcon,
  DumbbellIcon,
  TargetIcon,
  WarningIcon,
  RefreshIcon,
  ClockIcon,
  BodyIcon,
  LightbulbIcon,
  BookIcon,
  SparkleIcon,
  RobotIcon,
  CheckCircleIcon
} from '../components/Icons'
import { generateTrainingPlan, TrainingPlan, TrainingExercise } from '../api/aiSuggestion'
import { exerciseAPI } from '../api/healthApi'
import './HealthEducation.css'

// 图标映射
const thumbnailIcons: Record<string, React.ReactNode> = {
  'article-1': <ArticleIcon color="#3b82f6" />,
  'article-2': <PostureIcon color="#10b981" />,
  'article-3': <PreventionIcon color="#ef4444" />,
  'article-4': <BackpackIcon color="#f59e0b" />,
  'video-1': <VideoIcon color="#8b5cf6" />,
  'video-2': <VideoIcon color="#8b5cf6" />,
  'video-3': <VideoIcon color="#8b5cf6" />,
  'course-1': <CourseIcon color="#f59e0b" />,
}

// 健康教育内容数据
const educationContents = {
  articles: [
    {
      id: 'article-1',
      title: '如何保持正确的坐姿',
      description: '学习科学坐姿，预防脊柱问题',
      category: 'posture',
      thumbnail: null,
      duration: 5,
      content: `
        <div class="article-hero-image">
          <img src="/education-posture.jpg" alt="正确坐姿示范" class="article-main-image" />
        </div>
        <h3>正确坐姿的要点</h3>
        <div class="tip-box tip-important">
          <svg class="tip-icon" viewBox="0 0 24 24" fill="none" width="20" height="20">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 16v-4m0-4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>背部挺直，腰部紧贴椅背，双脚平放地面</span>
        </div>
        <p><strong>1. 背部支撑</strong></p>
        <p>保持背部挺直，腰部紧贴椅背。可以使用腰垫提供额外支撑。</p>

        <p><strong>2. 双脚平放</strong></p>
        <p>双脚应平放在地面上，膝盖弯曲约90度。如果椅子太高，可以使用脚踏。</p>

        <p><strong>3. 屏幕高度</strong></p>
        <p>电脑屏幕顶端应与眼睛平齐或略低，避免低头或仰头。</p>

        <p><strong>4. 肩膀放松</strong></p>
        <p>肩膀自然下垂，不要耸肩。手肘弯曲约90度放在桌面上。</p>

        <p><strong>5. 定时休息</strong></p>
        <p>每30-45分钟起身活动一下，做做伸展运动。</p>
        <div class="tip-box tip-reminder">
          <svg class="tip-icon" viewBox="0 0 24 24" fill="none" width="20" height="20">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>建议每30-45分钟休息一次</span>
        </div>
      `
    },
    {
      id: 'article-2',
      title: '站姿矫正指南',
      description: '正确站姿让你更挺拔自信',
      category: 'posture',
      thumbnail: null,
      duration: 4,
      content: `
        <div class="article-illustration">
          <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="100" y1="10" x2="100" y2="170" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4"/>
            <circle cx="100" cy="25" r="12" stroke="#10b981" stroke-width="2" fill="#d1fae5"/>
            <line x1="100" y1="37" x2="100" y2="90" stroke="#10b981" stroke-width="2"/>
            <line x1="100" y1="50" x2="75" y2="70" stroke="#10b981" stroke-width="2"/>
            <line x1="100" y1="50" x2="125" y2="70" stroke="#10b981" stroke-width="2"/>
            <line x1="100" y1="90" x2="85" y2="140" stroke="#10b981" stroke-width="2"/>
            <line x1="100" y1="90" x2="115" y2="140" stroke="#10b981" stroke-width="2"/>
            <line x1="85" y1="140" x2="80" y2="165" stroke="#10b981" stroke-width="2"/>
            <line x1="115" y1="140" x2="120" y2="165" stroke="#10b981" stroke-width="2"/>
            <text x="100" y="178" text-anchor="middle" fill="#059669" font-size="10">正确站姿：身体成一条直线</text>
          </svg>
        </div>
        <h3>正确站姿的关键</h3>
        <div class="tip-box tip-important">
          <svg class="tip-icon" viewBox="0 0 24 24" fill="none" width="20" height="20">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
          <span>想象头顶有根线向上拉，保持身体挺拔</span>
        </div>
        <p><strong>1. 头部位置</strong></p>
        <p>下巴微收，耳朵与肩膀在同一垂直线上。想象有一根线从头顶向上拉。</p>

        <p><strong>2. 肩膀打开</strong></p>
        <p>肩膀向后微收，胸部自然挺起，但不要过度挺胸。</p>
        <div class="visual-comparison">
          <div class="compare-box">
            <div class="compare-item wrong">
              <svg viewBox="0 0 120 160" fill="none">
                <rect width="120" height="160" fill="#fff5f5" rx="8"/>
                <circle cx="60" cy="30" r="16" stroke="#ef4444" stroke-width="3" fill="#fed7d7"/>
                <path d="M60 46 Q50 80 60 110" stroke="#ef4444" stroke-width="3" fill="none"/>
                <path d="M35 70 L60 55 L85 70" stroke="#ef4444" stroke-width="2.5" fill="none"/>
                <line x1="45" y1="160" x2="45" y2="130" stroke="#ef4444" stroke-width="3"/>
                <line x1="75" y1="160" x2="75" y2="130" stroke="#ef4444" stroke-width="3"/>
                <text x="60" y="150" text-anchor="middle" fill="#c53030" font-size="12" font-weight="600">驼背</text>
              </svg>
              <span class="compare-label wrong">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14" style="display:inline-block;vertical-align:middle;margin-right:4px">
                  <circle cx="8" cy="8" r="7" stroke="#dc2626" stroke-width="2"/>
                  <path d="M5 5l6 6M11 5l-6 6" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
                </svg>
                含胸驼背
              </span>
            </div>
            <div class="compare-item correct">
              <svg viewBox="0 0 120 160" fill="none">
                <rect width="120" height="160" fill="#f0fdf4" rx="8"/>
                <circle cx="60" cy="30" r="16" stroke="#10b981" stroke-width="3" fill="#d1fae5"/>
                <line x1="60" y1="46" x2="60" y2="110" stroke="#10b981" stroke-width="3"/>
                <path d="M35 75 L60 60 L85 75" stroke="#10b981" stroke-width="2.5" fill="none"/>
                <line x1="45" y1="160" x2="45" y2="130" stroke="#10b981" stroke-width="3"/>
                <line x1="75" y1="160" x2="75" y2="130" stroke="#10b981" stroke-width="3"/>
                <text x="60" y="150" text-anchor="middle" fill="#059669" font-size="12" font-weight="600">挺拔</text>
              </svg>
              <span class="compare-label correct">
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14" style="display:inline-block;vertical-align:middle;margin-right:4px">
                  <circle cx="8" cy="8" r="7" stroke="#059669" stroke-width="2"/>
                  <path d="M5 8l2 2 4-4" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                肩膀打开
              </span>
            </div>
          </div>
          <div class="tip-box tip-practice">
            <svg class="tip-icon" viewBox="0 0 24 24" fill="none" width="20" height="20">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <path d="M17 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>对着镜子练习，确保肩膀在耳朵正下方</span>
          </div>
        </div>

        <p><strong>3. 收紧核心</strong></p>
        <p>腹部微微收紧，保持核心稳定，避免腰部过度前凸。</p>

        <p><strong>4. 膝盖微屈</strong></p>
        <p>膝盖保持微微弯曲，不要完全锁死，减轻关节压力。</p>

        <p><strong>5. 重心分布</strong></p>
        <p>体重均匀分布在双脚上，不要偏向一侧。</p>
      `
    },
    {
      id: 'article-3',
      title: '预防脊柱侧弯的方法',
      description: '了解脊柱侧弯，早期预防是关键',
      category: 'prevention',
      thumbnail: null,
      duration: 8,
      content: `
        <div class="article-hero-image">
          <img src="/education-spine.jpg" alt="脊柱侧弯对比" class="article-main-image" />
        </div>
        <h3>什么是脊柱侧弯？</h3>
        <p>脊柱侧弯是指脊柱向左或向右弯曲超过10度的情况。青少年发育期是高发期。</p>
        <div class="tip-box tip-warning">
          <svg class="tip-icon" viewBox="0 0 24 24" fill="none" width="20" height="20">
            <path d="M12 2L2 20h20L12 2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M12 9v4m0 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>青少年发育期（10-16岁）是脊柱侧弯高发期，需特别注意</span>
        </div>

        <h3>预防措施</h3>
        <p><strong>1. 保持良好姿势</strong></p>
        <p>日常保持正确的坐姿和站姿，避免长时间保持同一姿势。</p>

        <p><strong>2. 均衡使用双侧</strong></p>
        <p>背书包时使用双肩背，避免单肩负重。写字时不要歪着身子。</p>
        </div>

        <p><strong>3. 加强核心锻炼</strong></p>
        <p>游泳、瑜伽、普拉提等运动可以加强核心肌群，支撑脊柱。</p>

        <p><strong>4. 定期检查</strong></p>
        <p>每年进行一次脊柱健康检查，早发现早干预。</p>

        <p><strong>5. 合理运动</strong></p>
        <p>避免高强度单侧运动，选择对称性运动如游泳、跑步等。</p>
      `
    },
    {
      id: 'article-4',
      title: '书包的正确背法',
      description: '保护脊柱从正确背书包开始',
      category: 'posture',
      thumbnail: null,
      duration: 3,
      content: `
        <div class="article-illustration">
          <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="30" r="15" stroke="#10b981" stroke-width="2" fill="#d1fae5"/>
            <line x1="100" y1="45" x2="100" y2="100" stroke="#10b981" stroke-width="2"/>
            <rect x="80" y="50" width="40" height="45" rx="5" stroke="#f59e0b" stroke-width="2" fill="#fef3c7"/>
            <line x1="85" y1="50" x2="85" y2="45" stroke="#f59e0b" stroke-width="2"/>
            <line x1="115" y1="50" x2="115" y2="45" stroke="#f59e0b" stroke-width="2"/>
            <line x1="100" y1="100" x2="85" y2="140" stroke="#10b981" stroke-width="2"/>
            <line x1="100" y1="100" x2="115" y2="140" stroke="#10b981" stroke-width="2"/>
            <text x="100" y="148" text-anchor="middle" fill="#059669" font-size="10">书包贴近背部，双肩均匀受力</text>
          </svg>
        </div>
        <h3>书包与脊柱健康</h3>
        <p>书包过重或背法不当是导致青少年脊柱问题的重要原因之一。</p>
        <div class="tip-box tip-important">
          <svg class="tip-icon" viewBox="0 0 24 24" fill="none" width="20" height="20">
            <path d="M9 2v4M15 2v4M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 12h.01M12 16h.01M8 12h.01M16 12h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>书包重量不应超过体重的10-15%</span>
        </div>

        <h3>正确背书包的方法</h3>
        <p><strong>1. 选择合适的书包</strong></p>
        <p>选择有宽肩带、背部有支撑垫的双肩包。</p>

        <p><strong>2. 控制重量</strong></p>
        <p>书包重量不应超过体重的10-15%。</p>

        <p><strong>3. 调整肩带</strong></p>
        <p>肩带长度适中，书包底部不要低于腰部。</p>
        <div class="inline-illustration">
          <svg viewBox="0 0 120 100" fill="none">
            <circle cx="60" cy="20" r="10" stroke="#10b981" stroke-width="2"/>
            <line x1="60" y1="30" x2="60" y2="70" stroke="#10b981" stroke-width="2"/>
            <rect x="45" y="35" width="30" height="30" rx="3" stroke="#f59e0b" stroke-width="2" fill="#fef3c7"/>
            <line x1="20" y1="65" x2="100" y2="65" stroke="#ef4444" stroke-width="1" stroke-dasharray="4"/>
            <text x="105" y="68" fill="#ef4444" font-size="8">腰线</text>
            <text x="60" y="95" text-anchor="middle" fill="#059669" font-size="8">书包底部不低于腰部</text>
          </svg>
        </div>

        <p><strong>4. 合理装包</strong></p>
        <p>重物放在靠近背部的位置，物品均匀分布。</p>

        <p><strong>5. 双肩背负</strong></p>
        <p>始终使用双肩背，不要单肩斜挎。</p>
      `
    }
  ],
  videos: [
    {
      id: 'video-1',
      title: '5分钟颈椎放松操',
      description: '缓解颈部疲劳，预防颈椎病',
      category: 'exercise',
      thumbnail: null,
      duration: 5,
      videoUrl: '#'
    },
    {
      id: 'video-2',
      title: '办公室伸展运动',
      description: '适合久坐后的简单拉伸',
      category: 'exercise',
      thumbnail: null,
      duration: 8,
      videoUrl: '#'
    },
    {
      id: 'video-3',
      title: '脊柱矫正瑜伽',
      description: '温和的瑜伽动作改善体态',
      category: 'exercise',
      thumbnail: null,
      duration: 15,
      videoUrl: '#'
    }
  ],
  courses: [
    {
      id: 'course-1',
      title: '青少年体态健康课程',
      description: '系统学习体态健康知识',
      category: 'course',
      thumbnail: null,
      duration: 60,
      lessons: [
        { title: '认识你的脊柱', completed: false },
        { title: '常见体态问题', completed: false },
        { title: '日常姿势纠正', completed: false },
        { title: '运动与体态', completed: false },
        { title: '建立健康习惯', completed: false }
      ]
    }
  ]
}

// 根据用户风险等级推荐内容
const getRecommendedContent = (problems?: string[]) => {
  // 如果有具体问题，根据问题推荐
  if (problems && problems.length > 0) {
    const recommended: any[] = []
    
    if (problems.includes('neck')) {
      // 颈部问题推荐
      recommended.push(educationContents.videos[0]) // 颈椎放松操
      recommended.push(educationContents.articles[0]) // 正确坐姿
    }
    if (problems.includes('shoulder')) {
      // 肩部问题推荐
      recommended.push(educationContents.videos[1]) // 办公室伸展
      recommended.push(educationContents.articles[1]) // 站姿矫正
    }
    if (problems.includes('spine')) {
      // 脊柱问题推荐
      recommended.push(educationContents.videos[2]) // 脊柱矫正瑜伽
      recommended.push(educationContents.articles[2]) // 预防脊柱侧弯
    }
    if (problems.includes('pelvis')) {
      // 骨盆问题推荐
      recommended.push(educationContents.videos[2]) // 脊柱矫正瑜伽
      recommended.push(educationContents.articles[1]) // 站姿矫正
    }
    
    // 去重
    const uniqueRecommended = recommended.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    )
    
    return uniqueRecommended.length > 0 ? uniqueRecommended : [
      educationContents.articles[0],
      educationContents.articles[2],
      educationContents.videos[0]
    ]
  }
  
  // 默认推荐
  return [
    educationContents.articles[0],
    educationContents.articles[2],
    educationContents.videos[0]
  ]
}

// 问题类型对应的中文描述
const problemLabels: Record<string, string> = {
  neck: '颈部前倾',
  shoulder: '肩膀不平',
  spine: '脊柱弯曲',
  pelvis: '骨盆倾斜'
}

export default function HealthEducation() {
  const location = useLocation()
  const { problems, fromReport } = (location.state as { problems?: string[], fromReport?: boolean }) || {}
  
  const [activeTab, setActiveTab] = useState<'recommend' | 'articles' | 'videos' | 'courses'>('recommend')
  const [selectedArticle, setSelectedArticle] = useState<typeof educationContents.articles[0] | null>(null)
  const [showTrainingTip, setShowTrainingTip] = useState(fromReport || false)
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null)
  const [trainingLoading, setTrainingLoading] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<TrainingExercise | null>(null)
  const [completingExercise, setCompletingExercise] = useState(false)
  const [exerciseCompleted, setExerciseCompleted] = useState(false)

  const recommendedContent = getRecommendedContent(problems)
  
  // 如果是从报告页面跳转来的，自动生成训练计划
  useEffect(() => {
    if (fromReport && problems && problems.length > 0 && !trainingPlan) {
      loadTrainingPlan()
    }
  }, [fromReport, problems])
  
  // 如果是从报告页面跳转来的，5秒后隐藏提示
  useEffect(() => {
    if (showTrainingTip) {
      const timer = setTimeout(() => setShowTrainingTip(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showTrainingTip])

  // 加载 AI 训练计划 - 带缓存，同样的问题不重复生成
  const loadTrainingPlan = async () => {
    if (trainingLoading) return
    setTrainingLoading(true)
    try {
      // 生成缓存 key：基于问题类型排序后的字符串
      const cacheKey = `training_plan_${(problems || []).sort().join('_') || 'general'}`
      
      // 检查本地缓存
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        try {
          const cachedData = JSON.parse(cached)
          // 检查缓存是否在7天内
          if (cachedData.timestamp && Date.now() - cachedData.timestamp < 7 * 24 * 60 * 60 * 1000) {
            console.log('[训练计划] 使用缓存数据')
            setTrainingPlan(cachedData.plan)
            setTrainingLoading(false)
            return
          }
        } catch (e) {
          // 缓存解析失败，继续生成新的
        }
      }
      
      // 调用 AI 生成训练计划
      console.log('[训练计划] 调用 AI 生成新计划')
      const plan = await generateTrainingPlan(problems || [])
      setTrainingPlan(plan)
      
      // 保存到本地缓存
      localStorage.setItem(cacheKey, JSON.stringify({
        plan,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('加载训练计划失败:', error)
    } finally {
      setTrainingLoading(false)
    }
  }

  const renderContentCard = (item: any, type: string) => (
    <motion.div
      key={item.id}
      className="education-card"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        if (type === 'article') {
          setSelectedArticle(item)
        }
      }}
    >
      <div className="card-thumbnail">{thumbnailIcons[item.id] || <ArticleIcon />}</div>
      <div className="card-content">
        <h3 className="card-title">{item.title}</h3>
        <p className="card-description">{item.description}</p>
        <div className="card-meta">
          <span className="duration">{item.duration}分钟</span>
          {type === 'course' && (
            <span className="lessons">{item.lessons?.length}节课</span>
          )}
        </div>
      </div>
    </motion.div>
  )

  // 渲染训练动作详情
  const renderExerciseDetail = () => {
    if (!selectedExercise) return null

    // 解析时长（如 "3分钟" -> 3）
    const parseDuration = (duration: string): number => {
      const match = duration.match(/(\d+)/)
      return match ? parseInt(match[1]) : 5
    }

    // 完成训练
    const handleCompleteExercise = async () => {
      setCompletingExercise(true)
      try {
        await exerciseAPI.save({
          exercise_type: 'posture_correction',
          exercise_name: selectedExercise.name,
          duration_minutes: parseDuration(selectedExercise.duration),
          completion_rate: 100,
          difficulty_level: 'medium',
          notes: `目标部位: ${selectedExercise.targetArea}`
        })
        setExerciseCompleted(true)
        setTimeout(() => {
          setExerciseCompleted(false)
          setSelectedExercise(null)
        }, 2000)
      } catch (error) {
        console.error('保存运动记录失败:', error)
        alert('保存失败，请重试')
      } finally {
        setCompletingExercise(false)
      }
    }
    
    return (
      <div className="health-education-page">
        <header className="page-header">
          <button className="back-btn" onClick={() => setSelectedExercise(null)}>
            ← 返回
          </button>
          <h1>{selectedExercise.name}</h1>
        </header>
        <main className="exercise-detail-content">
          <div className="exercise-meta">
            <span className="exercise-duration"><ClockIcon color="#374151" /> {selectedExercise.duration}</span>
            <span className="exercise-target"><TargetIcon color="#374151" /> {selectedExercise.targetArea}</span>
          </div>
          
          <div className="exercise-description">
            <p>{selectedExercise.description}</p>
          </div>
          
          <div className="exercise-steps">
            <h3><BodyIcon color="#4ecdc4" /> 动作步骤</h3>
            <ol>
              {selectedExercise.steps.map((step, index) => (
                <li key={index}>
                  <span className="step-number">{index + 1}</span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          
          <div className="exercise-tips">
            <h3><LightbulbIcon color="#f59e0b" /> 动作要点</h3>
            <p>{selectedExercise.tips}</p>
          </div>

          {/* 完成训练按钮 */}
          <div className="exercise-complete-section">
            {exerciseCompleted ? (
              <motion.div 
                className="complete-success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <CheckCircleIcon color="#10b981" />
                <span>训练已完成！</span>
              </motion.div>
            ) : (
              <button 
                className="complete-exercise-btn"
                onClick={handleCompleteExercise}
                disabled={completingExercise}
              >
                {completingExercise ? (
                  <>
                    <span className="btn-spinner"></span>
                    保存中...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon color="#ffffff" />
                    完成训练
                  </>
                )}
              </button>
            )}
          </div>
        </main>
        <TabBar />
      </div>
    )
  }

  // 渲染 AI 训练计划
  const renderTrainingPlan = () => {
    if (trainingLoading) {
      return (
        <div className="training-loading">
          <div className="loading-animation">
            <div className="loading-spinner"></div>
          </div>
          <p>AI 正在为您生成个性化训练计划...</p>
        </div>
      )
    }
    
    if (!trainingPlan) {
      return (
        <div className="no-training-plan">
          <DumbbellIcon color="#9ca3af" />
          <p>暂无训练计划</p>
          <button className="generate-btn" onClick={loadTrainingPlan}>
            <SparkleIcon color="#ffffff" /> 生成 AI 训练计划
          </button>
        </div>
      )
    }
    
    return (
      <div className="training-plan">
        <div className="plan-header">
          <h3>{trainingPlan.title}</h3>
          <p>{trainingPlan.summary}</p>
        </div>
        
        <div className="plan-routine">
          <span className="routine-icon"><CalendarIcon color="#1e40af" /></span>
          <span>{trainingPlan.dailyRoutine}</span>
        </div>
        
        <div className="exercises-list">
          <h4><DumbbellIcon color="#374151" /> 训练动作 ({trainingPlan.exercises.length}个)</h4>
          {trainingPlan.exercises.map((exercise, index) => (
            <motion.div
              key={index}
              className="exercise-card"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedExercise(exercise)}
            >
              <div className="exercise-number">{index + 1}</div>
              <div className="exercise-info">
                <h5>{exercise.name}</h5>
                <p>{exercise.description}</p>
                <div className="exercise-meta-small">
                  <span><ClockIcon color="#9ca3af" /> {exercise.duration}</span>
                  <span><TargetIcon color="#9ca3af" /> {exercise.targetArea}</span>
                </div>
              </div>
              <div className="exercise-arrow">→</div>
            </motion.div>
          ))}
        </div>
        
        <div className="plan-precautions">
          <h4><WarningIcon color="#f59e0b" /> 注意事项</h4>
          <ul>
            {trainingPlan.precautions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        
        <button className="regenerate-btn" onClick={loadTrainingPlan}>
          <RefreshIcon color="#6b7280" /> 重新生成训练计划
        </button>
      </div>
    )
  }

  // 如果选中了训练动作，显示详情
  if (selectedExercise) {
    return renderExerciseDetail()
  }

  if (selectedArticle) {
    return (
      <div className="health-education-page">
        <header className="page-header">
          <button className="back-btn" onClick={() => setSelectedArticle(null)}>
            ← 返回
          </button>
          <h1>{selectedArticle.title}</h1>
        </header>
        <main className="article-content">
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: selectedArticle.content || '' }}
          />
        </main>
        <TabBar />
      </div>
    )
  }

  return (
    <div className="health-education-page">
      <header className="page-header">
        <h1>数字运动教练</h1>
        <p className="subtitle">学习体态健康知识，守护脊柱健康</p>
      </header>

      <nav className="education-tabs">
        <button
          className={`tab-btn ${activeTab === 'recommend' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommend')}
        >
          为你推荐
        </button>
        <button
          className={`tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
          onClick={() => setActiveTab('articles')}
        >
          图文教程
        </button>
        <button
          className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          视频课程
        </button>
        <button
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          数字课程
        </button>
      </nav>

      <main className="education-content">
        {activeTab === 'recommend' && (
          <section className="content-section">
            {showTrainingTip && problems && problems.length > 0 && (
              <motion.div 
                className="training-tip"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="tip-icon">💪</div>
                <div className="tip-content">
                  <strong>根据您的检测结果</strong>
                  <p>发现以下问题：{problems.map(p => problemLabels[p] || p).join('、')}</p>
                  <p>AI 正在为您生成个性化矫正训练计划</p>
                </div>
                <button className="tip-close" onClick={() => setShowTrainingTip(false)}>×</button>
              </motion.div>
            )}
            
            {/* 如果是从报告页面来的，显示 AI 训练计划 */}
            {fromReport && (
              <>
                <div className="section-header">
                  <h2><RobotIcon color="#8b5cf6" /> AI 个性化训练计划</h2>
                  <p>根据您的体态检测结果，AI 为您定制的矫正训练</p>
                </div>
                {renderTrainingPlan()}
              </>
            )}
            
            {/* 推荐内容 */}
            <div className="section-header" style={{ marginTop: fromReport ? 24 : 0 }}>
              <h2>{fromReport ? <><BookIcon color="#3b82f6" /> 相关学习资料</> : '个性化推荐'}</h2>
              <p>{fromReport ? '了解更多体态健康知识' : '根据你的体态检测结果，我们为你推荐以下内容'}</p>
            </div>
            <div className="content-list">
              {recommendedContent.map((item: any) => renderContentCard(item, item.videoUrl ? 'video' : 'article'))}
            </div>
          </section>
        )}

        {activeTab === 'articles' && (
          <section className="content-section">
            <div className="section-header">
              <h2>图文教程</h2>
            </div>
            <div className="content-list">
              {educationContents.articles.map(item => renderContentCard(item, 'article'))}
            </div>
          </section>
        )}

        {activeTab === 'videos' && (
          <section className="content-section">
            <div className="section-header">
              <h2>视频课程</h2>
            </div>
            <div className="content-list">
              {educationContents.videos.map(item => renderContentCard(item, 'video'))}
            </div>
          </section>
        )}

        {activeTab === 'courses' && (
          <section className="content-section">
            <div className="section-header">
              <h2>数字课程</h2>
              <p>系统化学习，AI个性化指导</p>
            </div>
            <div className="content-list">
              {educationContents.courses.map(item => (
                <motion.div
                  key={item.id}
                  className="course-card"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="course-header">
                    <span className="course-icon">{thumbnailIcons[item.id] || <CourseIcon />}</span>
                    <div className="course-info">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </div>
                  <div className="course-lessons">
                    {item.lessons?.map((lesson, index) => (
                      <div key={index} className="lesson-item">
                        <span className="lesson-number">{index + 1}</span>
                        <span className="lesson-title">{lesson.title}</span>
                        <span className={`lesson-status ${lesson.completed ? 'completed' : ''}`}>
                          {lesson.completed ? <LessonCompleteIcon /> : <LessonPendingIcon />}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="start-course-btn">开始学习</button>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      <TabBar />
    </div>
  )
}
