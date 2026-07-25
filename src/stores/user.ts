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

  /** 更新个人信息（登录后或编辑保存时调用） */
  function updateProfile(data: { name?: string; aiName?: string; avatar?: string; phone?: string,companion_days?: number,chat_rounds?: number,diary_count?: number,collection_count?: number}) {
    if (data.name !== undefined) name.value = data.name
    if (data.aiName !== undefined) aiName.value = data.aiName
    if (data.avatar !== undefined) avatar.value = data.avatar || '🦊'
    if (data.phone !== undefined) phone.value = data.phone
  
    if (data.companion_days !== undefined) companionDays.value = data.companion_days
    if (data.chat_rounds !== undefined) chatCount.value = data.chat_rounds
    if (data.diary_count !== undefined) diaryCount.value = data.diary_count
    if (data.collection_count !== undefined) collectionCount.value = data.collection_count
  }

  /** 退出登录：清空用户态并移除 localStorage 中的凭证 */
  function logout() {
    try {
      sessionStorage.removeItem('userInfo')
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
      router.push('/login')
      ElMessage.success('退出成功')
    } catch {
      /* 忽略 localStorage 不可用的情况 */
    }
  }

  return { name, aiName, avatar, phone, companionDays, chatCount, diaryCount, collectionCount, updateProfile, logout }
})
