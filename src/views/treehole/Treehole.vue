<template>
  <!-- 树洞历史子路由 -->
  <router-view v-if="isChildRoute" />
  <div v-else class="treehole" :class="{ 'is-night': isNight, 'is-deep-night': isDeepNight }">
    <!-- 装饰层 -->
    <div class="deco-stars">
      <span class="star s1">✦</span>
      <span class="star s2">✦</span>
      <span class="star s3">✦</span>
      <span class="star s4">✦</span>
      <span class="star s5">✦</span>
    </div>
    <div class="moon"></div>

    <!-- 治愈音景 -->
    <transition name="fade-slide">
      <div v-if="showSoundscape" class="soundscape-bar">
        <span class="soundscape-label">🌿 陪伴音</span>
        <button
          v-for="s in soundscapes"
          :key="s.key"
          class="soundscape-chip"
          :class="{ active: activeSoundscape === s.key }"
          @click="toggleSound(s.key)"
        >
          {{ s.icon }} {{ s.label }}
        </button>
      </div>
    </transition>

    <StatusBar />

    <!-- 导航栏 -->
    <div class="nav-bar">
      <div class="left">
        <button class="icon-btn" @click="handleExit">
          <SvgIcon name="back" :size="24" />
        </button>
      </div>
      <div class="title">树洞</div>
      <div class="right">
        <button class="icon-btn" @click="goToHistory" aria-label="历史">
          <SvgIcon name="clock" :size="20" />
        </button>
        <button
          class="icon-btn soundscape-btn"
          :class="{ active: showSoundscape }"
          @click="showSoundscape = !showSoundscape"
          aria-label="陪伴音"
        >
          <SvgIcon name="mic" :size="20" />
        </button>
        <span class="anon-tag">🔒 匿名</span>
      </div>
    </div>

    <!-- 安全标签 -->
    <div class="safety-label">这里很安全，不会有人评价你</div>

    <!-- 内容滚动区 -->
    <div class="scroll-area content" ref="scrollRef">
      <!-- 进入引导 -->
      <transition name="fade-down">
        <div v-if="showGreeting" class="greeting">
          <div class="greeting-moon">🌙</div>
          <p class="greeting-text">{{ greetingText }}</p>
        </div>
      </transition>

      <!-- 引言（首次进入无消息时） -->
      <div v-if="messages.length === 0 && !showGreeting" class="intro-text">
        把心里的话，<br />留在这里。<br />没有人会知道是你。
      </div>

      <!-- 消息列表 -->
      <div class="timeline">
        <div v-for="msg in messages" :key="msg.id" class="msg-row" :class="msg.role">
          <template v-if="msg.role === 'ai'">
            <div class="ai-avatar">🌙</div>
            <div class="bubble ai-bubble" v-html="msg.content"></div>
          </template>
          <template v-else>
            <div class="bubble user-bubble" v-html="msg.content"></div>
          </template>
        </div>
      </div>

      <!-- 情绪标签提议（对话 3 轮后触发） -->
      <transition name="slide-up">
        <div v-if="showEmotionPrompt" class="emotion-prompt">
          <p class="emotion-question">💭 今天这种感觉，用一个词来形容的话…</p>
          <div class="emotion-chips">
            <button
              v-for="emotion in emotions"
              :key="emotion.value"
              class="emotion-chip"
              :class="{ selected: selectedEmotion === emotion.value }"
              @click="selectEmotion(emotion.value)"
            >
              {{ emotion.icon }} {{ emotion.label }}
            </button>
          </div>
          <transition name="fade">
            <p v-if="emotionSaved" class="emotion-saved">已记录到今日心情 ✓</p>
          </transition>
        </div>
      </transition>

      <!-- 打字中动画 -->
      <div class="typing-indicator" v-if="isLoading">
        <div class="typing">
          <span></span><span></span><span></span>
        </div>
        <span class="typing-label">正在输入...</span>
      </div>

      <!-- 今日情绪标签栏（从 treeholeStore 获取） -->
      <div v-if="todayEmotions.length > 0" class="today-emotion-bar">
        <span class="emotion-bar-label">今日情绪</span>
        <span
          v-for="tag in todayEmotions"
          :key="tag.emotion"
          class="emotion-tag"
        >
          {{ tag.emoji }} {{ tag.label }}
        </span>
      </div>

      <!-- 底部留白 -->
      <div class="scroll-spacer"></div>
    </div>

    <!-- 输入区 -->
    <div class="input-area">
      <button class="input-icon" @click="showSoundscape = !showSoundscape" aria-label="陪伴音">
        <SvgIcon name="mic" :size="22" />
      </button>
      <div class="input-box">
        <input
          ref="inputRef"
          v-model="inputText"
          type="text"
          :placeholder="currentPlaceholder"
          @keyup.enter="sendMessage"
          maxlength="500"
        />
      </div>
      <button
        class="send-btn"
        :class="{ disabled: !inputText.trim() }"
        :disabled="!inputText.trim() || isLoading"
        aria-label="发送"
        @click="sendMessage"
      >
        <SvgIcon name="send" :size="20" />
      </button>
    </div>

    <!-- 离场收束浮层 -->
    <transition name="fade">
      <div v-if="showExitOverlay" class="exit-overlay">
        <div class="exit-dialog">
          <div class="exit-icon">🌙</div>
          <p class="exit-title">今天的心里话，要帮你收起来吗？</p>
          <p class="exit-desc">它们会好好地保存在这里，只有你看得到。</p>
          <div class="exit-actions">
            <button class="exit-btn primary" @click="saveAndLeave">
              <span>📔</span> 保存到日记
            </button>
            <button class="exit-btn" @click="leaveDirectly">
              直接离开
            </button>
            <button class="exit-btn ghost" @click="showExitOverlay = false">
              再待一会儿
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StatusBar from '../../components/StatusBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import { useUserStore } from '../../stores/user'
import { useTreeholeStore } from '../../stores/treeholeStore'
import { useSessionStore } from '../../stores/sessionStore'
import * as treeholeStorage from '../../utils/treeholeStorage'
import type { TreeholeStoredMessage } from '../../utils/treeholeStorage'
import { getAiReply } from './aiReply'
import { treeholeCompletionsStream } from '../../api/treehole'

