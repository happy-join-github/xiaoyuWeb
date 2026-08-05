/**
 * 聊聊模块 API（B 模块）
 *
 * B1  GET  /api/chat/sessions                    会话列表（分页）
 * B2  POST /api/chat/sessions                    创建会话（空会话，无请求体）
 * B3  GET  /api/chat/sessions/:sessionId         单条会话
 * B4  GET  /api/chat/sessions/:sessionId/delete  删除会话（软删除，GET 方法）
 * B5  GET  /api/chat/sessions/:sessionId/messages  消息列表（分页，时间正序）
 * B6  POST /api/chat/sessions/:sessionId/messages  发送消息（同步 AI 回复）
 * B7  GET  /api/chat/history                     聊天历史（按周分组）
 * B8  POST /api/chat/sessions/:sessionId/completions  SSE 流式对话
 * B9  GET  /api/chat/archived                    已归档会话列表
 *
 * 字段说明：后端会话/消息字段为 snake_case（message_count / last_message_at / created_at），
 * 本文件在 API 边界统一映射为前端 camelCase；B9 归档接口后端返回 camelCase，无需映射。
 */
import service from './index'

// ====== 类型定义 ======

/** 后端统一响应包装（axios 拦截器已解包一层，返回该结构） */
export interface ApiEnvelope<T = unknown> {
  code: number
  msg: string
  data: T
}

export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface ChatSession {
  id: number
  userId: number
  title: string
  preview: string
  messageCount: number
  lastMessageAt: string | null
  createdAt: string
}

export interface ChatMessage {
  id: number
  role: 'ai' | 'user'
  content: string
  createdAt: string
}

export interface ChatHistoryGroup {
  weekLabel: string
  sessions: ChatSession[]
}

export interface ChatHistoryData {
  groups: ChatHistoryGroup[]
  total: number
}

export interface SendMessageData {
  userMessage: ChatMessage
  aiMessage: ChatMessage
  sessionTitle: string
}

export interface ArchivedSession {
  id: number
  originalSessionId: number
  title: string
  summary: string
  messageCount: number
  originalCreatedAt: string
  deletedAt: string
  archivedAt: string
}

// ====== 字段映射（后端 snake_case → 前端 camelCase）======

function toSession(raw: any): ChatSession {
  return {
    id: raw.id,
    userId: raw.userId,
    title: raw.title ?? '',
    preview: raw.preview ?? '',
    messageCount: raw.message_count,
    lastMessageAt: raw.last_message_at ?? null,
    createdAt: raw.created_at,
  }
}

function toMessage(raw: any): ChatMessage {
  return {
    id: raw.id,
    role: raw.role,
    content: raw.content,
    createdAt: raw.created_at,
  }
}

// ====== B1: 获取会话列表 ======
export function getChatSessions(page = 1, pageSize = 20): Promise<ApiEnvelope<PaginatedData<ChatSession>>> {
  return service.get('/chat/sessions', { params: { page, pageSize } }).then((res: any) => ({
    ...res,
    data: { ...res.data, list: (res.data.list ?? []).map(toSession) },
  }))
}

// ====== B2: 创建会话（空会话，无请求体）======
export function createChatSession(): Promise<ApiEnvelope<{ session: ChatSession }>> {
  return service.post('/chat/sessions').then((res: any) => ({
    ...res,
    data: { session: toSession(res.data.session) },
  }))
}

// ====== B3: 获取单条会话 ======
export function getChatSession(sessionId: number): Promise<ApiEnvelope<{ session: ChatSession }>> {
  return service.get(`/chat/sessions/${sessionId}`).then((res: any) => ({
    ...res,
    data: { session: toSession(res.data.session) },
  }))
}

// ====== B4: 删除会话（软删除，GET 方法）======
export function deleteChatSession(sessionId: number): Promise<ApiEnvelope<null>> {
  return service.get(`/chat/sessions/${sessionId}/delete`).then((res: any) => res)
}

// ====== B5: 获取消息列表（时间正序，分页）======
export function getChatMessages(
  sessionId: number,
  page = 1,
  pageSize = 50,
): Promise<ApiEnvelope<PaginatedData<ChatMessage> & { sessionTitle: string }>> {
  return service
    .get(`/chat/sessions/${sessionId}/messages`, { params: { page, pageSize } })
    .then((res: any) => ({
      ...res,
      data: { ...res.data, list: (res.data.list ?? []).map(toMessage) },
    }))
}

// ====== B6: 发送消息（同步 AI 回复）======
export function sendChatMessage(sessionId: number, content: string): Promise<ApiEnvelope<SendMessageData>> {
  return service.post(`/chat/sessions/${sessionId}/messages`, { content }).then((res: any) => ({
    ...res,
    data: {
      userMessage: toMessage(res.data.userMessage),
      aiMessage: toMessage(res.data.aiMessage),
      sessionTitle: res.data.sessionTitle,
    },
  }))
}

// ====== B7: 获取聊天历史（按周分组）======
export function getChatHistory(page = 1, pageSize = 20): Promise<ApiEnvelope<ChatHistoryData>> {
  return service.get('/chat/history', { params: { page, pageSize } }).then((res: any) => ({
    ...res,
    data: {
      total: res.data.total,
      groups: (res.data.groups ?? []).map((g: any) => ({
        weekLabel: g.weekLabel,
        sessions: (g.sessions ?? []).map(toSession),
      })),
    },
  }))
}

// ====== B8: 聊聊 SSE 流式对话（POST + JSON body）======
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
  const baseUrl = import.meta.env.VITE_API_BASE || '/api'

  fetch(`${baseUrl}/chat/sessions/${sessionId}/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
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
            // data.ping 为服务端心跳（约 2s 一次），前端忽略即可
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

// ====== B9: 获取已归档会话列表（后端已返回 camelCase，无需映射）======
export function getArchivedSessions(page = 1, pageSize = 20): Promise<ApiEnvelope<PaginatedData<ArchivedSession>>> {
  return service.get('/chat/archived', { params: { page, pageSize } }).then((res: any) => res)
}
