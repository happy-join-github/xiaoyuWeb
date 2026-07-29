<template>
  <div class="screen-bg"></div>
  <StatusBar />

  <div class="header">
    <router-link class="back" to="/mood">
      <SvgIcon name="back" :size="20" />
    </router-link>
    <div class="title">{{ dateTitle }}</div>
    <div class="actions">
      <router-link v-if="isToday" to="/mood/checkin" class="icon-btn">
        <SvgIcon name="edit" :size="18" />
      </router-link>
      <button class="icon-btn" @click="onShare">
        <SvgIcon name="share" :size="18" />
      </button>
    </div>
  </div>

  <!-- 未找到记录 -->
  <div v-if="loading" class="empty-state">
    <el-empty description="加载中..." />
  </div>
  <div v-else-if="!record" class="empty-state">
    <el-empty description="没有找到这一天的记录" />
    <el-button round @click="$router.push('/mood')">返回心情日历</el-button>
  </div>

  <template v-else>
    <div class="content no-scrollbar">
      <!-- 日期卡片 -->
      <div class="date-card fade-in">
        <div class="emoji-bg">{{ config.emoji }}</div>
        <div class="date"><b>{{ dateDisplay }}</b></div>
        <div class="mood" :style="{ background: config.color + '22', color: config.color }">
          {{ config.emoji }} {{ config.label }} · {{ config.score }}/5
        </div>
      </div>

      <!-- 日记正文 -->
      <div class="quote-section fade-up">
        <div class="text">{{ record.note }}</div>
        <div class="sign">— {{ userStore.name }} 记于 {{ timeLabel }}</div>
      </div>

      <!-- 关键词（根据内容自动提取） -->
      <div class="section fade-up" v-if="keywords.length > 0">
        <div class="label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9C8B7E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          今日关键词
        </div>
        <div class="keywords">
          <div class="kw" v-for="kw in keywords" :key="kw"><b>{{ kw }}</b></div>
        </div>
      </div>

      <!-- 关联对话 -->
      <div class="section fade-up" v-if="aiMessage">
        <div class="label">
          <SvgIcon name="chat" :size="14" />
          来自 {{ userStore.aiName }} 的问候
        </div>
        <div class="ai-card">
          <div class="av">{{ aiAvatar }}</div>
          <div class="body">
            <div class="name">{{ userStore.aiName }} · {{ aiMessage.title }}</div>
            <div class="text">{{ aiMessage.text }}</div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="section action-section fade-up">
        <div class="action-row">
          <el-button round @click="$router.push('/mood')">
            <SvgIcon name="back" :size="16" />
            返回日历
          </el-button>
          <el-button round @click="onShare">
            <SvgIcon name="share" :size="16" />
            分享
          </el-button>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElButton, ElEmpty } from 'element-plus'
import StatusBar from '../../components/StatusBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import { useUserStore } from '../../stores/user'
import { useMoodStore, MOOD_CONFIG } from '../../stores/mood'
import { getDailyRecord, type MoodRecord } from '../../api/mood'

const route = useRoute()
const userStore = useUserStore()
const moodStore = useMoodStore()

const dateParam = computed(() => (route.query.date as string) || '')
const record = ref<MoodRecord | null>(null)
const loading = ref(true)

onMounted(async () => {
  if (dateParam.value) {
    try {
      record.value = await getDailyRecord(dateParam.value)
    } catch { /* record stays null */ }
  }
  loading.value = false
})

const config = computed(() => {
  if (!record.value) return { emoji: '', label: '', score: 0, color: '' }
  return MOOD_CONFIG[record.value.mood]
})

const DATE_FORMAT = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

const dateDisplay = computed(() => {
  if (!dateParam.value) return ''
  const d = new Date(dateParam.value)
  return DATE_FORMAT.format(d)
})

const dateTitle = computed(() => {
  if (!dateParam.value) return '日记详情'
  const d = new Date(dateParam.value)
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

const isToday = computed(() => moodStore.isToday(dateParam.value))

const timeLabel = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '上午'
  if (hour < 14) return '中午'
  if (hour < 18) return '下午'
  return '晚上'
})

/** 关键词：优先用 API 返回的 keywords，否则从文本中提取 */
const keywords = computed(() => {
  if (!record.value) return []
  // API 已有 keywords 则直接使用
  if (record.value.keywords && record.value.keywords.length > 0) {
    return record.value.keywords.slice(0, 5)
  }
  const note = record.value.note || ''
  const found: string[] = []
  const patterns: { word: string; tag: string }[] = [
    { word: '天气', tag: '天气' },
    { word: '天空', tag: '天空' },
    { word: '咖啡', tag: '咖啡' },
    { word: '朋友', tag: '朋友' },
    { word: '吃饭', tag: '美食' },
    { word: '散步', tag: '散步' },
    { word: '运动', tag: '运动' },
    { word: '读书', tag: '读书' },
    { word: '书', tag: '读书' },
    { word: '工作', tag: '工作' },
    { word: '累', tag: '疲惫' },
    { word: '焦虑', tag: '焦虑' },
    { word: '开心', tag: '开心' },
    { word: '放松', tag: '放松' },
    { word: '花', tag: '花' },
    { word: '猫', tag: '猫' },
    { word: '狗', tag: '宠物' },
    { word: '家', tag: '家' },
    { word: '睡觉', tag: '休息' },
    { word: '梦', tag: '梦' },
    { word: '音乐', tag: '音乐' },
  ]
  for (const p of patterns) {
    if (note.includes(p.word)) {
      if (!found.includes(p.tag)) found.push(p.tag)
    }
  }
  return found.slice(0, 5)
})

