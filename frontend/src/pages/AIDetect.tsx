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
import { generateAISuggestion } from '../api/aiSuggestion'
import { assessmentAPI } from '../api/healthApi'
import './AIDetect.css'

type Step = 'intro' | 'front' | 'side' | 'back' | 'analyzing' | 'result'

export default function AIDetect() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('intro')
  const [agreed, setAgreed] = useState(false)
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [sideImage, setSideImage] = useState<string | null>(null)
  const [backImage, setBackImage] = useState<string | null>(null)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<PostureAnalysis | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [modelLoading, setModelLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<string>('')
  const [aiSuggestionLoading, setAiSuggestionLoading] = useState(false)
  const frontImageRef = useRef<HTMLImageElement>(null)
  const sideImageRef = useRef<HTMLImageElement>(null)
  const backImageRef = useRef<HTMLImageElement>(null)

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

  const handleImageUpload = (type: 'front' | 'side' | 'back') => {
    const input = document.createElement('input')
    input.type = 'file'
    // 明确指定接受的图片格式，避免某些浏览器默认只打开相机
    input.accept = 'image/jpeg,image/png,image/gif,image/webp,image/*'
    // 确保不设置 capture 属性，这样用户可以选择拍照或从相册上传
    input.removeAttribute('capture')
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          if (type === 'front') {
            setFrontImage(result)
          } else if (type === 'side') {
            setSideImage(result)
          } else {
            setBackImage(result)
          }
        }
        reader.readAsDataURL(file)
      }
    }
    // 添加到 DOM 中再触发点击（某些浏览器需要）
    input.style.display = 'none'
    document.body.appendChild(input)
    input.click()
    // 清理
    setTimeout(() => {
      document.body.removeChild(input)
    }, 1000)
  }

  const handleNext = () => {
    if (step === 'intro' && agreed) {
      setStep('front')
    } else if (step === 'front' && frontImage) {
      setStep('side')
    } else if (step === 'side' && sideImage) {
      setStep('back')
    } else if (step === 'back' && backImage) {
      startAnalysis()
    }
  }

  const startAnalysis = async () => {
    setStep('analyzing')
    setAnalysisProgress(0)
    
    try {
      // 进度动画
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 1, 85))
      }, 150)

      // 创建图片元素进行分析 - 使用更可靠的加载方式
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            console.log('[AIDetect] 图片加载完成:', img.naturalWidth, 'x', img.naturalHeight)
            resolve(img)
          }
          img.onerror = (e) => {
            console.error('[AIDetect] 图片加载失败:', e)
            reject(new Error('图片加载失败'))
          }
          img.src = src
        })
      }

      console.log('[AIDetect] 开始加载正面图片...')
      const frontImg = await loadImage(frontImage!)
      setAnalysisProgress(20)

      console.log('[AIDetect] 开始加载侧面图片...')
      const sideImg = await loadImage(sideImage!)
      setAnalysisProgress(25)
      
      console.log('[AIDetect] 开始加载背面图片...')
      const backImg = await loadImage(backImage!)
      setAnalysisProgress(30)

      // 检测正面姿态
      console.log('[AIDetect] 开始检测正面姿态...')
      const frontPose = await detectPoseFromImage(frontImg)
      setAnalysisProgress(55)
      
      // 检测侧面姿态
      console.log('[AIDetect] 开始检测侧面姿态...')
      const sidePose = await detectPoseFromImage(sideImg)
      setAnalysisProgress(60)
      
      // 检测背面姿态
      console.log('[AIDetect] 开始检测背面姿态...')
      const backPose = await detectPoseFromImage(backImg)
      setAnalysisProgress(80)

      clearInterval(progressInterval)
      setAnalysisProgress(100)

      console.log('[AIDetect] 正面姿态检测结果:', frontPose ? '成功' : '失败')
      console.log('[AIDetect] 侧面姿态检测结果:', sidePose ? '成功' : '失败')
      console.log('[AIDetect] 背面姿态检测结果:', backPose ? '成功' : '失败')

      // 分析结果
      let finalResult: PostureAnalysis
      if (frontPose && sidePose && backPose) {
        console.log('[AIDetect] 综合分析三张图片')
        const frontAnalysis = analyzeFrontPose(frontPose)
        const sideAnalysis = analyzeSidePose(sidePose)
        const backAnalysis = analyzeFrontPose(backPose) // 背面使用和正面类似的分析
        // 先合并正面和侧面
        let combined = combineAnalysis(frontAnalysis, sideAnalysis)
        // 再加入背面的分析结果
        if (backAnalysis.items && backAnalysis.items.length > 0) {
          combined.items = [...combined.items, ...backAnalysis.items.filter(item => 
            item.name.includes('高低肩') || item.name.includes('脊柱') || item.name.includes('骨盆')
          )]
          combined.suggestions = [...new Set([...combined.suggestions, ...backAnalysis.suggestions])].slice(0, 6)
        }
        finalResult = combined
      } else if (frontPose && sidePose) {
        console.log('[AIDetect] 综合分析正面和侧面图片')
        const frontAnalysis = analyzeFrontPose(frontPose)
        const sideAnalysis = analyzeSidePose(sidePose)
        finalResult = combineAnalysis(frontAnalysis, sideAnalysis)
      } else if (frontPose) {
        console.log('[AIDetect] 仅分析正面图片')
        finalResult = analyzeFrontPose(frontPose)
      } else if (sidePose) {
        console.log('[AIDetect] 仅分析侧面图片')
        const sideAnalysis = analyzeSidePose(sidePose)
        finalResult = {
          score: 80 + (sideAnalysis.score || 0),
          status: 'warning',
          items: sideAnalysis.items || [],
          suggestions: sideAnalysis.suggestions || ['建议重新拍摄正面照片以获得更准确的分析']
        }
      } else {
        // 无法检测到姿态
        console.warn('[AIDetect] 两张图片都未能检测到姿态')
        finalResult = {
          score: 75,
          status: 'warning',
          items: [
            { name: '姿态检测', status: 'warning', value: 50, description: '未能准确识别人体姿态' }
          ],
          suggestions: [
            '请确保全身在画面中清晰可见',
            '建议在光线充足的环境下重新拍摄',
            '穿着贴身衣物可提高检测准确度',
            '保持与相机约2-3米的距离'
          ]
        }
      }

      setAnalysisResult(finalResult)
      setTimeout(() => {
        setStep('result')
        // 异步获取 AI 建议
        fetchAISuggestion(finalResult)
      }, 500)
    } catch (error) {
      console.error('[AIDetect] 分析失败:', error)
      const errorResult: PostureAnalysis = {
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
      }
      setAnalysisResult(errorResult)
      setTimeout(() => setStep('result'), 500)
    }
  }

  // 获取 AI 健康建议
  const fetchAISuggestion = async (result: PostureAnalysis) => {
    setAiSuggestionLoading(true)
    try {
      const suggestion = await generateAISuggestion(result)
      setAiSuggestion(suggestion)

      // 只有检测成功（有有效的检测项）才保存到数据库
      const hasValidItems = result.items.some(item => 
        item.name.includes('肩') || 
        item.name.includes('头') || 
        item.name.includes('骨盆') || 
        item.name.includes('脊') ||
        item.name.includes('驼')
      )
      
      if (hasValidItems) {
        await saveAssessmentToDatabase(result, suggestion)
      } else {
        console.log('[AIDetect] 检测结果无效，不保存到数据库')
      }
    } catch (error) {
      console.error('[AIDetect] AI建议获取失败:', error)
    } finally {
      setAiSuggestionLoading(false)
    }
  }

  // 保存检测结果到数据库
  const saveAssessmentToDatabase = async (result: PostureAnalysis, aiSuggestion: string) => {
    try {
      // 从检测结果中提取详细数据
      const headItem = result.items.find(item => item.name.includes('头') || item.name.includes('颈'))
      const shoulderItem = result.items.find(item => item.name.includes('肩'))
      const spineItem = result.items.find(item => item.name.includes('脊') || item.name.includes('背') || item.name.includes('驼'))
      const pelvisItem = result.items.find(item => item.name.includes('骨盆') || item.name.includes('髋'))

      const riskLevel = result.score >= 80 ? 'low' : result.score >= 60 ? 'medium' : 'high'

      await assessmentAPI.save({
        overall_score: result.score,
        head_forward_angle: headItem ? headItem.value * 0.3 : undefined,
        shoulder_level_diff: shoulderItem ? shoulderItem.value * 0.1 : undefined,
        spine_curvature: spineItem ? spineItem.value * 0.15 : undefined,
        pelvis_tilt: pelvisItem ? pelvisItem.value * 0.1 : undefined,
        risk_level: riskLevel,
        keypoints_data: result.items,
        ai_suggestions: aiSuggestion
      })
      console.log('[AIDetect] 检测结果已保存到数据库')
    } catch (error) {
      console.error('[AIDetect] 保存检测结果失败:', error)
    }
  }

  // 人体正面轮廓 SVG (用于分析动画)
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

  // 介绍页面
  const renderIntro = () => (
    <motion.div className="detect-content intro-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="pose-card">
        <div className="pose-figure">
          <img src="/正面.jpg" alt="正面检测示范" className="pose-demo-img" />
        </div>
        <div className="pose-info">
          <h4 className="pose-title">正面检测</h4>
          <p className="pose-desc">请参照示例图拍摄【全身照】，需包含头顶到脚底完整身体，双脚并拢自然站立</p>
          <p className="pose-tip">
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14" className="tip-icon">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            注意：必须拍全身，不可只拍半身！
          </p>
        </div>
      </div>
      <div className="pose-card">
        <div className="pose-figure">
          <img src="/侧面.png" alt="侧面检测示范" className="pose-demo-img" />
        </div>
        <div className="pose-info">
          <h4 className="pose-title">侧面检测</h4>
          <p className="pose-desc">请参照示例图拍摄【全身照】，侧身站立，需包含头顶到脚底完整身体</p>
          <p className="pose-tip">
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14" className="tip-icon">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            注意：必须拍全身，不可只拍半身！
          </p>
        </div>
      </div>
      <div className="pose-card">
        <div className="pose-figure">
          <img src="/背面.png" alt="背面检测示范" className="pose-demo-img" />
        </div>
        <div className="pose-info">
          <h4 className="pose-title">背面检测</h4>
          <p className="pose-desc">请参照示例图拍摄【全身照】，背对镜头站立，需包含头顶到脚底完整身体</p>
          <p className="pose-tip">
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14" className="tip-icon">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            注意：必须拍全身，不可只拍半身！
          </p>
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
        <div className="step-badge">1/3</div>
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
            {/* 动作示范框架 */}
            <div className="pose-guide-frame">
              <svg viewBox="0 0 200 340" fill="none" className="pose-guide-svg">
                {/* 外框 */}
                <rect x="10" y="10" width="180" height="320" rx="10" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="8 4" fill="none"/>
                {/* 头部区域 */}
                <circle cx="100" cy="50" r="28" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="6 3" fill="rgba(78, 205, 196, 0.1)"/>
                <text x="100" y="55" textAnchor="middle" fill="#4ecdc4" fontSize="10">头部</text>
                {/* 身体中线 */}
                <line x1="100" y1="78" x2="100" y2="200" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2"/>
                {/* 肩膀线 */}
                <line x1="45" y1="100" x2="155" y2="100" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2"/>
                <text x="40" y="95" textAnchor="end" fill="#4ecdc4" fontSize="8">肩</text>
                <text x="160" y="95" textAnchor="start" fill="#4ecdc4" fontSize="8">肩</text>
                {/* 手臂 */}
                <line x1="45" y1="100" x2="30" y2="170" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2"/>
                <line x1="155" y1="100" x2="170" y2="170" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2"/>
                {/* 髋部线 */}
                <line x1="60" y1="200" x2="140" y2="200" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2"/>
                {/* 腿部 */}
                <line x1="75" y1="200" x2="70" y2="300" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2"/>
                <line x1="125" y1="200" x2="130" y2="300" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2"/>
                {/* 脚部 */}
                <ellipse cx="70" cy="310" rx="15" ry="8" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2" fill="rgba(78, 205, 196, 0.1)"/>
                <ellipse cx="130" cy="310" rx="15" ry="8" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2" fill="rgba(78, 205, 196, 0.1)"/>
                {/* 提示文字 */}
                <text x="100" y="290" textAnchor="middle" fill="#4ecdc4" fontSize="10">双脚并拢站在此位置</text>
              </svg>
            </div>
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
        <div className="tip-item"><span className="tip-dot"></span>将身体对准框架内的人形轮廓</div>
      </div>
    </motion.div>
  )

  // 侧面拍摄页面
  const renderSideCapture = () => (
    <motion.div className="detect-content capture-content" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
      <div className="capture-header">
        <div className="step-badge">2/3</div>
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
            {/* 侧面动作示范框架 */}
            <div className="pose-guide-frame">
              <svg viewBox="0 0 200 340" fill="none" className="pose-guide-svg">
                {/* 外框 */}
                <rect x="10" y="10" width="180" height="320" rx="10" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="8 4" fill="none"/>
                {/* 头部区域 */}
                <ellipse cx="110" cy="50" rx="22" ry="28" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="6 3" fill="rgba(78, 205, 196, 0.1)"/>
                <text x="110" y="55" textAnchor="middle" fill="#4ecdc4" fontSize="10">头部</text>
                {/* 脊柱线（稍微前倾的自然曲线） */}
                <path d="M105 78 Q115 120 110 160 Q105 190 108 200" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="4 2" fill="none"/>
                <text x="130" y="140" fill="#4ecdc4" fontSize="8">脊柱</text>
                {/* 手臂 */}
                <line x1="105" y1="100" x2="70" y2="160" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2"/>
                {/* 臀部 */}
                <ellipse cx="115" cy="210" rx="25" ry="20" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2" fill="rgba(78, 205, 196, 0.05)"/>
                {/* 腿部 */}
                <line x1="100" y1="225" x2="95" y2="300" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2"/>
                <line x1="115" y1="225" x2="110" y2="300" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2"/>
                {/* 脚部 */}
                <ellipse cx="100" cy="310" rx="20" ry="8" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2" fill="rgba(78, 205, 196, 0.1)"/>
                {/* 提示文字 */}
                <text x="100" y="290" textAnchor="middle" fill="#4ecdc4" fontSize="10">侧身站立，双脚并拢</text>
              </svg>
            </div>
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
        <div className="tip-item"><span className="tip-dot"></span>将身体对准框架内的人形轮廓</div>
      </div>
    </motion.div>
  )

  // 背面拍摄页面
  const renderBackCapture = () => (
    <motion.div className="detect-content capture-content" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
      <div className="capture-header">
        <div className="step-badge">3/3</div>
        <h2>背面拍摄</h2>
        <p>请按照示意图姿势拍摄背面全身照</p>
      </div>
      <div className="capture-area">
        {backImage ? (
          <div className="preview-image">
            <img src={backImage} alt="背面照片" ref={backImageRef} />
            <button className="retake-btn" onClick={() => setBackImage(null)}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              重拍
            </button>
          </div>
        ) : (
          <div className="capture-placeholder" onClick={() => handleImageUpload('back')}>
            {/* 背面动作示范框架 */}
            <div className="pose-guide-frame">
              <svg viewBox="0 0 200 340" fill="none" className="pose-guide-svg">
                {/* 外框 */}
                <rect x="10" y="10" width="180" height="320" rx="10" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="8 4" fill="none"/>
                {/* 头部区域 */}
                <circle cx="100" cy="50" r="28" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="6 3" fill="rgba(78, 205, 196, 0.1)"/>
                <text x="100" y="55" textAnchor="middle" fill="#4ecdc4" fontSize="10">头部</text>
                {/* 脊柱线（背面可见） */}
                <line x1="100" y1="78" x2="100" y2="200" stroke="#4ecdc4" strokeWidth="2" strokeDasharray="4 2"/>
                <text x="120" y="140" fill="#4ecdc4" fontSize="8">脊柱</text>
                {/* 肩胛骨区域 */}
                <ellipse cx="70" cy="110" rx="15" ry="20" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2" fill="rgba(78, 205, 196, 0.05)"/>
                <ellipse cx="130" cy="110" rx="15" ry="20" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2" fill="rgba(78, 205, 196, 0.05)"/>
                <text x="70" y="95" textAnchor="middle" fill="#4ecdc4" fontSize="7">肩胛</text>
                <text x="130" y="95" textAnchor="middle" fill="#4ecdc4" fontSize="7">肩胛</text>
                {/* 肩膀线 */}
                <line x1="45" y1="100" x2="155" y2="100" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2"/>
                {/* 手臂 */}
                <line x1="45" y1="100" x2="30" y2="170" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2"/>
                <line x1="155" y1="100" x2="170" y2="170" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2"/>
                {/* 髅部线 */}
                <line x1="60" y1="200" x2="140" y2="200" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2"/>
                {/* 腿部 */}
                <line x1="75" y1="200" x2="70" y2="300" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2"/>
                <line x1="125" y1="200" x2="130" y2="300" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2"/>
                {/* 脚部 */}
                <ellipse cx="70" cy="310" rx="15" ry="8" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2" fill="rgba(78, 205, 196, 0.1)"/>
                <ellipse cx="130" cy="310" rx="15" ry="8" stroke="#4ecdc4" strokeWidth="1.5" strokeDasharray="4 2" fill="rgba(78, 205, 196, 0.1)"/>
                {/* 提示文字 */}
                <text x="100" y="290" textAnchor="middle" fill="#4ecdc4" fontSize="10">背对镜头，双脚并拢</text>
              </svg>
            </div>
            <div className="capture-hint">
              <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="#4ecdc4" strokeWidth="2"/><circle cx="12" cy="13" r="4" stroke="#4ecdc4" strokeWidth="2"/></svg>
              <span>点击拍摄或上传</span>
            </div>
          </div>
        )}
      </div>
      <div className="capture-tips">
        <div className="tip-item"><span className="tip-dot"></span>背对镜头，双脚并拢站立</div>
        <div className="tip-item"><span className="tip-dot"></span>镜头对准腰部位置水平拍摄</div>
        <div className="tip-item"><span className="tip-dot"></span>可检测脊柱侧弯、肩胛骨突出等问题</div>
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

        {/* AI 健康顾问建议 */}
        <div className="ai-suggestion-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z" stroke="#4ecdc4" strokeWidth="1.5"/>
              <circle cx="9" cy="13" r="1" fill="#4ecdc4"/>
              <circle cx="15" cy="13" r="1" fill="#4ecdc4"/>
              <path d="M9 17h6" stroke="#4ecdc4" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            AI 健康顾问
          </h3>
          {aiSuggestionLoading ? (
            <div className="ai-suggestion-loading">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
              <p>AI 正在分析并生成个性化建议...</p>
            </div>
          ) : aiSuggestion ? (
            <div className="ai-suggestion-content">
              {aiSuggestion.split('\n').map((line, index) => (
                line.trim() && <p key={index}>{line}</p>
              ))}
            </div>
          ) : (
            <div className="ai-suggestion-content">
              <p>正在获取 AI 建议...</p>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const getStepTitle = () => {
    switch (step) {
      case 'intro': return '注意事项'
      case 'front': return '正面拍摄'
      case 'side': return '侧面拍摄'
      case 'back': return '背面拍摄'
      case 'analyzing': return '分析中'
      case 'result': return '检测结果'
    }
  }

  const canProceed = () => {
    switch (step) {
      case 'intro': return agreed && !modelLoading
      case 'front': return !!frontImage
      case 'side': return !!sideImage
      case 'back': return !!backImage
      default: return false
    }
  }

  const getButtonText = () => {
    if (step === 'intro' && modelLoading) return 'AI模型加载中...'
    switch (step) {
      case 'intro': return '下一步'
      case 'front': return '下一步'
      case 'side': return '下一步'
      case 'back': return '开始分析'
      case 'result': return '完成'
      default: return '下一步'
    }
  }

  const handleBack = () => {
    switch (step) {
      case 'front': setStep('intro'); break
      case 'side': setStep('front'); break
      case 'back': setStep('side'); break
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
          <div className={`step-dot ${step === 'front' ? 'active' : (step === 'side' || step === 'back') ? 'done' : ''}`}>{(step === 'side' || step === 'back') ? <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> : '2'}</div>
          <div className={`step-line ${(step === 'side' || step === 'back') ? 'active' : ''}`}></div>
          <div className={`step-dot ${step === 'side' ? 'active' : step === 'back' ? 'done' : ''}`}>{step === 'back' ? <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> : '3'}</div>
          <div className={`step-line ${step === 'back' ? 'active' : ''}`}></div>
          <div className={`step-dot ${step === 'back' ? 'active' : ''}`}>4</div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'intro' && renderIntro()}
        {step === 'front' && renderFrontCapture()}
        {step === 'side' && renderSideCapture()}
        {step === 'back' && renderBackCapture()}
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
