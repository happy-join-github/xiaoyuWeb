/**
 * 树洞独立本地消息存储层
 *
 * 独立于 chatStorage，使用独立的 localStorage 键名。
 * 对应后端 treehole_sessions + treehole_messages + treehole_emotion_tags。
 * 当前作为前端缓存层使用，同时 API 调用成功后同步更新本地。
 */

import type { MoodType } from '../api/treehole'

// ========== 类型定义 ==========

export interface TreeholeStoredSession {
  id: string
  title: string
  preview: string
  messageCount: number
  lastMessageAt: string  // ISO
  createdAt: string      // ISO
}

export interface TreeholeStoredMessage {
  id: number
  role: 'ai' | 'user'
  content: string
  emotionTag: string | null
  createdAt: string
}

export interface TreeholeStoredEmotionTag {
  emotion: string
  recordDate: string
  source: string
}

// ========== 存储 Key 常量（独立于 chatStorage） ==========

const SESSION_INDEX_KEY = 'treehole_session_index'
const MESSAGE_PREFIX = 'treehole_messages_'
const EMOTION_TAG_PREFIX = 'treehole_emotion_tags_'

// ========== 会话索引 ==========

function getSessionIndex(): TreeholeStoredSession[] {
  try {
    const raw = localStorage.getItem(SESSION_INDEX_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSessionIndex(sessions: TreeholeStoredSession[]): void {
  localStorage.setItem(SESSION_INDEX_KEY, JSON.stringify(sessions))
}

// ========== 会话 CRUD ==========

let _idCounter = Date.now()

function nextId(): string {
  return `${++_idCounter}`
}

/** 获取今天的 MM/dd 格式 */
function formatDateShort(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${m}/${d}`
}

/** 创建新树洞会话，返回会话对象 */
export function createSession(): TreeholeStoredSession {
  const now = new Date().toISOString()
  const session: TreeholeStoredSession = {
    id: nextId(),
    title: '树洞 · ' + formatDateShort(new Date()),
    preview: '',
    messageCount: 0,
    lastMessageAt: now,
    createdAt: now,
  }
  const sessions = getSessionIndex()
  sessions.unshift(session)
  saveSessionIndex(sessions)
  localStorage.setItem(MESSAGE_PREFIX + session.id, JSON.stringify([]))
  return session
}

/** 获取所有树洞会话，按最后消息时间倒序 */
export function getSessions(): TreeholeStoredSession[] {
  return getSessionIndex()
}

/** 根据 id 获取树洞会话 */
export function getSession(id: string): TreeholeStoredSession | undefined {
  return getSessionIndex().find(s => s.id === id)
}

/** 删除树洞会话及消息 */
export function deleteSession(id: string): void {
  const sessions = getSessionIndex().filter(s => s.id !== id)
  saveSessionIndex(sessions)
  localStorage.removeItem(MESSAGE_PREFIX + id)
}

/** 获取最近的树洞会话，没有则创建 */
export function getOrCreateLatestSession(): TreeholeStoredSession {
  const sessions = getSessionIndex()
  if (sessions.length > 0) {
    return sessions[0]
  }
  return createSession()
}

// ========== 消息 CRUD ==========

/** 获取某个树洞会话的所有消息 */
export function getMessages(sessionId: string): TreeholeStoredMessage[] {
  try {
    const raw = localStorage.getItem(MESSAGE_PREFIX + sessionId)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveMessages(sessionId: string, messages: TreeholeStoredMessage[]): void {
  localStorage.setItem(MESSAGE_PREFIX + sessionId, JSON.stringify(messages))
}

/** 向树洞会话追加一条消息，并更新会话索引 */
export function appendMessage(sessionId: string, msg: TreeholeStoredMessage): void {
  const messages = getMessages(sessionId)
  messages.push(msg)
  saveMessages(sessionId, messages)

  const sessions = getSessionIndex()
  const idx = sessions.findIndex(s => s.id === sessionId)
  if (idx !== -1) {
    sessions[idx].messageCount = messages.length
    sessions[idx].preview = stripHtml(msg.content).slice(0, 50)
    sessions[idx].lastMessageAt = new Date().toISOString()
    if (messages.length <= 2 && msg.role === 'user') {
      sessions[idx].title = stripHtml(msg.content).slice(0, 20)
    }
    sessions.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    saveSessionIndex(sessions)
  }
}

/** 更新会话标题 */
export function updateSessionTitle(sessionId: string, title: string): void {
  const sessions = getSessionIndex()
  const idx = sessions.findIndex(s => s.id === sessionId)
  if (idx !== -1) {
    sessions[idx].title = title
    saveSessionIndex(sessions)
  }
}

// ========== 情绪标签存储 ==========

/** 获取某日的情绪标签 */
export function getEmotionTags(date: string): TreeholeStoredEmotionTag[] {
  try {
    const raw = localStorage.getItem(EMOTION_TAG_PREFIX + date)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/** 保存某日的情绪标签 */
export function saveEmotionTags(date: string, tags: TreeholeStoredEmotionTag[]): void {
  localStorage.setItem(EMOTION_TAG_PREFIX + date, JSON.stringify(tags))
}

/** 添加一条情绪标签（每人每天每种情绪仅一条） */
export function addEmotionTag(tag: TreeholeStoredEmotionTag): void {
  const tags = getEmotionTags(tag.recordDate)
  const exists = tags.some(t => t.emotion === tag.emotion)
  if (!exists) {
    tags.push(tag)
    saveEmotionTags(tag.recordDate, tags)
  }
}

// ========== 工具函数 ==========

function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

/** 生成新的消息 id */
export function nextMessageId(messages: TreeholeStoredMessage[]): number {
  if (messages.length === 0) return 1
  return Math.max(...messages.map(m => m.id)) + 1
}

/** 生成当前时间的 ISO 字符串 */
export function getISOTime(): string {
  return new Date().toISOString()
}

/** 格式化显示时间 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')

  if (date.toDateString() === now.toDateString()) {
    return `${h}:${m}`
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${h}:${m}`
  }

  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}/${date.getDate()} ${h}:${m}`
  }

  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

/** 按日期分组标签 */
export function getDateGroupLabel(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()

  if (date.toDateString() === now.toDateString()) return '今天'

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return '昨天'

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  if (date >= weekStart) {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekDays[date.getDay()]
  }

  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`
}
