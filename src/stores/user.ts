import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import router from '../router'
import {
  getProfile,
  getAiSettings,
  getAppSettings,
  updateAppSettings,
  getProfileStats,
  type UserProfileData,
  type AiSettings,
  type UserSettings,
  type ThemeItem,
  type ProfileStats,
} from '../api/profile'

/** 应用设置默认值 */
const DEFAULT_SETTINGS: UserSettings = {
  themeKey: 'morning',
  darkMode: false,
  anonymousMode: true,
  dailyCardPush: true,
  goodnightReminder: true,
  weeklyReport: true,
  checkinReminder: false,
}

/** 5 套主题的兜底列表（接口失败时使用） */
const FALLBACK_THEMES: ThemeItem[] = [
  { key: 'morning', name: '晨光', desc: '金色晨曦 · 温暖治愈', icon: '🌅', color: '#FF9800' },
  { key: 'forest', name: '森语', desc: '薄荷森林 · 自然疗愈', icon: '🌿', color: '#5CA050' },
  { key: 'flower', name: '花信', desc: '樱花和风 · 温柔浪漫', icon: '🌸', color: '#E06080' },
  { key: 'moon', name: '月汐', desc: '深蓝月色 · 平静安宁', icon: '🌙', color: '#5880B8' },
  { key: 'tea', name: '暖茶', desc: '焦糖暖意 · 温润醇厚', icon: '🍵', color: '#B89060' },
]

