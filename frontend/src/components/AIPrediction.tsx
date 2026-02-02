import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PredictionIcon,
  IncreaseIcon,
  AddIcon,
  MonitorIcon,
  CloseIcon
} from './Icons'
import { PredictionData } from '../api/aiSuggestion'
import { predictionAPI } from '../api/healthApi'
import './AIPrediction.css'

interface AIPredictionProps {
  onClose: () => void
}

export default function AIPrediction({ onClose }: AIPredictionProps) {
  const [loading, setLoading] = useState(true)
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const riskColors = {
    low: { bg: '#d1fae5', text: '#059669', label: '低风险' },
    medium: { bg: '#fef3c7', text: '#d97706', label: '中风险' },
    high: { bg: '#fee2e2', text: '#dc2626', label: '高风险' }
  }

  useEffect(() => {
    loadPrediction()
  }, [])

  const loadPrediction = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 调用后端预测接口，基于真实数据计算预测
      const response = await predictionAPI.analyze()
      if (response.success && response.data) {
        setPredictionData(response.data as PredictionData)
      } else {
        setError('暂无足够数据进行预测，请先完成体态检测')
      }
    } catch (err) {
      console.error('加载预测失败:', err)
      setError('加载预测失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="prediction-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="prediction-modal"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="modal-header">
            <div className="header-content">
              <span className="ai-icon"><PredictionIcon color="#6366f1" /></span>
              <h2>AI 健康趋势预测</h2>
            </div>
            <button className="close-btn" onClick={onClose}><CloseIcon /></button>
          </div>

          <div className="modal-body">
            {loading ? (
              <div className="prediction-loading">
                <div className="loading-spinner"></div>
                <p>AI 正在分析您的健康数据...</p>
              </div>
            ) : error ? (
              <div className="prediction-error">
                <p>{error}</p>
                <button onClick={loadPrediction}>重试</button>
              </div>
            ) : predictionData ? (
              <>
                {/* 风险趋势预测 */}
                <section className="prediction-section">
                  <h3>风险等级预测</h3>
                  <div className="risk-prediction">
                    <div className="risk-flow">
                      <div
                        className="risk-box current"
                        style={{
                          background: riskColors[predictionData.riskTrend.current].bg,
                          color: riskColors[predictionData.riskTrend.current].text
                        }}
                      >
                        <span className="risk-time">当前</span>
                        <span className="risk-status">
                          {riskColors[predictionData.riskTrend.current].label}
                        </span>
                      </div>
                      <div className="risk-arrow">
                        <span>→</span>
                        <span className="timeframe">{predictionData.riskTrend.timeframe}</span>
                      </div>
                      <div
                        className="risk-box predicted"
                        style={{
                          background: riskColors[predictionData.riskTrend.predicted].bg,
                          color: riskColors[predictionData.riskTrend.predicted].text
                        }}
                      >
                        <span className="risk-time">预测</span>
                        <span className="risk-status">
                          {riskColors[predictionData.riskTrend.predicted].label}
                        </span>
                      </div>
                    </div>
                    <div className="confidence">
                      <span>预测置信度：</span>
                      <strong>{predictionData.riskTrend.confidence}%</strong>
                    </div>
                  </div>
                </section>

                {/* 评分趋势预测 */}
                <section className="prediction-section">
                  <h3>评分趋势预测</h3>
                  <div className="score-forecast">
                    {predictionData.futureForcast.map((item, index) => (
                      <div key={index} className="forecast-item">
                        <div className="forecast-week">第{item.week}周</div>
                        <div className="forecast-bar-container">
                          <div
                            className="forecast-bar"
                            style={{
                              width: `${item.score}%`,
                              background: riskColors[item.risk].text
                            }}
                          />
                        </div>
                        <div className="forecast-score">{item.score}分</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 行为影响分析 */}
                <section className="prediction-section">
                  <h3>行为影响分析</h3>
                  <p className="section-desc">哪些行为对体态健康影响最大</p>
                  <div className="behavior-list">
                    {predictionData.behaviorImpact.map((item, index) => (
                      <div key={index} className={`behavior-item priority-${item.priority}`}>
                        <div className="behavior-main">
                          <span className="behavior-name">{item.behavior}</span>
                          <span className="behavior-impact">{item.impact}</span>
                        </div>
                        <p className="behavior-desc">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 调整建议 */}
                <section className="prediction-section">
                  <h3>方案调整建议</h3>
                  <div className="adjustment-list">
                    {predictionData.adjustments.map((item, index) => (
                      <div key={index} className={`adjustment-item type-${item.type}`}>
                        <div className="adjustment-icon">
                          {item.type === 'increase' && <IncreaseIcon color="#10b981" />}
                          {item.type === 'add' && <AddIcon color="#3b82f6" />}
                          {item.type === 'monitor' && <MonitorIcon color="#8b5cf6" />}
                        </div>
                        <div className="adjustment-content">
                          <p className="adjustment-suggestion">{item.suggestion}</p>
                          <p className="adjustment-impact">预期效果：{item.expectedImpact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 影响因素 */}
                <section className="prediction-section">
                  <h3>关键影响因素</h3>
                  <div className="factors-list">
                    {predictionData.riskTrend.factors.map((factor, index) => (
                      <div key={index} className="factor-item">
                        <span className="factor-name">{factor.name}</span>
                        <div className="factor-bar-container">
                          <div
                            className={`factor-bar ${factor.impact}`}
                            style={{ width: `${factor.score}%` }}
                          />
                        </div>
                        <span className={`factor-score ${factor.impact}`}>{factor.score}%</span>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            ) : null}
          </div>

          <div className="modal-footer">
            <button className="apply-btn" onClick={onClose}>
              {loading ? '加载中...' : '应用调整建议'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
