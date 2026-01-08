import { Pose, Results, POSE_CONNECTIONS } from '@mediapipe/pose'

let pose: Pose | null = null
let isInitializing = false
let initError: string | null = null

// MediaPipe Pose 33个关键点索引
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32
}

export { POSE_CONNECTIONS }

export interface Landmark {
  x: number
  y: number
  z: number
  visibility?: number
}

export interface PoseResult {
  landmarks: Landmark[]
  worldLandmarks?: Landmark[]
}

// 初始化 MediaPipe Pose
export async function initPoseDetector(): Promise<Pose> {
  if (pose) return pose
  if (initError) throw new Error(initError)
  if (isInitializing) {
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    if (pose) return pose
    throw new Error(initError || '初始化失败')
  }

  isInitializing = true

  try {
    console.log('[MediaPipe] 开始初始化...')
    
    pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      }
    })

    pose.setOptions({
      modelComplexity: 1, // 0=lite, 1=full, 2=heavy
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })

    // 预热模型
    await pose.initialize()
    console.log('[MediaPipe] 初始化成功，33个关键点模型已加载')
    
    isInitializing = false
    return pose
  } catch (error) {
    isInitializing = false
    initError = error instanceof Error ? error.message : '模型加载失败'
    console.error('[MediaPipe] 初始化失败:', error)
    throw error
  }
}

// 从图片检测姿态
export async function detectPoseFromImage(imageElement: HTMLImageElement): Promise<PoseResult | null> {
  return new Promise(async (resolve) => {
    try {
      const detector = await initPoseDetector()
      
      console.log('[MediaPipe] 开始检测，图片尺寸:', imageElement.naturalWidth, 'x', imageElement.naturalHeight)

      // 设置结果回调
      detector.onResults((results: Results) => {
        if (results.poseLandmarks && results.poseLandmarks.length > 0) {
          console.log('[MediaPipe] 检测成功，关键点数量:', results.poseLandmarks.length)
          
          // 打印关键点信息
          const validCount = results.poseLandmarks.filter(lm => lm.visibility && lm.visibility > 0.5).length
          console.log('[MediaPipe] 高置信度关键点:', validCount, '/ 33')
          
          resolve({
            landmarks: results.poseLandmarks,
            worldLandmarks: results.poseWorldLandmarks
          })
        } else {
          console.warn('[MediaPipe] 未检测到姿态')
          resolve(null)
        }
      })

      // 发送图片进行检测
      await detector.send({ image: imageElement })
    } catch (error) {
      console.error('[MediaPipe] 检测失败:', error)
      resolve(null)
    }
  })
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

// 计算两点之间的角度（相对于水平线）
function calculateAngle(p1: Landmark, p2: Landmark): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.atan2(dy, dx) * 180 / Math.PI
}

// 计算三点形成的角度
function calculateThreePointAngle(p1: Landmark, p2: Landmark, p3: Landmark): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y }
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y }
  const dot = v1.x * v2.x + v1.y * v2.y
  const cross = v1.x * v2.y - v1.y * v2.x
  return Math.atan2(cross, dot) * 180 / Math.PI
}

