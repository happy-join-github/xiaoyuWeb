import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type MoodType = 'happy' | 'calm' | 'sad' | 'anxious' | 'irritable' | 'tearful'

export interface MoodRecord {
  date: string
  mood: MoodType
  note: string
}

export const MOOD_CONFIG: Record<MoodType, { label: string; emoji: string; score: number; color: string }> = {
  happy: { label: '开心', emoji: '😊', score: 5, color: '#7BC97B' },
  calm: { label: '平静', emoji: '😌', score: 4, color: '#97D4A0' },
  sad: { label: '低落', emoji: '😔', score: 2, color: '#B8A0D0' },
  anxious: { label: '焦虑', emoji: '😣', score: 2, color: '#FFB085' },
  irritable: { label: '烦躁', emoji: '😡', score: 1, color: '#E88A6B' },
  tearful: { label: '想哭', emoji: '🥺', score: 1, color: '#F4A988' },
}

const INITIAL_RECORDS: MoodRecord[] = [
  { date: '2026-07-13', mood: 'calm', note: '今天心情不错，和朋友聊了天' },
  { date: '2026-07-14', mood: 'sad', note: '工作有点累' },
  { date: '2026-07-15', mood: 'anxious', note: '项目延期了，很焦虑' },
  { date: '2026-07-16', mood: 'calm', note: '问题解决了，松了口气' },
  { date: '2026-07-17', mood: 'happy', note: '周末去公园散步了' },
  { date: '2026-07-18', mood: 'sad', note: '有点无聊' },
  { date: '2026-07-19', mood: 'calm', note: '新的一周开始了' },
  { date: '2026-07-20', mood: 'happy', note: '今天天气很好，出门拍了照片 📷' },
  { date: '2026-07-21', mood: 'happy', note: '约了朋友吃饭，聊得很开心' },
  { date: '2026-07-22', mood: 'calm', note: '安静地看了一本书' },
  { date: '2026-07-23', mood: 'irritable', note: '被莫名其妙的事情惹到了' },
  { date: '2026-07-24', mood: 'calm', note: '整理了一下房间，心情变好了' },
  { date: '2026-07-25', mood: 'happy', note: '收到了一束花 💐' },
  { date: '2026-07-26', mood: 'happy', note: '今天做了顿好吃的犒劳自己 🍳' },
]

export const useMoodStore = defineStore('mood', () => {
  const records = ref<MoodRecord[]>(INITIAL_RECORDS)

  const currentYear = ref(2026)
  const currentMonth = ref(7)

  /** 当月记录数 */
  const monthCount = computed(() =>
    records.value.filter(r => {
      const [y, m] = r.date.split('-')
      return Number(y) === currentYear.value && Number(m) === currentMonth.value
    }).length
  )

  /** 当月平均分 */
  const monthAvgScore = computed(() => {
    const monthRecords = records.value.filter(r => {
      const [y, m] = r.date.split('-')
      return Number(y) === currentYear.value && Number(m) === currentMonth.value
    })
    if (!monthRecords.length) return 0
    const total = monthRecords.reduce((sum, r) => sum + MOOD_CONFIG[r.mood].score, 0)
    return Math.round((total / monthRecords.length) * 10) / 10
  })

  /** 当月情绪摘要文案 */
  const monthSummary = computed(() => {
    const avg = monthAvgScore.value
    if (avg >= 4) return { text: '好心情居多，像夏天的风一样温柔', emoji: '✨' }
    if (avg >= 3) return { text: '有甜有涩，都是生活', emoji: '🌊' }
    return { text: '这个月需要多一些关怀', emoji: '🌷' }
  })

  /** 连续打卡天数（计算到当天） */
  const streakDays = computed(() => {
    const today = new Date()
    let count = 0
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = formatDate(d)
      if (records.value.some(r => r.date === dateStr)) {
        count++
      } else if (i > 0) {
        break
      }
    }
    return count
  })

  function formatDate(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  function getRecordByDate(dateStr: string): MoodRecord | undefined {
    return records.value.find(r => r.date === dateStr)
  }

  function getRecordsByMonth(year: number, month: number): MoodRecord[] {
    return records.value.filter(r => {
      const [y, m] = r.date.split('-')
      return Number(y) === year && Number(m) === month
    }).sort((a, b) => b.date.localeCompare(a.date))
  }

  function addRecord(date: string, mood: MoodType, note: string): boolean {
    // 只允许记录/更新今天的心情
    if (date !== formatDate(new Date())) return false
    const existing = records.value.findIndex(r => r.date === date)
    if (existing >= 0) {
      records.value[existing] = { date, mood, note }
    } else {
      records.value.push({ date, mood, note })
    }
    return true
  }

  function prevMonth() {
    if (currentMonth.value === 1) {
      currentMonth.value = 12
      currentYear.value--
    } else {
      currentMonth.value--
    }
  }

  function nextMonth() {
    if (currentMonth.value === 12) {
      currentMonth.value = 1
      currentYear.value++
    } else {
      currentMonth.value++
    }
  }

  function isToday(dateStr: string): boolean {
    return dateStr === formatDate(new Date())
  }

  return {
    records,
    currentYear,
    currentMonth,
    monthCount,
    monthAvgScore,
    monthSummary,
    streakDays,
    getRecordByDate,
    getRecordsByMonth,
    addRecord,
    prevMonth,
    nextMonth,
    isToday,
    formatDate,
  }
})
