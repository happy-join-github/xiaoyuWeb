<template>
  <router-view v-if="isChildRoute" />
  <template v-else>
    <div class="screen-bg"></div>
    <StatusBar />

    <NavBar title="我的心情" left="back">
      <template #right>
        <router-link to="/mood/report" class="icon-btn">
          <el-icon :size="18"><Delete /></el-icon>
        </router-link>
      </template>
    </NavBar>

    <div class="scroll-area no-scrollbar">
      <!-- 空状态 -->
      <div v-if="moodStore.monthCount === 0 && moodStore.records.length === 0" class="empty-state fade-in">
        <div class="empty-icon">🌱</div>
        <h2>开始记录你的心情吧</h2>
        <p>每天 10 秒，把心情存进日记里</p>
        <el-button type="warning" round @click="$router.push('/mood/checkin')">记录今天的心情</el-button>
      </div>

      <template v-else>
        <!-- 月度统计 -->
        <div class="month-stat fade-in">
          <div class="text">
            <h2>{{ calTitle }} · {{ seasonPhrase }}</h2>
            <p>{{ moodStore.monthSummary.text }} {{ moodStore.monthSummary.emoji }}</p>
          </div>
          <div class="data">
            <div class="num">{{ streakLabel }}</div>
            <div class="label">连续打卡</div>
          </div>
        </div>

        <!-- 日历 -->
        <div class="calendar fade-up">
          <div class="cal-header">
            <button class="nav-btn" @click="moodStore.prevMonth()">
              <SvgIcon name="back" :size="14" />
            </button>
            <h3>{{ calTitle }}</h3>
            <button class="nav-btn" @click="moodStore.nextMonth()">
              <SvgIcon name="right" :size="14" />
            </button>
          </div>
          <div class="weekdays">
            <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
          </div>
          <div class="days">
            <div
              v-for="(day, index) in calDays"
              :key="index"
              class="day"
              :class="{
                mute: day.mute,
                today: day.today,
                selected: day.selected,
                'has-record': !!day.mood
              }"
              @click="selectDay(day)"
            >
              {{ day.label }}
              <div v-if="day.mood" class="dot" :style="{ background: moodConfig[day.mood as MoodType].color }"></div>
            </div>
          </div>
          <div class="legend">
            <span>今日心情</span>
            <span class="row gap-4">
              <span class="dot" :style="{ background: moodConfig.happy.color }"></span>
              <span class="dot" :style="{ background: moodConfig.calm.color }"></span>
              <span class="dot" :style="{ background: moodConfig.sad.color }"></span>
              <span class="dot" :style="{ background: moodConfig.anxious.color }"></span>
              <span class="dot" :style="{ background: moodConfig.irritable.color }"></span>
              <span class="dot" :style="{ background: moodConfig.tearful.color }"></span>
            </span>
          </div>
        </div>

        <!-- 选中日期的详情 -->
        <div class="day-detail fade-up" v-if="selectedDayInfo">
          <div class="head">
            <div class="date-info">
              <div class="d1">{{ selectedDayInfo.dateLabel }}</div>
              <div class="d2">{{ selectedDayInfo.relativeLabel }}</div>
            </div>
            <div v-if="selectedDayInfo.record" class="day-emoji">{{ moodConfig[selectedDayInfo.record.mood].emoji }}</div>
            <div v-else class="day-emoji no-record">📝</div>
          </div>
          <div class="body">
            <template v-if="selectedDayInfo.record">
              <div class="mood-tag" :style="{ background: moodConfig[selectedDayInfo.record.mood].color + '22', color: moodConfig[selectedDayInfo.record.mood].color }">
                {{ moodConfig[selectedDayInfo.record.mood].emoji }} {{ moodConfig[selectedDayInfo.record.mood].label }}
              </div>
              <div class="quote">{{ selectedDayInfo.record.note }}</div>
              <div class="link-row">
                <router-link class="link" :to="`/mood/detail?date=${selectedDayInfo.date}`">查看完整日记 →</router-link>
                <router-link v-if="selectedDayInfo.isToday" class="link edit" to="/mood/checkin">编辑</router-link>
              </div>
            </template>
            <template v-else>
              <div class="no-record-hint">{{ selectedDayInfo.isToday ? '今天还没有记录' : '这一天没有记录' }}</div>
              <router-link v-if="selectedDayInfo.isToday" class="link accent" to="/mood/checkin">记一笔今天的心情 →</router-link>
            </template>
          </div>
        </div>

        <!-- 本月全部记录 -->
        <div class="all-records fade-up">
          <div class="section-head" @click="showAllRecords = !showAllRecords">
            <h3>本月全部记录</h3>
            <span class="toggle">{{ showAllRecords ? '收起' : '展开' }}（{{ monthRecords.length }} 条）</span>
          </div>
          <template v-if="showAllRecords">
            <div v-if="monthRecords.length === 0" class="empty-list">这个月还没有心情记录</div>
            <div
              v-for="rec in monthRecords"
              :key="rec.date"
              class="record-row"
              @click="$router.push(`/mood/detail?date=${rec.date}`)"
            >
              <div class="record-emoji" :style="{ background: moodConfig[rec.mood].color + '18' }">{{ moodConfig[rec.mood].emoji }}</div>
              <div class="record-body">
                <div class="record-date">{{ formatDateDisplay(rec.date) }}</div>
                <div class="record-note">{{ rec.note }}</div>
              </div>
              <SvgIcon name="right" :size="14" />
            </div>
          </template>
        </div>

        <!-- 快捷入口 -->
        <div class="entries">
          <div class="entry-grid fade-up">
            <router-link class="entry peach" to="/mood/report">
              <div class="ic-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 3v18h18"/><path d="M7 12l4-4 4 6 5-8"/>
                </svg>
              </div>
              <div>
                <div class="t1">情绪周报</div>
                <div class="t2">这一周的你</div>
              </div>
            </router-link>
            <router-link class="entry blue" to="/cards">
              <div class="ic-box">
                <SvgIcon name="cards" :size="20" />
              </div>
              <div>
                <div class="t1">治愈卡片</div>
                <div class="t2">{{ userStore.collectionCount }} 张收藏</div>
              </div>
            </router-link>
          </div>
        </div>
      </template>
    </div>

    <!-- 浮动打卡按钮 -->
    <router-link to="/mood/checkin" class="fab-checkin">
      <el-button type="warning" :icon="Plus" circle size="large" />
    </router-link>

    <TabBar activeKey="me" />
  </template>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElButton, ElIcon, ElEmpty } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import StatusBar from '../../components/StatusBar.vue'
