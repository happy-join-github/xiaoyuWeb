import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getMoodRecords,
  getDailyRecord,
  checkinMood,
  getMoodReport,
  getMoodStreak,
  type MoodType,
  type MoodRecord,
  type MonthlyRecordsResponse,
  type WeeklyReportResponse,
  type MoodStreak,
} from '../api/mood'

// 导出 MoodType 和 MOOD_CONFIG 给组件用（兼容旧引用）
export type { MoodType, MoodRecord }

export const MOOD_CONFIG: Record<MoodType, { label: string; emoji: string; score: number; color: string }> = {
  happy: { label: '开心', emoji: '😊', score: 5, color: '#7BC97B' },
  calm: { label: '平静', emoji: '😌', score: 4, color: '#97D4A0' },
  sad: { label: '低落', emoji: '😔', score: 2, color: '#B8A0D0' },
  anxious: { label: '焦虑', emoji: '😣', score: 2, color: '#FFB085' },
  irritable: { label: '烦躁', emoji: '😡', score: 1, color: '#E88A6B' },
  tearful: { label: '想哭', emoji: '🥺', score: 1, color: '#F4A988' },
}

export const useMoodStore = defineStore('mood', () => {
  // ====== 状态 ======
  /** 当月心情记录列表 */
  const records = ref<MoodRecord[]>([])
  /** 月度统计数据 */
  const monthStats = ref<MonthlyRecordsResponse['stats'] | null>(null)
  /** 连续打卡 */
  const streak = ref<MoodStreak>({ streakDays: 0, totalDays: 0 })
  /** 周报数据 */
  const weeklyReport = ref<WeeklyReportResponse | null>(null)

  // 导航状态
  const currentYear = ref(new Date().getFullYear())
  const currentMonth = ref(new Date().getMonth() + 1)

  // ====== 计算属性 ======

  /** 当月记录数 */
  const monthCount = computed(() =>
    records.value.length
  )

  /** 当月平均分 */
  const monthAvgScore = computed(() => {
    if (!records.value.length) return 0
    const total = records.value.reduce((sum, r) => sum + (r.score || MOOD_CONFIG[r.mood]?.score || 0), 0)
    return Math.round((total / records.value.length) * 10) / 10
  })

  /** 当月情绪摘要文案（优先用后端返回，回退本地计算） */
  const monthSummary = computed(() => {
    if (monthStats.value?.summary) {
      return monthStats.value.summary
    }
    const avg = monthAvgScore.value
    if (avg >= 4) return { text: '好心情居多，像夏天的风一样温柔', emoji: '✨' }
    if (avg >= 3) return { text: '有甜有涩，都是生活', emoji: '🌊' }
    return { text: '这个月需要多一些关怀', emoji: '🌷' }
  })

  /** 连续打卡天数 */
  const streakDays = computed(() => streak.value.streakDays)

  // ====== 工具方法 ======

  function formatDate(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  function isToday(dateStr: string): boolean {
    return dateStr === formatDate(new Date())
  }

  /** 从 records 中查找指定日期的记录 */
  function getRecordByDate(dateStr: string): MoodRecord | undefined {
    return records.value.find(r => r.recordDate === dateStr)
  }

  /** 从 records 中按月筛选 */
  function getRecordsByMonth(year: number, month: number): MoodRecord[] {
    return records.value.filter(r => {
      // recordDate 格式 YYYY-MM-DD
      const [y, m] = r.recordDate.split('-')
      return Number(y) === year && Number(m) === month
    }).sort((a, b) => b.recordDate.localeCompare(a.recordDate))
  }

  // ====== 异步操作 ======

  /** 拉取月度记录 + 统计 */
  async function fetchMonthRecords(year?: number, month?: number): Promise<void> {
    const y = year ?? currentYear.value
    const m = month ?? currentMonth.value
    try {
      const data = await getMoodRecords(y, m)
      records.value = data.records || []
      monthStats.value = data.stats || null
    } catch {
      records.value = []
      monthStats.value = null
    }
  }

  /** 拉取单日记录 */
  async function fetchDailyRecord(date: string): Promise<MoodRecord | null> {
    try {
      return await getDailyRecord(date)
    } catch {
      return null
    }
  }

  /** 提交今日心情打卡 */
  async function submitCheckin(mood: MoodType, note?: string): Promise<MoodRecord | null> {
    try {
      const record = await checkinMood({ mood, note })
      // 更新本地 records（替换或追加）
      const idx = records.value.findIndex(r => r.recordDate === record.recordDate)
      if (idx >= 0) {
        records.value[idx] = record
      } else {
        records.value.push(record)
      }
      // 同时刷新 streak
      await fetchStreak()
      return record
    } catch {
      return null
    }
  }

  /** 拉取周报 */
  async function fetchReport(year?: number, week?: number): Promise<WeeklyReportResponse | null> {
    try {
      const data = await getMoodReport(year, week)
      weeklyReport.value = data
      return data
    } catch {
      weeklyReport.value = null
      return null
    }
  }

  /** 拉取连续打卡天数 */
  async function fetchStreak(): Promise<void> {
    try {
      streak.value = await getMoodStreak()
    } catch {
      streak.value = { streakDays: 0, totalDays: 0 }
    }
  }

  /** 上一月 */
  function prevMonth() {
    if (currentMonth.value === 1) {
      currentMonth.value = 12
      currentYear.value--
    } else {
      currentMonth.value--
    }
  }

  /** 下一月 */
  function nextMonth() {
    if (currentMonth.value === 12) {
      currentMonth.value = 1
      currentYear.value++
    } else {
      currentMonth.value++
    }
  }

  return {
    // 状态
    records,
    monthStats,
    streak,
    weeklyReport,
    currentYear,
    currentMonth,
    // 计算属性
    monthCount,
    monthAvgScore,
    monthSummary,
    streakDays,
    // 工具方法
    formatDate,
    isToday,
    getRecordByDate,
    getRecordsByMonth,
    // 异步操作
    fetchMonthRecords,
    fetchDailyRecord,
    submitCheckin,
    fetchReport,
    fetchStreak,
    // 导航
    prevMonth,
    nextMonth,
  }
})
