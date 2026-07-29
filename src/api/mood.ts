/**
 * 心情记录模块 API（D 模块）
 * 文档来源：docsFinally/api-merged.md §D
 */
import service from './index'

// ====== 数据模型 ======

export type MoodType = 'happy' | 'calm' | 'sad' | 'anxious' | 'irritable' | 'tearful'

export interface MoodConfig {
  mood: MoodType
  label: string
  emoji: string
  score: number
  color: string
}

export interface MoodRecord {
  id: number
  userId?: number
  mood: MoodType
  score: number
  note: string | null
  recordDate: string    // YYYY-MM-DD
  keywords: string[] | null
  createdAt: string     // ISO datetime
}

export interface MonthlyRecordsResponse {
  records: MoodRecord[]
  stats: {
    monthCount: number
    avgScore: number
    summary: {
      text: string
      emoji: string
    }
    streakDays: number
  }
}

export interface WeeklyReportResponse {
  report: {
    yearWeek: string
    weekRange: string | null
    recordCount: number
    dominantMood: string | null
    avgScore: number | null
    summaryText: string | null
    keywords: string[] | null
  }
  dailyMoods: {
    label: string
    mood: string | null
  }[]
}

export interface MoodStreak {
  streakDays: number
  totalDays: number
}

// ====== 接口调用 ======

/** D1. 获取情绪配置列表 */
export function getMoodConfig(): Promise<{ configs: MoodConfig[] }> {
  return service.get('/mood/config').then((res: any) => res.data)
}

/** D2. 获取月度心情记录 */
export function getMoodRecords(year: number, month: number): Promise<MonthlyRecordsResponse> {
  return service.get('/mood/records', { params: { year, month } }).then((res: any) => res.data)
}

/** D3. 获取单日心情记录 */
export function getDailyRecord(date: string): Promise<MoodRecord | null> {
  return service.get('/mood/records/daily', { params: { date } }).then((res: any) => res.data)
}

/** D4. 记录/更新今日心情 */
export function checkinMood(payload: {
  mood: MoodType
  note?: string
}): Promise<MoodRecord> {
  return service.post('/mood/checkin', payload).then((res: any) => res.data)
}

/** D5. 获取周报 */
export function getMoodReport(year?: number, week?: number): Promise<WeeklyReportResponse> {
  return service.get('/mood/report', { params: { year, week } }).then((res: any) => res.data)
}

/** D6. 获取连续打卡天数 */
export function getMoodStreak(): Promise<MoodStreak> {
  return service.get('/mood/streak').then((res: any) => res.data)
}
