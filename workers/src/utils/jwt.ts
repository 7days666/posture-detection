const JWT_SECRET = 'posture-detection-secret-key-2024'

interface JWTPayload {
  id: number
  phone: string
  exp: number
}

// 简单的 Base64URL 编码
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return atob(str)
}

// 生成 JWT
export function signJWT(payload: { id: number; phone: string }): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: JWTPayload = {
    ...payload,
    exp: now + 7 * 24 * 60 * 60 // 7天过期
  }
  
  const headerB64 = base64UrlEncode(JSON.stringify(header))
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload))
  const signature = base64UrlEncode(JWT_SECRET + headerB64 + payloadB64)
  
  return `${headerB64}.${payloadB64}.${signature}`
}

// 验证 JWT
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const [headerB64, payloadB64, signature] = parts
    const expectedSig = base64UrlEncode(JWT_SECRET + headerB64 + payloadB64)
    
    if (signature !== expectedSig) return null
    
    const payload: JWTPayload = JSON.parse(base64UrlDecode(payloadB64))
    
    // 检查过期
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    
    return payload
  } catch {
    return null
  }
}
