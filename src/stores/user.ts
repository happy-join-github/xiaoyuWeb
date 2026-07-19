import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const name = ref('小柚子')
  const aiName = ref('小愈')
  const avatar = ref('🦊')
  const phone = ref('')
  // 与 AI 伙伴相伴的天数
  const companionDays = ref(0)
  
  // 与 AI 伙伴相伴的日记数
  const diaryCount = ref(0)

  // 与 AI 伙伴相伴的收藏数
  const collectionCount = ref(0)

  /** 退出登录：清空用户态并移除 localStorage 中的凭证 */
  function logout() {
    name.value = ''
    aiName.value = ''
    avatar.value = ''
    companionDays.value = 0
  
    diaryCount.value = 0
    collectionCount.value = 0
    phone.value = ''
    try {
      localStorage.removeItem('userInfo')
    } catch {
      /* 忽略 localStorage 不可用的情况 */
    }
  }

  return { name, aiName, avatar, phone, companionDays, diaryCount, collectionCount, logout }
})
