import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'
import {
  fetchSystemCards,
  fetchUserCards,
  fetchCommunityCards,
  fetchTopics,
  fetchTopicCards,
  fetchCardById as apiFetchCardById,
  createCard as apiCreateCard,
  updateCard as apiUpdateCard,
  deleteCard as apiDeleteCard,
  fetchDailyCard,
  fetchCollectedIds,
  collectCard as apiCollectCard,
  uncollectCard as apiUncollectCard,
  fetchCollections as apiFetchCollections,
  createCollection as apiCreateCollection,
  deleteCollection as apiDeleteCollection,
  addCardToCollection as apiAddCardToCollection,
  removeCardFromCollection as apiRemoveCardFromCollection,
  type CardItem,
  type TopicItem,
  type CollectionItem,
} from '../api/cards'

const PAGE_SIZE = 10

export type CardsTab = 'recommend' | 'my-cards' | 'warm' | 'audio' | 'scene' | 'community'

/** 收藏集（本地扩展：cardIds 为运行时追踪，不来自后端） */
export interface Collection extends CollectionItem {
  cardIds: number[]
}

export const TAB_CONFIG: { key: CardsTab; label: string }[] = [
  { key: 'recommend', label: '今日推荐' },
  { key: 'warm', label: '暖心话' },
  { key: 'scene', label: '风景' },
  { key: 'audio', label: '声音' },
  { key: 'my-cards', label: '我的创作' },
  { key: 'community', label: '广场' },
]

