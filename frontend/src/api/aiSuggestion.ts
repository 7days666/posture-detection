import type { PostureAnalysis } from '../utils/poseDetection'

const API_KEY = 'sk-zgkbubnglnexrytvtgnyaoitoebwflrflhytyhltnwdukuif'
const API_URL = 'https://api.gptsapi.net/v1/chat/completions'

interface AIResponse {
  choices: {
    message: {
      content: string
    }
  }[]
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
        model: 'gpt-4o-mini',
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