// 分析正面姿态
export function analyzeFrontPose(result: PoseResult): PostureAnalysis {
  const lm = result.landmarks
  const items: PostureAnalysis['items'] = []
  const suggestions: string[] = []
  let totalScore = 100

  const leftShoulder = lm[POSE_LANDMARKS.LEFT_SHOULDER]
  const rightShoulder = lm[POSE_LANDMARKS.RIGHT_SHOULDER]
  const leftHip = lm[POSE_LANDMARKS.LEFT_HIP]
  const rightHip = lm[POSE_LANDMARKS.RIGHT_HIP]
  const leftEar = lm[POSE_LANDMARKS.LEFT_EAR]
  const rightEar = lm[POSE_LANDMARKS.RIGHT_EAR]
  const nose = lm[POSE_LANDMARKS.NOSE]
  const leftKnee = lm[POSE_LANDMARKS.LEFT_KNEE]
  const rightKnee = lm[POSE_LANDMARKS.RIGHT_KNEE]

  // 原始数据
  const rawData = {
    shoulderTilt: 0,
    hipTilt: 0,
    headTilt: 0,
    headForward: 0,
    shoulderRound: 0,
    spineAngle: 0
  }

  // 1. 高低肩检测
  if (leftShoulder && rightShoulder) {
    const shoulderAngle = calculateAngle(leftShoulder, rightShoulder)
    const shoulderTilt = Math.abs(shoulderAngle)
    rawData.shoulderTilt = shoulderTilt

    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '双肩水平对称'

    if (shoulderTilt > 5) {
      status = 'danger'
      description = `高低肩明显 (倾斜${shoulderTilt.toFixed(1)}°)`
      totalScore -= 18
      suggestions.push('存在明显高低肩，建议进行肩部矫正训练，必要时就医检查')
    } else if (shoulderTilt > 2.5) {
      status = 'warning'
      description = `轻微高低肩 (倾斜${shoulderTilt.toFixed(1)}°)`
      totalScore -= 8
      suggestions.push('存在轻微高低肩，建议每天进行肩部拉伸运动')
    }

    items.push({
      name: '高低肩',
      status,
      value: Math.min(shoulderTilt * 10, 100),
      description,
      angle: shoulderTilt
    })
  }

  // 2. 骨盆倾斜检测
  if (leftHip && rightHip) {
    const hipAngle = calculateAngle(leftHip, rightHip)
    const hipTilt = Math.abs(hipAngle)
    rawData.hipTilt = hipTilt

    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '骨盆水平正常'

    if (hipTilt > 4) {
      status = 'danger'
      description = `骨盆倾斜明显 (倾斜${hipTilt.toFixed(1)}°)`
      totalScore -= 15
      suggestions.push('骨盆倾斜明显，建议进行骨盆矫正训练')
    } else if (hipTilt > 2) {
      status = 'warning'
      description = `轻微骨盆倾斜 (倾斜${hipTilt.toFixed(1)}°)`
      totalScore -= 7
      suggestions.push('存在轻微骨盆倾斜，注意站姿和坐姿')
    }

    items.push({
      name: '骨盆倾斜',
      status,
      value: Math.min(hipTilt * 12, 100),
      description,
      angle: hipTilt
    })
  }

  // 3. 头部倾斜检测
  if (leftEar && rightEar) {
    const headAngle = calculateAngle(leftEar, rightEar)
    const headTilt = Math.abs(headAngle)
    rawData.headTilt = headTilt

    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '头部位置正常'

    if (headTilt > 6) {
      status = 'danger'
      description = `头部倾斜明显 (倾斜${headTilt.toFixed(1)}°)`
      totalScore -= 10
      suggestions.push('头部倾斜明显，注意保持头部正直')
    } else if (headTilt > 3) {
      status = 'warning'
      description = `轻微头部倾斜 (倾斜${headTilt.toFixed(1)}°)`
      totalScore -= 5
    }

    items.push({
      name: '头部倾斜',
      status,
      value: Math.min(headTilt * 8, 100),
      description,
      angle: headTilt
    })
  }

  // 4. 脊柱侧弯初筛（通过肩-髋连线）
  if (leftShoulder && rightShoulder && leftHip && rightHip && nose) {
    const shoulderMid = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 }
    const hipMid = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 }
    
    // 计算脊柱偏移
    const spineOffset = Math.abs(shoulderMid.x - hipMid.x) * 100
    rawData.spineAngle = spineOffset

    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '脊柱排列正常'

    if (spineOffset > 5) {
      status = 'danger'
      description = '脊柱可能存在侧弯'
      totalScore -= 15
      suggestions.push('脊柱排列异常，建议进行专业脊柱检查')
    } else if (spineOffset > 2.5) {
      status = 'warning'
      description = '脊柱轻微偏移'
      totalScore -= 8
    }

    items.push({
      name: '脊柱排列',
      status,
      value: Math.min(spineOffset * 10, 100),
      description
    })
  }

  // 5. 膝关节对称性
  if (leftKnee && rightKnee) {
    const kneeDiff = Math.abs(leftKnee.y - rightKnee.y) * 100
    
    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '膝关节对称'

    if (kneeDiff > 4) {
      status = 'warning'
      description = '膝关节高度不对称'
      totalScore -= 5
    }

    items.push({
      name: '膝关节对称',
      status,
      value: Math.min(kneeDiff * 12, 100),
      description
    })
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

  const ear = lm[POSE_LANDMARKS.LEFT_EAR] || lm[POSE_LANDMARKS.RIGHT_EAR]
  const shoulder = lm[POSE_LANDMARKS.LEFT_SHOULDER] || lm[POSE_LANDMARKS.RIGHT_SHOULDER]
  const hip = lm[POSE_LANDMARKS.LEFT_HIP] || lm[POSE_LANDMARKS.RIGHT_HIP]
  const knee = lm[POSE_LANDMARKS.LEFT_KNEE] || lm[POSE_LANDMARKS.RIGHT_KNEE]
  const ankle = lm[POSE_LANDMARKS.LEFT_ANKLE] || lm[POSE_LANDMARKS.RIGHT_ANKLE]

  const rawData = { headForward: 0, shoulderRound: 0 }

  // 1. 头部前倾检测（耳朵相对于肩膀的前移）
  if (ear && shoulder) {
    // 使用 z 坐标（深度）来判断前倾
    const forwardOffset = (ear.z - shoulder.z) * 100
    rawData.headForward = Math.abs(forwardOffset)

    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '头部位置正常'

    if (forwardOffset > 8) {
      status = 'danger'
      description = '头部前倾明显'
      scoreDeduction += 15
      suggestions.push('头部前倾明显，建议进行颈部拉伸和强化训练，减少低头看手机')
    } else if (forwardOffset > 4) {
      status = 'warning'
      description = '轻微头部前倾'
      scoreDeduction += 8
      suggestions.push('存在轻微头部前倾，注意使用电子设备时的姿势')
    }

    items.push({
      name: '头部前倾',
      status,
      value: Math.min(Math.abs(forwardOffset) * 6, 100),
      description
    })
  }

  // 2. 驼背/圆肩检测
  if (shoulder && hip) {
    const shoulderForward = (shoulder.z - hip.z) * 100
    rawData.shoulderRound = Math.abs(shoulderForward)

    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '背部曲度正常'

    if (shoulderForward > 10) {
      status = 'danger'
      description = '驼背/圆肩明显'
      scoreDeduction += 15
      suggestions.push('存在驼背或圆肩，建议进行背部强化训练，如游泳、引体向上')
    } else if (shoulderForward > 5) {
      status = 'warning'
      description = '轻微驼背倾向'
      scoreDeduction += 8
      suggestions.push('有轻微驼背倾向，注意保持挺胸抬头')
    }

    items.push({
      name: '驼背/圆肩',
      status,
      value: Math.min(Math.abs(shoulderForward) * 5, 100),
      description
    })
  }

  // 3. 骨盆前倾/后倾
  if (hip && knee && ankle) {
    const hipAngle = calculateThreePointAngle(
      { x: shoulder?.x || hip.x, y: shoulder?.y || hip.y - 0.2, z: 0 } as Landmark,
      hip,
      knee
    )
    
    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '骨盆位置正常'

    // 简化判断
    if (Math.abs(hipAngle) > 20) {
      status = 'warning'
      description = hipAngle > 0 ? '骨盆可能前倾' : '骨盆可能后倾'
      scoreDeduction += 5
    }

    items.push({
      name: '骨盆前后倾',
      status,
      value: Math.min(Math.abs(hipAngle), 100),
      description
    })
  }

  return { items, suggestions, score: -scoreDeduction, rawData }
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
  }

  const status = finalScore >= 85 ? 'good' : finalScore >= 70 ? 'warning' : 'danger'

  return {
    score: finalScore,
    status,
    items: combinedItems,
    suggestions: combinedSuggestions.slice(0, 6),
    rawData: rawData as PostureAnalysis['rawData']
  }
}