export const useCardStore = defineStore('cards', () => {
  // ====== 数据 ======
  const systemCards = ref<CardItem[]>([])
  const userCards = ref<CardItem[]>([])
  const communityCards = ref<CardItem[]>([])
  const topics = ref<TopicItem[]>([])
  const activeTab = ref<CardsTab>('recommend')
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const page = ref(1)
  const total = ref(0)

  // 收藏集（本地扩展 cardIds 数组，由 UI 操作维护）
  const collections = ref<Collection[]>([])

  // 已收藏的卡片 ID 集合
  const collectedIds = ref<Set<number>>(new Set())

  /** E2 每日推荐卡片（由 fetchAllCards 调用时填充） */
  const dailyCard = ref<CardItem | null>(null)

  // ====== 计算属性 ======
  const hasMore = computed(() => systemCards.value.length < total.value)

  /** 搜索关键字 */
  const searchQuery_lower = computed(() => searchQuery.value.toLowerCase().trim())

  /** 搜索筛选后的卡片 */
  const searchedCards = computed(() => {
    const q = searchQuery_lower.value
    if (!q) return displayCards.value
    return displayCards.value.filter((card) => {
      const text = (card.content || card.customText || '') + (card.author || '')
      return text.toLowerCase().includes(q)
    })
  })

  /** 根据 activeTab 筛选显示卡片 */
  const displayCards = computed(() => {
    const tab = activeTab.value
    switch (tab) {
      case 'recommend':
        return systemCards.value
      case 'my-cards':
        return userCards.value
      case 'warm':
        return systemCards.value.filter((c) => c.type === 'quote')
      case 'audio':
        return systemCards.value.filter((c) => c.type === 'audio')
      case 'scene':
        return systemCards.value.filter((c) => c.type === 'landscape')
      case 'community':
        return communityCards.value
      default:
        return systemCards.value
    }
  })

  /** 今日推荐：优先使用 E2 接口的每日推荐，兜底从本地选 */
  const todayRecommend = computed(() => {
    if (dailyCard.value) return dailyCard.value
    const cards = systemCards.value
    if (!cards.length) return null
    const dayOfYear = getDayOfYear(new Date())
    return cards[dayOfYear % cards.length]
  })

  /** 我的创作数量 */
  const userCardCount = computed(() => userCards.value.length)

  /** 收藏卡片数（同步到 userStore） */
  const collectedCount = computed(() => collectedIds.value.size)

  // ====== 操作 ======

  /** 拉取全部卡片数据（首次加载） */
  async function fetchAllCards() {
    loading.value = true
    error.value = null
    page.value = 1
    try {
      const [sys, usr, com, tpc] = await Promise.all([
        fetchSystemCards(1, PAGE_SIZE),
        fetchUserCards(1, PAGE_SIZE),
        fetchCommunityCards(1, PAGE_SIZE),
        fetchTopics(),
      ])
      systemCards.value = sys.list
      total.value = sys.total
      userCards.value = usr.list
      communityCards.value = com.list
      topics.value = tpc.list.map((t) => ({ ...t, class: `t-${t.id}` }))

      // 单独获取 E2 每日推荐（包含正确的 date 标签）
      try {
        dailyCard.value = await fetchDailyCard()
      } catch {
        // 后端暂不可用时静默，兜底由 todayRecommend 从 systemCards 选取
      }

      // 加载已收藏 ID
      try {
        const res = await fetchCollectedIds()
        collectedIds.value = new Set(res.collectedIds)
      } catch {
        // 未登录等情况静默失败
      }

      // 同步收藏数到 userStore
      const userStore = useUserStore()
      userStore.collectionCount = collectedCount.value
    } catch (e) {
      error.value = '卡片加载失败，请稍后重试'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  /** 加载更多系统卡片（分页） */
  async function loadMoreCards() {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    try {
      const nextPage = page.value + 1
      const res = await fetchSystemCards(nextPage, PAGE_SIZE)
      systemCards.value = [...systemCards.value, ...res.list]
      page.value = nextPage
    } catch (e) {
      console.error('加载更多失败', e)
    } finally {
      loadingMore.value = false
    }
  }

  /** 获取单张卡片详情（系统卡片走 E3，用户卡片本地找） */
  async function getCardById(id: number): Promise<CardItem | null> {
    const local = [...systemCards.value, ...userCards.value, ...communityCards.value].find((c) => c.id === id)
    if (local) return local
    try {
      const card = await apiFetchCardById(id)
      return card ?? null
    } catch {
      return null
    }
  }

  /** 收藏/取消收藏 */
  async function toggleCollect(id: number) {
    const set = collectedIds.value
    const isCollecting = !set.has(id)

    try {
      if (isCollecting) {
        await apiCollectCard(id)
        set.add(id)
      } else {
        await apiUncollectCard(id)
        set.delete(id)
      }
    } catch {
      // 请求失败时回滚 UI 不生效
      return
    }

    // 同步卡片自身的 liked 状态
    const allCards = [...systemCards.value, ...userCards.value, ...communityCards.value]
    const card = allCards.find((c) => c.id === id)
    if (card) {
      card.liked = set.has(id)
      card.likes += card.liked ? 1 : -1
    }
    // 更新 userStore 计数
    const userStore = useUserStore()
    userStore.collectionCount = collectedCount.value
  }

  /** 检查是否已收藏 */
  function isCollected(id: number): boolean {
    return collectedIds.value.has(id)
  }

  /** 创建用户卡片 */
  async function createUserCard(data: {
    bgTemplate: string
    customText: string
    customImage?: string
    isPublic: boolean
  }): Promise<CardItem> {
    const card = await apiCreateCard(data)
    userCards.value.unshift(card)
    return card
  }

  /** 更新用户卡片 */
  async function updateUserCard(id: number, data: Record<string, any>): Promise<CardItem | null> {
    try {
      const updated = await apiUpdateCard(id, data)
      const idx = userCards.value.findIndex((c) => c.id === id)
      if (idx !== -1) userCards.value[idx] = updated
      return updated
    } catch {
      return null
    }
  }

  /** 删除用户卡片 */
  async function removeUserCard(id: number): Promise<boolean> {
    try {
      await apiDeleteCard(id)
      userCards.value = userCards.value.filter((c) => c.id !== id)
      collectedIds.value.delete(id)
      return true
    } catch {
      return false
    }
  }

  /** 获取主题下的卡片列表 */
  async function fetchCardsByTopicId(topicId: number): Promise<CardItem[]> {
    try {
      const res = await fetchTopicCards(topicId)
      return res.list
    } catch {
      return []
    }
  }

  /** 切换 Tab */
  function setActiveTab(tab: CardsTab) {
    activeTab.value = tab
  }

  // ====== 收藏集管理（E16-E21） ======

  /** 从后端加载收藏集列表 */
  async function loadCollections() {
    try {
      const res = await apiFetchCollections()
      collections.value = res.list.map((c) => ({
        ...c,
        cardIds: [], // cardIds 由运行时维护
      }))
    } catch {
      // 静默失败
    }
  }

  /** 创建收藏集 */
  async function createCollection(name: string): Promise<Collection> {
    const item = await apiCreateCollection(name)
    const col: Collection = {
      ...item,
      cardIds: [],
    }
    collections.value.unshift(col)
    return col
  }

  /** 删除收藏集 */
  async function deleteCollection(id: number) {
    await apiDeleteCollection(id)
    collections.value = collections.value.filter((c) => c.id !== id)
  }

  /** 添加卡片到收藏集 */
  async function addCardToCollection(collectionId: number, cardId: number) {
    await apiAddCardToCollection(collectionId, cardId)
    const col = collections.value.find((c) => c.id === collectionId)
    if (col) {
      if (!col.cardIds.includes(cardId)) {
        col.cardIds.push(cardId)
      }
      col.cardCount++
    }
  }

  /** 从收藏集移除卡片 */
  async function removeCardFromCollection(collectionId: number, cardId: number) {
    await apiRemoveCardFromCollection(collectionId, cardId)
    const col = collections.value.find((c) => c.id === collectionId)
    if (col) {
      col.cardIds = col.cardIds.filter((id) => id !== cardId)
      col.cardCount = Math.max(0, col.cardCount - 1)
    }
  }

  /** 获取包含指定卡片的收藏集 */
  function getCollectionsByCard(cardId: number): Collection[] {
    return collections.value.filter((c) => c.cardIds.includes(cardId))
  }

  return {
    // 状态
    systemCards,
    userCards,
    communityCards,
    topics,
    activeTab,
    loading,
    loadingMore,
    error,
    searchQuery,
    collectedIds,
    dailyCard,
    collections,
    page,
    total,
    // 计算
    displayCards,
    searchedCards,
    todayRecommend,
    hasMore,
    userCardCount,
    collectedCount,
    // 操作
    fetchAllCards,
    loadMoreCards,
    getCardById,
    toggleCollect,
    isCollected,
    createUserCard,
    updateUserCard,
    removeUserCard,
    fetchCardsByTopicId,
    setActiveTab,
    // 收藏集
    loadCollections,
    createCollection,
    deleteCollection,
    addCardToCollection,
    removeCardFromCollection,
    getCollectionsByCard,
  }
})

/** 获取今天是今年的第几天（用于每日伪随机） */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}