import NavBar from '../../components/NavBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import TabBar from '../../components/TabBar.vue'
import { useUserStore } from '../../stores/user'
import { useMoodStore, MOOD_CONFIG, type MoodType } from '../../stores/mood'

const route = useRoute()
const moodStore = useMoodStore()
const userStore = useUserStore()
const moodConfig = MOOD_CONFIG

const isChildRoute = computed(() => route.path !== '/mood')
const showAllRecords = ref(false)
const selectedDate = ref(moodStore.formatDate(new Date()))

const SEASONS: Record<number, string> = {
  1: '冬日暖阳', 2: '早春微风', 3: '春暖花开',
  4: '初夏时光', 5: '夏日悠长', 6: '盛夏',
  7: '你的夏天', 8: '夏末', 9: '初秋',
  10: '金秋', 11: '深秋', 12: '初冬',
}

const seasonPhrase = computed(() => {
  return SEASONS[moodStore.currentMonth] || ''
})

const calTitle = computed(() => {
  return `${moodStore.currentYear} 年 ${moodStore.currentMonth} 月`
})

const streakLabel = computed(() => {
  const s = moodStore.streakDays
  return s > 0 ? `${s} 天` : '--'
})

/** 当月所有记录 */
const monthRecords = computed(() =>
  moodStore.getRecordsByMonth(moodStore.currentYear, moodStore.currentMonth)
)

/** 生成本月日历网格 */
interface CalDay {
  label: string
  date?: string
  mute: boolean
  today: boolean
  selected: boolean
  mood?: string | null
}

