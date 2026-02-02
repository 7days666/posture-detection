import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import TabBar from '../components/TabBar'
import AIPrediction from '../components/AIPrediction'
import { RobotIcon, PredictionIcon } from '../components/Icons'
import { assessmentAPI } from '../api/healthApi'
import './HealthReport.css'

interface AssessmentData {
  id?: number
  overall_score: number
  risk_level: string
  head_forward_angle?: number | null
  shoulder_level_diff?: number | null
  spine_curvature?: number | null
  pelvis_tilt?: number | null
  ai_suggestions?: string | null
  keypoints_data?: any
  created_at: string
}

interface ReportData {
  date: string
  overallScore: number
  riskLevel: 'low' | 'medium' | 'high'
  details: {
    headForward?: { value: number; status: string; label: string; unit: string; normal: string }
    shoulderLevel?: { value: number; status: string; label: string; unit: string; normal: string }
    spineCurvature?: { value: number; status: string; label: string; unit: string; normal: string }
    pelvisTilt?: { value: number; status: string; label: string; unit: string; normal: string }
  }
  improvements: { metric: string; before: number; after: number; unit: string }[]
  suggestions: string[]
}

// 风险等级配置
const riskConfig = {
  low: { color: '#10b981', label: '低风险', bg: '#d1fae5' },
  medium: { color: '#f59e0b', label: '中风险', bg: '#fef3c7' },
  high: { color: '#ef4444', label: '高风险', bg: '#fee2e2' },
}

// 辅助函数：判断指标状态
function getMetricStatus(value: number, threshold: number): 'good' | 'warning' | 'danger' {
  if (value <= threshold) return 'good'
  if (value <= threshold * 1.5) return 'warning'
  return 'danger'
}

// 转换数据库数据为展示格式
function transformAssessmentData(data: AssessmentData, historyData: AssessmentData[]): ReportData {
  const details: ReportData['details'] = {}
  
  // 头部前倾
  if (data.head_forward_angle !== null && data.head_forward_angle !== undefined) {
    const value = Math.round(data.head_forward_angle)
    details.headForward = {
      value,
      status: getMetricStatus(value, 10),
      label: '头部前倾',
      unit: '°',
      normal: '< 10°'
    }
  }
  
  // 肩膀高低差
  if (data.shoulder_level_diff !== null && data.shoulder_level_diff !== undefined) {
    const value = Math.round(data.shoulder_level_diff * 10) / 10
    details.shoulderLevel = {
      value,
      status: getMetricStatus(value, 2),
      label: '肩膀高低差',
      unit: 'cm',
      normal: '< 2cm'
    }
  }
  
  // 脊柱弯曲
  if (data.spine_curvature !== null && data.spine_curvature !== undefined) {
    const value = Math.round(data.spine_curvature)
    details.spineCurvature = {
      value,
      status: getMetricStatus(value, 10),
      label: '脊柱弯曲',
      unit: '°',
      normal: '< 10°'
    }
  }
  
  // 骨盆倾斜
  if (data.pelvis_tilt !== null && data.pelvis_tilt !== undefined) {
    const value = Math.round(data.pelvis_tilt)
    details.pelvisTilt = {
      value,
      status: getMetricStatus(value, 8),
      label: '骨盆倾斜',
      unit: '°',
      normal: '< 8°'
    }
  }
  
  // 计算改善情况（对比历史数据）
  const improvements: ReportData['improvements'] = []
  if (historyData.length >= 2) {
    const oldestRecord = historyData[historyData.length - 1]
    
    if (data.head_forward_angle && oldestRecord.head_forward_angle) {
      improvements.push({
        metric: '头部前倾',
        before: Math.round(oldestRecord.head_forward_angle),
        after: Math.round(data.head_forward_angle),
        unit: '°'
      })
    }
    
    if (data.shoulder_level_diff && oldestRecord.shoulder_level_diff) {
      improvements.push({
        metric: '肩膀高低差',
        before: Math.round(oldestRecord.shoulder_level_diff * 10) / 10,
        after: Math.round(data.shoulder_level_diff * 10) / 10,
        unit: 'cm'
      })
    }
  }
  
  // 解析 AI 建议
  let suggestions: string[] = []
  if (data.ai_suggestions) {
    // 尝试按数字编号分割（如 1. 2. 3. 或 1、2、3、）
    const numbered = data.ai_suggestions.split(/(?=\d+[.、])/g).filter(s => s.trim())
    if (numbered.length >= 3) {
      suggestions = numbered.slice(0, 6)
    } else {
      // 按换行符分割
      const lines = data.ai_suggestions.split('\n').filter(s => s.trim())
      if (lines.length >= 3) {
        suggestions = lines.slice(0, 6)
      } else {
        // 按句号分割
        const sentences = data.ai_suggestions.split(/[。！]/).filter(s => s.trim())
        suggestions = sentences.slice(0, 6).map(s => s + (s.endsWith('。') ? '' : '。'))
      }
    }
  }
  
  if (suggestions.length === 0) {
    suggestions = [
      '完成首次AI体态检测后，这里会显示个性化建议',
      '建议定期进行体态检测，跟踪健康变化',
      '保持良好的坐姿和站姿习惯',
      '每天进行适量的伸展运动'
    ]
  }
  
  return {
    date: new Date(data.created_at).toLocaleDateString('zh-CN'),
    overallScore: Math.round(data.overall_score),
    riskLevel: data.risk_level as 'low' | 'medium' | 'high',
    details,
    improvements,
    suggestions
  }
}

