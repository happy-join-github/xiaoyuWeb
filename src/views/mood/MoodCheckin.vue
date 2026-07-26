<template>
  <div class="checkin-root">
    <div class="screen-bg"></div>
    <StatusBar />

    <!-- 表单内容 -->
    <template v-if="!saved">
      <div class="content">
        <div class="close-row">
          <router-link to="/mood" class="close-btn">
            <SvgIcon name="close" :size="18" />
          </router-link>
        </div>

        <div class="greeting fade-in">
          <h1>{{ greetingText }}</h1>
          <p>{{ isEdit ? '可以随时修改今天的记录哦' : '告诉我你的心情，10 秒就好 💛' }}</p>
        </div>

        <div class="emotion-grid">
          <div
            v-for="emotion in emotions"
            :key="emotion.value"
            class="emotion-card fade-up"
            :class="{ selected: selectedEmotion === emotion.value }"
            @click="selectedEmotion = emotion.value"
          >
            <div class="emoji">{{ emotion.emoji }}</div>
            <div class="name">{{ emotion.label }}</div>
          </div>
        </div>

        <div class="note-box fade-up">
          <label>今天想说的一句小话（选填）</label>
          <textarea
            v-model="note"
            placeholder="比如：今天的天空很蓝…"
            maxlength="50"
          ></textarea>
          <div class="count">{{ note.length }}/50</div>
        </div>

        <div class="reward fade-up">
          <div class="ic">
            <SvgIcon name="star" :size="16" />
          </div>
          <div class="text">
            <div class="t1">完成打卡，记录今天的自己 ✨</div>
            <div class="t2" v-if="streakDays > 0">已坚持打卡 {{ streakDays }} 天 · 继续加油 💪</div>
            <div class="t2" v-else>这是你的第一次打卡，加油 💪</div>
          </div>
        </div>

        <div class="actions">
          <button
            class="btn btn-primary"
            :disabled="!selectedEmotion"
            @click="handleSave"
          >
            {{ !selectedEmotion ? '请选择心情' : isEdit ? '更新今天的心情' : '保存今天的心情' }}
          </button>
          <div class="skip"><router-link to="/mood">下次再说</router-link></div>
        </div>
      </div>
    </template>

    <!-- 保存成功覆盖 -->
    <div v-else class="success-overlay">
      <div class="success-card fade-in">
        <div class="check-circle">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h2>{{ isEdit ? '已更新今天的心情' : '已记录今天的心情' }}</h2>
        <p class="saved-mood">{{ savedEmoji }} {{ savedLabel }}</p>
        <p class="saved-note">{{ note || '没有填写小话' }}</p>
        <div class="streak-badge" v-if="streakDays > 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          已连续打卡 {{ streakDays }} 天
        </div>
        <router-link to="/mood" class="btn btn-primary back-btn">返回心情日历</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import StatusBar from '../../components/StatusBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import { useMoodStore, MOOD_CONFIG, type MoodType } from '../../stores/mood'

const router = useRouter()
const moodStore = useMoodStore()
const moodConfig = MOOD_CONFIG

const selectedEmotion = ref<MoodType | null>(null)
const note = ref('')
const saved = ref(false)
const isEdit = ref(false)
const streakDays = ref(0)
let autoTimer: ReturnType<typeof setTimeout> | null = null

/** 加载今天已有记录（编辑模式） */
onMounted(() => {
  const today = moodStore.formatDate(new Date())
  const existing = moodStore.getRecordByDate(today)
  if (existing) {
    selectedEmotion.value = existing.mood
    note.value = existing.note
    isEdit.value = true
  }
})

const emotions = [
  { emoji: '😊', label: '开心', value: 'happy' as MoodType },
  { emoji: '😌', label: '平静', value: 'calm' as MoodType },
  { emoji: '😔', label: '低落', value: 'sad' as MoodType },
  { emoji: '😣', label: '焦虑', value: 'anxious' as MoodType },
  { emoji: '😡', label: '烦躁', value: 'irritable' as MoodType },
  { emoji: '🥺', label: '想哭', value: 'tearful' as MoodType },
]

const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了\n还没睡吗 🌙'
  if (hour < 9) return '早安呀 ☀️\n今天感觉怎么样'
  if (hour < 12) return '上午好 🌤️\n今天心情如何'
  if (hour < 14) return '中午好 ☀️\n吃饭了吗'
  if (hour < 18) return '下午好 🌸\n今天过得怎么样'
  if (hour < 21) return '傍晚好 🌇\n今天还好吗'
  return '晚上好 🌙\n今天过得怎么样'
})

