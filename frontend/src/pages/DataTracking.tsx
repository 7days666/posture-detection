import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import TabBar from '../components/TabBar'
import {
  TrendUpIcon,
  TrendDownIcon,
  TrendStableIcon,
  SearchIcon,
  RunIcon,
  TimerIcon,
  CheckmarkIcon,
  RobotIcon,
  ImprovementIcon
} from '../components/Icons'
import { predictionAPI } from '../api/healthApi'
import './DataTracking.css'

interface AssessmentRecord {
  id: number
  overall_score: number
  risk_level: string
  head_forward_angle: number | null
  shoulder_level_diff: number | null
  created_at: string
}

interface ExerciseRecord {
  id: number
  exercise_type: string
  exercise_name: string | null
  duration_minutes: number
  completion_rate: number
  created_at: string
}

interface DashboardData {
  assessment: {
    stats: { total: number; avg_score: number; max_score: number; min_score: number } | null
    recent: AssessmentRecord[]
  }
  exercise: {
    stats: { total: number; total_minutes: number; avg_completion: number } | null
    recent: ExerciseRecord[]
  }
  trend: { direction: string; change: number; message: string }
}

export default function DataTracking() {
  const [activeTab, setActiveTab] = useState<'overview' | 'posture' | 'exercise'>('overview')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await predictionAPI.getDashboard()
      if (response.success) {
        setData(response.data)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const assessmentHistory = data?.assessment?.recent || []
  const exerciseRecords = data?.exercise?.recent || []
  const assessmentStats = data?.assessment?.stats
  const exerciseStats = data?.exercise?.stats
  const trend = data?.trend

  const latestScore = assessmentHistory[0]?.overall_score || 0
  const scoreChange = assessmentStats ? (assessmentStats.max_score - assessmentStats.min_score) : 0

  // 简单的柱状图渲染
  const renderBarChart = (records: AssessmentRecord[]) => (
    <div className="bar-chart">
      {records.slice().reverse().map((record, index) => (
        <div key={record.id || index} className="bar-container">
          <div
            className="bar"
            style={{ height: `${record.overall_score}%` }}
          />
          <span className="bar-label">
            {new Date(record.created_at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
          </span>
        </div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="data-tracking-page">
        <header className="page-header">
          <h1>数据追踪</h1>
          <p className="subtitle">加载中...</p>
        </header>
        <main className="tracking-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <div className="loading-spinner" style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </main>
        <TabBar />
      </div>
    )
  }

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
                  <span className="score-value">{latestScore || '--'}</span>
                  <span className="score-label">健康评分</span>
                </div>
                <div className="score-trend">
                  <span className={`trend-badge ${trend?.direction || 'stable'}`}>
                    {trend?.direction === 'improving' && <><TrendUpIcon color="#059669" /> 持续改善</>}
                    {trend?.direction === 'stable' && <><TrendStableIcon color="#d97706" /> 保持稳定</>}
                    {trend?.direction === 'declining' && <><TrendDownIcon color="#dc2626" /> 需要关注</>}
                    {!trend?.direction && <><TrendStableIcon color="#d97706" /> 暂无数据</>}
                  </span>
                  <p className="trend-detail">
                    {trend?.message || '完成首次检测后查看趋势'}
                  </p>
                </div>
              </div>
            </motion.section>

            {/* 趋势图表 */}
            {assessmentHistory.length > 0 && (
              <motion.section
                className="chart-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2>评分趋势</h2>
                {renderBarChart(assessmentHistory)}
              </motion.section>
            )}

            {/* 快速统计 */}
            <motion.section
              className="stats-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="stat-card">
                <span className="stat-icon"><SearchIcon color="#10b981" /></span>
                <span className="stat-value">{assessmentStats?.total || 0}</span>
                <span className="stat-label">检测次数</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon"><RunIcon color="#3b82f6" /></span>
                <span className="stat-value">{exerciseStats?.total || 0}</span>
                <span className="stat-label">运动次数</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon"><TimerIcon color="#f59e0b" /></span>
                <span className="stat-value">{exerciseStats?.total_minutes || 0}</span>
                <span className="stat-label">运动分钟</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon"><CheckmarkIcon color="#8b5cf6" /></span>
                <span className="stat-value">{Math.round(exerciseStats?.avg_completion || 0)}%</span>
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
                <span className="ai-icon"><RobotIcon color="#8b5cf6" /></span>
                <h2>AI 行为分析</h2>
              </div>
              <div className="analysis-content">
                {assessmentHistory.length >= 2 ? (
                  <>
                    <p>根据你近期的数据分析：</p>
                    <ul>
                      <li>体态评分呈现<strong>{trend?.direction === 'improving' ? '上升趋势' : trend?.direction === 'declining' ? '下降趋势' : '稳定状态'}</strong></li>
                      <li>平均评分为 {Math.round(assessmentStats?.avg_score || 0)} 分</li>
                      <li>共完成 {exerciseStats?.total || 0} 次运动，累计 {exerciseStats?.total_minutes || 0} 分钟</li>
                      <li>{trend?.direction === 'improving' ? '继续保持当前的运动习惯' : '建议增加运动频率和时长'}</li>
                    </ul>
                  </>
                ) : (
                  <p>完成更多检测后，AI将为你生成个性化的行为分析建议</p>
                )}
              </div>
            </motion.section>
          </>
        )}

        {activeTab === 'posture' && (
          <>
            <section className="history-section">
              <h2>检测历史</h2>
              {assessmentHistory.length > 0 ? (
                <div className="history-list">
                  {assessmentHistory.map((record, index) => (
                    <motion.div
                      key={record.id}
                      className="history-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="history-date">{new Date(record.created_at).toLocaleDateString('zh-CN')}</div>
                      <div className="history-details">
                        <div className="detail-row">
                          <span>综合评分</span>
                          <span className={`score ${record.risk_level}`}>{record.overall_score}分</span>
                        </div>
                        {record.head_forward_angle && (
                          <div className="detail-row">
                            <span>头部前倾</span>
                            <span>{record.head_forward_angle.toFixed(1)}°</span>
                          </div>
                        )}
                        {record.shoulder_level_diff && (
                          <div className="detail-row">
                            <span>肩膀高低差</span>
                            <span>{record.shoulder_level_diff.toFixed(1)}cm</span>
                          </div>
                        )}
                      </div>
                      <div className={`risk-badge ${record.risk_level}`}>
                        {record.risk_level === 'high' && '高风险'}
                        {record.risk_level === 'medium' && '中风险'}
                        {record.risk_level === 'low' && '低风险'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                  <p>暂无检测记录</p>
                  <p style={{ fontSize: 14, marginTop: 8 }}>完成AI体态检测后，记录将显示在这里</p>
                </div>
              )}
            </section>

            {/* 趋势分析 */}
            {assessmentHistory.length >= 2 && (
              <section className="trend-analysis">
                <h2>趋势分析</h2>
                <div className="trend-cards">
                  <div className={`trend-card ${scoreChange > 0 ? 'positive' : 'neutral'}`}>
                    <span className="trend-icon"><ImprovementIcon color="#10b981" /></span>
                    <div className="trend-info">
                      <h3>评分变化</h3>
                      <p>最低{assessmentStats?.min_score}分 → 最高{assessmentStats?.max_score}分</p>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {activeTab === 'exercise' && (
          <>
            <section className="exercise-section">
              <h2>运动记录</h2>
              {exerciseRecords.length > 0 ? (
                <div className="exercise-list">
                  {exerciseRecords.map((record, index) => (
                    <motion.div
                      key={record.id}
                      className="exercise-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="exercise-icon"><RunIcon color="#10b981" /></div>
                      <div className="exercise-info">
                        <h3>{record.exercise_name || record.exercise_type}</h3>
                        <p>{new Date(record.created_at).toLocaleDateString('zh-CN')}</p>
                      </div>
                      <div className="exercise-stats">
                        <span className="duration">{record.duration_minutes}分钟</span>
                        <div className="completion-bar">
                          <div
                            className="completion-fill"
                            style={{ width: `${record.completion_rate}%` }}
                          />
                        </div>
                        <span className="completion-text">{record.completion_rate}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                  <p>暂无运动记录</p>
                  <p style={{ fontSize: 14, marginTop: 8 }}>开始运动后，记录将显示在这里</p>
                </div>
              )}
            </section>

            {/* 运动建议 */}
            <section className="exercise-suggestions">
              <h2>调整建议</h2>
              <div className="suggestion-card">
                <p>根据你的运动完成情况，AI建议：</p>
                <ul>
                  <li>{(exerciseStats?.total || 0) >= 5 ? '运动频率良好，继续保持' : '增加每周运动频次至5次'}</li>
                  <li>{(exerciseStats?.avg_completion || 0) >= 80 ? '完成度优秀' : '尝试提高每次运动的完成度'}</li>
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
