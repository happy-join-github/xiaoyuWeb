import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import router from '../router'

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

  /** 更新个人信息（登录后或编辑保存时调用） */
  function updateProfile(data: {
    name?: string; aiName?: string; avatar?: string; phone?: string;
    companionDays?: number; chatRounds?: number; diaryCount?: number; collectionCount?: number;
    voice?: string; characterTags?: string[]; characterBio?: string;
    morningGreeting?: string; eveningGreeting?: string;
  }) {
    if (data.name !== undefined) name.value = data.name
    if (data.aiName !== undefined) aiName.value = data.aiName
    if (data.avatar !== undefined) avatar.value = data.avatar || '🦊'
    if (data.phone !== undefined) phone.value = data.phone
  
    if (data.companionDays !== undefined) companionDays.value = data.companionDays
    if (data.chatRounds !== undefined) chatCount.value = data.chatRounds
    if (data.diaryCount !== undefined) diaryCount.value = data.diaryCount
    if (data.collectionCount !== undefined) collectionCount.value = data.collectionCount

    if (data.voice !== undefined) voice.value = data.voice
    if (data.characterTags !== undefined) characterTags.value = data.characterTags
    if (data.characterBio !== undefined) characterBio.value = data.characterBio
    if (data.morningGreeting !== undefined) morningGreeting.value = data.morningGreeting
    if (data.eveningGreeting !== undefined) eveningGreeting.value = data.eveningGreeting
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
      router.push('/login')
      ElMessage.success('退出成功')
    } catch {
      /* 忽略 localStorage 不可用的情况 */
    }
  }

  return { name, aiName, avatar, phone, companionDays, chatCount, diaryCount, collectionCount, voice, characterTags, characterBio, morningGreeting, eveningGreeting, updateProfile, logout }
})
