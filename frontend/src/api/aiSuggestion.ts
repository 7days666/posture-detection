import type { PostureAnalysis } from '../utils/poseDetection'

// DeepSeek API 配置
const API_KEY = 'sk-281fd0d816a448da8f6eacc303ceae32'
const API_URL = 'https://api.deepseek.com/v1/chat/completions'
const MODEL = 'deepseek-chat'

interface AIResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

// 训练动作接口
export interface TrainingExercise {
  name: string
  duration: string
  description: string
  steps: string[]
  tips: string
  targetArea: string
}

// 训练计划接口
export interface TrainingPlan {
  title: string
  summary: string
  exercises: TrainingExercise[]
  dailyRoutine: string
  precautions: string[]
}

export async function generateAISuggestion(
  analysis: PostureAnalysis,
  userInfo?: { age?: number; gender?: string }
): Promise<string> {
  const prompt = buildPrompt(analysis, userInfo)

  try {
    console.log('[AI建议] 正在生成个性化建议...')
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `你是一位专业的儿童青少年体态健康顾问，擅长脊柱健康和体态矫正指导。
请根据AI体态检测结果，为用户提供专业、具体、可操作的健康建议。
要求：
1. 语言通俗易懂，适合家长和青少年阅读
2. 建议要具体可执行，包含具体的动作或方法
3. 如有严重问题，建议就医检查
4. 保持积极正面的语气
5. 回复控制在300字以内`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }

    const data: AIResponse = await response.json()
    const suggestion = data.choices[0]?.message?.content || ''
    
    console.log('[AI建议] 生成成功')
    return suggestion
  } catch (error) {
    console.error('[AI建议] 生成失败:', error)
    return generateFallbackSuggestion(analysis)
  }
}

function buildPrompt(analysis: PostureAnalysis, userInfo?: { age?: number; gender?: string }): string {
  const ageInfo = userInfo?.age ? `${userInfo.age}岁` : '儿童青少年'
  const genderInfo = userInfo?.gender === 'male' ? '男孩' : userInfo?.gender === 'female' ? '女孩' : ''
  
  let prompt = `## 体态检测结果

**检测对象**: ${ageInfo}${genderInfo}
**综合评分**: ${analysis.score}分 (${analysis.status === 'good' ? '良好' : analysis.status === 'warning' ? '需关注' : '建议就医'})

### 检测项目详情:
`

  analysis.items.forEach(item => {
    const statusText = item.status === 'normal' ? '正常' : item.status === 'warning' ? '轻微异常' : '明显异常'
    prompt += `- **${item.name}**: ${statusText} - ${item.description}\n`
  })

  if (analysis.rawData) {
    prompt += `
### 测量数据:
- 肩部倾斜角度: ${analysis.rawData.shoulderTilt?.toFixed(1) || 0}°
- 骨盆倾斜角度: ${analysis.rawData.hipTilt?.toFixed(1) || 0}°
- 头部倾斜角度: ${analysis.rawData.headTilt?.toFixed(1) || 0}°
`
  }

  prompt += `
请根据以上检测结果，提供：
1. 对当前体态状况的简要评价
2. 针对异常项目的具体改善建议（包含具体动作）
3. 日常生活中的注意事项
4. 是否需要进一步检查的建议`

  return prompt
}

function generateFallbackSuggestion(analysis: PostureAnalysis): string {
  const suggestions: string[] = []
  
  if (analysis.score >= 85) {
    suggestions.push('您的体态状况良好！继续保持良好的站姿和坐姿习惯。')
    suggestions.push('建议每天进行适量的体育锻炼，如游泳、跑步等，有助于维持良好体态。')
  } else if (analysis.score >= 70) {
    suggestions.push('您的体态存在一些需要关注的问题，但整体状况尚可。')
    
    analysis.items.forEach(item => {
      if (item.status === 'warning') {
        if (item.name.includes('肩')) {
          suggestions.push('针对高低肩：每天做肩部拉伸运动，双手交叉向上伸展，保持15秒，重复5次。')
        }
        if (item.name.includes('头')) {
          suggestions.push('针对头部问题：减少低头看手机的时间，每隔30分钟做颈部放松运动。')
        }
      }
    })
  } else {
    suggestions.push('检测发现您的体态存在较明显的问题，建议引起重视。')
    suggestions.push('建议尽快到医院骨科或康复科进行专业检查，排除脊柱侧弯等问题。')
    suggestions.push('在专业指导下进行针对性的矫正训练。')
  }

  suggestions.push('日常注意：保持正确的坐姿和站姿，书包双肩背负，避免长时间保持同一姿势。')

  return suggestions.join('\n\n')
}