export default function HealthReport() {
  const navigate = useNavigate()
  const [showPrediction, setShowPrediction] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  
  useEffect(() => {
    fetchReportData()
  }, [])
  
  async function fetchReportData() {
    try {
      setLoading(true)
      setError(null)
      
      // 获取最新检测结果
      const latestResponse = await assessmentAPI.getLatest()
      if (!latestResponse.success || !latestResponse.data) {
        setError('暂无检测数据，请先完成AI体态检测')
        setLoading(false)
        return
      }
      
      // 获取历史数据用于计算改善情况
      const historyResponse = await assessmentAPI.getHistory(10, 0)
      const historyData = historyResponse.success ? historyResponse.data : []
      
      const transformed = transformAssessmentData(latestResponse.data, historyData)
      setReportData(transformed)
    } catch (err) {
      console.error('获取报告数据失败:', err)
      setError('获取数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }
  
  // 加载中
  if (loading) {
    return (
      <div className="health-report-page">
        <header className="page-header">
          <h1>健康报告</h1>
        </header>
        <main className="report-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner" style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280' }}>加载中...</p>
          </div>
        </main>
        <TabBar />
      </div>
    )
  }
  
  // 错误或无数据
  if (error || !reportData) {
    return (
      <div className="health-report-page">
        <header className="page-header">
          <h1>健康报告</h1>
        </header>
        <main className="report-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <svg viewBox="0 0 64 64" fill="none" width="64" height="64" style={{ margin: '0 auto 16px' }}>
              <rect x="12" y="8" width="40" height="48" rx="3" stroke="#9ca3af" stroke-width="2.5" fill="#f3f4f6"/>
              <path d="M20 20h24M20 28h24M20 36h16" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
              <circle cx="24" cy="44" r="1.5" fill="#9ca3af"/>
              <circle cx="32" cy="44" r="1.5" fill="#9ca3af"/>
              <circle cx="40" cy="44" r="1.5" fill="#9ca3af"/>
            </svg>
            <p style={{ color: '#6b7280', marginBottom: 20 }}>{error || '暂无数据'}</p>
            <button 
              onClick={() => window.location.href = '/detect'}
              style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: 15, cursor: 'pointer' }}
            >
              开始检测
            </button>
          </div>
        </main>
        <TabBar />
      </div>
    )
  }
  
  const risk = riskConfig[reportData.riskLevel]

  // 开始矫正训练 - 跳转到数字运动教练页面
  const handleStartTraining = () => {
    // 根据检测结果确定推荐的训练类型
    const problems: string[] = []
    if (reportData.details.headForward && reportData.details.headForward.status !== 'good') {
      problems.push('neck') // 颈部问题
    }
    if (reportData.details.shoulderLevel && reportData.details.shoulderLevel.status !== 'good') {
      problems.push('shoulder') // 肩部问题
    }
    if (reportData.details.spineCurvature && reportData.details.spineCurvature.status !== 'good') {
      problems.push('spine') // 脊柱问题
    }
    if (reportData.details.pelvisTilt && reportData.details.pelvisTilt.status !== 'good') {
      problems.push('pelvis') // 骨盆问题
    }
    
    // 跳转到数字运动教练页面，带上问题类型参数
    navigate('/education', { state: { problems, fromReport: true } })
  }

  // 分享报告
  const handleShareReport = async () => {
    const shareData = {
      title: '我的体态健康报告',
      text: `我的体态评分：${reportData.overallScore}分，${risk.label}。快来检测你的体态健康吧！`,
      url: window.location.href
    }

    // 检查是否支持原生分享
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // 用户取消分享或分享失败，显示分享弹窗
        if ((err as Error).name !== 'AbortError') {
          setShowShareModal(true)
        }
      }
    } else {
      // 不支持原生分享，显示分享弹窗
      setShowShareModal(true)
    }
  }

  // 复制链接
  const handleCopyLink = () => {
    const text = `我的体态评分：${reportData.overallScore}分，${risk.label}。快来检测你的体态健康吧！ ${window.location.origin}/detect`
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板')
      setShowShareModal(false)
    }).catch(() => {
      alert('复制失败，请手动复制')
    })
  }

  return (
    <div className="health-report-page">
      <header className="page-header">
        <h1>健康报告</h1>
        <p className="report-date">检测日期：{reportData.date}</p>
      </header>

      <main className="report-content">
        {/* 总体评分 */}
        <motion.section
          className="overall-score-section"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="score-ring" style={{ '--ring-color': risk.color } as React.CSSProperties}>
            <svg viewBox="0 0 100 100">
              <circle className="ring-bg" cx="50" cy="50" r="45" />
              <circle
                className="ring-progress"
                cx="50"
                cy="50"
                r="45"
                strokeDasharray={`${reportData.overallScore * 2.83} 283`}
                style={{ stroke: risk.color }}
              />
            </svg>
            <div className="score-content">
              <span className="score-number">{reportData.overallScore}</span>
              <span className="score-unit">分</span>
            </div>
          </div>
          <div
            className="risk-label"
            style={{ background: risk.bg, color: risk.color }}
          >
            {risk.label}
          </div>
        </motion.section>

        {/* 详细指标 */}
        <motion.section
          className="metrics-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2>体态指标详情</h2>
          <div className="metrics-grid">
            {Object.entries(reportData.details).map(([key, metric]) => (
              <div key={key} className={`metric-card ${metric.status}`}>
                <div className="metric-header">
                  <span className="metric-label">{metric.label}</span>
                  <span className={`status-dot ${metric.status}`} />
                </div>
                <div className="metric-value">
                  {metric.value}<span className="unit">{metric.unit}</span>
                </div>
                <div className="metric-normal">正常范围: {metric.normal}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 改善对比 */}
        <motion.section
          className="improvement-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2>改善情况</h2>
          {reportData.improvements.length > 0 ? (
            <div className="improvement-list">
              {reportData.improvements.map((item, index) => (
              <div key={index} className="improvement-item">
                <span className="improvement-label">{item.metric}</span>
                <div className="improvement-bar">
                  <div className="before-bar">
                    <span>{item.before}{item.unit}</span>
                  </div>
                  <span className="arrow">→</span>
                  <div className="after-bar">
                    <span>{item.after}{item.unit}</span>
                  </div>
                </div>
                <span className="improvement-percent">
                  ↓ {Math.round((1 - item.after / item.before) * 100)}%
                </span>
              </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: 14 }}>
              继续检测以查看改善趋势
            </div>
          )}
        </motion.section>

        {/* AI 建议 */}
        <motion.section
          className="suggestions-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="section-header">
            <span className="ai-badge"><RobotIcon color="#ffffff" /> AI建议</span>
            <h2>个性化调整方案</h2>
          </div>
          <div className="suggestions-list">
            {reportData.suggestions.map((suggestion, index) => (
              <div key={index} className="suggestion-item">
                <span className="suggestion-number">{index + 1}</span>
                <span className="suggestion-text">{suggestion}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* AI 预测入口 */}
        <motion.section
          className="prediction-entry"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            className="prediction-btn"
            onClick={() => setShowPrediction(true)}
          >
            <span className="btn-icon"><PredictionIcon color="#ffffff" /></span>
            <div className="btn-content">
              <span className="btn-title">AI 健康趋势预测</span>
              <span className="btn-desc">基于历史数据预测未来体态变化</span>
            </div>
            <span className="btn-arrow">→</span>
          </button>
        </motion.section>

        {/* 操作按钮 */}
        <motion.div
          className="action-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button className="action-btn primary" onClick={handleStartTraining}>开始矫正训练</button>
          <button className="action-btn secondary" onClick={handleShareReport}>分享报告</button>
        </motion.div>
      </main>

      {/* 分享弹窗 */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <motion.div 
            className="share-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <h3>分享报告</h3>
            <div className="share-content">
              <div className="share-preview">
                <div className="share-score" style={{ color: risk.color }}>{reportData.overallScore}分</div>
                <div className="share-risk" style={{ background: risk.bg, color: risk.color }}>{risk.label}</div>
              </div>
              <p className="share-text">我的体态评分：{reportData.overallScore}分，{risk.label}。快来检测你的体态健康吧！</p>
            </div>
            <div className="share-actions">
              <button className="share-btn copy" onClick={handleCopyLink}>
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
                </svg>
                复制链接
              </button>
            </div>
            <button className="share-close" onClick={() => setShowShareModal(false)}>关闭</button>
          </motion.div>
        </div>
      )}

      {/* AI 预测弹窗 */}
      {showPrediction && (
        <AIPrediction onClose={() => setShowPrediction(false)} />
      )}

      <TabBar />
    </div>
  )
}
