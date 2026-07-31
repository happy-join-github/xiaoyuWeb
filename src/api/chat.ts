/**
 * 聊聊模块 API（B 模块）
 *
 * B1  GET   /api/chat/sessions                   会话列表
 * B2  POST  /api/chat/sessions                   创建会话
 * B3  GET   /api/chat/sessions/:sessionId        单条会话
 * B4  DELETE /api/chat/sessions/:sessionId       删除会话
 * B5  GET   /api/chat/sessions/:sessionId/messages  消息列表
 * B6  POST  /api/chat/sessions/:sessionId/messages  发送消息
 * B7  GET   /api/chat/history                    历史（按周分组）
 * B8  GET   /api/chat/completions                SSE 流式对话
 */
import service from './index'

// ====== 类型定义 ======

export interface ChatSession {
  id: number
  userId: number
  title: string | null
  preview: string | null
  messageCount: number
  lastMessageAt: string | null
  createdAt: string
}

export interface ChatMessage {
  id: number
  sessionId: number
  role: 'ai' | 'user'
  content: string
  time: string
  createdAt: string
}

// ====== B1: 获取会话列表 ======
export function getChatSessions(page = 1, pageSize = 20) {
  return service.get('/chat/sessions', { params: { page, pageSize } })
}

// ====== B2: 创建会话 ======
export function createChatSession(firstMessage?: string) {
  return service.post('/chat/sessions', firstMessage ? { firstMessage } : {})
}

// ====== B3: 获取单条会话 ======
export function getChatSession(sessionId: number) {
  return service.get(`/chat/sessions/${sessionId}`)
}

// ====== B4: 删除会话（软删除） ======
export function deleteChatSession(sessionId: number) {
  return service.delete(`/chat/sessions/${sessionId}`)
}

// ====== B5: 获取消息列表 ======
export function getChatMessages(sessionId: number, page = 1, pageSize = 50) {
  return service.get(`/chat/sessions/${sessionId}/messages`, { params: { page, pageSize } })
}

// ====== B6: 发送消息 ======
export function sendChatMessage(sessionId: number, content: string) {
  return service.post(`/chat/sessions/${sessionId}/messages`, { content })
}

// ====== B7: 获取聊天历史（按周分组） ======
export function getChatHistory() {
  return service.get('/chat/history')
}

// ====== B8: 聊聊 SSE 流式对话 ======
export function chatCompletionsStream(
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

  fetch(`${baseUrl}/chat/completions?${params}`, {
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
