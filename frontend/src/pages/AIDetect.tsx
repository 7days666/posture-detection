import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './AIDetect.css'

type Step = 'intro' | 'front' | 'side' | 'analyzing' | 'result'

export default function AIDetect() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('intro')
  const [agreed, setAgreed] = useState(false)
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [sideImage, setSideImage] = useState<string | null>(null)
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  const handleImageUpload = (type: 'front' | 'side') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          if (type === 'front') {
            setFrontImage(result)
          } else {
            setSideImage(result)
          }
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleNext = () => {
    if (step === 'intro' && agreed) {
      setStep('front')
    } else if (step === 'front' && frontImage) {
      setStep('side')
    } else if (step === 'side' && sideImage) {
      startAnalysis()
    }
  }

  const startAnalysis = () => {
    setStep('analyzing')
    // 模拟分析过程
    setTimeout(() => {
      setStep('result')
    }, 3000)
  }

  // 人体正面轮廓 SVG
  const FrontBodySvg = () => (
    <svg viewBox="0 0 80 180" fill="none" className="body-svg">
      <ellipse cx="40" cy="18" rx="14" ry="16" stroke="#4ecdc4" strokeWidth="1.5"/>
      <path d="M40 34 L40 48 Q40 52 38 56 L32 72 Q30 78 32 84 L40 100 L48 84 Q50 78 48 72 L42 56 Q40 52 40 48 L40 34" stroke="#4ecdc4" strokeWidth="1.5" fill="none"/>
      <path d="M32 42 Q24 48 18 62 Q14 72 16 82 L20 94" stroke="#4ecdc4" strokeWidth="1.5" fill="none"/>
      <path d="M48 42 Q56 48 62 62 Q66 72 64 82 L60 94" stroke="#4ecdc4" strokeWidth="1.5" fill="none"/>
      <path d="M36 100 Q34 120 32 140 Q30 155 28 170" stroke="#4ecdc4" strokeWidth="1.5" fill="none"/>
      <path d="M44 100 Q46 120 48 140 Q50 155 52 170" stroke="#4ecdc4" strokeWidth="1.5" fill="none"/>
      <line x1="24" y1="170" x2="32" y2="170" stroke="#4ecdc4" strokeWidth="1.5"/>
      <line x1="48" y1="170" x2="56" y2="170" stroke="#4ecdc4" strokeWidth="1.5"/>
    </svg>
  )

  // 人体侧面轮廓 SVG
  const SideBodySvg = () => (
    <svg viewBox="0 0 60 180" fill="none" className="body-svg">
      <ellipse cx="32" cy="18" rx="10" ry="16" stroke="#4ecdc4" strokeWidth="1.5"/>
      <path d="M32 34 Q36 45 34 60 Q32 75 34 90 Q36 100 34 110" stroke="#4ecdc4" strokeWidth="1.5" fill="none"/>
      <path d="M32 45 Q22 55 20 70 Q18 80 22 90" stroke="#4ecdc4" strokeWidth="1.5" fill="none"/>
      <path d="M34 110 Q32 130 30 150 Q28 165 26 170" stroke="#4ecdc4" strokeWidth="1.5" fill="none"/>
      <path d="M34 110 Q38 130 40 150 Q42 165 44 170" stroke="#4ecdc4" strokeWidth="1.5" fill="none"/>
      <line x1="22" y1="170" x2="30" y2="170" stroke="#4ecdc4" strokeWidth="1.5"/>
      <line x1="40" y1="170" x2="48" y2="170" stroke="#4ecdc4" strokeWidth="1.5"/>
    </svg>
  )

  // 人体背面轮廓 SVG
  const BackBodySvg = () => (
    <svg viewBox="0 0 80 180" fill="none" className="body-svg">
      <ellipse cx="40" cy="18" rx="14" ry="16" stroke="#4ecdc4" strokeWidth="1.5"/>
      <path d="M40 34 L40 48 Q40 60 38 72 L36 88 Q34 96 36 100 L40 100 L44 100 Q46 96 44 88 L42 72 Q40 60 40 48 L40 34" stroke="#4ecdc4" strokeWidth="1.5" fill="none"/>
      <path d="M32 42 Q24 48 18 62 Q14 72 16 82 L20 94" stroke="#4ecdc4" strokeWidth="1.5" fill="none"/>
      <path d="M48 42 Q56 48 62 62 Q66 72 64 82 L60 94" stroke="#4ecdc4" strokeWidth="1.5" fill="none"/>
      <path d="M36 100 Q34 120 32 140 Q30 155 28 170" stroke="#4ecdc4" strokeWidth="1.5" fill="none"/>
      <path d="M44 100 Q46 120 48 140 Q50 155 52 170" stroke="#4ecdc4" strokeWidth="1.5" fill="none"/>
      <line x1="24" y1="170" x2="32" y2="170" stroke="#4ecdc4" strokeWidth="1.5"/>
      <line x1="48" y1="170" x2="56" y2="170" stroke="#4ecdc4" strokeWidth="1.5"/>
    </svg>
  )

  // 介绍页面
  const renderIntro = () => (
    <motion.div className="detect-content intro-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* 正面检测 */}
      <div className="pose-card">
        <div className="pose-figure">
          <FrontBodySvg />
        </div>
        <div className="pose-info">
          <h4 className="pose-title">正面检测</h4>
          <p className="pose-desc">双脚合拢自然站立，光脚站立镜头对准胸部下部的位置，水平拍摄全身</p>
          <p className="pose-tip">提示:不可俯身拍摄或者仰视拍摄，脚跟应水平位置(不可一个在前一个在后)</p>
        </div>
      </div>

      {/* 侧面检测 */}
      <div className="pose-card">
        <div className="pose-figure">
          <SideBodySvg />
        </div>
        <div className="pose-info">
          <h4 className="pose-title">侧面检测</h4>
          <p className="pose-desc">镜头对准腰部位置，水平进行拍摄或者对准骨盆的位置</p>
          <p className="pose-tip">提示:双脚合拢拍摄，两脚跟应水平位置(不可一个在前一个在后)</p>
        </div>
      </div>

      {/* 背面检测 */}
      <div className="pose-card">
        <div className="pose-figure">
          <BackBodySvg />
        </div>
        <div className="pose-info">
          <h4 className="pose-title">背面检测</h4>
          <p className="pose-desc">镜头对准腰底的位置(臀部最上部中间)进行拍摄或者水平对准骨盆的位置</p>
          <p className="pose-tip">提示:不可俯身拍摄或者仰视拍摄，脚跟应水平位置(不可一个在前一个在后)</p>
        </div>
      </div>
    </motion.div>
  )

  // 正面拍摄页面
  const renderFrontCapture = () => (
    <motion.div className="detect-content capture-content" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
      <div className="capture-header">
        <div className="step-badge">1/2</div>
        <h2>正面拍摄</h2>
        <p>请按照示意图姿势拍摄正面全身照</p>
      </div>

      <div className="capture-area">
        {frontImage ? (
          <div className="preview-image">
            <img src={frontImage} alt="正面照片" />
            <button className="retake-btn" onClick={() => setFrontImage(null)}>
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              重新拍摄
            </button>
          </div>
        ) : (
          <div className="capture-placeholder" onClick={() => handleImageUpload('front')}>
            <div className="body-outline front">
              <svg viewBox="0 0 120 200" fill="none">
                <ellipse cx="60" cy="25" rx="18" ry="20" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="4 2"/>
                <line x1="60" y1="45" x2="60" y2="100" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="4 2"/>
                <line x1="60" y1="55" x2="25" y2="90" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="4 2"/>
                <line x1="60" y1="55" x2="95" y2="90" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="4 2"/>
                <line x1="60" y1="100" x2="35" y2="170" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="4 2"/>
                <line x1="60" y1="100" x2="85" y2="170" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="4 2"/>
              </svg>
            </div>
            <div className="capture-hint">
              <svg viewBox="0 0 24 24" fill="none" width="32" height="32"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="#4ecdc4" strokeWidth="2"/><circle cx="12" cy="13" r="4" stroke="#4ecdc4" strokeWidth="2"/></svg>
              <span>点击拍摄或上传正面照片</span>
            </div>
          </div>
        )}
      </div>

      <div className="capture-tips">
        <div className="tip-item">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="10" stroke="#4ecdc4" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round"/></svg>
          <span>双脚合拢自然站立</span>
        </div>
        <div className="tip-item">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="10" stroke="#4ecdc4" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round"/></svg>
          <span>光脚站立，水平拍摄全身</span>
        </div>
      </div>
    </motion.div>
  )

  // 侧面拍摄页面
  const renderSideCapture = () => (
    <motion.div className="detect-content capture-content" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
      <div className="capture-header">
        <div className="step-badge">2/2</div>
        <h2>侧面拍摄</h2>
        <p>请按照示意图姿势拍摄侧面全身照</p>
      </div>

      <div className="capture-area">
        {sideImage ? (
          <div className="preview-image">
            <img src={sideImage} alt="侧面照片" />
            <button className="retake-btn" onClick={() => setSideImage(null)}>
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              重新拍摄
            </button>
          </div>
        ) : (
          <div className="capture-placeholder" onClick={() => handleImageUpload('side')}>
            <div className="body-outline side">
              <svg viewBox="0 0 80 200" fill="none">
                <ellipse cx="40" cy="25" rx="14" ry="20" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="4 2"/>
                <path d="M40 45 Q50 70 40 100" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="4 2" fill="none"/>
                <line x1="40" y1="55" x2="25" y2="85" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="4 2"/>
                <line x1="40" y1="100" x2="30" y2="170" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="4 2"/>
                <line x1="40" y1="100" x2="50" y2="170" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="4 2"/>
              </svg>
            </div>
            <div className="capture-hint">
              <svg viewBox="0 0 24 24" fill="none" width="32" height="32"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="#4ecdc4" strokeWidth="2"/><circle cx="12" cy="13" r="4" stroke="#4ecdc4" strokeWidth="2"/></svg>
              <span>点击拍摄或上传侧面照片</span>
            </div>
          </div>
        )}
      </div>

      <div className="capture-tips">
        <div className="tip-item">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="10" stroke="#4ecdc4" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round"/></svg>
          <span>双脚合拢，侧身站立</span>
        </div>
        <div className="tip-item">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="10" stroke="#4ecdc4" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round"/></svg>
          <span>镜头对准腰部位置水平拍摄</span>
        </div>
      </div>
    </motion.div>
  )

  // 分析中页面
  const renderAnalyzing = () => (
    <motion.div className="detect-content analyzing-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="analyzing-animation">
        <div className="scan-container">
          <div className="body-silhouette">
            <svg viewBox="0 0 120 200" fill="none">
              <ellipse cx="60" cy="25" rx="18" ry="20" stroke="#4ecdc4" strokeWidth="2"/>
              <line x1="60" y1="45" x2="60" y2="100" stroke="#4ecdc4" strokeWidth="2"/>
              <line x1="60" y1="55" x2="25" y2="90" stroke="#4ecdc4" strokeWidth="2"/>
              <line x1="60" y1="55" x2="95" y2="90" stroke="#4ecdc4" strokeWidth="2"/>
              <line x1="60" y1="100" x2="35" y2="170" stroke="#4ecdc4" strokeWidth="2"/>
              <line x1="60" y1="100" x2="85" y2="170" stroke="#4ecdc4" strokeWidth="2"/>
            </svg>
          </div>
          <motion.div 
            className="scan-line"
            animate={{ y: [0, 180, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <div className="analyzing-text">
          <motion.div 
            className="loading-dots"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            AI 正在分析您的体态数据
          </motion.div>
          <p className="analyzing-hint">请稍候，预计需要 10-15 秒</p>
        </div>
      </div>
    </motion.div>
  )

  // 结果页面
  const renderResult = () => (
    <motion.div className="detect-content result-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="result-header">
        <div className="result-score">
          <motion.div 
            className="score-circle"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <span className="score-value">85</span>
            <span className="score-label">体态评分</span>
          </motion.div>
        </div>
        <div className="result-status good">
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>体态状况良好</span>
        </div>
      </div>

      <div className="result-details">
        <h3>检测结果</h3>
        <div className="result-items">
          <div className="result-item">
            <div className="item-header">
              <span className="item-name">头部前倾</span>
              <span className="item-status normal">正常</span>
            </div>
            <div className="item-bar"><div className="item-fill" style={{ width: '20%' }}></div></div>
          </div>
          <div className="result-item">
            <div className="item-header">
              <span className="item-name">高低肩</span>
              <span className="item-status warning">轻微</span>
            </div>
            <div className="item-bar"><div className="item-fill warning" style={{ width: '40%' }}></div></div>
          </div>
          <div className="result-item">
            <div className="item-header">
              <span className="item-name">脊柱侧弯</span>
              <span className="item-status normal">正常</span>
            </div>
            <div className="item-bar"><div className="item-fill" style={{ width: '15%' }}></div></div>
          </div>
          <div className="result-item">
            <div className="item-header">
              <span className="item-name">骨盆倾斜</span>
              <span className="item-status normal">正常</span>
            </div>
            <div className="item-bar"><div className="item-fill" style={{ width: '25%' }}></div></div>
          </div>
        </div>
      </div>

      <div className="result-suggestion">
        <h3>改善建议</h3>
        <div className="suggestion-list">
          <div className="suggestion-item">
            <span className="suggestion-icon">1</span>
            <span>建议每天进行肩部拉伸运动，每次10-15分钟</span>
          </div>
          <div className="suggestion-item">
            <span className="suggestion-icon">2</span>
            <span>注意坐姿，避免长时间低头使用电子设备</span>
          </div>
          <div className="suggestion-item">
            <span className="suggestion-icon">3</span>
            <span>建议3个月后复查，持续关注体态变化</span>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const getStepTitle = () => {
    switch (step) {
      case 'intro': return '注意事项'
      case 'front': return '正面拍摄'
      case 'side': return '侧面拍摄'
      case 'analyzing': return '分析中'
      case 'result': return '检测结果'
    }
  }

  const canProceed = () => {
    switch (step) {
      case 'intro': return agreed
      case 'front': return !!frontImage
      case 'side': return !!sideImage
      default: return false
    }
  }

  const getButtonText = () => {
    switch (step) {
      case 'intro': return '下一步'
      case 'front': return '下一步'
      case 'side': return '开始分析'
      case 'result': return '完成'
      default: return '下一步'
    }
  }

  const handleBack = () => {
    switch (step) {
      case 'front': setStep('intro'); break
      case 'side': setStep('front'); break
      case 'result': navigate('/home'); break
      default: navigate('/home')
    }
  }

  return (
    <div className="ai-detect-container">
      {/* 顶部导航 */}
      <header className="detect-header">
        <button className="back-btn" onClick={handleBack}>
          <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1>{getStepTitle()}</h1>
        <div className="header-spacer"></div>
      </header>

      {/* 步骤指示器 */}
      {step !== 'analyzing' && step !== 'result' && (
        <div className="step-indicator">
          <div className={`step-dot ${step === 'intro' ? 'active' : 'done'}`}>
            {step !== 'intro' ? (
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
            ) : '1'}
          </div>
          <div className="step-line"></div>
          <div className={`step-dot ${step === 'front' ? 'active' : step === 'side' ? 'done' : ''}`}>
            {step === 'side' ? (
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
            ) : '2'}
          </div>
          <div className="step-line"></div>
          <div className={`step-dot ${step === 'side' ? 'active' : ''}`}>
            3
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <AnimatePresence mode="wait">
        {step === 'intro' && renderIntro()}
        {step === 'front' && renderFrontCapture()}
        {step === 'side' && renderSideCapture()}
        {step === 'analyzing' && renderAnalyzing()}
        {step === 'result' && renderResult()}
      </AnimatePresence>

      {/* 底部按钮 */}
      {step !== 'analyzing' && (
        <div className="detect-footer">
          {step !== 'intro' && step !== 'result' && (
            <button className="btn-secondary" onClick={handleBack}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              返回
            </button>
          )}
          <button 
            className={`btn-primary ${!canProceed() && step !== 'result' ? 'disabled' : ''}`}
            onClick={step === 'result' ? () => navigate('/home') : handleNext}
            disabled={!canProceed() && step !== 'result'}
          >
            {getButtonText()}
            {step !== 'result' && (
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          
          {/* 免责协议勾选 - 仅在介绍页显示 */}
          {step === 'intro' && (
            <motion.div 
              className={`agreement-row ${agreed ? 'checked' : ''}`}
              onClick={() => setAgreed(!agreed)}
              whileTap={{ scale: 0.98 }}
            >
              <span className="check-circle">
                {agreed && <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>}
              </span>
              <span>已阅读并同意遵守</span>
              <span className="agreement-link" onClick={e => { e.stopPropagation(); setShowDisclaimer(true); }}>《免责协议》</span>
            </motion.div>
          )}
        </div>
      )}

      {/* 免责协议弹窗 */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div 
            className="disclaimer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDisclaimer(false)}
          >
            <motion.div 
              className="disclaimer-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <h3>免责协议</h3>
              <div className="disclaimer-content">
                <p>本产品计算机视觉算法对实时图像源执行图像处理，以检测特定人体姿势。易受不同品牌手机、镜头及拍摄位置影响。检测结果仅供参考，检测结果不能作为医疗诊治凭据。</p>
              </div>
              <button className="disclaimer-btn" onClick={() => setShowDisclaimer(false)}>确认</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