const savedEmoji = computed(() => {
  if (!selectedEmotion.value) return ''
  return moodConfig[selectedEmotion.value]?.emoji || ''
})

const savedLabel = computed(() => {
  if (!selectedEmotion.value) return ''
  return moodConfig[selectedEmotion.value]?.label || ''
})

function handleSave() {
  if (!selectedEmotion.value) return

  const date = moodStore.formatDate(new Date())
  moodStore.addRecord(date, selectedEmotion.value, note.value)
  streakDays.value = moodStore.streakDays
  saved.value = true

  // 2 秒后自动跳转
  autoTimer = setTimeout(() => {
    router.push('/mood')
  }, 2000)
}

onBeforeUnmount(() => {
  if (autoTimer) clearTimeout(autoTimer)
})
</script>

<style scoped>
.checkin-root {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.screen-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #FFEFDF 0%, #FFE0CB 100%);
}

/* 内容区 */
.content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 20px 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.content::-webkit-scrollbar {
  display: none;
}
.close-row {
  display: flex;
  justify-content: flex-end;
}
.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(74, 58, 46, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9C8B7E;
}
.greeting {
  margin-top: 8px;
}
.greeting h1 {
  font-size: 24px;
  color: #4A3A2E;
  font-weight: 700;
  line-height: 1.3;
  white-space: pre-line;
}
.greeting p {
  color: #9C8B7E;
  margin-top: 6px;
  font-size: 13px;
}
.emotion-grid {
  margin: 20px 0 4px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.emotion-card {
  aspect-ratio: 1;
  max-height: 90px;
  background: #fff;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  box-shadow: 0 2px 8px rgba(244, 169, 136, 0.08);
  border: 2px solid transparent;
  transition: all 0.2s;
  cursor: pointer;
}
.emotion-card.selected {
  border-color: #F4A988;
  background: linear-gradient(135deg, #FFF 0%, #FFE7D1 100%);
}
.emotion-card .emoji {
  font-size: 26px;
}
.emotion-card .name {
  font-size: 11px;
  color: #4A3A2E;
}
.emotion-card.selected .name {
  color: #E88A6B;
  font-weight: 600;
}
.note-box {
  margin-top: 16px;
  background: #fff;
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(244, 169, 136, 0.08);
}
.note-box label {
  display: block;
  font-size: 12px;
  color: #9C8B7E;
  margin-bottom: 8px;
}
.note-box textarea {
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  min-height: 60px;
  font: inherit;
  color: #4A3A2E;
}
.note-box textarea::placeholder {
  color: #C4B5A6;
}
.note-box .count {
  text-align: right;
  font-size: 11px;
  color: #C4B5A6;
  margin-top: 4px;
}
.reward {
  margin-top: 10px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #FFF4E8 0%, #FFE7D1 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.reward .ic {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  color: #E88A6B;
  display: flex;
  align-items: center;
  justify-content: center;
}
.reward .text {
  flex: 1;
}
.reward .text .t1 {
  font-size: 13px;
  color: #4A3A2E;
  font-weight: 600;
}
.reward .text .t2 {
  font-size: 11px;
  color: #9C8B7E;
  margin-top: 2px;
}
.actions {
  margin-top: auto;
  padding-top: 20px;
}
.actions .btn-primary {
  width: 100%;
}
.actions .btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(135deg, #D4C5B8 0%, #C4B5A6 100%);
  box-shadow: none;
}
.skip {
  text-align: center;
  margin-top: 12px;
}
.skip a {
  color: #9C8B7E;
  font-size: 13px;
}

/* 成功覆盖层 */
.success-overlay {
  position: absolute;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 248, 241, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.success-card {
  text-align: center;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.check-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7BC97B, #5CA050);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: 0 8px 32px rgba(92, 160, 80, 0.35);
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes popIn {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}
.success-card h2 {
  font-size: 20px;
  color: #4A3A2E;
}
.saved-mood {
  font-size: 18px;
  color: #E88A6B;
  font-weight: 600;
}
.saved-note {
  font-size: 14px;
  color: #9C8B7E;
}
.streak-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #FFE7D1, #FFD4C2);
  border-radius: 999px;
  font-size: 13px;
  color: #E88A6B;
  font-weight: 600;
  margin-top: 4px;
}
.back-btn {
  margin-top: 16px;
  width: 100%;
}
</style>
