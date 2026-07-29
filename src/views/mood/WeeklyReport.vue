<template>
  <div class="screen-bg"></div>
  <StatusBar />

  <div class="content no-scrollbar">
    <div class="nav">
      <button class="back" @click="router.back()">
        <SvgIcon name="back" :size="20" />
      </button>
      <button class="share-btn" @click="onShare">
        <SvgIcon name="share" :size="18" />
      </button>
    </div>

    <div class="hero fade-in">
      <div class="week">{{ weekDisplay }}</div>
      <h1>{{ dominantMood ? weekMoodTitle : '这一周的你 ✨' }}</h1>
      <p>{{ summaryText || '记录每一天的心情' }}</p>
    </div>

    <div class="section-card fade-up">
      <div class="head">
        <h3>情绪曲线</h3>
        <span class="sub">平均 {{ avgScore ?? '-' }} / 5</span>
      </div>
      <div class="chart" v-if="chartPath.path">
        <svg viewBox="0 0 320 140" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#F4A988" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="#F4A988" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <line x1="0" y1="35" x2="320" y2="35" stroke="#F1E5D7" stroke-dasharray="3 3"/>
          <line x1="0" y1="70" x2="320" y2="70" stroke="#F1E5D7" stroke-dasharray="3 3"/>
          <line x1="0" y1="105" x2="320" y2="105" stroke="#F1E5D7" stroke-dasharray="3 3"/>
          <path :d="chartPath.fill" fill="url(#lineGrad)"/>
          <path :d="chartPath.path" fill="none" stroke="#E88A6B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle v-for="(dot, i) in chartPath.dots" :key="i" :cx="dot.split(',')[0]" :cy="dot.split(',')[1]" :r="i === chartPath.dots.length - 1 ? 5 : 4" fill="#fff" stroke="#E88A6B" stroke-width="2"/>
        </svg>
      </div>
      <div class="chart" v-else>
        <div class="no-data">本周暂无数据</div>
      </div>
      <div class="chart-labels">
        <span v-for="d in dailyMoods" :key="d.label" :class="{ active: d.active }">{{ d.label }}</span>
      </div>
    </div>

    <div class="section-card fade-up" v-if="keywords.length > 0">
      <div class="head">
        <h3>本周关键词</h3>
        <span class="sub">共 {{ keywords.length }} 个</span>
      </div>
      <div class="kw-cloud">
        <div class="kw" v-for="kw in keywords" :key="kw">{{ kw }}</div>
      </div>
    </div>

    <div class="weekly-letter fade-up">
      <div class="text" v-html="weekLetter"></div>
      <div class="sign">— {{ userStore.aiName }} 🌸</div>
    </div>

    <div class="section-card fade-up">
      <div class="head"><h3>这一周的数据</h3></div>
      <div class="stats">
        <div class="stat"><div class="num">{{ recordCount }}</div><div class="label">打卡天数</div></div>
        <div class="stat"><div class="num">{{ userStore.chatCount }}</div><div class="label">聊天轮次</div></div>
        <div class="stat"><div class="num">{{ userStore.collectionCount }}</div><div class="label">收藏卡片</div></div>
      </div>
    </div>

    <div class="suggest fade-up">
      <div class="ic">
        <SvgIcon name="sparkle" :size="18" />
      </div>
      <div class="text"><b>下周小挑战：</b>尝试一次 5 分钟冥想 🌙</div>
    </div>

    <div class="action-row">
      <el-button round @click="onShare">
        <SvgIcon name="share" :size="16" />
        分享周报
      </el-button>
      <el-button round @click="onFavorite">
        <SvgIcon name="heart" :size="16" />
        收藏
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElButton } from 'element-plus'
import StatusBar from '../../components/StatusBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import { useUserStore } from '../../stores/user'
import { useMoodStore, MOOD_CONFIG } from '../../stores/mood'

const router = useRouter()
const userStore = useUserStore()
const moodStore = useMoodStore()

const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
    await moodStore.fetchReport()
  } catch {
    error.value = true
  }
  loading.value = false
})

/** API 返回的报告数据 */
const reportData = computed(() => moodStore.weeklyReport)

/** 星期标签映射 */
const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日']

/** 周标题 */
const weekDisplay = computed(() => {
  if (!reportData.value) return 'WEEK --'
  const r = reportData.value.report
  return `WEEK ${r.yearWeek?.replace('W', '') || '--'}${r.weekRange ? ' · ' + r.weekRange : ''}`
})

/** 情绪曲线 svg 路径 */
const chartPath = computed(() => {
  if (!reportData.value) return { path: '', fill: '', dots: [] as string[] }
  const daily = reportData.value.dailyMoods
  const points = daily.map((d, i) => {
    const x = 25 + i * 45
    let y = 105  // 默认最低
    if (d.mood && MOOD_CONFIG[d.mood as keyof typeof MOOD_CONFIG]) {
      const score = MOOD_CONFIG[d.mood as keyof typeof MOOD_CONFIG].score
      // score 1-5 → y 105-20 (分数越高 y 越小)
      y = 120 - score * 20
    }
    return { x, y, mood: d.mood }
  })
  if (points.length === 0) return { path: '', fill: '', dots: [] as string[] }

  const pathStr = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const fillStr = pathStr + ` L ${points[points.length - 1].x} 140 L ${points[0].x} 140 Z`
  const dots = points.map(p => `${p.x},${p.y}`)
  return {
    path: pathStr,
    fill: fillStr,
    dots,
    lastMood: points[points.length - 1]?.mood || null,
  }
})