/** 消息本地接口 */
interface LocalMessage {
  id: number
  role: 'ai' | 'user'
  content: string
  time: string
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const treeholeStore = useTreeholeStore()
const sessionStore = useSessionStore()
const isChildRoute = computed(() => route.path !== '/treehole')

// ====== 响应式状态 ======
const messages = ref<LocalMessage[]>([])
const inputText = ref('')
const isLoading = ref(false)
let nextMsgId = Date.now()
const showExitOverlay = ref(false)
const showSoundscape = ref(false)
const activeSoundscape = ref<string | null>(null)
const showEmotionPrompt = ref(false)
const selectedEmotion = ref<string | null>(null)
const emotionSaved = ref(false)
const showGreeting = ref(true)
const greetingDismissed = ref(false)
const conversationRound = ref(0)

// ====== 今日情绪标签（从 treeholeStore） ======
const todayEmotions = computed(() => treeholeStore.todayEmotionsWithMeta)

// ====== 当前会话 ID ======
const sessionId = ref<string | null>(null)

// ====== DOM 引用 ======
const scrollRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

// ====== 治愈音景 ======
const soundscapes = [
  { key: 'rain', icon: '🌧️', label: '雨声' },
  { key: 'campfire', icon: '🔥', label: '篝火' },
  { key: 'wave', icon: '🌊', label: '海浪' },
  { key: 'forest', icon: '🌲', label: '森林' },
]

function toggleSound(key: string) {
  activeSoundscape.value = activeSoundscape.value === key ? null : key
}

// ====== 情绪标签 ======
const emotions = [
  { value: 'happy' as const, icon: '😊', label: '开心' },
  { value: 'calm' as const, icon: '😌', label: '平静' },
  { value: 'sad' as const, icon: '😔', label: '低落' },
  { value: 'anxious' as const, icon: '😣', label: '焦虑' },
  { value: 'irritable' as const, icon: '😤', label: '烦躁' },
  { value: 'tearful' as const, icon: '🥺', label: '想哭' },
]

function selectEmotion(value: string) {
  selectedEmotion.value = value
  emotionSaved.value = true
  // 通过 treeholeStore 记录
  if (sessionId.value) {
    treeholeStore.recordEmotion(sessionId.value, value)
  }
  // 存入 sessionStorage，供 MoodCheckin 读取（兼容旧逻辑）
  const existing = sessionStorage.getItem('treehole_emotion')
  const record = existing ? JSON.parse(existing) : {}
  record[getToday()] = value
  sessionStorage.setItem('treehole_emotion', JSON.stringify(record))
}

// ====== 进入问候 ======
const isNight = computed(() => {
  const h = new Date().getHours()
  return h >= 18 || h < 6
})

const isDeepNight = computed(() => {
  const h = new Date().getHours()
  return h >= 22 || h < 5
})

const greetingText = computed(() => {
  if (isDeepNight.value) return '夜深了 🌙<br />谢谢你还在。<br />把心里的话放下再睡吧。'
  if (isNight.value) return '傍晚了 🌆<br />一天辛苦了。<br />这里很安静，想说点什么都可以。'
  return '你来了 🌤️<br />不管今天发生了什么，<br />这里永远是安全的。'
})

// ====== 轮换 placeholder ======
const placeholderPool = [
  '说说什么事让你想到这…',
  '心里有没有什么堵着的地方…',
  '也可以只是说一句「好累」…',
  '今天过得怎么样？',
  '我在听，慢慢说 🍃',
]
let placeholderIndex = 0
const currentPlaceholder = ref(placeholderPool[0])

let placeholderTimer: ReturnType<typeof setInterval> | undefined

function startPlaceholderRotation() {
  placeholderTimer = setInterval(() => {
    placeholderIndex = (placeholderIndex + 1) % placeholderPool.length
    currentPlaceholder.value = placeholderPool[placeholderIndex]
  }, 8000)
}

function stopPlaceholderRotation() {
  if (placeholderTimer) {
    clearInterval(placeholderTimer)
    placeholderTimer = undefined
  }
}

watch(inputText, (val) => {
  if (val.trim()) {
    stopPlaceholderRotation()
  } else {
    startPlaceholderRotation()
  }
})

// ====== SSE 控制器 ======
let sseController: AbortController | null = null

// ====== 核心交互：发送消息 ======
async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  if (showGreeting.value) {
    showGreeting.value = false
    greetingDismissed.value = true
  }

