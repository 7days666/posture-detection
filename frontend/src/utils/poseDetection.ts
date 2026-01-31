import * as poseModule from '@mediapipe/pose'

const Pose = poseModule.Pose
type PoseType = InstanceType<typeof Pose>

let poseInstance: PoseType | null = null
let initPromise: Promise<PoseType> | null = null

// 检测是否是移动端
const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

export interface Landmark {
  x: number
  y: number
  score?: number
  name?: string
}

export interface PoseResult {
  landmarks: Landmark[]
}

// MediaPipe 关键点名称映射
const KEYPOINT_NAMES = [
  'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
  'right_eye_inner', 'right_eye', 'right_eye_outer',
  'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
  'left_index', 'right_index', 'left_thumb', 'right_thumb',
  'left_hip', 'right_hip', 'left_knee', 'right_knee',
  'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
  'left_foot_index', 'right_foot_index'
]

// 初始化 MediaPipe Pose
export async function initPoseDetector(): Promise<PoseType> {
  if (poseInstance) return poseInstance
  if (initPromise) return initPromise

  const mobile = isMobile()
  console.log('[AI] 初始化 MediaPipe Pose...')
  console.log('[AI] 设备类型:', mobile ? '移动端' : '桌面端')
  console.log('[AI] User Agent:', navigator.userAgent)

  initPromise = new Promise((resolve, reject) => {
    try {
      const pose = new Pose({
        locateFile: (file) => {
          // 使用更稳定的 CDN
          const url = `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
          console.log('[AI] 加载文件:', url)
          return url
        }
      })

      // 移动端使用更宽松的配置
      pose.setOptions({
        modelComplexity: mobile ? 0 : 1, // 移动端用轻量模型 (Lite)
        smoothLandmarks: false,
        enableSegmentation: false,
        minDetectionConfidence: mobile ? 0.3 : 0.5, // 移动端降低检测阈值
        minTrackingConfidence: mobile ? 0.3 : 0.5   // 移动端降低跟踪阈值
      })

      pose.onResults(() => {
        // 初始化回调，不做任何事
      })

      // 初始化模型
      pose.initialize().then(() => {
        console.log('[AI] MediaPipe Pose 初始化成功')
        poseInstance = pose
        resolve(pose)
      }).catch((err) => {
        console.error('[AI] MediaPipe 初始化失败:', err)
        initPromise = null // 允许重试
        reject(err)
      })
    } catch (error) {
      console.error('[AI] MediaPipe 创建失败:', error)
      initPromise = null // 允许重试
      reject(error)
    }
  })

  return initPromise
}

// 从图片检测姿态
export async function detectPoseFromImage(imageElement: HTMLImageElement): Promise<PoseResult | null> {
  try {
    const pose = await initPoseDetector()
    const mobile = isMobile()

    console.log('[AI] 检测图片:', imageElement.naturalWidth, 'x', imageElement.naturalHeight)
    console.log('[AI] 设备类型:', mobile ? '移动端' : '桌面端')

    // 确保图片加载完成
    if (!imageElement.complete || imageElement.naturalWidth === 0) {
      await new Promise<void>((resolve) => {
        imageElement.onload = () => resolve()
        if (imageElement.complete) resolve()
      })
    }

    // 创建 canvas 处理图片
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: false  // 禁用 alpha 通道，提高性能
    })
    if (!ctx) {
      console.error('[AI] 无法创建 canvas context')
      return null
    }

    // 移动端使用更小的尺寸以提高兼容性
    // 同时确保尺寸是偶数（某些编码器要求）
    const maxSize = mobile ? 384 : 640
    let width = imageElement.naturalWidth
    let height = imageElement.naturalHeight

    // 计算缩放比例
    const scale = Math.min(maxSize / width, maxSize / height, 1)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
    
    // 确保尺寸是偶数
    width = width % 2 === 0 ? width : width + 1
    height = height % 2 === 0 ? height : height + 1

    canvas.width = width
    canvas.height = height
    
    // 设置白色背景（避免透明度问题）
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)
    
    // 绘制图片
    ctx.drawImage(imageElement, 0, 0, width, height)

    console.log('[AI] Canvas 尺寸:', width, 'x', height)

    // 移动端多次尝试检测
    const maxAttempts = mobile ? 3 : 1
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`[AI] 检测尝试 ${attempt}/${maxAttempts}`)
      
      const result = await new Promise<PoseResult | null>((resolve) => {
        let resultLandmarks: Landmark[] | null = null
        let resolved = false

        const handleResults = (results: { poseLandmarks?: Array<{ x: number; y: number; visibility?: number }> }) => {
          if (resolved) return
          
          if (results.poseLandmarks && results.poseLandmarks.length > 0) {
            console.log('[AI] 检测到姿态，关键点数:', results.poseLandmarks.length)
            
            resultLandmarks = results.poseLandmarks.map((lm, idx) => ({
              x: lm.x,
              y: lm.y,
              score: lm.visibility ?? 0.5,
              name: KEYPOINT_NAMES[idx] || `point_${idx}`
            }))

            // 移动端降低有效关键点的阈值
            const minScore = mobile ? 0.2 : 0.5
            const validCount = resultLandmarks.filter(lm => lm.score && lm.score > minScore).length
            console.log('[AI] 有效关键点:', validCount, '/', resultLandmarks.length)

            // 至少需要检测到一定数量的关键点才算成功
            const minValidPoints = mobile ? 8 : 12
            if (validCount >= minValidPoints) {
              resolved = true
              resolve({ landmarks: resultLandmarks })
            } else {
              console.warn('[AI] 有效关键点不足:', validCount, '<', minValidPoints)
              resolved = true
              resolve(null)
            }
          } else {
            console.warn('[AI] 未检测到姿态')
            resolved = true
            resolve(null)
          }
        }

        pose.onResults(handleResults)

        // 发送图片进行检测
        pose.send({ image: canvas }).catch((err) => {
          console.error('[AI] 发送图片失败:', err)
          if (!resolved) {
            resolved = true
            resolve(null)
          }
        })

        // 移动端给更长的超时时间
        const timeout = mobile ? 15000 : 10000
        setTimeout(() => {
          if (!resolved) {
            console.warn('[AI] 检测超时')
            resolved = true
            resolve(null)
          }
        }, timeout)
      })

      if (result) {
        return result
      }

      // 如果失败且还有重试机会，等待一下再重试
      if (attempt < maxAttempts) {
        console.log('[AI] 等待后重试...')
        await new Promise(r => setTimeout(r, 500))
      }
    }

    console.warn('[AI] 所有检测尝试均失败')
    return null
  } catch (error) {
    console.error('[AI] 检测失败:', error)
    return null
  }
}

// MediaPipe Pose 关键点索引
const KEYPOINTS = {
  NOSE: 0,
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28
}

export interface PostureAnalysis {
  score: number
  status: 'good' | 'warning' | 'danger'
  items: {
    name: string
    status: 'normal' | 'warning' | 'danger'
    value: number
    description: string
    angle?: number
  }[]
  suggestions: string[]
  rawData?: {
    shoulderTilt: number
    hipTilt: number
    headTilt: number
    headForward: number
    shoulderRound: number
    spineAngle: number
  }
}

// 计算角度（备用）
// function calcAngle(p1: Landmark, p2: Landmark): number {
//   return Math.abs(Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI)
// }


// 分析正面姿态
export function analyzeFrontPose(result: PoseResult): PostureAnalysis {
  const lm = result.landmarks
  const items: PostureAnalysis['items'] = []
  const suggestions: string[] = []
  let totalScore = 100
  const mobile = isMobile()
  // 移动端使用更低的置信度阈值
  const minConfidence = mobile ? 0.2 : 0.3

  const rawData: PostureAnalysis['rawData'] = {
    shoulderTilt: 0, hipTilt: 0, headTilt: 0,
    headForward: 0, shoulderRound: 0, spineAngle: 0
  }

  const leftShoulder = lm[KEYPOINTS.LEFT_SHOULDER]
  const rightShoulder = lm[KEYPOINTS.RIGHT_SHOULDER]
  const leftHip = lm[KEYPOINTS.LEFT_HIP]
  const rightHip = lm[KEYPOINTS.RIGHT_HIP]
  const leftEar = lm[KEYPOINTS.LEFT_EAR]
  const rightEar = lm[KEYPOINTS.RIGHT_EAR]
  const nose = lm[KEYPOINTS.NOSE]

  // 1. 高低肩检测
  if (leftShoulder?.score && rightShoulder?.score && 
      leftShoulder.score > minConfidence && rightShoulder.score > minConfidence) {
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y) * 100
    rawData.shoulderTilt = shoulderDiff

    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '双肩水平对称'

    if (shoulderDiff > 4) {
      status = 'danger'
      description = `高低肩明显 (差异${shoulderDiff.toFixed(1)}%)`
      totalScore -= 18
      suggestions.push('存在明显高低肩，建议进行肩部矫正训练')
    } else if (shoulderDiff > 2) {
      status = 'warning'
      description = `轻微高低肩 (差异${shoulderDiff.toFixed(1)}%)`
      totalScore -= 8
      suggestions.push('存在轻微高低肩，建议每天进行肩部拉伸')
    }

    items.push({ name: '高低肩', status, value: Math.min(shoulderDiff * 15, 100), description })
  }

  // 2. 骨盆倾斜
  if (leftHip?.score && rightHip?.score && 
      leftHip.score > minConfidence && rightHip.score > minConfidence) {
    const hipDiff = Math.abs(leftHip.y - rightHip.y) * 100
    rawData.hipTilt = hipDiff

    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '骨盆水平正常'

    if (hipDiff > 3) {
      status = 'danger'
      description = `骨盆倾斜明显 (差异${hipDiff.toFixed(1)}%)`
      totalScore -= 15
      suggestions.push('骨盆倾斜明显，建议进行骨盆矫正训练')
    } else if (hipDiff > 1.5) {
      status = 'warning'
      description = `轻微骨盆倾斜 (差异${hipDiff.toFixed(1)}%)`
      totalScore -= 7
    }

    items.push({ name: '骨盆倾斜', status, value: Math.min(hipDiff * 20, 100), description })
  }

  // 3. 头部倾斜
  if (leftEar?.score && rightEar?.score && 
      leftEar.score > minConfidence && rightEar.score > minConfidence) {
    const headDiff = Math.abs(leftEar.y - rightEar.y) * 100
    rawData.headTilt = headDiff

    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '头部位置正常'

    if (headDiff > 3) {
      status = 'danger'
      description = '头部倾斜明显'
      totalScore -= 10
      suggestions.push('头部倾斜明显，注意保持头部正直')
    } else if (headDiff > 1.5) {
      status = 'warning'
      description = '轻微头部倾斜'
      totalScore -= 5
    }

    items.push({ name: '头部倾斜', status, value: Math.min(headDiff * 20, 100), description })
  }

  // 4. 身体中线
  if (nose?.score && leftShoulder?.score && rightShoulder?.score &&
      nose.score > minConfidence && leftShoulder.score > minConfidence && rightShoulder.score > minConfidence) {
    const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2
    const offset = Math.abs(nose.x - shoulderMidX) * 100
    rawData.spineAngle = offset

    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '身体中线正常'

    if (offset > 5) {
      status = 'warning'
      description = '身体中线偏移'
      totalScore -= 8
    }

    items.push({ name: '身体对称', status, value: Math.min(offset * 10, 100), description })
  }

  if (suggestions.length === 0) {
    suggestions.push('体态状况良好，继续保持')
  }

  const status = totalScore >= 85 ? 'good' : totalScore >= 70 ? 'warning' : 'danger'
  return { score: Math.max(totalScore, 0), status, items, suggestions, rawData }
}


// 分析侧面姿态
export function analyzeSidePose(result: PoseResult): Partial<PostureAnalysis> {
  const lm = result.landmarks
  const items: PostureAnalysis['items'] = []
  const suggestions: string[] = []
  let scoreDeduction = 0
  const mobile = isMobile()
  // 移动端使用更低的置信度阈值
  const minConfidence = mobile ? 0.2 : 0.3

  const rawData = {
    shoulderTilt: 0, hipTilt: 0, headTilt: 0,
    headForward: 0, shoulderRound: 0, spineAngle: 0
  }

  const leftEar = lm[KEYPOINTS.LEFT_EAR]
  const rightEar = lm[KEYPOINTS.RIGHT_EAR]
  const leftShoulder = lm[KEYPOINTS.LEFT_SHOULDER]
  const rightShoulder = lm[KEYPOINTS.RIGHT_SHOULDER]
  const leftHip = lm[KEYPOINTS.LEFT_HIP]
  const rightHip = lm[KEYPOINTS.RIGHT_HIP]

  const ear = leftEar?.score && leftEar.score > minConfidence ? leftEar : rightEar
  const shoulder = leftShoulder?.score && leftShoulder.score > minConfidence ? leftShoulder : rightShoulder
  const hip = leftHip?.score && leftHip.score > minConfidence ? leftHip : rightHip

  // 1. 头部前倾
  if (ear?.score && shoulder?.score && ear.score > minConfidence && shoulder.score > minConfidence) {
    const forwardOffset = (ear.x - shoulder.x) * 100
    rawData.headForward = Math.abs(forwardOffset)

    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '头部位置正常'

    if (forwardOffset > 8) {
      status = 'danger'
      description = '头部前倾明显'
      scoreDeduction += 15
      suggestions.push('头部前倾明显，建议进行颈部拉伸训练')
    } else if (forwardOffset > 4) {
      status = 'warning'
      description = '轻微头部前倾'
      scoreDeduction += 8
      suggestions.push('存在轻微头部前倾，注意使用电子设备时的姿势')
    }

    items.push({ name: '头部前倾', status, value: Math.min(Math.abs(forwardOffset) * 6, 100), description })
  }

  // 2. 驼背/圆肩
  if (shoulder?.score && hip?.score && shoulder.score > minConfidence && hip.score > minConfidence) {
    const shoulderForward = (shoulder.x - hip.x) * 100
    rawData.shoulderRound = Math.abs(shoulderForward)

    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '背部曲度正常'

    if (shoulderForward > 10) {
      status = 'danger'
      description = '驼背/圆肩明显'
      scoreDeduction += 15
      suggestions.push('存在驼背或圆肩，建议进行背部强化训练')
    } else if (shoulderForward > 5) {
      status = 'warning'
      description = '轻微驼背倾向'
      scoreDeduction += 8
      suggestions.push('有轻微驼背倾向，注意保持挺胸抬头')
    }

    items.push({ name: '驼背/圆肩', status, value: Math.min(Math.abs(shoulderForward) * 5, 100), description })
  }

  return { items, suggestions, score: -scoreDeduction, rawData: rawData as PostureAnalysis['rawData'] }
}

// 综合分析
export function combineAnalysis(
  frontAnalysis: PostureAnalysis,
  sideAnalysis: Partial<PostureAnalysis>
): PostureAnalysis {
  const combinedItems = [...frontAnalysis.items, ...(sideAnalysis.items || [])]
  const combinedSuggestions = [...new Set([...frontAnalysis.suggestions, ...(sideAnalysis.suggestions || [])])]
  const finalScore = Math.max(frontAnalysis.score + (sideAnalysis.score || 0), 0)

  const rawData = {
    ...frontAnalysis.rawData,
    ...(sideAnalysis.rawData || {})
  } as PostureAnalysis['rawData']

  const status = finalScore >= 85 ? 'good' : finalScore >= 70 ? 'warning' : 'danger'

  return {
    score: finalScore,
    status,
    items: combinedItems,
    suggestions: combinedSuggestions.slice(0, 6),
    rawData
  }
}
