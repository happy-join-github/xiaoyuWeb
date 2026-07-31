/**
 * 会话管理 Store（sessionStore）
 *
 * 管理聊聊 + 树洞双场景的会话列表和当前会话消息。
 * 聊聊数据源：chat_sessions（localStorage: chatStorage）
 * 树洞数据源：treehole_sessions（localStorage: treeholeStorage）
 *
 * @see 前端方案 §三 sessionStore
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as chatStorage from '../utils/chatStorage'
import * as treeholeStorage from '../utils/treeholeStorage'
import type { Message } from '../api/mock'
import type { TreeholeStoredMessage } from '../utils/treeholeStorage'

export type SessionType = 'chat' | 'treehole'

export interface SessionItem {
  id: string
  type: SessionType
  title: string
  preview: string
  messageCount: number
  lastMessageAt: string
  createdAt: string
}

export const useSessionStore = defineStore('session', () => {
  // ====== 状态 ======
  const currentThreadId = ref<string | null>(null)
  const currentType = ref<SessionType>('chat')

  // ====== 聊聊远程会话 ID 映射（localId → remoteId）======
  // 前端 localStorage 生成的是自增时间戳 ID（如 1785394011696），
  // 后端数据库有自增数字 ID（如 1, 2, 3...）。
  // 此映射把两者关联起来，使 SSE 调用时能传正确的后端 ID。
  const REMOTE_MAP_KEY = 'chat_remote_session_map'

  function loadRemoteMap(): Record<string, number> {
    try {
      const raw = localStorage.getItem(REMOTE_MAP_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }

  function saveRemoteMap(map: Record<string, number>) {
    localStorage.setItem(REMOTE_MAP_KEY, JSON.stringify(map))
  }

  /** 获取本地 ID → 后端 ID（聊聊） */
  function getRemoteId(localId: string): number | null {
    const map = loadRemoteMap()
    return map[localId] ?? null
  }

  /** 记录本地 ID → 后端 ID（聊聊） */
  function setRemoteId(localId: string, remoteId: number) {
    const map = loadRemoteMap()
    map[localId] = remoteId
    saveRemoteMap(map)
  }

  /** 确保聊聊本地会话在后端也有对应记录，返回后端 sessionId */
  async function ensureRemoteSession(localId: string): Promise<number | null> {
    // 1. 先查映射缓存
    const existing = getRemoteId(localId)
    if (existing !== null) return existing

    // 2. 尝试通过 B2 接口在后端创建会话
    try {
      const { default: api } = await import('../api/chat')
      const res: any = await api.createChatSession()
      if (res.code === 200 && res.data?.session?.id) {
        const remoteId = res.data.session.id
        setRemoteId(localId, remoteId)
        return remoteId
      }
    } catch {
      // 后端不可用时返回 null，调用方回退到 mock
    }
    return null
  }

  // ====== 树洞远程会话 ID 映射（localId → remoteId）======
  const TREEHOLE_REMOTE_MAP_KEY = 'treehole_remote_session_map'

  function loadTreeholeRemoteMap(): Record<string, number> {
    try {
      const raw = localStorage.getItem(TREEHOLE_REMOTE_MAP_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }

  function saveTreeholeRemoteMap(map: Record<string, number>) {
    localStorage.setItem(TREEHOLE_REMOTE_MAP_KEY, JSON.stringify(map))
  }

  /** 获取树洞本地 ID → 后端 ID */
  function getTreeholeRemoteId(localId: string): number | null {
    const map = loadTreeholeRemoteMap()
    return map[localId] ?? null
  }

  /** 记录树洞本地 ID → 后端 ID */
  function setTreeholeRemoteId(localId: string, remoteId: number) {
    const map = loadTreeholeRemoteMap()
    map[localId] = remoteId
    saveTreeholeRemoteMap(map)
  }

  /** 确保树洞本地会话在后端也有对应记录，返回后端 sessionId */
  async function ensureRemoteTreeholeSession(localId: string): Promise<number | null> {
    // 1. 先查映射缓存
    const existing = getTreeholeRemoteId(localId)
    if (existing !== null) return existing

    // 2. 尝试通过 C5 接口在后端创建会话
    try {
      const { default: api } = await import('../api/treehole')
      const res: any = await api.createTreeholeSession()
      if (res.code === 200 && res.data?.session?.id) {
        const remoteId = res.data.session.id
        setTreeholeRemoteId(localId, remoteId)
        return remoteId
      }
    } catch {
      // 后端不可用时返回 null，调用方回退到 mock
    }
    return null
  }

  // ====== 计算属性：聊聊会话列表 ======
  const chatList = computed<SessionItem[]>(() => {
    return chatStorage.getSessions()
      .filter(s => s.type === 'chat')
      .map(s => ({
        id: s.id,
        type: 'chat' as SessionType,
        title: s.title,
        preview: s.preview,
        messageCount: s.messageCount,
        lastMessageAt: s.lastMessageAt,
        createdAt: s.createdAt,
      }))
  })

  // ====== 计算属性：树洞会话列表 ======
  const treeholeList = computed<SessionItem[]>(() => {
    return treeholeStorage.getSessions().map(s => ({
      id: s.id,
      type: 'treehole' as SessionType,
      title: s.title,
      preview: s.preview,
      messageCount: s.messageCount,
      lastMessageAt: s.lastMessageAt,
      createdAt: s.createdAt,
    }))
  })

  // ====== 当前会话消息 ======
  const messageList = computed(() => {
    if (!currentThreadId.value) return []
    if (currentType.value === 'chat') {
      return chatStorage.getMessages(currentThreadId.value)
    }
    return treeholeStorage.getMessages(currentThreadId.value)
  })

  // ====== 行为 ======

  /** 切换当前会话 */
  function switchSession(id: string, type: SessionType) {
    currentThreadId.value = id
    currentType.value = type
  }

  /** 创建新会话 */
  function createSession(type: SessionType): SessionItem {
    let session: SessionItem
    if (type === 'chat') {
      const s = chatStorage.createSession('chat')
      session = { id: s.id, type: 'chat', title: s.title, preview: s.preview, messageCount: s.messageCount, lastMessageAt: s.lastMessageAt, createdAt: s.createdAt }
    } else {
      const s = treeholeStorage.createSession()
      session = { id: s.id, type: 'treehole', title: s.title, preview: s.preview, messageCount: s.messageCount, lastMessageAt: s.lastMessageAt, createdAt: s.createdAt }
    }
    currentThreadId.value = session.id
    currentType.value = type
    return session
  }

  /** 删除会话 */
  function removeSession(id: string, type: SessionType) {
    if (type === 'chat') {
      chatStorage.deleteSession(id)
    } else {
      treeholeStorage.deleteSession(id)
    }
    if (currentThreadId.value === id) {
      currentThreadId.value = null
    }
  }

  /** 获取最新（或创建）指定类型的会话 */
  function getOrCreateLatest(type: SessionType): SessionItem {
    if (type === 'chat') {
      const s = chatStorage.getOrCreateLatestSession('chat')
      currentThreadId.value = s.id
      currentType.value = 'chat'
      return { id: s.id, type: 'chat', title: s.title, preview: s.preview, messageCount: s.messageCount, lastMessageAt: s.lastMessageAt, createdAt: s.createdAt }
    }
    const s = treeholeStorage.getOrCreateLatestSession()
    currentThreadId.value = s.id
    currentType.value = 'treehole'
    return { id: s.id, type: 'treehole', title: s.title, preview: s.preview, messageCount: s.messageCount, lastMessageAt: s.lastMessageAt, createdAt: s.createdAt }
  }

  return {
    currentThreadId,
    currentType,
    chatList,
    treeholeList,
    messageList,
    switchSession,
    createSession,
    removeSession,
    getOrCreateLatest,
    getRemoteId,
    setRemoteId,
    ensureRemoteSession,
    getTreeholeRemoteId,
    setTreeholeRemoteId,
    ensureRemoteTreeholeSession,
  }
})
