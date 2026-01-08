import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import * as tf from '@tensorflow/tfjs'

let detector: poseDetection.PoseDetector | null = null

// 初始化姿态检测器
export async function initPoseDetector() {
  if (detector) return detector
  
  await tf.ready()
  await tf.setBackend('webgl')
  
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
      enableSmoothing: true
    }
  )
  
  return detector
}

// 从图片检测姿态
export async function detectPoseFromImage(imageElement: HTMLImageElement) {
  if (!detector) {
    await initPoseDetector()
  }
  
  const poses = await detector!.estimatePoses(imageElement)
  return poses[0] || null
}

// 关键点名称映射（保留供将来使用）
// const KEYPOINT_NAMES = { ... }

// 计算两点之间的角度（保留供将来使用）
// function calculateAngle(...) { ... }

// 计算两点之间的距离（保留供将来使用）
// function distance(...) { ... }

// 获取关键点
function getKeypoint(pose: poseDetection.Pose, name: string) {
  return pose.keypoints.find(kp => kp.name === name)
}

export interface PostureAnalysis {
  score: number
  status: 'good' | 'warning' | 'danger'
  items: {
    name: string
    status: 'normal' | 'warning' | 'danger'
    value: number
    description: string
  }[]
  suggestions: string[]
}

// 分析正面姿态
export function analyzeFrontPose(pose: poseDetection.Pose): PostureAnalysis {
  const items: PostureAnalysis['items'] = []
  const suggestions: string[] = []
  let totalScore = 100

  // 获取关键点
  const leftShoulder = getKeypoint(pose, 'left_shoulder')
  const rightShoulder = getKeypoint(pose, 'right_shoulder')
  const leftHip = getKeypoint(pose, 'left_hip')
  const rightHip = getKeypoint(pose, 'right_hip')
  const leftEar = getKeypoint(pose, 'left_ear')
  const rightEar = getKeypoint(pose, 'right_ear')
  const nose = getKeypoint(pose, 'nose')

  // 1. 高低肩检测
  if (leftShoulder && rightShoulder && leftShoulder.score! > 0.3 && rightShoulder.score! > 0.3) {
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y)
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x)
    const shoulderRatio = shoulderDiff / shoulderWidth * 100
    
    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '双肩水平对称'
    
    if (shoulderRatio > 8) {
      status = 'danger'
      description = '高低肩明显，建议就医检查'
      totalScore -= 20
      suggestions.push('存在明显高低肩，建议进行肩部矫正训练，必要时就医检查')
    } else if (shoulderRatio > 4) {
      status = 'warning'
      description = '轻微高低肩'
      totalScore -= 10
      suggestions.push('存在轻微高低肩，建议每天进行肩部拉伸运动')
    }
    
    items.push({
      name: '高低肩',
      status,
      value: Math.min(shoulderRatio * 5, 100),
      description
    })
  }

  // 2. 骨盆倾斜检测
  if (leftHip && rightHip && leftHip.score! > 0.3 && rightHip.score! > 0.3) {
    const hipDiff = Math.abs(leftHip.y - rightHip.y)
    const hipWidth = Math.abs(leftHip.x - rightHip.x)
    const hipRatio = hipDiff / hipWidth * 100
    
    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '骨盆水平正常'
    
    if (hipRatio > 10) {
      status = 'danger'
      description = '骨盆倾斜明显'
      totalScore -= 15
      suggestions.push('骨盆倾斜明显，建议进行骨盆矫正训练')
    } else if (hipRatio > 5) {
      status = 'warning'
      description = '轻微骨盆倾斜'
      totalScore -= 8
      suggestions.push('存在轻微骨盆倾斜，注意站姿和坐姿')
    }
    
    items.push({
      name: '骨盆倾斜',
      status,
      value: Math.min(hipRatio * 5, 100),
      description
    })
  }

  // 3. 头部倾斜检测
  if (leftEar && rightEar && nose && leftEar.score! > 0.3 && rightEar.score! > 0.3) {
    const earDiff = Math.abs(leftEar.y - rightEar.y)
    const earWidth = Math.abs(leftEar.x - rightEar.x)
    const headTiltRatio = earDiff / earWidth * 100
    
    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '头部位置正常'
    
    if (headTiltRatio > 15) {
      status = 'danger'
      description = '头部倾斜明显'
      totalScore -= 10
      suggestions.push('头部倾斜明显，注意保持头部正直')
    } else if (headTiltRatio > 8) {
      status = 'warning'
      description = '轻微头部倾斜'
      totalScore -= 5
    }
    
    items.push({
      name: '头部倾斜',
      status,
      value: Math.min(headTiltRatio * 3, 100),
      description
    })
  }

  // 4. 身体中线偏移
  if (nose && leftHip && rightHip && leftShoulder && rightShoulder) {
    const shoulderCenter = (leftShoulder.x + rightShoulder.x) / 2
    const bodyWidth = Math.abs(leftShoulder.x - rightShoulder.x)
    const centerOffset = Math.abs(nose.x - shoulderCenter) / bodyWidth * 100
    
    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '身体中线正常'
    
    if (centerOffset > 15) {
      status = 'warning'
      description = '身体中线偏移'
      totalScore -= 8
      suggestions.push('身体中线有偏移，注意保持身体对称')
    }
    
    items.push({
      name: '身体对称',
      status,
      value: Math.min(centerOffset * 3, 100),
      description
    })
  }

  // 确保至少有一些建议
  if (suggestions.length === 0) {
    suggestions.push('体态状况良好，继续保持')
    suggestions.push('建议定期进行体态检测，关注身体变化')
    suggestions.push('适当进行拉伸运动，保持身体柔韧性')
  }

  const status = totalScore >= 85 ? 'good' : totalScore >= 70 ? 'warning' : 'danger'

  return {
    score: Math.max(totalScore, 0),
    status,
    items,
    suggestions
  }
}

