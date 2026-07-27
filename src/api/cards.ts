/**
 * 卡片 API
 * 当前使用 Mock 数据，后续可切换为真实后端接口
 */
import { mockCards, mockUserCards, mockCommunityCards, mockTopics, type CardItem, type TopicItem } from './mock'

// 模拟网络延迟
function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 获取系统卡片列表（平台内容） */
export async function fetchSystemCards(page = 1, pageSize = 10): Promise<{ list: CardItem[]; total: number }> {
  await delay(150)
  const start = (page - 1) * pageSize
  const list = mockCards.slice(start, start + pageSize)
  return { list, total: mockCards.length }
}

/** 获取用户自己的卡片列表（手账） */
export async function fetchUserCards(): Promise<CardItem[]> {
  await delay()
  return [...mockUserCards]
}

/** 获取单张卡片详情 */
export async function fetchCardById(id: number): Promise<CardItem | undefined> {
  await delay(50)
  const all = [...mockCards, ...mockUserCards, ...mockCommunityCards]
  return all.find((c) => c.id === id)
}

/** 创建用户卡片 */
export async function createCard(data: {
  bgTemplate: string
  customText: string
  customImage?: string
  isPublic: boolean
}): Promise<CardItem> {
  await delay(150)
  const newCard: CardItem = {
    id: Date.now(), // 临时用时间戳作为 ID
    source: 'user',
    type: 'user-note',
    content: '',
    category: '我的创作',
    likes: 0,
    liked: false,
    date: '',
    styleClass: `user-${(mockUserCards.length % 3) + 1}`,
    author: '小柚子',
    createdAt: new Date().toISOString().slice(0, 10),
    bgTemplate: data.bgTemplate,
    customText: data.customText,
    customImage: data.customImage,
    isPublic: data.isPublic,
  }
  mockUserCards.unshift(newCard)
  return newCard
}

/** 更新用户卡片 */
export async function updateCard(id: number, data: Partial<CardItem>): Promise<CardItem | undefined> {
  await delay(100)
  const idx = mockUserCards.findIndex((c) => c.id === id)
  if (idx === -1) return undefined
  mockUserCards[idx] = { ...mockUserCards[idx], ...data }
  return mockUserCards[idx]
}

/** 删除用户卡片 */
export async function deleteCard(id: number): Promise<boolean> {
  await delay(100)
  const idx = mockUserCards.findIndex((c) => c.id === id)
  if (idx === -1) return false
  mockUserCards.splice(idx, 1)
  return true
}

/** 获取社区广场卡片（其他用户公开的卡片） */
export async function fetchCommunityCards(): Promise<CardItem[]> {
  await delay(150)
  return [...mockCommunityCards]
}

/** 获取主题合集 */
export async function fetchTopics(): Promise<TopicItem[]> {
  await delay()
  return [...mockTopics]
}

/** 获取单个主题详情 */
export async function fetchTopicById(id: number): Promise<TopicItem | undefined> {
  await delay(50)
  return mockTopics.find((t) => t.id === id)
}

/** 获取主题下的卡片列表 */
export async function fetchCardsByTopicId(topicId: number): Promise<CardItem[]> {
  await delay(100)
  const topic = mockTopics.find((t) => t.id === topicId)
  if (!topic) return []
  return mockCards.filter((c) => topic.cardIds.includes(c.id))
}
