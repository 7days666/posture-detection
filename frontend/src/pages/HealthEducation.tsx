import { useState } from 'react'
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
  LessonPendingIcon
} from '../components/Icons'
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
      thumbnail: '📖',
      duration: 5,
      content: `
        <h3>正确坐姿的要点</h3>
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
      `
    },
    {
      id: 'article-2',
      title: '站姿矫正指南',
      description: '正确站姿让你更挺拔自信',
      category: 'posture',
      thumbnail: '🧍',
      duration: 4,
      content: `
        <h3>正确站姿的关键</h3>
        <p><strong>1. 头部位置</strong></p>
        <p>下巴微收，耳朵与肩膀在同一垂直线上。想象有一根线从头顶向上拉。</p>

        <p><strong>2. 肩膀打开</strong></p>
        <p>肩膀向后微收，胸部自然挺起，但不要过度挺胸。</p>

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
      thumbnail: '🏥',
      duration: 8,
      content: `
        <h3>什么是脊柱侧弯？</h3>
        <p>脊柱侧弯是指脊柱向左或向右弯曲超过10度的情况。青少年发育期是高发期。</p>

        <h3>预防措施</h3>
        <p><strong>1. 保持良好姿势</strong></p>
        <p>日常保持正确的坐姿和站姿，避免长时间保持同一姿势。</p>

        <p><strong>2. 均衡使用双侧</strong></p>
        <p>背书包时使用双肩背，避免单肩负重。写字时不要歪着身子。</p>

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
      thumbnail: '🎒',
      duration: 3,
      content: `
        <h3>书包与脊柱健康</h3>
        <p>书包过重或背法不当是导致青少年脊柱问题的重要原因之一。</p>

        <h3>正确背书包的方法</h3>
        <p><strong>1. 选择合适的书包</strong></p>
        <p>选择有宽肩带、背部有支撑垫的双肩包。</p>

        <p><strong>2. 控制重量</strong></p>
        <p>书包重量不应超过体重的10-15%。</p>

        <p><strong>3. 调整肩带</strong></p>
        <p>肩带长度适中，书包底部不要低于腰部。</p>

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
      thumbnail: '🎬',
      duration: 5,
      videoUrl: '#'
    },
    {
      id: 'video-2',
      title: '办公室伸展运动',
      description: '适合久坐后的简单拉伸',
      category: 'exercise',
      thumbnail: '🎬',
      duration: 8,
      videoUrl: '#'
    },
    {
      id: 'video-3',
      title: '脊柱矫正瑜伽',
      description: '温和的瑜伽动作改善体态',
      category: 'exercise',
      thumbnail: '🎬',
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
      thumbnail: '📚',
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
const getRecommendedContent = () => {
  // 这里可以根据用户的检测结果推荐个性化内容
  return [
    educationContents.articles[0],
    educationContents.articles[2],
    educationContents.videos[0]
  ]
}

export default function HealthEducation() {
  const [activeTab, setActiveTab] = useState<'recommend' | 'articles' | 'videos' | 'courses'>('recommend')
  const [selectedArticle, setSelectedArticle] = useState<typeof educationContents.articles[0] | null>(null)

  const recommendedContent = getRecommendedContent()

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
        <h1>健康学堂</h1>
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
            <div className="section-header">
              <h2>个性化推荐</h2>
              <p>根据你的体态检测结果，我们为你推荐以下内容</p>
            </div>
            <div className="content-list">
              {recommendedContent.map((item: any) => renderContentCard(item, 'article'))}
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