/** 本周关键词（从报告取） */
const keywords = computed(() => {
  return reportData.value?.report?.keywords || []
})

/** 打卡天数 */
const recordCount = computed(() => reportData.value?.report?.recordCount ?? 0)

/** 平均分 */
const avgScore = computed(() => reportData.value?.report?.avgScore)

/** 主导情绪 */
const dominantMood = computed(() => reportData.value?.report?.dominantMood)

/** 摘要文案 */
const summaryText = computed(() => reportData.value?.report?.summaryText || '')

/** 周情绪标题 */
const weekMoodTitle = computed(() => {
  if (!dominantMood.value) return '这一周的你 ✨'
  const config = MOOD_CONFIG[dominantMood.value as keyof typeof MOOD_CONFIG]
  return `这周的你 · ${config?.emoji || ''} ${config?.label || dominantMood.value}`
})

/** 周报寄语 */
const weekLetter = computed(() => {
  const name = userStore.name || '你'
  if (summaryText.value) {
    return `${name}，这一周你辛苦了 💛<br><br>${summaryText.value}<br><br>继续加油，新的一周也会更好的 ✨`
  }
  return `${name}，这一周你辛苦了 💛<br><br>记录每一天的心情，好好照顾自己。<br><br>新的一周也要加油哦 ✨`
})

/** 每日情绪映射 */
const dailyMoods = computed<Array<{ label: string; mood: string | null; active: boolean }>>(() => {
  if (!reportData.value) {
    return WEEK_LABELS.map(label => ({ label, mood: null, active: false }))
  }
  return reportData.value.dailyMoods.map((d, i) => ({
    label: WEEK_LABELS[i] || d.label,
    mood: d.mood,
    active: d.mood !== null,
  }))
})

function onShare() {}
function onFavorite() {}
</script>

<style scoped>
.screen-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, var(--cream-2) 0%, var(--peach) 50%, var(--blue-mist) 100%);
}
.content {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 24px;
}
.content::-webkit-scrollbar {
  display: none;
}
.nav {
  padding: 8px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav .back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-main);
  border: none;
  cursor: pointer;
}
.nav .share-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  border: none;
  cursor: pointer;
}
.hero {
  margin: 8px 0 16px;
  padding: 24px 20px;
  background: linear-gradient(135deg, var(--apricot) 0%, var(--peach) 100%);
  border-radius: 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.hero::before {
  content: "";
  position: absolute;
  top: -30px;
  right: -30px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, var(--card-bg) 0%, transparent 70%);
  opacity: 0.3;
}
.hero .week {
  font-size: 12px;
  color: var(--text-sub);
  letter-spacing: 1px;
}
.hero h1 {
  font-size: 24px;
  color: var(--text-main);
  margin: 6px 0 4px;
}
.hero p {
  font-size: 13px;
  color: var(--text-main);
}
.section-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 14px;
  box-shadow: var(--shadow-sm);
}
.section-card .head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-card .head h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
}
.section-card .head .sub {
  font-size: 11px;
  color: var(--text-sub);
}
.chart {
  height: 140px;
  position: relative;
}
.chart svg {
  width: 100%;
  height: 100%;
}
.chart .no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 13px;
  color: var(--text-mute);
}
.chart-labels {
  display: flex;
  justify-content: space-between;
  padding: 8px 6px 0;
  font-size: 11px;
  color: var(--text-sub);
}
.chart-labels .active {
  color: var(--accent-deep);
  font-weight: 600;
}
.kw-cloud {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.kw {
  padding: 6px 14px;
  background: var(--cream);
  border-radius: 999px;
  font-size: 13px;
  color: var(--text-main);
}
.kw.hot {
  background: var(--peach);
  color: var(--accent-deep);
  font-weight: 600;
}
.weekly-letter {
  background: linear-gradient(135deg, var(--cream) 0%, var(--apricot) 100%);
  border-radius: 18px;
  padding: 18px 20px;
  margin-bottom: 14px;
  position: relative;
}
.weekly-letter::before {
  content: "\201C";
  position: absolute;
  top: -4px;
  left: 18px;
  font-size: 60px;
  color: var(--accent);
  line-height: 1;
}
.weekly-letter .text {
  font-size: 14px;
  line-height: 1.85;
  color: var(--text-main);
}
.weekly-letter .sign {
  margin-top: 12px;
  text-align: right;
  font-size: 12px;
  color: var(--text-sub);
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.stat {
  text-align: center;
  padding: 14px 8px;
  background: var(--cream);
  border-radius: 14px;
}
.stat .num {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-deep);
}
.stat .label {
  font-size: 11px;
  color: var(--text-sub);
  margin-top: 2px;
}
.suggest {
  display: flex;
  gap: 10px;
  align-items: center;
  background: var(--accent-soft);
  padding: 14px 16px;
  border-radius: 14px;
  margin-bottom: 14px;
}
.suggest .ic {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.suggest .text {
  flex: 1;
  font-size: 13px;
  color: var(--text-main);
  line-height: 1.5;
}
.suggest .text b {
  color: var(--accent-deep);
}
.action-row {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.action-row .el-button {
  flex: 1;
}
</style>
