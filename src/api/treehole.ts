/**
 * 树洞模块 API（C 模块）
 *
 * C1  POST  /api/treehole/emotion             记录情绪标签
 * C2  GET   /api/treehole/emotion/today         获取今日情绪标签
 * C3  POST  /api/treehole/save-to-diary         保存到日记
 * C4  GET   /api/treehole/sessions              会话列表
 * C5  POST  /api/treehole/sessions              创建会话
 * C6  GET   /api/treehole/sessions/:sessionId   单条会话
 * C7  GET   /api/treehole/sessions/delete       删除会话（物理）
 * C8  GET   /api/treehole/sessions/:sessionId/messages  消息列表
 * C9  POST  /api/treehole/sessions/:sessionId/messages  发送消息
 * C10 GET   /api/treehole/completions           SSE 流式对话
 */
import service from './index'

// ====== 类型定义 ======

export interface TreeholeSession {
  id: number
  title: string | null
  preview: string | null
  messageCount: number
  lastMessageAt: string | null
  createdAt: string
  expiresAt: string | null
}

export interface TreeholeMessage {
  id: number
  sessionId: number
  role: 'ai' | 'user'
  content: string
  emotionTag: string | null
  createdAt: string
}

export type MoodType = 'happy' | 'calm' | 'sad' | 'anxious' | 'irritable' | 'tearful'

export interface TreeholeEmotionTag {
  id: number
  userId: number
  sessionId: number
  emotion: MoodType
  recordDate: string
  source: string
  createdAt: string
}

export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ====== C1: 记录情绪标签 ======
export function recordEmotion(sessionId: number, emotion: string) {
  return service.post('/treehole/emotion', { sessionId, emotion })
}

// ====== C2: 获取今日情绪标签 ======
export function getTodayEmotion() {
  return service.get('/treehole/emotion/today')
}

// ====== C3: 保存到日记 ======
export function saveToDiary(sessionId: number, emotion?: string, note?: string) {
  return service.post('/treehole/save-to-diary', { sessionId, emotion, note })
}

// ====== C4: 获取树洞会话列表 ======
export function getTreeholeSessions(page = 1, pageSize = 20) {
  return service.get('/treehole/sessions', { params: { page, pageSize } })
}

// ====== C5: 创建树洞会话 ======
export function createTreeholeSession(firstMessage?: string) {
  return service.post('/treehole/sessions', firstMessage ? { firstMessage } : {})
}

// ====== C6: 获取单条树洞会话 ======
export function getTreeholeSession(sessionId: number) {
  return service.get(`/treehole/sessions/${sessionId}`)
}

// ====== C7: 删除树洞会话（物理删除） ======
export function deleteTreeholeSession(sessionId: number) {
  return service.get('/treehole/sessions/delete', { params: { sessionId } })
}

// ====== C8: 获取树洞消息列表 ======
export function getTreeholeMessages(sessionId: number, page = 1, pageSize = 50) {
  return service.get(`/treehole/sessions/${sessionId}/messages`, { params: { page, pageSize } })
}

// ====== C9: 发送树洞消息 ======
export function sendTreeholeMessage(sessionId: number, content: string) {
  return service.post(`/treehole/sessions/${sessionId}/messages`, { content })
}

// ====== C10: 树洞 SSE 流式对话 ======
// 使用 fetch + ReadableStream 消费 SSE
export function treeholeCompletionsStream(
  sessionId: number,
  content: string,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
): AbortController {
  const controller = new AbortController()
  const userInfo = sessionStorage.getItem('userInfo')
  const token = userInfo ? JSON.parse(userInfo).access_token : ''

  const params = new URLSearchParams({ sessionId: String(sessionId), content })
  const baseUrl = import.meta.env.VITE_API_BASE || '/api'

  fetch(`${baseUrl}/treehole/completions?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        onError(new Error(`SSE 连接失败: ${response.status}`))
        return
      }
      const reader = response.body?.getReader()
      if (!reader) {
        onError(new Error('Response body 不可读'))
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data:')) continue
          const jsonStr = trimmed.slice(5).trim()
          if (!jsonStr) continue
          try {
            const data = JSON.parse(jsonStr)
            if (data.done === true) {
              onDone()
              return
            }
            if (data.token) {
              onToken(data.token)
            }
          } catch {
            // ignore parse errors
          }
        }
      }
      onDone()
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError(err)
      }
    })

  return controller
}