  // 确保有会话
  let s = sessionId.value ? treeholeStorage.getSession(sessionId.value) : null
  if (!s) {
    s = treeholeStorage.createSession()
    sessionId.value = s.id
    treeholeStore.switchSession(s.id)
  }

  const now = new Date().toISOString()
  const h = String(new Date().getHours()).padStart(2, '0')
  const m = String(new Date().getMinutes()).padStart(2, '0')
  const timeStr = `${h}:${m}`

  // 添加用户消息
  const userMsg: LocalMessage = {
    id: nextMsgId++,
    role: 'user',
    content: escapeHtml(text),
    time: timeStr,
  }
  messages.value.push(userMsg)

  // 持久化到 treeholeStorage
  const storedUserMsg: TreeholeStoredMessage = {
    id: userMsg.id,
    role: 'user',
    content: userMsg.content,
    emotionTag: null,
    createdAt: now,
  }
  treeholeStorage.appendMessage(s.id, storedUserMsg)

  inputText.value = ''
  scrollToBottom()

  // AI 回复
  isLoading.value = true
  conversationRound.value++

  const aiMsgId = nextMsgId++
  const aiLocalMsg: LocalMessage = {
    id: aiMsgId,
    role: 'ai',
    content: '',
    time: timeStr,
  }
  messages.value.push(aiLocalMsg)