// 生成个性化训练计划
export async function generateTrainingPlan(
  problems: string[],
  analysisData?: PostureAnalysis
): Promise<TrainingPlan> {
  const prompt = buildTrainingPrompt(problems, analysisData)

  try {
    console.log('[AI训练] 正在生成个性化训练计划...')
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `你是一位专业的儿童青少年体态矫正教练，擅长设计针对性的矫正训练计划。
请根据用户的体态问题，生成具体可执行的训练计划。

要求：
1. 动作要安全、适合青少年
2. 每个动作要有详细的步骤说明
3. 包含动作要点和注意事项
4. 训练时间合理，每次15-20分钟

请严格按照以下JSON格式返回（不要包含markdown代码块标记）：
{
  "title": "训练计划标题",
  "summary": "计划简介（50字以内）",
  "exercises": [
    {
      "name": "动作名称",
      "duration": "时长（如：30秒×3组）",
      "description": "动作简介",
      "steps": ["步骤1", "步骤2", "步骤3"],
      "tips": "动作要点",
      "targetArea": "针对部位"
    }
  ],
  "dailyRoutine": "每日训练建议",
  "precautions": ["注意事项1", "注意事项2"]
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }

    const data: AIResponse = await response.json()
    const content = data.choices[0]?.message?.content || ''
    
    console.log('[AI训练] 生成成功')
    
    // 解析 JSON
    try {
      // 移除可能的 markdown 代码块标记
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      return JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('[AI训练] JSON解析失败:', parseError)
      return generateFallbackTrainingPlan(problems)
    }
  } catch (error) {
    console.error('[AI训练] 生成失败:', error)
    return generateFallbackTrainingPlan(problems)
  }
}

function buildTrainingPrompt(problems: string[], analysisData?: PostureAnalysis): string {
  const problemLabels: Record<string, string> = {
    neck: '颈部前倾/头部前伸',
    shoulder: '高低肩/肩膀不平',
    spine: '脊柱弯曲/驼背',
    pelvis: '骨盆倾斜/骨盆前倾'
  }
  
  const problemDescriptions = problems.map(p => problemLabels[p] || p).join('、')
  
  let prompt = `## 用户体态问题

**检测发现的问题**: ${problemDescriptions}
`

  if (analysisData) {
    prompt += `
**综合评分**: ${analysisData.score}分
**风险等级**: ${analysisData.status === 'good' ? '低风险' : analysisData.status === 'warning' ? '中风险' : '高风险'}

**详细数据**:
`
    analysisData.items.forEach(item => {
      prompt += `- ${item.name}: ${item.description}\n`
    })
  }

  prompt += `
请为这位青少年设计一套针对以上问题的矫正训练计划，包含4-6个具体的训练动作。
每个动作要详细说明步骤，确保用户能够正确执行。`

  return prompt
}

function generateFallbackTrainingPlan(problems: string[]): TrainingPlan {
  const exercises: TrainingExercise[] = []
  
  if (problems.includes('neck')) {
    exercises.push({
      name: '颈部后缩训练',
      duration: '10次×3组',
      description: '改善头部前倾，强化颈部深层肌肉',
      steps: [
        '坐直或站立，目视前方',
        '保持下巴水平，将头部向后平移（像做"双下巴"的动作）',
        '保持3秒，然后放松',
        '重复10次为一组'
      ],
      tips: '动作要缓慢，不要仰头或低头',
      targetArea: '颈部'
    })
    exercises.push({
      name: '颈部拉伸',
      duration: '每侧30秒×2组',
      description: '放松颈部紧张肌肉',
      steps: [
        '坐直，右手放在头部左侧',
        '轻轻将头部向右侧拉伸',
        '感受左侧颈部的拉伸感',
        '保持30秒，换另一侧'
      ],
      tips: '拉伸时保持呼吸，不要用力过猛',
      targetArea: '颈部'
    })
  }
  
  if (problems.includes('shoulder')) {
    exercises.push({
      name: '肩胛骨内收训练',
      duration: '15次×3组',
      description: '改善高低肩，强化肩胛骨周围肌肉',
      steps: [
        '站立，双臂自然下垂',
        '将两侧肩胛骨向中间夹紧',
        '保持5秒，然后放松',
        '重复15次为一组'
      ],
      tips: '想象用肩胛骨夹住一支笔',
      targetArea: '肩部'
    })
    exercises.push({
      name: '墙壁天使',
      duration: '10次×3组',
      description: '改善圆肩，打开胸腔',
      steps: [
        '背靠墙站立，后脑勺、肩胛骨、臀部贴墙',
        '双臂贴墙，呈"投降"姿势',
        '保持手臂贴墙，向上滑动至头顶',
        '再缓慢滑回起始位置'
      ],
      tips: '全程保持手臂贴墙，动作要慢',
      targetArea: '肩部'
    })
  }
  
  if (problems.includes('spine')) {
    exercises.push({
      name: '猫牛式',
      duration: '10次×3组',
      description: '增加脊柱灵活性，改善驼背',
      steps: [
        '四肢着地，手在肩膀正下方，膝盖在髋部正下方',
        '吸气时，腹部下沉，抬头挺胸（牛式）',
        '呼气时，背部拱起，低头收腹（猫式）',
        '缓慢交替进行'
      ],
      tips: '配合呼吸，动作要流畅',
      targetArea: '脊柱'
    })
    exercises.push({
      name: '俯卧背伸',
      duration: '10次×3组',
      description: '强化背部肌肉，改善驼背',
      steps: [
        '俯卧在垫子上，双手放在身体两侧',
        '收紧臀部和背部肌肉',
        '缓慢抬起上半身，保持3秒',
        '缓慢放下，重复'
      ],
      tips: '不要用手撑地，靠背部力量抬起',
      targetArea: '背部'
    })
  }
  
  if (problems.includes('pelvis')) {
    exercises.push({
      name: '骨盆后倾训练',
      duration: '15次×3组',
      description: '改善骨盆前倾，强化腹部核心',
      steps: [
        '仰卧，双膝弯曲，双脚平放地面',
        '收紧腹部，将腰部压向地面',
        '感受骨盆向后倾斜',
        '保持5秒，放松，重复'
      ],
      tips: '想象用肚脐去贴近脊柱',
      targetArea: '骨盆'
    })
    exercises.push({
      name: '髂腰肌拉伸',
      duration: '每侧30秒×2组',
      description: '放松髂腰肌，改善骨盆前倾',
      steps: [
        '单膝跪地，另一腿向前成弓步',
        '保持上身直立，骨盆向前推',
        '感受后腿髋部前侧的拉伸',
        '保持30秒，换另一侧'
      ],
      tips: '保持上身直立，不要前倾',
      targetArea: '髋部'
    })
  }
  
  // 如果没有具体问题，添加通用训练
  if (exercises.length === 0) {
    exercises.push({
      name: '靠墙站立',
      duration: '2分钟×3组',
      description: '培养正确站姿意识',
      steps: [
        '背靠墙站立',
        '后脑勺、肩胛骨、臀部、小腿、脚跟贴墙',
        '收紧腹部，保持自然呼吸',
        '保持2分钟'
      ],
      tips: '每天坚持，培养正确体态记忆',
      targetArea: '全身'
    })
  }
  
  return {
    title: '个性化体态矫正训练',
    summary: '根据您的检测结果定制的矫正训练计划',
    exercises,
    dailyRoutine: '建议每天早晚各进行一次训练，每次约15-20分钟',
    precautions: [
      '训练前先做5分钟热身活动',
      '动作要缓慢、控制，不要追求速度',
      '如有疼痛感，立即停止并咨询医生',
      '坚持训练，一般4-6周可见明显改善'
    ]
  }
}
