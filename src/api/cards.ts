/**
 * 治愈卡片模块 API（E 模块）
 * 文档来源：docsFinally/api-merged.md §E
 * 后端路由：router/card.py
 */
import service from './index'

// ====== 数据模型 ======

export type CardSource = 'system' | 'user'
export type CardType = 'quote' | 'audio' | 'landscape' | 'user-note'

export interface CardItem {
  id: number
  source: CardSource
  type: CardType
  /** 系统卡片正文 */
  content: string
  category: string
  /** 展示标签（如 "暖心话 · No.142"） */
  date: string
  /** 样式变体（如 c-1, l-1, user-1） */
  styleClass: string
  /** 用户卡片作者 */
  author?: string
  /** 用户卡片创建日期 YYYY-MM-DD */
  createdAt?: string
  /** 背景模板 warm / calm / dream */
  bgTemplate?: string
  /** 用户卡片文字 */
  customText?: string
  /** 用户卡片配图 URL */
  customImage?: string
  isPublic?: boolean
  likes: number
  liked: boolean
}

export interface TopicItem {
  id: number
  label: string
  sub: string
  coverUrl?: string
  cardCount?: number
  /** 前端样式类，后端不返回，由前端从 id 派生 */
  class?: string
}

export interface CollectionItem {
  id: number
  name: string
  cardCount: number
  createdAt: string // YYYY-MM-DD
}

// ====== 系统卡片 E1-E3 ======

/** E1. 获取系统卡片列表 */
export function fetchSystemCards(
  page = 1,
  pageSize = 20,
  type?: string,
  category?: string,
  keyword?: string,
): Promise<{ list: CardItem[]; total: number; page: number; pageSize: number }> {
  const params: any = { page, pageSize }
  if (type) params.type = type
  if (category) params.category = category
  if (keyword) params.keyword = keyword
  return service.get('/cards/system', { params }).then((res: any) => res.data)
}

/** E2. 获取每日推荐卡片 */
export function fetchDailyCard(): Promise<CardItem> {
  return service.get('/cards/system/daily').then((res: any) => res.data)
}

/** E3. 获取单张系统卡片 */
export function fetchCardById(cardId: number): Promise<CardItem> {
  return service.get('/cards/system/item', { params: { cardId } }).then((res: any) => res.data)
}

// ====== 用户创作卡片 E4-E8 ======

/** E4. 获取用户卡片列表 */
export function fetchUserCards(
  page = 1,
  pageSize = 20,
  isPublic?: boolean,
  keyword?: string,
): Promise<{ list: CardItem[]; total: number; page: number; pageSize: number }> {
  const params: any = { page, pageSize }
  if (isPublic !== undefined) params.isPublic = isPublic
  if (keyword) params.keyword = keyword
  return service.get('/cards/user', { params }).then((res: any) => res.data)
}

/** E5. 创建用户卡片 */
export function createCard(data: {
  bgTemplate: string
  customText: string
  customImage?: string
  isPublic: boolean
}): Promise<CardItem> {
  return service.post('/cards/user', data).then((res: any) => res.data)
}

/** E6. 更新用户卡片 */
export function updateCard(
  cardId: number,
  data: {
    bgTemplate?: string
    customText?: string
    customImage?: string
    isPublic?: boolean
  },
): Promise<CardItem> {
  return service.post('/cards/user/update', data, { params: { cardId } }).then((res: any) => res.data)
}

/** E7. 删除用户卡片 */
export function deleteCard(cardId: number): Promise<void> {
  return service.get('/cards/user/delete', { params: { cardId } }).then(() => undefined)
}

/** E8. 切换卡片可见性 */
export function setCardVisibility(cardId: number, isPublic: boolean): Promise<CardItem> {
  return service
    .post('/cards/user/visibility', { isPublic }, { params: { cardId } })
    .then((res: any) => res.data)
}

// ====== 收藏 E9-E11 ======

/** E9. 获取已收藏卡片 ID 列表 */
export function fetchCollectedIds(): Promise<{ collectedIds: number[] }> {
  return service.get('/cards/collections').then((res: any) => res.data)
}

/** E10. 收藏卡片 */
export function collectCard(cardId: number): Promise<void> {
  return service.post('/cards/collect', null, { params: { cardId } }).then(() => undefined)
}

/** E11. 取消收藏 */
export function uncollectCard(cardId: number): Promise<void> {
  return service.get('/cards/uncollect', { params: { cardId } }).then(() => undefined)
}

// ====== 主题合集 E12-E13 ======

/** E12. 获取主题合集列表 */
export function fetchTopics(): Promise<{ list: TopicItem[] }> {
  return service.get('/cards/topics').then((res: any) => res.data)
}

/** E13. 获取主题合集下的卡片 */
export function fetchTopicCards(
  topicId: number,
  page = 1,
  pageSize = 20,
): Promise<{ list: CardItem[]; total: number; topic: TopicItem; page: number; pageSize: number }> {
  return service
    .get(`/cards/topics/${topicId}/cards`, { params: { page, pageSize } })
    .then((res: any) => res.data)
}

// ====== 社区广场 E14 ======

/** E14. 获取社区广场卡片 */
export function fetchCommunityCards(
  page = 1,
  pageSize = 20,
  keyword?: string,
  sortBy: string = 'latest',
): Promise<{ list: CardItem[]; total: number; page: number; pageSize: number }> {
  const params: any = { page, pageSize, sortBy }
  if (keyword) params.keyword = keyword
  return service.get('/cards/community', { params }).then((res: any) => res.data)
}

// ====== 全局搜索 E15 ======

/** E15. 全局搜索卡片 */
export function searchCards(
  keyword: string,
  page = 1,
  pageSize = 20,
  source?: string,
  type?: string,
): Promise<{ list: CardItem[]; total: number; keyword: string; page: number; pageSize: number }> {
  const params: any = { keyword, page, pageSize }
  if (source) params.source = source
  if (type) params.type = type
  return service.get('/cards/search', { params }).then((res: any) => res.data)
}

// ====== 收藏集 E16-E21 ======

/** E16. 获取收藏集列表 */
export function fetchCollections(): Promise<{ list: CollectionItem[] }> {
  return service.get('/cards/collections/list').then((res: any) => res.data)
}

/** E17. 创建收藏集 */
export function createCollection(name: string): Promise<CollectionItem> {
  return service.post('/cards/collections', { name }).then((res: any) => res.data)
}

/** E18. 更新收藏集名称 */
export function updateCollectionName(collectionId: number, name: string): Promise<CollectionItem> {
  return service
    .post('/cards/collections/update', { name }, { params: { collectionId } })
    .then((res: any) => res.data)
}

/** E19. 删除收藏集 */
export function deleteCollection(collectionId: number): Promise<void> {
  return service.get('/cards/collections/remove', { params: { collectionId } }).then(() => undefined)
}

/** E20. 添加卡片到收藏集 */
export function addCardToCollection(
  collectionId: number,
  cardId: number,
): Promise<{ id: number; collectionId: number; cardId: number; createdAt: string }> {
  return service.post(`/cards/collections/${collectionId}/cards`, { cardId }).then((res: any) => res.data)
}

/** E21. 从收藏集移除卡片 */
export function removeCardFromCollection(collectionId: number, cardId: number): Promise<void> {
  return service
    .get('/cards/collections/remove-card', { params: { collectionId, cardId } })
    .then(() => undefined)
}