  try {
    // 获取后端远程 sessionId（通过 C5 接口创建/映射）
    const remoteSessionId = await sessionStore.ensureRemoteTreeholeSession(s.id)
    if (remoteSessionId === null) {
      // 后端不可用，使用模拟回复
      throw new Error('local')
    }

    let aiContent = ''
    sseController = treeholeCompletionsStream(
      remoteSessionId,  // ← 这是后端数据库的真实 ID（如 1, 2, 3...），不是前端的 localStorage ID
      text,
      (token: string) => {
        aiContent += token
        aiLocalMsg.content = aiContent
        scrollToBottom()
      },
      () => {
        // done
        sseController = null
        // 持久化 AI 回复
        const storedAiMsg: TreeholeStoredMessage = {
          id: aiMsgId,
          role: 'ai',
          content: aiContent,
          emotionTag: null,
          createdAt: new Date().toISOString(),
        }
        if (sessionId.value) {
          treeholeStorage.appendMessage(sessionId.value, storedAiMsg)
        }
        isLoading.value = false
        scrollToBottom()

        // 对话 3 轮后弹出情绪标签
        if (conversationRound.value >= 3 && !showEmotionPrompt.value) {
          setTimeout(() => {
            showEmotionPrompt.value = true
            scrollToBottom()
          }, 1200)
        }
      },
      () => {
        // error, fallback to mock
        sseController = null
        fallbackAiReply(text, aiLocalMsg)
      },
    )
  } catch {
    // fallback
    fallbackAiReply(text, aiLocalMsg)
  }
}

/** 模拟 AI 回复（SSE 回退方案） */
async function fallbackAiReply(text: string, aiLocalMsg: LocalMessage) {
  await delay(800 + Math.random() * 600)
  const reply = getAiReply(text, messages.value as any)
  aiLocalMsg.content = reply

  // 持久化
  if (sessionId.value) {
    const storedAiMsg: TreeholeStoredMessage = {
      id: aiLocalMsg.id,
      role: 'ai',
      content: reply,
      emotionTag: null,
      createdAt: new Date().toISOString(),
    }
    treeholeStorage.appendMessage(sessionId.value, storedAiMsg)
  }

  isLoading.value = false
  scrollToBottom()

  if (conversationRound.value >= 3 && !showEmotionPrompt.value) {
    await delay(1200)
    showEmotionPrompt.value = true
    scrollToBottom()
  }
}

// ====== 滚动到底部 ======
async function scrollToBottom() {
  await nextTick()
  if (scrollRef.value) {
    scrollRef.value.scrollTop = scrollRef.value.scrollHeight
  }
}

// ====== 离开处理 ======
function handleExit() {
  if (messages.value.length <= 1) {
    doLeave()
    return
  }
  showExitOverlay.value = true
}

function saveAndLeave() {
  saveToDiary()
  showExitOverlay.value = false
  doLeave()
}

function leaveDirectly() {
  showExitOverlay.value = false
  doLeave()
}

function doLeave() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/chat')
  }
}

// ====== 保存到日记 ======
function saveToDiary() {
  const recent = messages.value.slice(-6)
  const userParts: string[] = []
  const aiParts: string[] = []

  for (const m of recent) {
    const text = stripHtml(m.content)
    if (m.role === 'user') userParts.push(text)
    else aiParts.push(text)
  }

  const summary = userParts.length > 0
    ? userParts.join(' | ')
    : '今晚在树洞待了一会儿'

  const feeling = aiParts.length > 0
    ? aiParts[aiParts.length - 1].slice(0, 60)
    : ''

  const diaryData = {
    date: getToday(),
    summary,
    feeling,
    emotion: selectedEmotion.value || '',
    messages: recent.map(m => ({
      role: m.role,
      content: stripHtml(m.content),
    })),
    source: 'treehole',
  }

  sessionStorage.setItem('treehole_diary_draft', JSON.stringify(diaryData))

  router.push({
    name: 'MoodCheckin',
    query: { from: 'treehole' },
  })
}

// ====== 导航到历史 ======
function goToHistory() {
  router.push({ name: 'TreeholeHistory' })
}