// 分析侧面姿态
export function analyzeSidePose(pose: poseDetection.Pose): Partial<PostureAnalysis> {
  const items: PostureAnalysis['items'] = []
  const suggestions: string[] = []
  let scoreDeduction = 0

  const ear = getKeypoint(pose, 'left_ear') || getKeypoint(pose, 'right_ear')
  const shoulder = getKeypoint(pose, 'left_shoulder') || getKeypoint(pose, 'right_shoulder')
  const hip = getKeypoint(pose, 'left_hip') || getKeypoint(pose, 'right_hip')
  const knee = getKeypoint(pose, 'left_knee') || getKeypoint(pose, 'right_knee')
  const ankle = getKeypoint(pose, 'left_ankle') || getKeypoint(pose, 'right_ankle')

  // 1. 头部前倾检测
  if (ear && shoulder && ear.score! > 0.3 && shoulder.score! > 0.3) {
    const forwardOffset = ear.x - shoulder.x
    const verticalDist = Math.abs(ear.y - shoulder.y)
    const forwardRatio = Math.abs(forwardOffset) / verticalDist * 100
    
    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '头部位置正常'
    
    if (forwardOffset > 0 && forwardRatio > 30) {
      status = 'danger'
      description = '头部前倾明显'
      scoreDeduction += 15
      suggestions.push('头部前倾明显，建议进行颈部拉伸和强化训练')
    } else if (forwardOffset > 0 && forwardRatio > 15) {
      status = 'warning'
      description = '轻微头部前倾'
      scoreDeduction += 8
      suggestions.push('存在轻微头部前倾，注意使用电子设备时的姿势')
    }
    
    items.push({
      name: '头部前倾',
      status,
      value: Math.min(forwardRatio, 100),
      description
    })
  }

  // 2. 驼背/圆肩检测
  if (shoulder && hip && shoulder.score! > 0.3 && hip.score! > 0.3) {
    const shoulderForward = shoulder.x - hip.x
    const torsoHeight = Math.abs(shoulder.y - hip.y)
    const roundRatio = Math.abs(shoulderForward) / torsoHeight * 100
    
    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '背部曲度正常'
    
    if (shoulderForward > 0 && roundRatio > 25) {
      status = 'danger'
      description = '驼背/圆肩明显'
      scoreDeduction += 15
      suggestions.push('存在驼背或圆肩，建议进行背部强化训练')
    } else if (shoulderForward > 0 && roundRatio > 12) {
      status = 'warning'
      description = '轻微驼背倾向'
      scoreDeduction += 8
      suggestions.push('有轻微驼背倾向，注意保持挺胸抬头')
    }
    
    items.push({
      name: '驼背/圆肩',
      status,
      value: Math.min(roundRatio * 2, 100),
      description
    })
  }

  // 3. 骨盆前倾/后倾
  if (hip && knee && ankle && hip.score! > 0.3 && knee.score! > 0.3) {
    // 简化的骨盆倾斜检测
    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let description = '骨盆位置正常'
    
    items.push({
      name: '骨盆前后倾',
      status,
      value: 20,
      description
    })
  }

  return {
    items,
    suggestions,
    score: -scoreDeduction
  }
}

// 综合分析
export function combineAnalysis(frontAnalysis: PostureAnalysis, sideAnalysis: Partial<PostureAnalysis>): PostureAnalysis {
  const combinedItems = [...frontAnalysis.items, ...(sideAnalysis.items || [])]
  const combinedSuggestions = [...new Set([...frontAnalysis.suggestions, ...(sideAnalysis.suggestions || [])])]
  const finalScore = Math.max(frontAnalysis.score + (sideAnalysis.score || 0), 0)
  
  const status = finalScore >= 85 ? 'good' : finalScore >= 70 ? 'warning' : 'danger'
  
  return {
    score: finalScore,
    status,
    items: combinedItems,
    suggestions: combinedSuggestions.slice(0, 5)
  }
}
