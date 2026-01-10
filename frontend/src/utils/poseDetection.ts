import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import * as tf from '@tensorflow/tfjs'

let detector: poseDetection.PoseDetector | null = null
let isInitializing = false
let initError: string | null = null

export interface Landmark {
  x: number
  y: number
  score?: number
  name?: string
}

export interface PoseResult {
  landmarks: Landmark[]
}

// 初始化 MoveNet 检测器
export async function initPoseDetector(): Promise<poseDetection.PoseDetector> {
  if (detector) return detector
  if (initError) throw new Error(initError)
  if (isInitializing) {
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    if (detector) return detector
    throw new Error(initError || '初始化失败')
  }

  isInitializing = true

  try {
    console.log('[AI] 初始化 TensorFlow.js...')
    await tf.ready()
    console.log('[AI] TensorFlow 后端:', tf.getBackend())

    // 尝试 WebGL
    if (tf.getBackend() !== 'webgl') {
      try {
        await tf.setBackend('webgl')
        await tf.ready()
      } catch (e) {
        console.warn('[AI] WebGL 不可用')
      }
    }

    console.log('[AI] 加载 MoveNet Thunder 模型...')
    detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
        enableSmoothing: false
      }
    )
    console.log('[AI] 模型加载成功')

    isInitializing = false
    return detector
  } catch (error) {
    isInitializing = false
    initError = error instanceof Error ? error.message : '模型加载失败'
    console.error('[AI] 初始化失败:', error)
    throw error
  }
}


// 从图片检测姿态
export async function detectPoseFromImage(imageElement: HTMLImageElement): Promise<PoseResult | null> {
  try {
    const det = await initPoseDetector()

    console.log('[AI] 检测图片:', imageElement.naturalWidth, 'x', imageElement.naturalHeight)

    // 确保图片加载完成
    if (!imageElement.complete || imageElement.naturalWidth === 0) {
      await new Promise<void>((resolve) => {
        imageElement.onload = () => resolve()
        if (imageElement.complete) resolve()
      })
    }

    // 创建 canvas 处理图片
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // 调整尺寸
    const maxSize = 512
    let width = imageElement.naturalWidth
    let height = imageElement.naturalHeight

    if (width > maxSize || height > maxSize) {
      const scale = maxSize / Math.max(width, height)
      width = Math.round(width * scale)
      height = Math.round(height * scale)
    }

    canvas.width = width
    canvas.height = height
    ctx.drawImage(imageElement, 0, 0, width, height)

    console.log('[AI] Canvas 尺寸:', width, 'x', height)

    // 检测姿态
    const poses = await det.estimatePoses(canvas)
    console.log('[AI] 检测到姿态数:', poses.length)

    if (poses.length > 0) {
      const pose = poses[0]
      const landmarks: Landmark[] = pose.keypoints.map(kp => ({
        x: kp.x / width,  // 归一化到 0-1
        y: kp.y / height,
        score: kp.score,
        name: kp.name
      }))

      // 打印关键点
      const validCount = landmarks.filter(lm => lm.score && lm.score > 0.3).length
      console.log('[AI] 有效关键点:', validCount, '/ 17')
      
      landmarks.forEach(lm => {
        const status = lm.score && lm.score > 0.3 ? '✓' : '✗'
        console.log(`[AI] ${status} ${lm.name}: score=${lm.score?.toFixed(2)}`)
      })

      if (validCount >= 8) {
        return { landmarks }
      }
    }

    console.warn('[AI] 未检测到有效姿态')
    return null
  } catch (error) {
    console.error('[AI] 检测失败:', error)
    return null
  }
}

// 关键点索引
const KEYPOINTS = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16
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
      leftShoulder.score > 0.3 && rightShoulder.score > 0.3) {
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
      leftHip.score > 0.3 && rightHip.score > 0.3) {
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
      leftEar.score > 0.3 && rightEar.score > 0.3) {
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
      nose.score > 0.3 && leftShoulder.score > 0.3 && rightShoulder.score > 0.3) {
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

  const ear = leftEar?.score && leftEar.score > 0.3 ? leftEar : rightEar
  const shoulder = leftShoulder?.score && leftShoulder.score > 0.3 ? leftShoulder : rightShoulder
  const hip = leftHip?.score && leftHip.score > 0.3 ? leftHip : rightHip

  // 1. 头部前倾
  if (ear?.score && shoulder?.score && ear.score > 0.3 && shoulder.score > 0.3) {
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
  if (shoulder?.score && hip?.score && shoulder.score > 0.3 && hip.score > 0.3) {
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
