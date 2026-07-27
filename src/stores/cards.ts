import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'
import {
  fetchSystemCards,
  fetchUserCards,
  fetchCardById,
  createCard,
  updateCard,
  deleteCard,
  fetchTopics,
  fetchCommunityCards,
  type CardItem,
  type TopicItem,
} from '../api/cards'

const PAGE_SIZE = 10

export type CardsTab = 'recommend' | 'my-cards' | 'warm' | 'audio' | 'scene' | 'community'

export interface Collection {
  id: number
  name: string
  cardIds: number[]
  createdAt: string
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

  // 收藏集：已收藏/点赞的卡片 ID 集合
  const collectedIds = ref<Set<number>>(new Set())

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

  /** 今日推荐：取系统卡片第一条，每日可做伪随机 */
  const todayRecommend = computed(() => {
    const cards = systemCards.value
    if (!cards.length) return null
    // 用日期做种子，每天推荐不同卡片
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
        fetchUserCards(),
        fetchCommunityCards(),
        fetchTopics(),
      ])
      systemCards.value = sys.list
      total.value = sys.total
      userCards.value = usr
      communityCards.value = com
      topics.value = tpc

      // 初始化已收藏状态
      const allCards = [...sys.list, ...usr, ...com]
      allCards.forEach((c) => {
        if (c.liked) collectedIds.value.add(c.id)
      })

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

  /** 加载更多卡片（分页） */
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

  /** 获取单张卡片（含详情页） */
  async function getCardById(id: number): Promise<CardItem | null> {
    const card = await fetchCardById(id)
    return card ?? null
  }

  /** 切换收藏/取消收藏 */
  function toggleCollect(id: number) {
    const set = collectedIds.value
    if (set.has(id)) {
      set.delete(id)
    } else {
      set.add(id)
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
    const card = await createCard(data)
    userCards.value.unshift(card)
    return card
  }

  /** 更新用户卡片 */
  async function updateUserCard(id: number, data: Partial<CardItem>): Promise<CardItem | null> {
    const updated = await updateCard(id, data)
    if (!updated) return null
    const idx = userCards.value.findIndex((c) => c.id === id)
    if (idx !== -1) userCards.value[idx] = updated
    return updated
  }

  /** 删除用户卡片 */
  async function removeUserCard(id: number): Promise<boolean> {
    const ok = await deleteCard(id)
    if (ok) {
      userCards.value = userCards.value.filter((c) => c.id !== id)
      collectedIds.value.delete(id)
    }
    return ok
  }

  /** 切换 Tab */
  function setActiveTab(tab: CardsTab) {
    activeTab.value = tab
  }

  // ====== 收藏集管理 ======
  const collections = ref<Collection[]>([])
  let collectionIdCounter = 1

  function createCollection(name: string): Collection {
    const col: Collection = {
      id: collectionIdCounter++,
      name,
      cardIds: [],
      createdAt: new Date().toISOString().slice(0, 10),
    }
    collections.value.push(col)
    return col
  }

  function deleteCollection(id: number) {
    collections.value = collections.value.filter((c) => c.id !== id)
  }

  function addCardToCollection(collectionId: number, cardId: number) {
    const col = collections.value.find((c) => c.id === collectionId)
    if (col && !col.cardIds.includes(cardId)) {
      col.cardIds.push(cardId)
    }
  }

  function removeCardFromCollection(collectionId: number, cardId: number) {
    const col = collections.value.find((c) => c.id === collectionId)
    if (col) {
      col.cardIds = col.cardIds.filter((id) => id !== cardId)
    }
  }

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
    setActiveTab,
    // 收藏集
    collections,
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