// ====== 工具函数 ======
function getToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ====== 生命周期 ======
onMounted(async () => {
  // 加载今日情绪标签
  treeholeStore.loadTodayEmotion()

  // 检查是否有指定 sessionId（从历史页面跳转）
  const querySessionId = route.query.sessionId as string | undefined
  if (querySessionId) {
    sessionId.value = querySessionId
    treeholeStore.switchSession(querySessionId)
    // 加载该会话的消息
    const stored = treeholeStorage.getMessages(querySessionId)
    // 转换成 LocalMessage 格式
    const h = new Date().getHours()
    const mi = new Date().getMinutes()
    messages.value = stored.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      time: `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`,
    }))
    showGreeting.value = false
    greetingDismissed.value = true
  } else {
    // 获取或创建最新会话
    const s = treeholeStorage.getOrCreateLatestSession()
    sessionId.value = s.id
    treeholeStore.switchSession(s.id)
    // 加载已有消息
    const stored = treeholeStorage.getMessages(s.id)
    if (stored.length > 0) {
      messages.value = stored.map(m => {
        const d = new Date(m.createdAt)
        return {
          id: m.id,
          role: m.role,
          content: m.content,
          time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
        }
      })
      showGreeting.value = false
      greetingDismissed.value = true
    }
  }

  nextTick(() => {
    scrollToBottom()
    inputRef.value?.focus()
  })

  // 进入问候 4 秒后自动淡出
  setTimeout(() => {
    showGreeting.value = false
    greetingDismissed.value = true
  }, 4000)

  startPlaceholderRotation()
})

onUnmounted(() => {
  stopPlaceholderRotation()
  if (sseController) {
    sseController.abort()
    sseController = null
  }
})
</script>

<style scoped>
.treehole {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: linear-gradient(180deg, #2A1F1B 0%, #1A130E 100%);
  overflow: hidden;
  transition: background 1.5s ease;
}
.treehole.is-deep-night {
  background: linear-gradient(180deg, #1A1418 0%, #0E0A0C 100%);
}

:deep(.status-bar) {
  color: rgba(255, 255, 255, 0.8);
}

/* ========== 装饰 ========== */
.deco-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.star {
  position: absolute;
  color: rgba(255, 255, 255, 0.25);
  font-size: 14px;
  animation: twinkle 3s ease-in-out infinite;
}
.s1 { top: 12%; left: 10%; font-size: 10px; opacity: 0.5; animation-delay: 0s; }
.s2 { top: 20%; right: 18%; font-size: 16px; opacity: 0.6; animation-delay: 0.6s; }
.s3 { top: 35%; left: 6%; font-size: 12px; opacity: 0.3; animation-delay: 1.2s; }
.s4 { top: 45%; right: 12%; font-size: 10px; opacity: 0.4; animation-delay: 0.3s; }
.s5 { top: 8%; left: 50%; font-size: 8px; opacity: 0.35; animation-delay: 1.8s; }

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.2); }
}

.moon {
  position: absolute;
  top: 18%;
  right: 30%;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #FFF8E1, #FFE082);
  box-shadow: 0 0 40px rgba(255, 224, 130, 0.3), 0 0 80px rgba(255, 224, 130, 0.12);
  z-index: 0;
  pointer-events: none;
  transition: all 1s ease;
}
.is-deep-night .moon {
  box-shadow: 0 0 60px rgba(255, 224, 130, 0.45), 0 0 120px rgba(255, 224, 130, 0.2);
}

/* ========== 治愈音景 ========== */
.soundscape-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  position: relative;
  z-index: 5;
  overflow-x: auto;
}
.soundscape-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  flex-shrink: 0;
}
.soundscape-chip {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.08);
  white-space: nowrap;
  transition: all 0.2s;
}
.soundscape-chip:active {
  background: rgba(255, 255, 255, 0.15);
}
.soundscape-chip.active {
  background: rgba(255, 224, 130, 0.2);
  color: #FFE082;
}

/* ========== 导航 ========== */
.nav-bar {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  flex-shrink: 0;
  position: relative;
  z-index: 4;
}
.nav-bar .left {
  width: 36px;
  height: 36px;
}
.nav-bar .icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
}
.nav-bar .icon-btn:active {
  background: rgba(255, 255, 255, 0.1);
}
.nav-bar .title {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
}
.nav-bar .right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.soundscape-btn.active {
  background: rgba(255, 224, 130, 0.15);
  color: #FFE082;
}
.anon-tag {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 10px;
  border-radius: 99px;
  white-space: nowrap;
}

.safety-label {
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  padding: 4px 16px 8px;
  position: relative;
  z-index: 4;
}

