import { motion, AnimatePresence } from 'framer-motion'
import './AIPrediction.css'

interface AIPredictionProps {
  onClose: () => void
}

// 模拟AI预测数据
const predictionData = {
  // 风险趋势预测
  riskTrend: {
    current: 'medium',
    predicted: 'low',
    confidence: 85,
    timeframe: '4周后',
    factors: [
      { name: '运动频率', impact: 'positive', score: 90 },
      { name: '坐姿时长', impact: 'negative', score: 60 },
      { name: '依从性', impact: 'positive', score: 85 },
    ]
  },
  // 行为影响分析
  behaviorImpact: [
    {
      behavior: '每日颈椎操',
      impact: '+8分',
      description: '对头部前倾改善效果最显著',
      priority: 'high'
    },
    {
      behavior: '减少久坐时间',
      impact: '+5分',
      description: '建议每45分钟休息一次',
      priority: 'high'
    },
    {
      behavior: '核心训练',
      impact: '+4分',
      description: '增强脊柱稳定性',
      priority: 'medium'
    },
    {
      behavior: '正确背书包',
      impact: '+2分',
      description: '预防肩膀不对称',
      priority: 'low'
    }
  ],
  // 未来预测
  futureForcast: [
    { week: 1, score: 74, risk: 'medium' },
    { week: 2, score: 77, risk: 'medium' },
    { week: 3, score: 80, risk: 'low' },
    { week: 4, score: 83, risk: 'low' },
  ],
  // 调整建议
  adjustments: [
    {
      type: 'increase',
      suggestion: '将颈椎操频率从每天1次增加到2次',
      expectedImpact: '加速头部前倾改善'
    },
    {
      type: 'add',
      suggestion: '新增每周3次核心训练（每次15分钟）',
      expectedImpact: '增强脊柱稳定性'
    },
    {
      type: 'monitor',
      suggestion: '持续监测肩膀对称性变化',
      expectedImpact: '及时发现异常'
    }
  ]
}

export default function AIPrediction({ onClose }: AIPredictionProps) {
  const riskColors = {
    low: { bg: '#d1fae5', text: '#059669', label: '低风险' },
    medium: { bg: '#fef3c7', text: '#d97706', label: '中风险' },
    high: { bg: '#fee2e2', text: '#dc2626', label: '高风险' }
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
              <span className="ai-icon">🔮</span>
              <h2>AI 健康趋势预测</h2>
            </div>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          <div className="modal-body">
            {/* 风险趋势预测 */}
            <section className="prediction-section">
              <h3>风险等级预测</h3>
              <div className="risk-prediction">
                <div className="risk-flow">
                  <div
                    className="risk-box current"
                    style={{
                      background: riskColors[predictionData.riskTrend.current as keyof typeof riskColors].bg,
                      color: riskColors[predictionData.riskTrend.current as keyof typeof riskColors].text
                    }}
                  >
                    <span className="risk-time">当前</span>
                    <span className="risk-status">
                      {riskColors[predictionData.riskTrend.current as keyof typeof riskColors].label}
                    </span>
                  </div>
                  <div className="risk-arrow">
                    <span>→</span>
                    <span className="timeframe">{predictionData.riskTrend.timeframe}</span>
                  </div>
                  <div
                    className="risk-box predicted"
                    style={{
                      background: riskColors[predictionData.riskTrend.predicted as keyof typeof riskColors].bg,
                      color: riskColors[predictionData.riskTrend.predicted as keyof typeof riskColors].text
                    }}
                  >
                    <span className="risk-time">预测</span>
                    <span className="risk-status">
                      {riskColors[predictionData.riskTrend.predicted as keyof typeof riskColors].label}
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
                          background: riskColors[item.risk as keyof typeof riskColors].text
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
                      {item.type === 'increase' && '⬆️'}
                      {item.type === 'add' && '➕'}
                      {item.type === 'monitor' && '👁️'}
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
          </div>

          <div className="modal-footer">
            <button className="apply-btn" onClick={onClose}>
              应用调整建议
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