export const useUserStore = defineStore('user', () => {
  const name = ref('小柚子')
  const aiName = ref('小愈')
  const avatar = ref('🦊')
  const phone = ref('')
  // 与 AI 伙伴相伴的天数
  const companionDays = ref(14)
  // 聊天轮次
  const chatCount = ref(86)
  // 日记数
  const diaryCount = ref(14)
  // 收藏卡片数
  const collectionCount = ref(12)

  // AI 设置
  const voice = ref('温柔女声')
  const characterTags = ref<string[]>(['聆听者'])
  const characterBio = ref('')
  const morningGreeting = ref('08:00')
  const eveningGreeting = ref('22:00')

  // 应用设置
  const settings = ref<UserSettings>({ ...DEFAULT_SETTINGS })
  const availableThemes = ref<ThemeItem[]>([...FALLBACK_THEMES])

  /** 根据接口数据填充本地资料字段（缺失字段保持现状；data 为空时直接返回） */
  function applyProfileData(data: Partial<UserProfileData> | null | undefined) {
    if (!data) return
    if (data.name !== undefined) name.value = data.name
    if (data.aiName !== undefined) aiName.value = data.aiName
    if (data.avatar !== undefined) avatar.value = data.avatar || '🦊'
    if (data.phone !== undefined) phone.value = data.phone
    if (data.companionDays !== undefined) companionDays.value = data.companionDays
    if (data.chatRounds !== undefined) chatCount.value = data.chatRounds
    if (data.diaryCount !== undefined) diaryCount.value = data.diaryCount
    if (data.collectionCount !== undefined) collectionCount.value = data.collectionCount
    if (data.voice !== undefined) voice.value = data.voice
    if (data.characterTags !== undefined) characterTags.value = normalizeTags(data.characterTags)
    if (data.characterBio !== undefined) characterBio.value = data.characterBio || ''
    if (data.morningGreeting !== undefined) morningGreeting.value = data.morningGreeting
    if (data.eveningGreeting !== undefined) eveningGreeting.value = data.eveningGreeting
  }

  /** 根据接口数据填充 AI 设置 */
  function applyAiSettings(data: Partial<AiSettings> | null | undefined) {
    if (!data) return
    if (data.aiName !== undefined) aiName.value = data.aiName
    if (data.voice !== undefined) voice.value = data.voice
    if (data.characterTags !== undefined) characterTags.value = normalizeTags(data.characterTags)
    if (data.characterBio !== undefined) characterBio.value = data.characterBio || ''
    if (data.morningGreeting !== undefined) morningGreeting.value = data.morningGreeting
    if (data.eveningGreeting !== undefined) eveningGreeting.value = data.eveningGreeting
  }

  /**
   * 归一化角色标签：兼容数组 / JSON 字符串（如 "[]" 或 '["a","b"]'）/ 逗号分隔字符串
   */
  function normalizeTags(raw: unknown): string[] {
    if (Array.isArray(raw)) {
      return raw.filter((v): v is string => typeof v === 'string' && v.length > 0)
    }
    if (typeof raw === 'string') {
      const trimmed = raw.trim()
      if (!trimmed || trimmed === '[]') return []
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed)
          if (Array.isArray(parsed)) {
            return parsed.filter((v): v is string => typeof v === 'string' && v.length > 0)
          }
        } catch {
          /* fall through to split */
        }
      }
      return trimmed.split(/[,，、\s]+/).filter(Boolean)
    }
    return []
  }

  /** 根据接口数据填充应用设置 */
  function applyAppSettings(data: Partial<UserSettings> | null | undefined) {
    if (!data) return
    settings.value = { ...settings.value, ...data }
  }

  /** 拉取 /api/profile 并同步到 store */
  async function loadProfile(): Promise<UserProfileData | null> {
    try {
      const data = await getProfile()
      applyProfileData(data)
      return data
    } catch {
      return null
    }
  }

  /** 拉取 /api/profile/ai-settings 并同步到 store */
  async function loadAiSettings(): Promise<AiSettings | null> {
    try {
      const data = await getAiSettings()
      applyAiSettings(data)
      return data
    } catch {
      return null
    }
  }

  /** 拉取 /api/profile/settings 并同步到 store */
  async function loadAppSettings(): Promise<{
    userSettings: UserSettings
    availableThemes: ThemeItem[]
  } | null> {
    try {
      const data = await getAppSettings()
      if (!data) return null
      applyAppSettings(data.userSettings)
      if (data.availableThemes?.length) {
        availableThemes.value = data.availableThemes
      }
      return data
    } catch {
      return null
    }
  }

  /** 拉取 /api/profile/stats 并同步到 store */
  async function loadStats(): Promise<ProfileStats | null> {
    try {
      const data = await getProfileStats()
      applyProfileData(data)
      return data
    } catch {
      return null
    }
  }

  /** 保存应用设置到后端 */
  async function saveAppSettings(
    payload: Partial<UserSettings>,
  ): Promise<UserSettings | null> {
    try {
      const data = await updateAppSettings(payload)
      applyAppSettings(data)
      return data
    } catch {
      return null
    }
  }

  /** 更新个人信息（兼容旧调用，内部走本地合并） */
  function updateProfile(data: Partial<UserProfileData>) {
    applyProfileData(data)
  }

  /** 退出登录：清空用户态并移除 localStorage 中的凭证 */
  function logout() {
    try {
      sessionStorage.removeItem('userInfo')
      localStorage.removeItem('theme')
      // 重置 store 数据到默认值
      name.value = ''
      aiName.value = '小愈'
      avatar.value = '🦊'
      phone.value = ''
      companionDays.value = 0
      chatCount.value = 0
      diaryCount.value = 0
      collectionCount.value = 0
      voice.value = '温柔女声'
      characterTags.value = ['聆听者']
      characterBio.value = ''
      morningGreeting.value = '08:00'
      eveningGreeting.value = '22:00'
      settings.value = { ...DEFAULT_SETTINGS }
      availableThemes.value = [...FALLBACK_THEMES]
      router.push('/login')
      ElMessage.success('退出成功')
    } catch {
      /* 忽略 localStorage 不可用的情况 */
    }
  }

  return {
    // 基础资料
    name, aiName, avatar, phone,
    companionDays, chatCount, diaryCount, collectionCount,
    // AI 设置
    voice, characterTags, characterBio, morningGreeting, eveningGreeting,
    // 应用设置
    settings, availableThemes,
    // 方法
    updateProfile, applyProfileData, applyAiSettings, applyAppSettings,
    loadProfile, loadAiSettings, loadAppSettings, loadStats, saveAppSettings,
    logout,
  }
})
