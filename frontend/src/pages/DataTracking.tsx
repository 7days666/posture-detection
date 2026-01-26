import { useState } from 'react'
import { motion } from 'framer-motion'
import TabBar from '../components/TabBar'
import './DataTracking.css'

// 模拟历史检测数据
const mockAssessmentHistory = [
  { date: '2024-01-20', score: 72, riskLevel: 'medium', headAngle: 12, shoulderDiff: 3 },
  { date: '2024-01-15', score: 68, riskLevel: 'medium', headAngle: 15, shoulderDiff: 4 },
  { date: '2024-01-10', score: 65, riskLevel: 'high', headAngle: 18, shoulderDiff: 5 },
  { date: '2024-01-05', score: 60, riskLevel: 'high', headAngle: 20, shoulderDiff: 6 },
  { date: '2024-01-01', score: 55, riskLevel: 'high', headAngle: 22, shoulderDiff: 7 },
]

// 模拟运动记录
const mockExerciseRecords = [
  { date: '2024-01-20', type: '颈椎操', duration: 10, completion: 100 },
  { date: '2024-01-19', type: '脊柱伸展', duration: 15, completion: 80 },
  { date: '2024-01-18', type: '核心训练', duration: 20, completion: 100 },
  { date: '2024-01-17', type: '颈椎操', duration: 10, completion: 90 },
  { date: '2024-01-16', type: '体态矫正', duration: 25, completion: 75 },
]

// 计算趋势
const calculateTrend = (data: number[]) => {
  if (data.length < 2) return 'stable'
  const recent = data.slice(0, 3).reduce((a, b) => a + b, 0) / 3
  const older = data.slice(-3).reduce((a, b) => a + b, 0) / 3
  if (recent > older + 5) return 'improving'
  if (recent < older - 5) return 'declining'
  return 'stable'
}

