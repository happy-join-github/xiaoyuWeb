/**
 * 树洞专属 Store（treeholeStore）
 *
 * 管理树洞特有的状态：
 * - todayEmotionTags: 当日情绪标签
 * - 当前会话消息
 * - 情绪标签的 API 同步
 *
 * @see 前端方案 §三 treeholeStore
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as treeholeStorage from '../utils/treeholeStorage'
import * as treeholeApi from '../api/treehole'
import type { MoodType } from '../api/treehole'

export interface EmotionTagItem {
  id?: number
  emotion: string
  label?: string
  recordDate: string
  source: string
}

/** 情绪配置（与 mood store 保持一致） */
const EMOTION_CONFIG: Record<string, { label: string; emoji: string }> = {
  happy: { label: '开心', emoji: '😊' },
  calm: { label: '平静', emoji: '😌' },
  sad: { label: '低落', emoji: '😔' },
  anxious: { label: '焦虑', emoji: '😣' },
  irritable: { label: '烦躁', emoji: '😤' },
  tearful: { label: '想哭', emoji: '🥺' },
}

export const useTreeholeStore = defineStore('treehole', () => {
  // ====== 状态 ======
  const todayEmotionTags = ref<EmotionTagItem[]>([])
  const currentSessionId = ref<string | null>(null)
  const isLoading = ref(false)

  // ====== 计算属性 ======

  /** 当前树洞会话的消息 */
  const treeholeMessages = computed(() => {
    if (!currentSessionId.value) return []
    return treeholeStorage.getMessages(currentSessionId.value)
  })

  /** 今日情绪标签（含 emoji 和 label） */
  const todayEmotionsWithMeta = computed(() => {
    return todayEmotionTags.value.map(tag => {
      const config = EMOTION_CONFIG[tag.emotion] || { label: tag.emotion, emoji: '' }
      return { ...tag, label: config.label, emoji: config.emoji }
    })
  })

  // ====== 行为 ======

  /** 加载今日情绪标签（先本地，再 API） */
  async function loadTodayEmotion() {
    const today = getToday()
    // 先加载本地
    const localTags = treeholeStorage.getEmotionTags(today)
    todayEmotionTags.value = localTags.map(t => ({ emotion: t.emotion, recordDate: t.recordDate, source: t.source }))

    // 再尝试 API 同步
    try {
      const res: any = await treeholeApi.getTodayEmotion()
      if (res.code === 200 && res.data?.tags) {
        const apiTags: EmotionTagItem[] = res.data.tags.map((t: any) => ({
          id: t.id,
          emotion: t.emotion,
          recordDate: t.recordDate,
          source: t.source,
        }))
        todayEmotionTags.value = apiTags
        treeholeStorage.saveEmotionTags(today, apiTags.map(t => ({ emotion: t.emotion, recordDate: t.recordDate, source: t.source })))
      }
    } catch {
      // API 不可用时使用本地数据
    }
  }

  /** 记录情绪标签 */
  async function recordEmotion(sessionId: number | string, emotion: string) {
    const today = getToday()
    // 本地先记录
    treeholeStorage.addEmotionTag({ emotion, recordDate: today, source: 'manual' })

    // 更新 store
    const exists = todayEmotionTags.value.some(t => t.emotion === emotion)
    if (!exists) {
      todayEmotionTags.value.push({
        emotion,
        recordDate: today,
        source: 'manual',
      })
    }

    // API 同步
    try {
      if (typeof sessionId === 'string') {
        return // 本地 ID，跳过 API
      }
      await treeholeApi.recordEmotion(sessionId as number, emotion)
    } catch {
      // 静默
    }
  }

  /** 切换当前会话 */
  function switchSession(sessionId: string) {
    currentSessionId.value = sessionId
  }

  /** 向当前会话追加消息（含本地存储） */
  function appendMessage(sessionId: string, msg: treeholeStorage.TreeholeStoredMessage) {
    treeholeStorage.appendMessage(sessionId, msg)
  }

  /** 获取当前会话的某个消息列表副本 */
  function getMessages(sessionId: string): treeholeStorage.TreeholeStoredMessage[] {
    return treeholeStorage.getMessages(sessionId)
  }

  return {
    todayEmotionTags,
    currentSessionId,
    isLoading,
    treeholeMessages,
    todayEmotionsWithMeta,
    loadTodayEmotion,
    recordEmotion,
    switchSession,
    appendMessage,
    getMessages,
  }
})

function getToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
