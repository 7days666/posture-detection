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

  // 人体正面轮廓 SVG - 专业医学风格
  const FrontBodySvg = () => (
    <svg viewBox="0 0 100 200" fill="none" className="body-svg">
      <g stroke="#4ecdc4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Head & Neck */}
        <path d="M 42.4 2.9 L 40 11.8 L 42 19.6 L 46.1 23.3 L 49.8 25.3 L 54.7 22.4 L 57.6 19.2 L 59.2 10.2 L 57.1 2.4 L 49.8 0 Z" />
        <path d="M 55.5 23.7 L 50.6 33.5 L 50.6 39.2 L 61.6 40 L 70.6 44.9 L 69.4 36.7 L 63.3 35.1 L 58.4 30.6 Z" />
        <path d="M 29 44.9 L 30.2 37.1 L 36.3 35.1 L 41.2 30.2 L 44.5 24.5 L 49 33.9 L 48.6 39.2 L 38 39.6 Z" />
        {/* Chest & Shoulders */}
        <path d="M 51.8 41.6 L 51 55.1 L 58 58 L 67.8 55.5 L 70.6 47.3 L 62 41.6 Z" />
        <path d="M 29.8 46.5 L 31.4 55.5 L 40.8 58 L 48.2 55.1 L 47.8 42 L 37.6 42 Z" />
        <path d="M 78.4 53.1 L 79.6 47.8 L 79.2 41.2 L 75.9 38 L 71 36.3 L 72.2 42.9 L 71.4 47.3 Z" />
        <path d="M 28.2 47.3 L 21.2 53.1 L 20 47.8 L 20.4 40.8 L 24.5 37.1 L 28.6 37.1 L 26.9 43.3 Z" />
        {/* Arms */}
        <path d="M 16.7 68.2 L 18 71.4 L 22.9 66.1 L 29 53.9 L 27.8 49.4 L 20.4 55.9 Z" />
        <path d="M 71.4 49.4 L 70.2 54.7 L 76.3 66.1 L 81.6 71.8 L 82.9 69 L 78.8 55.5 Z" />
        <path d="M 6.1 88.6 L 10.2 75.1 L 14.7 70.2 L 16.3 74.3 L 19.2 73.5 L 4.5 97.6 L 0 100 Z" />
        <path d="M 84.5 69.8 L 83.3 73.5 L 80 73.1 L 95.1 98.4 L 100 100.4 L 93.5 89.4 L 89.8 76.3 Z" />
        {/* Torso */}
        <path d="M 56.3 59.2 L 58 64.1 L 58.4 78 L 58.4 92.7 L 56.3 98.4 L 55.1 104.1 L 51.4 107.8 L 51 84.5 L 50.6 67.3 L 51 57.1 Z" />
        <path d="M 43.7 58.8 L 48.6 57.1 L 49 67.3 L 48.6 84.5 L 48.2 107.3 L 44.5 103.7 L 40.8 91.4 L 40.8 78.4 L 41.2 64.5 Z" />
        <path d="M 68.6 63.3 L 67.3 57.1 L 58.8 59.6 L 60 64.1 L 60.4 83.3 L 65.7 78.8 L 66.5 69.8 Z" />
        <path d="M 33.9 78.4 L 33.1 71.8 L 31 63.3 L 32.2 57.1 L 40.8 59.2 L 39.2 63.3 L 39.2 83.7 Z" />
        {/* Legs */}
        <path d="M 34.7 98.8 L 37.1 108.2 L 37.1 127.8 L 34.3 137.1 L 31 132.7 L 29.4 120 L 28.2 111.4 L 29.4 100.8 L 32.2 94.7 Z" />
        <path d="M 63.3 105.7 L 64.5 100 L 66.9 94.7 L 70.2 101.2 L 71 111.8 L 68.2 133.1 L 65.3 137.6 L 62.4 128.6 L 62 111.4 Z" />
        <path d="M 33.9 140 L 34.7 143.3 L 35.5 147.3 L 36.3 151 L 35.1 156.7 L 29.8 156.7 L 27.3 152.7 L 27.3 147.3 L 30.2 144.1 Z" />
        <path d="M 65.7 140 L 72.2 147.8 L 72.2 152.2 L 69.8 157.1 L 64.9 156.7 L 62.9 151 Z" />
        <path d="M 71.4 160.4 L 73.5 153.5 L 76.7 161.2 L 79.6 167.8 L 78.4 187.8 L 79.6 195.5 L 74.7 195.5 Z" />
        <path d="M 24.9 194.7 L 27.8 164.9 L 28.2 160.4 L 26.1 154.3 L 24.9 157.6 L 22.4 161.6 L 20.8 167.8 L 22 188.2 L 20.8 195.5 Z" />
      </g>
    </svg>
  )

  // 人体侧面轮廓 SVG - 专业医学风格
  const SideBodySvg = () => (
    <svg viewBox="0 0 100 200" fill="none" className="body-svg">
      <path d="M 46 2.5 C 50 2.5 53 5 53 10 C 53 15 50 18 46 18 C 44 18 43 17 43 17 L 43 22 C 43 22 48 22 50 25 C 53 30 54 40 52 50 C 51 55 50 60 50 65 L 50 90 C 50 90 53 95 56 100 C 58 105 58 115 56 120 L 53 160 L 56 190 L 63 200 L 43 200 L 46 190 L 43 160 C 43 160 40 120 43 100 C 44 95 44 90 44 90 L 44 65 C 44 60 38 55 38 40 C 38 30 40 25 43 22 L 43 17 C 43 17 42 18 40 18 C 36 18 33 15 33 10 C 33 5 36 2.5 40 2.5 Z" stroke="#4ecdc4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  // 人体背面轮廓 SVG - 专业医学风格
  const BackBodySvg = () => (
    <svg viewBox="0 0 100 200" fill="none" className="body-svg">
      <g stroke="#4ecdc4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Head & Neck */}
        <path d="M 50.6 0 L 46 0.9 L 40.9 5.5 L 40.4 12.8 L 45.1 20 L 55.7 20 L 59.1 13.6 L 59.6 4.7 L 55.7 1.3 Z" />
        {/* Back & Shoulders */}
        <path d="M 44.7 21.7 L 47.7 21.7 L 47.2 38.3 L 47.7 64.7 L 38.3 53.2 L 35.3 40.9 L 31.1 36.6 L 39.1 33.2 L 43.8 27.2 Z" />
        <path d="M 52.3 21.7 L 55.7 21.7 L 56.6 27.2 L 60.9 32.8 L 68.9 36.6 L 64.7 40.4 L 61.7 53.2 L 52.3 64.7 L 53.2 38.3 Z" />
        <path d="M 31.1 38.7 L 28.1 48.9 L 28.5 55.3 L 34 75.3 L 47.2 71.1 L 47.2 66.4 L 36.6 54 L 33.6 41.3 Z" />
        <path d="M 68.9 38.7 L 71.9 49.4 L 71.5 56.2 L 66 75.3 L 52.8 71.1 L 52.8 66.4 L 63.4 54.5 L 66.4 41.7 Z" />
        <path d="M 29.4 37 L 23 39.1 L 17.4 44.3 L 18.3 53.6 L 24.3 49.4 L 27.2 46.4 Z" />
        <path d="M 71.1 37 L 78.3 39.6 L 82.6 44.7 L 81.7 53.6 L 74.9 48.9 L 72.3 45.1 Z" />
        {/* Glutes & Legs */}
        <path d="M 44.7 99.6 L 30.2 108.5 L 29.8 118.7 L 31.5 126 L 47.2 121.3 L 49.4 114.9 Z" />
        <path d="M 55.3 99.1 L 51.1 114.5 L 52.3 120.9 L 68.1 126 L 69.8 119.1 L 69.4 108.5 Z" />
        <path d="M 28.9 122.1 L 31.1 129.4 L 36.6 126 L 35.3 135.3 L 34.5 150.2 L 29.4 158.3 L 28.9 146.8 L 27.7 141.3 L 27.2 131.5 Z" />
        <path d="M 71.5 121.7 L 69.4 128.9 L 63.8 126 L 65.5 136.6 L 66.4 150.2 L 71.1 158.3 L 71.5 147.7 L 72.8 142.1 L 73.6 131.9 Z" />
        <path d="M 29.4 160.4 L 28.5 167.2 L 24.7 179.6 L 23.8 192.8 L 25.5 197 L 28.5 193.2 L 29.8 180 L 31.9 171.1 L 31.9 166.8 Z" />
        <path d="M 70.6 160.4 L 72.3 168.5 L 75.7 179.1 L 76.6 192.8 L 74.5 196.6 L 72.3 193.6 L 70.6 179.6 L 68.1 168.1 Z" />
      </g>
    </svg>
  )

  // 介绍页面
  const renderIntro = () => (
    <motion.div 
      className="detect-content intro-page" 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* 正面检测 */}
      <div className="pose-card">
        <div className="pose-figure">
          <FrontBodySvg />
        </div>
        <div className="pose-info">
          <h4 className="pose-title">正面检测</h4>
          <p className="pose-desc">双脚合拢自然站立，光脚站立镜头对准胸部下部的位置，水平拍摄全身</p>
          <p className="pose-tip">提示:不可俯身拍摄或者仰视拍摄，脚跟应水平位置</p>
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
          <p className="pose-tip">提示:双脚合拢拍摄，两脚跟应水平位置</p>
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
          <p className="pose-tip">提示:不可俯身拍摄或者仰视拍摄，脚跟应水平位置</p>
        </div>
      </div>
    </motion.div>
  )

  // 正面拍摄页面
  const renderFrontCapture = () => (
    <motion.div 
      className="detect-content capture-content" 
      initial={{ opacity: 0, x: 50 }} 
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
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
              <svg viewBox="0 0 100 200" fill="none">
                <g stroke="#4ecdc4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2">
                  <path d="M 42.4 2.9 L 40 11.8 L 42 19.6 L 46.1 23.3 L 49.8 25.3 L 54.7 22.4 L 57.6 19.2 L 59.2 10.2 L 57.1 2.4 L 49.8 0 Z" />
                  <path d="M 55.5 23.7 L 50.6 33.5 L 50.6 39.2 L 61.6 40 L 70.6 44.9 L 69.4 36.7 L 63.3 35.1 L 58.4 30.6 Z" />
                  <path d="M 29 44.9 L 30.2 37.1 L 36.3 35.1 L 41.2 30.2 L 44.5 24.5 L 49 33.9 L 48.6 39.2 L 38 39.6 Z" />
                  <path d="M 51.8 41.6 L 51 55.1 L 58 58 L 67.8 55.5 L 70.6 47.3 L 62 41.6 Z" />
                  <path d="M 29.8 46.5 L 31.4 55.5 L 40.8 58 L 48.2 55.1 L 47.8 42 L 37.6 42 Z" />
                  <path d="M 78.4 53.1 L 79.6 47.8 L 79.2 41.2 L 75.9 38 L 71 36.3 L 72.2 42.9 L 71.4 47.3 Z" />
                  <path d="M 28.2 47.3 L 21.2 53.1 L 20 47.8 L 20.4 40.8 L 24.5 37.1 L 28.6 37.1 L 26.9 43.3 Z" />
                  <path d="M 16.7 68.2 L 18 71.4 L 22.9 66.1 L 29 53.9 L 27.8 49.4 L 20.4 55.9 Z" />
                  <path d="M 71.4 49.4 L 70.2 54.7 L 76.3 66.1 L 81.6 71.8 L 82.9 69 L 78.8 55.5 Z" />
                  <path d="M 6.1 88.6 L 10.2 75.1 L 14.7 70.2 L 16.3 74.3 L 19.2 73.5 L 4.5 97.6 L 0 100 Z" />
                  <path d="M 84.5 69.8 L 83.3 73.5 L 80 73.1 L 95.1 98.4 L 100 100.4 L 93.5 89.4 L 89.8 76.3 Z" />
                  <path d="M 56.3 59.2 L 58 64.1 L 58.4 78 L 58.4 92.7 L 56.3 98.4 L 55.1 104.1 L 51.4 107.8 L 51 84.5 L 50.6 67.3 L 51 57.1 Z" />
                  <path d="M 43.7 58.8 L 48.6 57.1 L 49 67.3 L 48.6 84.5 L 48.2 107.3 L 44.5 103.7 L 40.8 91.4 L 40.8 78.4 L 41.2 64.5 Z" />
                  <path d="M 68.6 63.3 L 67.3 57.1 L 58.8 59.6 L 60 64.1 L 60.4 83.3 L 65.7 78.8 L 66.5 69.8 Z" />
                  <path d="M 33.9 78.4 L 33.1 71.8 L 31 63.3 L 32.2 57.1 L 40.8 59.2 L 39.2 63.3 L 39.2 83.7 Z" />
                  <path d="M 34.7 98.8 L 37.1 108.2 L 37.1 127.8 L 34.3 137.1 L 31 132.7 L 29.4 120 L 28.2 111.4 L 29.4 100.8 L 32.2 94.7 Z" />
                  <path d="M 63.3 105.7 L 64.5 100 L 66.9 94.7 L 70.2 101.2 L 71 111.8 L 68.2 133.1 L 65.3 137.6 L 62.4 128.6 L 62 111.4 Z" />
                  <path d="M 33.9 140 L 34.7 143.3 L 35.5 147.3 L 36.3 151 L 35.1 156.7 L 29.8 156.7 L 27.3 152.7 L 27.3 147.3 L 30.2 144.1 Z" />
                  <path d="M 65.7 140 L 72.2 147.8 L 72.2 152.2 L 69.8 157.1 L 64.9 156.7 L 62.9 151 Z" />
                  <path d="M 71.4 160.4 L 73.5 153.5 L 76.7 161.2 L 79.6 167.8 L 78.4 187.8 L 79.6 195.5 L 74.7 195.5 Z" />
                  <path d="M 24.9 194.7 L 27.8 164.9 L 28.2 160.4 L 26.1 154.3 L 24.9 157.6 L 22.4 161.6 L 20.8 167.8 L 22 188.2 L 20.8 195.5 Z" />
                </g>
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
    <motion.div 
      className="detect-content capture-content" 
      initial={{ opacity: 0, x: 50 }} 
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
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
              <svg viewBox="0 0 100 200" fill="none">
                <path d="M 46 2.5 C 50 2.5 53 5 53 10 C 53 15 50 18 46 18 C 44 18 43 17 43 17 L 43 22 C 43 22 48 22 50 25 C 53 30 54 40 52 50 C 51 55 50 60 50 65 L 50 90 C 50 90 53 95 56 100 C 58 105 58 115 56 120 L 53 160 L 56 190 L 63 200 L 43 200 L 46 190 L 43 160 C 43 160 40 120 43 100 C 44 95 44 90 44 90 L 44 65 C 44 60 38 55 38 40 C 38 30 40 25 43 22 L 43 17 C 43 17 42 18 40 18 C 36 18 33 15 33 10 C 33 5 36 2.5 40 2.5 Z" stroke="#4ecdc4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2"/>
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
    <motion.div 
      className="detect-content analyzing-content" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="analyzing-animation">
        <div className="scan-container">
          <div className="body-silhouette">
            <svg viewBox="0 0 100 200" fill="none">
              <g stroke="#4ecdc4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 42.4 2.9 L 40 11.8 L 42 19.6 L 46.1 23.3 L 49.8 25.3 L 54.7 22.4 L 57.6 19.2 L 59.2 10.2 L 57.1 2.4 L 49.8 0 Z" />
                <path d="M 55.5 23.7 L 50.6 33.5 L 50.6 39.2 L 61.6 40 L 70.6 44.9 L 69.4 36.7 L 63.3 35.1 L 58.4 30.6 Z" />
                <path d="M 29 44.9 L 30.2 37.1 L 36.3 35.1 L 41.2 30.2 L 44.5 24.5 L 49 33.9 L 48.6 39.2 L 38 39.6 Z" />
                <path d="M 51.8 41.6 L 51 55.1 L 58 58 L 67.8 55.5 L 70.6 47.3 L 62 41.6 Z" />
                <path d="M 29.8 46.5 L 31.4 55.5 L 40.8 58 L 48.2 55.1 L 47.8 42 L 37.6 42 Z" />
                <path d="M 78.4 53.1 L 79.6 47.8 L 79.2 41.2 L 75.9 38 L 71 36.3 L 72.2 42.9 L 71.4 47.3 Z" />
                <path d="M 28.2 47.3 L 21.2 53.1 L 20 47.8 L 20.4 40.8 L 24.5 37.1 L 28.6 37.1 L 26.9 43.3 Z" />
                <path d="M 16.7 68.2 L 18 71.4 L 22.9 66.1 L 29 53.9 L 27.8 49.4 L 20.4 55.9 Z" />
                <path d="M 71.4 49.4 L 70.2 54.7 L 76.3 66.1 L 81.6 71.8 L 82.9 69 L 78.8 55.5 Z" />
                <path d="M 6.1 88.6 L 10.2 75.1 L 14.7 70.2 L 16.3 74.3 L 19.2 73.5 L 4.5 97.6 L 0 100 Z" />
                <path d="M 84.5 69.8 L 83.3 73.5 L 80 73.1 L 95.1 98.4 L 100 100.4 L 93.5 89.4 L 89.8 76.3 Z" />
                <path d="M 56.3 59.2 L 58 64.1 L 58.4 78 L 58.4 92.7 L 56.3 98.4 L 55.1 104.1 L 51.4 107.8 L 51 84.5 L 50.6 67.3 L 51 57.1 Z" />
                <path d="M 43.7 58.8 L 48.6 57.1 L 49 67.3 L 48.6 84.5 L 48.2 107.3 L 44.5 103.7 L 40.8 91.4 L 40.8 78.4 L 41.2 64.5 Z" />
                <path d="M 68.6 63.3 L 67.3 57.1 L 58.8 59.6 L 60 64.1 L 60.4 83.3 L 65.7 78.8 L 66.5 69.8 Z" />
                <path d="M 33.9 78.4 L 33.1 71.8 L 31 63.3 L 32.2 57.1 L 40.8 59.2 L 39.2 63.3 L 39.2 83.7 Z" />
                <path d="M 34.7 98.8 L 37.1 108.2 L 37.1 127.8 L 34.3 137.1 L 31 132.7 L 29.4 120 L 28.2 111.4 L 29.4 100.8 L 32.2 94.7 Z" />
                <path d="M 63.3 105.7 L 64.5 100 L 66.9 94.7 L 70.2 101.2 L 71 111.8 L 68.2 133.1 L 65.3 137.6 L 62.4 128.6 L 62 111.4 Z" />
                <path d="M 33.9 140 L 34.7 143.3 L 35.5 147.3 L 36.3 151 L 35.1 156.7 L 29.8 156.7 L 27.3 152.7 L 27.3 147.3 L 30.2 144.1 Z" />
                <path d="M 65.7 140 L 72.2 147.8 L 72.2 152.2 L 69.8 157.1 L 64.9 156.7 L 62.9 151 Z" />
                <path d="M 71.4 160.4 L 73.5 153.5 L 76.7 161.2 L 79.6 167.8 L 78.4 187.8 L 79.6 195.5 L 74.7 195.5 Z" />
                <path d="M 24.9 194.7 L 27.8 164.9 L 28.2 160.4 L 26.1 154.3 L 24.9 157.6 L 22.4 161.6 L 20.8 167.8 L 22 188.2 L 20.8 195.5 Z" />
              </g>
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
    <motion.div 
      className="detect-content result-content" 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
    >
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
            <div className="item-bar"><motion.div className="item-fill" initial={{ width: 0 }} animate={{ width: '20%' }} transition={{ duration: 1, delay: 0.5 }}></motion.div></div>
          </div>
          <div className="result-item">
            <div className="item-header">
              <span className="item-name">高低肩</span>
              <span className="item-status warning">轻微</span>
            </div>
            <div className="item-bar"><motion.div className="item-fill warning" initial={{ width: 0 }} animate={{ width: '40%' }} transition={{ duration: 1, delay: 0.6 }}></motion.div></div>
          </div>
          <div className="result-item">
            <div className="item-header">
              <span className="item-name">脊柱侧弯</span>
              <span className="item-status normal">正常</span>
            </div>
            <div className="item-bar"><motion.div className="item-fill" initial={{ width: 0 }} animate={{ width: '15%' }} transition={{ duration: 1, delay: 0.7 }}></motion.div></div>
          </div>
          <div className="result-item">
            <div className="item-header">
              <span className="item-name">骨盆倾斜</span>
              <span className="item-status normal">正常</span>
            </div>
            <div className="item-bar"><motion.div className="item-fill" initial={{ width: 0 }} animate={{ width: '25%' }} transition={{ duration: 1, delay: 0.8 }}></motion.div></div>
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
          <div className={`step-line ${step !== 'intro' ? 'active' : ''}`}></div>
          <div className={`step-dot ${step === 'front' ? 'active' : step === 'side' ? 'done' : ''}`}>
            {step === 'side' ? (
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
            ) : '2'}
          </div>
          <div className={`step-line ${step === 'side' ? 'active' : ''}`}></div>
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
