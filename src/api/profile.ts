/**
 * 用户与个人设置 API（F 模块）
 * 文档来源：docsFinally/api-merged.md
 */
import service from './index'

// ====== 数据模型 ======

/** F1/F2 响应中的用户资料 */
export interface UserProfileData {
  name: string
  aiName: string
  avatar: string
  phone: string
  companionDays: number
  chatRounds: number
  diaryCount: number
  collectionCount: number
  voice: string
  characterTags: string[] | string
  characterBio: string | null
  morningGreeting: string
  eveningGreeting: string
}

/** F3/F4 AI 设置 */
export interface AiSettings {
  aiName: string
  voice: string
  characterTags: string[] | string
  characterBio: string | null
  morningGreeting: string
  eveningGreeting: string
}

/** F5/F6 应用设置 */
export interface UserSettings {
  themeKey: string
  darkMode: boolean
  anonymousMode: boolean
  dailyCardPush: boolean
  goodnightReminder: boolean
  weeklyReport: boolean
  checkinReminder: boolean
}

/** 主题项 */
export interface ThemeItem {
  key: string
  name: string
  desc: string
  icon: string
  color: string
}

/** F7 数据面板 */
export interface ProfileStats {
  companionDays: number
  chatRounds: number
  diaryCount: number
  collectionCount: number
}

// ====== 接口调用 ======

/** F1. 获取个人主页 */
export function getProfile(): Promise<UserProfileData> {
  return service.get('/profile').then((res: any) => res.data)
}

/** F2. 编辑个人资料（昵称 / 头像） */
export function updateProfile(payload: {
  nickname?: string
  avatar?: string
}): Promise<{ user: any; profile: UserProfileData }> {
  return service.put('/profile', payload).then((res: any) => res.data)
}

/** F3. 获取 AI 设置 */
export function getAiSettings(): Promise<AiSettings> {
  return service.get('/profile/ai-settings').then((res: any) => res.data)
}

/** F4. 更新 AI 设置 */
export function updateAiSettings(payload: AiSettings): Promise<UserProfileData> {
  return service.put('/profile/ai-settings', payload).then((res: any) => res.data)
}

/** F5. 获取应用设置 + 可用主题 */
export function getAppSettings(): Promise<{
  userSettings: UserSettings
  availableThemes: ThemeItem[]
}> {
  return service.get('/profile/settings').then((res: any) => res.data)
}

/** F6. 更新应用设置 */
export function updateAppSettings(
  payload: Partial<UserSettings>,
): Promise<UserSettings> {
  return service.put('/profile/settings', payload).then((res: any) => res.data)
}

/** F7. 获取数据面板 */
export function getProfileStats(): Promise<ProfileStats> {
  return service.get('/profile/stats').then((res: any) => res.data)
}
