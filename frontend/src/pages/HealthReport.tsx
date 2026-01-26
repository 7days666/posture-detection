import { useState } from 'react'
import { motion } from 'framer-motion'
import TabBar from '../components/TabBar'
import AIPrediction from '../components/AIPrediction'
import { RobotIcon, PredictionIcon } from '../components/Icons'
import './HealthReport.css'

// 模拟最近一次检测结果
const latestAssessment = {
  date: '2024-01-20',
  overallScore: 72,
  riskLevel: 'medium' as const,
  details: {
    headForward: { value: 12, status: 'warning', label: '头部前倾', unit: '°', normal: '< 10°' },
    shoulderLevel: { value: 3, status: 'warning', label: '肩膀高低差', unit: 'cm', normal: '< 2cm' },
    spineCurvature: { value: 8, status: 'good', label: '脊柱弯曲', unit: '°', normal: '< 10°' },
    pelvisTilt: { value: 5, status: 'good', label: '骨盆倾斜', unit: '°', normal: '< 8°' },
  },
  improvements: [
    { metric: '头部前倾', before: 22, after: 12, unit: '°' },
    { metric: '肩膀高低差', before: 7, after: 3, unit: 'cm' },
  ],
  suggestions: [
    '继续保持每日颈椎操练习，每次10分钟',
    '注意调整电脑屏幕高度，保持平视',
    '每隔45分钟起身活动，做肩颈拉伸',
    '加强核心肌群训练，每周3次',
  ]
}

// 风险等级配置
const riskConfig = {
  low: { color: '#10b981', label: '低风险', bg: '#d1fae5' },
  medium: { color: '#f59e0b', label: '中风险', bg: '#fef3c7' },
  high: { color: '#ef4444', label: '高风险', bg: '#fee2e2' },
}

export default function HealthReport() {
  const [showPrediction, setShowPrediction] = useState(false)

  const risk = riskConfig[latestAssessment.riskLevel]

  return (
    <div className="health-report-page">
      <header className="page-header">
        <h1>健康报告</h1>
        <p className="report-date">检测日期：{latestAssessment.date}</p>
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
                strokeDasharray={`${latestAssessment.overallScore * 2.83} 283`}
                style={{ stroke: risk.color }}
              />
            </svg>
            <div className="score-content">
              <span className="score-number">{latestAssessment.overallScore}</span>
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
            {Object.entries(latestAssessment.details).map(([key, metric]) => (
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
          <div className="improvement-list">
            {latestAssessment.improvements.map((item, index) => (
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
            {latestAssessment.suggestions.map((suggestion, index) => (
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
          <button className="action-btn primary">开始矫正训练</button>
          <button className="action-btn secondary">分享报告</button>
        </motion.div>
      </main>

      {/* AI 预测弹窗 */}
      {showPrediction && (
        <AIPrediction onClose={() => setShowPrediction(false)} />
      )}

      <TabBar />
    </div>
  )
}