const calDays = computed<CalDay[]>(() => {
  const y = moodStore.currentYear
  const m = moodStore.currentMonth
  const firstDow = new Date(y, m - 1, 1).getDay()
  const totalDays = new Date(y, m, 0).getDate()
  const prevTotal = new Date(y, m - 1, 0).getDate()

  const days: CalDay[] = []

  // 上月补充
  for (let i = firstDow - 1; i >= 0; i--) {
    days.push({ label: String(prevTotal - i), mute: true, today: false, selected: false })
  }

  // 本月
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const record = moodStore.getRecordByDate(dateStr)
    const isT = dateStr === moodStore.formatDate(new Date())
    days.push({
      label: String(i),
      date: dateStr,
      mute: false,
      today: isT,
      selected: dateStr === selectedDate.value,
      mood: record?.mood || null,
    })
  }

  // 下月补充至 6 行
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ label: String(i), mute: true, today: false, selected: false })
  }

  return days
})

/** 选中日期的详情信息 */
const selectedDayInfo = computed(() => {
  if (!selectedDate.value) return null
  const record = moodStore.getRecordByDate(selectedDate.value)
  const dt = new Date(selectedDate.value)
  const month = dt.getMonth() + 1
  const day = dt.getDate()
  const dowNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const dow = dowNames[dt.getDay()]
  const dateLabel = `${month} 月 ${day} 日 · ${dow}`

  let relativeLabel = ''
  if (moodStore.isToday(selectedDate.value)) {
    relativeLabel = '今天'
  } else {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (selectedDate.value === moodStore.formatDate(yesterday)) {
      relativeLabel = '昨天'
    }
  }

  return {
    date: selectedDate.value,
    dateLabel,
    relativeLabel,
    record,
    isToday: moodStore.isToday(selectedDate.value),
  }
})

