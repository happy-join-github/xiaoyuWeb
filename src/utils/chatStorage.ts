/**
 * 聊聊 / 树洞 本地消息存储层
 *
 * 基于 localStorage 的会话 + 消息持久化。
 * 两个模块共用同一套存储结构，通过 type 字段区分。
 * 后续切换为真实后端时，替换此文件中的 localStorage 操作为 API 调用即可。
 */

import type { Message } from '../api/mock'

// ========== 类型定义 ==========

export interface StoredSession {
  id: string
  type: 'chat' | 'treehole'
  title: string
  preview: string
  messageCount: number
  lastMessageAt: string  // ISO
  createdAt: string      // ISO
}

// ========== 存储 Key 常量 ==========

const SESSION_INDEX_KEY = 'chat_session_index'
const MESSAGE_PREFIX = 'chat_messages_'

// ========== 会话索引 ==========

function getSessionIndex(): StoredSession[] {
  try {
    const raw = localStorage.getItem(SESSION_INDEX_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSessionIndex(sessions: StoredSession[]): void {
  localStorage.setItem(SESSION_INDEX_KEY, JSON.stringify(sessions))
}

// ========== 会话 CRUD ==========

let _idCounter = Date.now()

function nextId(): string {
  return `${++_idCounter}`
}

/** 创建新会话，返回会话对象 */
export function createSession(type: 'chat' | 'treehole'): StoredSession {
  const now = new Date().toISOString()
  const session: StoredSession = {
    id: nextId(),
    type,
    title: type === 'chat' ? '新对话' : '树洞 · ' + formatDateShort(new Date()),
    preview: '',
    messageCount: 0,
    lastMessageAt: now,
    createdAt: now,
  }
  const sessions = getSessionIndex()
  sessions.unshift(session)
  saveSessionIndex(sessions)
  // 初始化空消息列表
  localStorage.setItem(MESSAGE_PREFIX + session.id, JSON.stringify([]))
  return session
}

/** 获取所有会话，按最后消息时间倒序 */
export function getSessions(): StoredSession[] {
  return getSessionIndex()
}

/** 根据 id 获取会话 */
export function getSession(id: string): StoredSession | undefined {
  return getSessionIndex().find(s => s.id === id)
}

/** 删除会话 */
export function deleteSession(id: string): void {
  const sessions = getSessionIndex().filter(s => s.id !== id)
  saveSessionIndex(sessions)
  localStorage.removeItem(MESSAGE_PREFIX + id)
}

/** 获取某个 type 的最近一个会话，没有则创建 */
export function getOrCreateLatestSession(type: 'chat' | 'treehole'): StoredSession {
  const sessions = getSessionIndex().filter(s => s.type === type)
  if (sessions.length > 0) {
    return sessions[0]
  }
  return createSession(type)
}

// ========== 消息 CRUD ==========

/** 获取某个会话的所有消息 */
export function getMessages(sessionId: string): Message[] {
  try {
    const raw = localStorage.getItem(MESSAGE_PREFIX + sessionId)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/** 保存消息列表到指定会话 */
function saveMessages(sessionId: string, messages: Message[]): void {
  localStorage.setItem(MESSAGE_PREFIX + sessionId, JSON.stringify(messages))
}

/** 向会话追加一条消息，并更新会话索引 */
export function appendMessage(sessionId: string, msg: Message): void {
  const messages = getMessages(sessionId)
  messages.push(msg)
  saveMessages(sessionId, messages)

  // 更新会话索引
  const sessions = getSessionIndex()
  const idx = sessions.findIndex(s => s.id === sessionId)
  if (idx !== -1) {
    sessions[idx].messageCount = messages.length
    sessions[idx].preview = stripHtml(msg.content).slice(0, 50)
    sessions[idx].lastMessageAt = new Date().toISOString()
    // 首条消息自动生成标题
    if (messages.length <= 2 && msg.role === 'user') {
      sessions[idx].title = stripHtml(msg.content).slice(0, 20)
    }
    // 重新排序（最新的在第一个）
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

// ========== 工具函数 ==========

function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

function formatDateShort(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${m}/${d}`
}

/** 格式化显示时间 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')

  // 今天
  if (date.toDateString() === now.toDateString()) {
    return `${h}:${m}`
  }

  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${h}:${m}`
  }

  // 今年
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}/${date.getDate()} ${h}:${m}`
  }

  // 更早
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

/** 按日期分组标签 */
export function getDateGroupLabel(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const today = now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today) return '今天'

  if (date.toDateString() === yesterday.toDateString()) return '昨天'

  // 本周内
  const dayOfWeek = date.getDay()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  if (date >= weekStart) {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekDays[dayOfWeek]
  }

  // 更早
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`
}

/** 生成新的消息 id */
export function nextMessageId(messages: Message[]): number {
  if (messages.length === 0) return 1
  return Math.max(...messages.map(m => m.id)) + 1
}

/** 生成当前时间的 HH:mm 字符串 */
export function getTimeString(): string {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}