/* ========== 内容区 ========== */
.content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 4px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  z-index: 2;
  scroll-behavior: smooth;
}

.greeting {
  text-align: center;
  padding: 32px 16px 16px;
}
.greeting-moon {
  font-size: 48px;
  line-height: 1;
  margin-bottom: 16px;
  animation: float 4s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.greeting-text {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.75);
}

.intro-text {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
  padding: 8px 0;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.msg-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  max-width: 85%;
  animation: msgIn 0.3s ease-out;
}
@keyframes msgIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.msg-row.user {
  align-self: flex-end;
}
.ai-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.bubble {
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}
.ai-bubble {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  border-radius: 16px 16px 16px 4px;
}
.user-bubble {
  background: linear-gradient(135deg, #F4A988 0%, #E88A6B 100%);
  color: #fff;
  border-radius: 16px 16px 4px 16px;
}

/* ---- 情绪标签提议 ---- */
.emotion-prompt {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  padding: 20px 16px 16px;
  margin-top: 8px;
}
.emotion-question {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 14px;
  text-align: center;
}
.emotion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.emotion-chip {
  padding: 8px 16px;
  border-radius: 99px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.08);
  transition: all 0.2s;
  white-space: nowrap;
}
.emotion-chip:active {
  background: rgba(255, 255, 255, 0.15);
}
.emotion-chip.selected {
  background: rgba(255, 224, 130, 0.2);
  color: #FFE082;
  border: 1px solid rgba(255, 224, 130, 0.3);
}
.emotion-saved {
  text-align: center;
  font-size: 12px;
  color: #6ABF69;
  margin-top: 10px;
}

/* ---- 打字中 ---- */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0 4px 40px;
}
.typing {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}
.typing span {
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  animation: bounce 1.2s ease-in-out infinite;
}
.typing span:nth-child(2) { animation-delay: 0.15s; }
.typing span:nth-child(3) { animation-delay: 0.3s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
.typing-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}

/* ---- 今日情绪标签栏 ---- */
.today-emotion-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  flex-wrap: wrap;
}
.emotion-bar-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
}
.emotion-tag {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.08);
  padding: 4px 10px;
  border-radius: 99px;
  white-space: nowrap;
}

.scroll-spacer {
  height: 12px;
  flex-shrink: 0;
}

/* ========== 输入区 ========== */
.input-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px 20px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  z-index: 3;
}
.input-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}
.input-icon:active {
  background: rgba(255, 255, 255, 0.1);
}
.input-box {
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-pill);
  padding: 8px 16px;
}
.input-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
}
.input-box input::placeholder {
  color: rgba(255, 255, 255, 0.35);
  transition: opacity 0.3s;
}
.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.15s, opacity 0.2s;
}
.send-btn:active:not(.disabled) {
  transform: scale(0.92);
}
.send-btn.disabled {
  opacity: 0.4;
}

/* ========== 离场收束浮层 ========== */
.exit-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.exit-dialog {
  background: #2A1F1B;
  border-radius: 20px;
  padding: 32px 28px 24px;
  margin: 0 24px;
  max-width: 320px;
  text-align: center;
}
.exit-icon {
  font-size: 48px;
  line-height: 1;
  margin-bottom: 12px;
}
.exit-title {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
  line-height: 1.4;
}
.exit-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 24px;
  line-height: 1.5;
}
.exit-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.exit-btn {
  width: 100%;
  padding: 14px;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.2s;
}
.exit-btn:active {
  background: rgba(255, 255, 255, 0.14);
}
.exit-btn.primary {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%);
  color: #fff;
}
.exit-btn.ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
}

/* ========== 过渡动画 ========== */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.35s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.fade-down-enter-active {
  transition: all 0.8s ease-out;
}
.fade-down-leave-active {
  transition: all 0.4s ease-in;
}
.fade-down-enter-from {
  opacity: 0;
  transform: translateY(-16px);
}
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.fade-slide-enter-active {
  transition: all 0.3s ease-out;
}
.fade-slide-leave-active {
  transition: all 0.25s ease-in;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.slide-up-enter-active {
  transition: all 0.4s ease-out;
}
.slide-up-leave-active {
  transition: all 0.25s ease-in;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