function formatDateDisplay(dateStr: string) {
  const dt = new Date(dateStr)
  const dowNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${dt.getMonth() + 1}/${dt.getDate()} ${dowNames[dt.getDay()]}`
}

function selectDay(day: CalDay) {
  if (day.mute || !day.date) return
  selectedDate.value = day.date
}
</script>

<style scoped>
.screen-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, var(--cream) 0%, var(--cream-2) 100%);
}
.scroll-area {
  position: relative;
  z-index: 1;
}

/* 空状态 */
.empty-state {
  margin: 60px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.empty-icon {
  font-size: 64px;
  margin-bottom: 8px;
}
.empty-state h2 {
  font-size: 20px;
  color: var(--text-main);
}
.empty-state p {
  font-size: 14px;
  color: var(--text-sub);
  margin-bottom: 8px;
}

/* 月度统计 */
.month-stat {
  margin: 8px 16px 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--apricot) 0%, var(--peach) 100%);
  border-radius: 20px;
  color: var(--text-main);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.month-stat .text h2 {
  font-size: 16px;
  font-weight: 600;
}
.month-stat .text p {
  font-size: 12px;
  color: var(--text-main);
  margin-top: 4px;
}
.month-stat .data {
  text-align: right;
}
.month-stat .data .num {
  font-size: 22px;
  font-weight: 700;
  color: var(--accent-deep);
}
.month-stat .data .label {
  font-size: 11px;
  color: var(--text-main);
}

/* 日历 */
.calendar {
  margin: 16px;
  background: var(--card-bg);
  border-radius: 20px;
  padding: 18px 14px;
  box-shadow: var(--shadow-sm);
}
.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding: 0 4px;
}
.cal-header h3 {
  font-size: 16px;
  font-weight: 600;
}
.cal-header .nav-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--cream);
  color: var(--text-sub);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}
.cal-header .nav-btn:active {
  background: var(--apricot);
}
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 11px;
  color: var(--text-sub);
  padding: 6px 0;
}
.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 13px;
  color: var(--text-main);
  position: relative;
  cursor: pointer;
  transition: background 0.15s;
}
.day:active {
  background: var(--cream);
}
.day.mute {
  color: var(--text-mute);
}
.day.today {
  font-weight: 700;
  color: var(--accent-deep);
}
.day.today::after {
  content: '';
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent-deep);
}
.day.today.has-record::after {
  display: none;
}
.day.selected {
  background: var(--accent);
  color: #fff;
  font-weight: 600;
}
.day.selected .dot {
  display: none;
}
.day .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 2px;
  flex-shrink: 0;
}
.legend {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 0 4px;
  font-size: 11px;
  color: var(--text-sub);
}
.legend .dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* 日期详情 */
.day-detail {
  margin: 0 16px 16px;
  background: var(--card-bg);
  border-radius: 20px;
  padding: 18px;
  box-shadow: var(--shadow-sm);
}
.day-detail .head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.day-detail .date-info .d1 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}
.day-detail .date-info .d2 {
  font-size: 12px;
  color: var(--text-sub);
  margin-top: 2px;
}
.day-detail .day-emoji {
  font-size: 36px;
}
.day-detail .day-emoji.no-record {
  font-size: 28px;
  opacity: 0.5;
}
.day-detail .body {
  margin-top: 14px;
}
.day-detail .mood-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;
}
.day-detail .body .quote {
  padding: 14px 16px;
  background: var(--cream);
  border-radius: 14px;
  font-size: 14px;
  color: var(--text-main);
  line-height: 1.7;
  position: relative;
}
.day-detail .body .quote::before {
  content: "\201C";
  position: absolute;
  top: -8px;
  left: 12px;
  color: var(--accent);
  font-size: 40px;
  line-height: 1;
}
.day-detail .body .link {
  color: var(--accent-deep);
  font-size: 12px;
  display: block;
  font-weight: 500;
}
.day-detail .body .link-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}
.day-detail .body .link-row .link {
  margin-top: 0;
}
.day-detail .body .link-row .link.edit {
  color: var(--text-main);
  font-weight: 400;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--cream);
}
.day-detail .body .link.accent {
  color: var(--accent-deep);
  font-weight: 600;
}
.day-detail .no-record-hint {
  padding: 14px 16px;
  background: var(--cream);
  border-radius: 14px;
  font-size: 14px;
  color: var(--text-mute);
  text-align: center;
}

/* 全部记录 */
.all-records {
  margin: 0 16px 16px;
  background: var(--card-bg);
  border-radius: 20px;
  padding: 18px;
  box-shadow: var(--shadow-sm);
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}
.section-head h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
}
.section-head .toggle {
  font-size: 12px;
  color: var(--text-sub);
}
.empty-list {
  text-align: center;
  padding: 20px 0;
  font-size: 13px;
  color: var(--text-mute);
}
.record-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
}
.record-row:last-child {
  border-bottom: none;
}
.record-row:active {
  opacity: 0.7;
}
.record-emoji {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.record-body {
  flex: 1;
  min-width: 0;
}
.record-date {
  font-size: 12px;
  color: var(--text-sub);
}
.record-note {
  font-size: 14px;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

/* 快捷入口 */
.entries {
  padding: 0 16px 16px;
}
.entry-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.entry {
  background: var(--card-bg);
  border-radius: 18px;
  padding: 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: inherit;
  text-decoration: none;
}
.entry .ic-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.entry .t1 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}
.entry .t2 {
  font-size: 11px;
  color: var(--text-sub);
}
.entry.peach .ic-box {
  background: linear-gradient(135deg, var(--peach) 0%, var(--apricot) 100%);
  color: var(--accent-deep);
}
.entry.blue .ic-box {
  background: linear-gradient(135deg, var(--blue-mist) 0%, var(--blue-soft) 100%);
  color: #6BA4C9;
}

/* 浮动打卡按钮 */
.fab-checkin {
  position: absolute;
  right: 16px;
  bottom: calc(var(--tabbar-h) + 16px);
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  z-index: 10;
  animation: pulse 2.5s ease-in-out infinite;
  transition: transform 0.2s;
}
.fab-checkin:active {
  transform: scale(0.94);
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}
</style>
