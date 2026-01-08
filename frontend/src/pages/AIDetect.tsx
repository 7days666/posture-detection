import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  initPoseDetector, 
  detectPoseFromImage, 
  analyzeFrontPose, 
  analyzeSidePose, 
  combineAnalysis,
  PostureAnalysis 
} from '../utils/poseDetection'
import './AIDetect.css'

type Step = 'intro' | 'front' | 'side' | 'analyzing' | 'result'

export default function AIDetect() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('intro')
  const [agreed, setAgreed] = useState(false)
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [sideImage, setSideImage] = useState<string | null>(null)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<PostureAnalysis | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [modelLoading, setModelLoading] = useState(false)
  const frontImageRef = useRef<HTMLImageElement>(null)
  const sideImageRef = useRef<HTMLImageElement>(null)

  // 预加载模型
  useEffect(() => {
    const preloadModel = async () => {
      try {
        setModelLoading(true)
        await initPoseDetector()
        setModelLoading(false)
      } catch (error) {
        console.error('模型加载失败:', error)
        setModelLoading(false)
      }
    }
    preloadModel()
  }, [])

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

  const startAnalysis = async () => {
    setStep('analyzing')
    setAnalysisProgress(0)
    
    try {
      // 进度动画
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 2, 90))
      }, 100)

      // 创建图片元素进行分析
      const frontImg = new Image()
      frontImg.crossOrigin = 'anonymous'
      frontImg.src = frontImage!
      await new Promise(resolve => frontImg.onload = resolve)

      const sideImg = new Image()
      sideImg.crossOrigin = 'anonymous'
      sideImg.src = sideImage!
      await new Promise(resolve => sideImg.onload = resolve)

      // 检测正面姿态
      setAnalysisProgress(30)
      const frontPose = await detectPoseFromImage(frontImg)
      
      // 检测侧面姿态
      setAnalysisProgress(60)
      const sidePose = await detectPoseFromImage(sideImg)

      clearInterval(progressInterval)
      setAnalysisProgress(100)

      // 分析结果
      if (frontPose && sidePose) {
        const frontAnalysis = analyzeFrontPose(frontPose)
        const sideAnalysis = analyzeSidePose(sidePose)
        const combined = combineAnalysis(frontAnalysis, sideAnalysis)
        setAnalysisResult(combined)
      } else if (frontPose) {
        const frontAnalysis = analyzeFrontPose(frontPose)
        setAnalysisResult(frontAnalysis)
      } else {
        // 无法检测到姿态，使用默认结果
        setAnalysisResult({
          score: 75,
          status: 'warning',
          items: [
            { name: '姿态检测', status: 'warning', value: 50, description: '图片质量可能影响检测精度' }
          ],
          suggestions: [
            '建议在光线充足的环境下重新拍摄',
            '确保全身在画面中清晰可见',
            '穿着贴身衣物可提高检测准确度'
          ]
        })
      }

      setTimeout(() => setStep('result'), 500)
    } catch (error) {
      console.error('分析失败:', error)
      setAnalysisResult({
        score: 70,
        status: 'warning',
        items: [
          { name: '检测状态', status: 'warning', value: 50, description: '检测过程中出现问题' }
        ],
        suggestions: [
          '请确保图片清晰完整',
          '建议重新拍摄后再次检测',
          '如问题持续，请联系客服'
        ]
      })
      setTimeout(() => setStep('result'), 500)
    }
  }

  // 人体正面轮廓 SVG
  const FrontBodySvg = () => (
    <svg viewBox="0 0 60 120" fill="none" className="body-svg">
      <ellipse cx="30" cy="12" rx="8" ry="10" stroke="#4ecdc4" strokeWidth="1.2"/>
      <line x1="30" y1="22" x2="30" y2="55" stroke="#4ecdc4" strokeWidth="1.2"/>
      <line x1="30" y1="28" x2="12" y2="45" stroke="#4ecdc4" strokeWidth="1.2"/>
      <line x1="30" y1="28" x2="48" y2="45" stroke="#4ecdc4" strokeWidth="1.2"/>
      <line x1="30" y1="55" x2="18" y2="95" stroke="#4ecdc4" strokeWidth="1.2"/>
      <line x1="30" y1="55" x2="42" y2="95" stroke="#4ecdc4" strokeWidth="1.2"/>
      <line x1="18" y1="95" x2="15" y2="115" stroke="#4ecdc4" strokeWidth="1.2"/>
      <line x1="42" y1="95" x2="45" y2="115" stroke="#4ecdc4" strokeWidth="1.2"/>
    </svg>
  )

  // 人体侧面轮廓 SVG
  const SideBodySvg = () => (
    <svg viewBox="0 0 50 120" fill="none" className="body-svg">
      <ellipse cx="28" cy="12" rx="7" ry="10" stroke="#4ecdc4" strokeWidth="1.2"/>
      <path d="M28 22 Q32 35 30 55" stroke="#4ecdc4" strokeWidth="1.2" fill="none"/>
      <line x1="28" y1="28" x2="18" y2="42" stroke="#4ecdc4" strokeWidth="1.2"/>
      <line x1="30" y1="55" x2="25" y2="95" stroke="#4ecdc4" strokeWidth="1.2"/>
      <line x1="30" y1="55" x2="35" y2="95" stroke="#4ecdc4" strokeWidth="1.2"/>
      <line x1="25" y1="95" x2="22" y2="115" stroke="#4ecdc4" strokeWidth="1.2"/>
      <line x1="35" y1="95" x2="38" y2="115" stroke="#4ecdc4" strokeWidth="1.2"/>
    </svg>
  )

  // 人体背面轮廓 SVG
  const BackBodySvg = () => (
    <svg viewBox="0 0 60 120" fill="none" className="body-svg">
      <ellipse cx="30" cy="12" rx="8" ry="10" stroke="#4ecdc4" strokeWidth="1.2"/>
      <line x1="30" y1="22" x2="30" y2="55" stroke="#4ecdc4" strokeWidth="1.2"/>
      <line x1="30" y1="28" x2="12" y2="45" stroke="#4ecdc4" strokeWidth="1.2"/>
      <line x1="30" y1="28" x2="48" y2="45" stroke="#4ecdc4" strokeWidth="1.2"/>
      <path d="M25 35 L30 50 L35 35" stroke="#4ecdc4" strokeWidth="0.8" fill="none"/>
      <line x1="30" y1="55" x2="18" y2="95" stroke="#4ecdc4" strokeWidth="1.2"/>
      <line x1="30" y1="55" x2="42" y2="95" stroke="#4ecdc4" strokeWidth="1.2"/>
      <line x1="18" y1="95" x2="15" y2="115" stroke="#4ecdc4" strokeWidth="1.2"/>
      <line x1="42" y1="95" x2="45" y2="115" stroke="#4ecdc4" strokeWidth="1.2"/>
    </svg>
  )

  // 介绍页面
  const renderIntro = () => (
    <motion.div className="detect-content intro-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="pose-card">
        <div className="pose-figure"><FrontBodySvg /></div>
        <div className="pose-info">
          <h4 className="pose-title">正面检测</h4>
          <p className="pose-desc">双脚合拢自然站立，光脚站立镜头对准胸部下部的位置，水平拍摄全身</p>
          <p className="pose-tip">提示:不可俯身拍摄或者仰视拍摄，脚跟应水平位置</p>
        </div>
      </div>
      <div className="pose-card">
        <div className="pose-figure"><SideBodySvg /></div>
        <div className="pose-info">
          <h4 className="pose-title">侧面检测</h4>
          <p className="pose-desc">镜头对准腰部位置，水平进行拍摄或者对准骨盆的位置</p>
          <p className="pose-tip">提示:双脚合拢拍摄，两脚跟应水平位置</p>
        </div>
      </div>
      <div className="pose-card">
        <div className="pose-figure"><BackBodySvg /></div>
        <div className="pose-info">
          <h4 className="pose-title">背面检测</h4>
          <p className="pose-desc">镜头对准腰底的位置进行拍摄或者水平对准骨盆的位置</p>
          <p className="pose-tip">提示:不可俯身拍摄或者仰视拍摄，脚跟应水平位置</p>
        </div>
      </div>
      {modelLoading && (
        <div className="model-loading">
          <div className="loading-spinner-small"></div>
          <span>AI模型加载中...</span>
        </div>
      )}
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
            <img src={frontImage} alt="正面照片" ref={frontImageRef} />
            <button className="retake-btn" onClick={() => setFrontImage(null)}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              重拍
            </button>
          </div>
        ) : (
          <div className="capture-placeholder" onClick={() => handleImageUpload('front')}>
            <div className="body-outline"><FrontBodySvg /></div>
            <div className="capture-hint">
              <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="#4ecdc4" strokeWidth="2"/><circle cx="12" cy="13" r="4" stroke="#4ecdc4" strokeWidth="2"/></svg>
              <span>点击拍摄或上传</span>
            </div>
          </div>
        )}
      </div>
      <div className="capture-tips">
        <div className="tip-item"><span className="tip-dot"></span>双脚合拢自然站立</div>
        <div className="tip-item"><span className="tip-dot"></span>光脚站立，水平拍摄全身</div>
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
            <img src={sideImage} alt="侧面照片" ref={sideImageRef} />
            <button className="retake-btn" onClick={() => setSideImage(null)}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              重拍
            </button>
          </div>
        ) : (
          <div className="capture-placeholder" onClick={() => handleImageUpload('side')}>
            <div className="body-outline"><SideBodySvg /></div>
            <div className="capture-hint">
              <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="#4ecdc4" strokeWidth="2"/><circle cx="12" cy="13" r="4" stroke="#4ecdc4" strokeWidth="2"/></svg>
              <span>点击拍摄或上传</span>
            </div>
          </div>
        )}
      </div>
      <div className="capture-tips">
        <div className="tip-item"><span className="tip-dot"></span>双脚合拢，侧身站立</div>
        <div className="tip-item"><span className="tip-dot"></span>镜头对准腰部位置水平拍摄</div>
      </div>
    </motion.div>
  )

  // 分析中页面
  const renderAnalyzing = () => (
    <motion.div className="detect-content analyzing-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="analyzing-animation">
        <div className="scan-container">
          <div className="body-silhouette"><FrontBodySvg /></div>
          <motion.div className="scan-line" animate={{ y: [0, 100, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
        </div>
        <div className="analyzing-text">
          <div className="progress-bar">
            <motion.div className="progress-fill" style={{ width: `${analysisProgress}%` }} />
          </div>
          <p className="analyzing-hint">AI 正在分析您的体态数据 ({analysisProgress}%)</p>
        </div>
      </div>
    </motion.div>
  )

  // 结果页面
  const renderResult = () => {
    const result = analysisResult || { score: 0, status: 'warning' as const, items: [], suggestions: [] }
    return (
      <motion.div className="detect-content result-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="result-header">
          <motion.div className="score-circle" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
            style={{ background: result.status === 'good' ? 'linear-gradient(135deg, #68d391 0%, #48bb78 100%)' : result.status === 'warning' ? 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)' : 'linear-gradient(135deg, #fc8181 0%, #f56565 100%)' }}>
            <span className="score-value">{result.score}</span>
            <span className="score-label">体态评分</span>
          </motion.div>
          <div className={`result-status ${result.status}`}>
            {result.status === 'good' ? (
              <><svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg><span>体态状况良好</span></>
            ) : result.status === 'warning' ? (
              <><svg viewBox="0 0 24 24" fill="none" width="18" height="18"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg><span>体态需要关注</span></>
            ) : (
              <><svg viewBox="0 0 24 24" fill="none" width="18" height="18"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg><span>建议就医检查</span></>
            )}
          </div>
        </div>

        {result.items.length > 0 && (
          <div className="result-details">
            <h3>检测结果</h3>
            <div className="result-items">
              {result.items.map((item, index) => (
                <div className="result-item" key={index}>
                  <div className="item-header">
                    <span className="item-name">{item.name}</span>
                    <span className={`item-status ${item.status}`}>
                      {item.status === 'normal' ? '正常' : item.status === 'warning' ? '轻微' : '异常'}
                    </span>
                  </div>
                  <div className="item-bar">
                    <motion.div className={`item-fill ${item.status}`} initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }} />
                  </div>
                  <p className="item-desc">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="result-suggestion">
          <h3>改善建议</h3>
          <div className="suggestion-list">
            {result.suggestions.map((suggestion, index) => (
              <div className="suggestion-item" key={index}>
                <span className="suggestion-icon">{index + 1}</span>
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

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
      case 'intro': return agreed && !modelLoading
      case 'front': return !!frontImage
      case 'side': return !!sideImage
      default: return false
    }
  }

  const getButtonText = () => {
    if (step === 'intro' && modelLoading) return 'AI模型加载中...'
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
      <header className="detect-header">
        <button className="back-btn" onClick={handleBack}>
          <svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <h1>{getStepTitle()}</h1>
        <div className="header-spacer"></div>
      </header>

      {step !== 'analyzing' && step !== 'result' && (
        <div className="step-indicator">
          <div className={`step-dot ${step === 'intro' ? 'active' : 'done'}`}>{step !== 'intro' ? <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> : '1'}</div>
          <div className={`step-line ${step !== 'intro' ? 'active' : ''}`}></div>
          <div className={`step-dot ${step === 'front' ? 'active' : step === 'side' ? 'done' : ''}`}>{step === 'side' ? <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> : '2'}</div>
          <div className={`step-line ${step === 'side' ? 'active' : ''}`}></div>
          <div className={`step-dot ${step === 'side' ? 'active' : ''}`}>3</div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'intro' && renderIntro()}
        {step === 'front' && renderFrontCapture()}
        {step === 'side' && renderSideCapture()}
        {step === 'analyzing' && renderAnalyzing()}
        {step === 'result' && renderResult()}
      </AnimatePresence>

      {step !== 'analyzing' && (
        <div className="detect-footer">
          {step !== 'intro' && step !== 'result' && (
            <button className="btn-secondary" onClick={handleBack}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              返回
            </button>
          )}
          <button className={`btn-primary ${!canProceed() && step !== 'result' ? 'disabled' : ''}`} onClick={step === 'result' ? () => navigate('/home') : handleNext} disabled={!canProceed() && step !== 'result'}>
            {getButtonText()}
            {step !== 'result' && !modelLoading && <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </button>
          {step === 'intro' && (
            <motion.div className={`agreement-row ${agreed ? 'checked' : ''}`} onClick={() => setAgreed(!agreed)} whileTap={{ scale: 0.98 }}>
              <span className="check-circle">{agreed && <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>}</span>
              <span>已阅读并同意遵守</span>
              <span className="agreement-link" onClick={e => { e.stopPropagation(); setShowDisclaimer(true); }}>《免责协议》</span>
            </motion.div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showDisclaimer && (
          <motion.div className="disclaimer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDisclaimer(false)}>
            <motion.div className="disclaimer-modal" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()}>
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