/** 根据心情类型生成关联 AI 问候 */
const aiMessage = computed(() => {
  if (!record.value) return null
  const mood = record.value.mood
  const msgMap: Record<string, { title: string; text: string }> = {
    happy: {
      title: '暖心陪伴',
      text: '开心的时候，世界都是闪闪发光的 ✨ 记住这种感觉，不开心的时候翻出来看看~',
    },
    calm: {
      title: '暖心陪伴',
      text: '平静的日子也是一种幸福 🌿 在忙碌的生活里能找到内心的安宁，真的很了不起。',
    },
    sad: {
      title: '温柔拥抱',
      text: '低落的时候不需要马上好起来，慢慢来，我会一直在这里陪着你 💛',
    },
    anxious: {
      title: '放松时刻',
      text: '焦虑的时候试试深呼吸——吸气 4 秒，屏住 4 秒，呼气 6 秒 🌬️ 我在这里陪你。',
    },
    irritable: {
      title: '冷静空间',
      text: '烦躁的时候，给自己一个「暂停键」⏸️ 喝杯水，看看窗外，我在呢。',
    },
    tearful: {
      title: '温暖守候',
      text: '想哭就哭吧，眼泪不是软弱，是心里装太多需要释放 🫂 哭完了，我陪你重新出发。',
    },
  }
  return msgMap[mood] || null
})

const aiAvatar = computed(() => userStore.avatar || '🌸')

function onShare() {
  // share placeholder
}
</script>

<style scoped>
.screen-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, var(--cream-2) 0%, var(--line) 100%);
}

/* 空状态 */
.empty-state {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.header {
  padding: 4px 20px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}
.header .back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-main);
  border: none;
  cursor: pointer;
}
.header .title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}
.header .actions {
  display: flex;
  gap: 8px;
}
.header .actions .icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  border: none;
  cursor: pointer;
}
.content {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 0 0 24px;
}
.content::-webkit-scrollbar {
  display: none;
}
.date-card {
  margin: 12px 20px 16px;
  padding: 24px;
  background: var(--card-bg);
  border-radius: 24px;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}
.date-card::before {
  content: "";
  position: absolute;
  top: -40px;
  right: -40px;
  width: 160px;
  height: 160px;
  background: linear-gradient(135deg, var(--apricot) 0%, var(--peach) 100%);
  border-radius: 50%;
  opacity: 0.4;
}
.date-card .emoji-bg {
  font-size: 80px;
  line-height: 1;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}
.date-card .date {
  font-size: 13px;
  color: var(--text-sub);
  position: relative;
  z-index: 1;
}
.date-card .date b {
  color: var(--text-main);
  font-weight: 600;
}
.date-card .mood {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  position: relative;
  z-index: 1;
}
.quote-section {
  margin: 0 20px 16px;
  padding: 18px 20px;
  background: linear-gradient(135deg, var(--cream) 0%, var(--apricot) 100%);
  border-radius: 18px;
  position: relative;
}
.quote-section::before {
  content: "\201C";
  position: absolute;
  top: -4px;
  left: 16px;
  font-size: 60px;
  color: var(--accent);
  line-height: 1;
}
.quote-section .text {
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-main);
  font-weight: 500;
}
.quote-section .sign {
  font-size: 12px;
  color: var(--text-sub);
  margin-top: 12px;
  text-align: right;
}
.section {
  margin: 0 20px 16px;
}
.section .label {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.keywords {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.kw {
  padding: 6px 12px;
  background: var(--card-bg);
  border-radius: 999px;
  font-size: 12px;
  color: var(--text-main);
  box-shadow: var(--shadow-sm);
}
.kw b {
  color: var(--accent-deep);
}
.ai-card {
  background: var(--card-bg);
  border-radius: 18px;
  padding: 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.ai-card .av {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--peach) 0%, var(--apricot) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.ai-card .body {
  flex: 1;
}
.ai-card .body .name {
  font-size: 12px;
  color: var(--text-sub);
}
.ai-card .body .text {
  font-size: 14px;
  color: var(--text-main);
  line-height: 1.7;
  margin-top: 4px;
}
.action-section {
  padding: 0 20px;
}
.action-row {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.action-row .el-button {
  flex: 1;
}
</style>