export default function DataTracking() {
  const [activeTab, setActiveTab] = useState<'overview' | 'posture' | 'exercise'>('overview')

  const scores = mockAssessmentHistory.map(a => a.score)
  const trend = calculateTrend(scores)
  const latestScore = scores[0]
  const scoreChange = scores[0] - scores[scores.length - 1]

  // 简单的柱状图渲染
  const renderBarChart = (data: number[], maxValue: number) => (
    <div className="bar-chart">
      {data.slice().reverse().map((value, index) => (
        <div key={index} className="bar-container">
          <div
            className="bar"
            style={{ height: `${(value / maxValue) * 100}%` }}
          />
          <span className="bar-label">{mockAssessmentHistory[data.length - 1 - index]?.date.slice(5)}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div className="data-tracking-page">
      <header className="page-header">
        <h1>数据追踪</h1>
        <p className="subtitle">查看你的健康进展与行为分析</p>
      </header>

      <nav className="tracking-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          概览
        </button>
        <button
          className={`tab-btn ${activeTab === 'posture' ? 'active' : ''}`}
          onClick={() => setActiveTab('posture')}
        >
          体态数据
        </button>
        <button
          className={`tab-btn ${activeTab === 'exercise' ? 'active' : ''}`}
          onClick={() => setActiveTab('exercise')}
        >
          运动记录
        </button>
      </nav>

      <main className="tracking-content">
        {activeTab === 'overview' && (
          <>
            {/* 健康评分卡片 */}
            <motion.section
              className="score-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="score-main">
                <div className="score-circle">
                  <span className="score-value">{latestScore}</span>
                  <span className="score-label">健康评分</span>
                </div>
                <div className="score-trend">
                  <span className={`trend-badge ${trend}`}>
                    {trend === 'improving' && '📈 持续改善'}
                    {trend === 'stable' && '➡️ 保持稳定'}
                    {trend === 'declining' && '📉 需要关注'}
                  </span>
                  <p className="trend-detail">
                    相比首次检测 {scoreChange > 0 ? '+' : ''}{scoreChange} 分
                  </p>
                </div>
              </div>
            </motion.section>

            {/* 趋势图表 */}
            <motion.section
              className="chart-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2>评分趋势</h2>
              {renderBarChart(scores, 100)}
            </motion.section>

            {/* 快速统计 */}
            <motion.section
              className="stats-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="stat-card">
                <span className="stat-icon">🔍</span>
                <span className="stat-value">{mockAssessmentHistory.length}</span>
                <span className="stat-label">检测次数</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🏃</span>
                <span className="stat-value">{mockExerciseRecords.length}</span>
                <span className="stat-label">运动次数</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">⏱️</span>
                <span className="stat-value">
                  {mockExerciseRecords.reduce((sum, r) => sum + r.duration, 0)}
                </span>
                <span className="stat-label">运动分钟</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">✅</span>
                <span className="stat-value">
                  {Math.round(mockExerciseRecords.reduce((sum, r) => sum + r.completion, 0) / mockExerciseRecords.length)}%
                </span>
                <span className="stat-label">平均完成度</span>
              </div>
            </motion.section>

            {/* AI 分析建议 */}
            <motion.section
              className="ai-analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="analysis-header">
                <span className="ai-icon">🤖</span>
                <h2>AI 行为分析</h2>
              </div>
              <div className="analysis-content">
                <p>根据你近期的数据分析：</p>
                <ul>
                  <li>体态评分呈现<strong>上升趋势</strong>，说明运动干预有效</li>
                  <li>头部前倾角度从22°改善到12°，效果显著</li>
                  <li>建议保持每日颈椎操练习，继续巩固效果</li>
                  <li>预测：按当前进度，2周后评分可达80分以上</li>
                </ul>
              </div>
            </motion.section>
          </>
        )}

        {activeTab === 'posture' && (
          <>
            <section className="history-section">
              <h2>检测历史</h2>
              <div className="history-list">
                {mockAssessmentHistory.map((record, index) => (
                  <motion.div
                    key={index}
                    className="history-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="history-date">{record.date}</div>
                    <div className="history-details">
                      <div className="detail-row">
                        <span>综合评分</span>
                        <span className={`score ${record.riskLevel}`}>{record.score}分</span>
                      </div>
                      <div className="detail-row">
                        <span>头部前倾</span>
                        <span>{record.headAngle}°</span>
                      </div>
                      <div className="detail-row">
                        <span>肩膀高低差</span>
                        <span>{record.shoulderDiff}cm</span>
                      </div>
                    </div>
                    <div className={`risk-badge ${record.riskLevel}`}>
                      {record.riskLevel === 'high' && '高风险'}
                      {record.riskLevel === 'medium' && '中风险'}
                      {record.riskLevel === 'low' && '低风险'}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* 趋势分析 */}
            <section className="trend-analysis">
              <h2>趋势分析</h2>
              <div className="trend-cards">
                <div className="trend-card positive">
                  <span className="trend-icon">📉</span>
                  <div className="trend-info">
                    <h3>头部前倾改善</h3>
                    <p>从22°降至12°，改善45%</p>
                  </div>
                </div>
                <div className="trend-card positive">
                  <span className="trend-icon">📉</span>
                  <div className="trend-info">
                    <h3>肩膀对称性改善</h3>
                    <p>高低差从7cm降至3cm</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'exercise' && (
          <>
            <section className="exercise-section">
              <h2>运动记录</h2>
              <div className="exercise-list">
                {mockExerciseRecords.map((record, index) => (
                  <motion.div
                    key={index}
                    className="exercise-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="exercise-icon">🏃</div>
                    <div className="exercise-info">
                      <h3>{record.type}</h3>
                      <p>{record.date}</p>
                    </div>
                    <div className="exercise-stats">
                      <span className="duration">{record.duration}分钟</span>
                      <div className="completion-bar">
                        <div
                          className="completion-fill"
                          style={{ width: `${record.completion}%` }}
                        />
                      </div>
                      <span className="completion-text">{record.completion}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* 运动建议 */}
            <section className="exercise-suggestions">
              <h2>调整建议</h2>
              <div className="suggestion-card">
                <p>根据你的运动完成情况，AI建议：</p>
                <ul>
                  <li>增加每周运动频次至5次</li>
                  <li>尝试延长每次运动时长至15-20分钟</li>
                  <li>添加核心稳定性训练，增强脊柱支撑</li>
                </ul>
              </div>
            </section>
          </>
        )}
      </main>

      <TabBar />
    </div>
  )
}
