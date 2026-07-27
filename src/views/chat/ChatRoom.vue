<template>
  <router-view v-if="isChildRoute" />
  <div v-else class="chat-room">
    <!-- 装饰背景层 -->
    <div class="bg-gradient"></div>
    <div class="deco-blob blob-1"></div>
    <div class="deco-blob blob-2"></div>

    <StatusBar />

    <!-- AI 介绍区 -->
    <div class="ai-header">
      <div class="ai-info">
        <div class="avatar sm">🌸</div>
        <div class="ai-meta">
          <span class="ai-name">{{ userStore.aiName }}</span>
          <span class="ai-status">在线</span>
        </div>
      </div>
      <button class="more-btn" aria-label="更多">
        <SvgIcon name="more" :size="22" />
      </button>
    </div>

    <!-- 内容滚动区 -->
    <div class="scroll-area content" ref="scrollRef">
      <!-- 消息时间线 -->
      <div class="timeline">
        <div v-for="msg in messages" :key="msg.id" class="msg-row" :class="msg.role">
          <template v-if="msg.role === 'ai'">
            <div class="avatar sm">🌸</div>
            <div class="bubble ai-bubble" v-html="msg.content"></div>
          </template>
          <template v-else>
            <div class="bubble user-bubble" v-html="msg.content"></div>
          </template>
        </div>
      </div>

      <!-- 打字中动画 -->
      <div class="typing-indicator" v-if="isLoading">
        <div class="typing">
          <span></span><span></span><span></span>
        </div>
        <span class="typing-label">{{ userStore.aiName }} 正在输入...</span>
      </div>

      <!-- 底部留白 -->
      <div class="scroll-spacer"></div>

      <!-- FAB 急救按钮：浮动在消息区右下角 -->
      <router-link to="/rescue" class="fab" aria-label="情绪急救">
        <SvgIcon name="heart" :size="24" />
      </router-link>
    </div>

    <!-- 输入区（含情绪快捷行） -->
    <div class="input-area">
      <!-- 情绪快捷行：折叠在输入区顶部，用表情按钮切换 -->
      <transition name="slide-down">
        <div v-if="showMoodStrip" class="mood-strip">
          <button
            v-for="mood in moods"
            :key="mood.label"
            class="mood-chip"
            :class="{ active: selectedMood === mood.label }"
            @click="sendMood(mood)"
          >
            {{ mood.emoji }} {{ mood.label }}
          </button>
        </div>
      </transition>
      <div class="input-row">
        <button class="input-icon" aria-label="语音">
          <SvgIcon name="mic" :size="22" />
        </button>
        <div class="input-box">
          <input
            ref="inputRef"
            v-model="inputText"
            type="text"
            placeholder="说说你的心情..."
            @keyup.enter="sendMessage"
            maxlength="500"
          />
        </div>
        <button
          class="input-icon"
          :class="{ active: showMoodStrip }"
          aria-label="表情"
          @click="showMoodStrip = !showMoodStrip"
        >
          <SvgIcon name="smile" :size="22" />
        </button>
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
    </div>

    <TabBar activeKey="chat" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import StatusBar from '../../components/StatusBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import TabBar from '../../components/TabBar.vue'
import { useUserStore } from '../../stores/user'
import { getAiReply } from '../treehole/aiReply'
import {
  getOrCreateLatestSession,
  getMessages,
  appendMessage,
  nextMessageId,
  getTimeString,
  type StoredSession,
} from '../../utils/chatStorage'
import type { Message } from '../../api/mock'

const route = useRoute()
const userStore = useUserStore()
const isChildRoute = computed(() => route.path !== '/chat')

// ====== 会话 & 消息 ======
const session = ref<StoredSession | null>(null)
const messages = ref<Message[]>([])
const inputText = ref('')
const isLoading = ref(false)
const selectedMood = ref<string | null>(null)
const showMoodStrip = ref(true)

// ====== DOM 引用 ======
const scrollRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

// ====== 快捷情绪 ======
const moods = [
  { emoji: '😌', label: '还好' },
  { emoji: '😔', label: '低落' },
  { emoji: '😣', label: '焦虑' },
  { emoji: '🥺', label: '想哭' },
  { emoji: '😊', label: '开心' },
]

function sendMood(mood: { emoji: string; label: string }) {
  selectedMood.value = mood.label
  const text = `我感觉${mood.label} ${mood.emoji}`
  inputText.value = text
  sendMessage()
}

// ====== 核心交互：发送消息 ======
async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value || !session.value) return

  // 添加用户消息
  const userMsg: Message = {
    id: nextMessageId(messages.value),
    role: 'user',
    content: escapeHtml(text),
    time: getTimeString(),
  }
  messages.value.push(userMsg)
  appendMessage(session.value.id, userMsg)

  inputText.value = ''
  selectedMood.value = null
  scrollToBottom()

  // AI 回复
  isLoading.value = true

  try {
    await delay(600 + Math.random() * 600)
    const reply = getAiReply(text, messages.value)
    const aiMsg: Message = {
      id: nextMessageId(messages.value),
      role: 'ai',
      content: reply,
      time: getTimeString(),
    }
    messages.value.push(aiMsg)
    appendMessage(session.value.id, aiMsg)
    scrollToBottom()
  } finally {
    isLoading.value = false
  }
}

// ====== 滚动到底部 ======
async function scrollToBottom() {
  await nextTick()
  if (scrollRef.value) {
    scrollRef.value.scrollTop = scrollRef.value.scrollHeight
  }
}

// ====== 工具函数 ======
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ====== 初始化 ======
onMounted(() => {
  // 获取或创建聊天会话
  const s = getOrCreateLatestSession('chat')
  session.value = s
  messages.value = getMessages(s.id)

  nextTick(() => {
    scrollToBottom()
    inputRef.value?.focus()
  })
})
</script>

<style scoped>
.chat-room {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: var(--cream);
  overflow: hidden;
}

/* ---- 装饰背景 ---- */
.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #FFEFDF 0%, #F4E3D0 100%);
  z-index: 0;
}
.blob-1 {
  width: 280px;
  height: 280px;
  background: rgba(205, 227, 242, 0.35);
  top: -60px;
  right: -80px;
}
.blob-2 {
  width: 200px;
  height: 200px;
  background: rgba(255, 212, 194, 0.35);
  bottom: 30%;
  left: -60px;
}

/* ---- AI 介绍区 ---- */
.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  position: relative;
  z-index: 4;
}
.ai-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ai-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.ai-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}
.ai-status {
  font-size: 12px;
  color: #6ABF69;
  font-weight: 500;
}
.ai-status::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6ABF69;
  margin-right: 4px;
  vertical-align: middle;
}
.more-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  flex-shrink: 0;
}
.more-btn:active {
  background: var(--cream-2);
}

/* ---- 内容区 ---- */
.content {
  padding: 8px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 2;
}

/* ---- 消息时间线 ---- */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 4px;
}
.time-label {
  text-align: center;
  font-size: 12px;
  color: var(--text-mute);
  padding: 4px 0;
}
.msg-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  max-width: 85%;
}
.msg-row.user {
  align-self: flex-end;
}
.bubble {
  padding: 12px 16px;
  font-size: 15px;
  line-height: 1.6;
}
.ai-bubble {
  background: #fff;
  color: var(--text-main);
  border-radius: 16px 16px 16px 4px;
  box-shadow: var(--shadow-sm);
}
.user-bubble {
  background: linear-gradient(135deg, #F4A988 0%, #E88A6B 100%);
  color: #fff;
  border-radius: 16px 16px 4px 16px;
}

/* ---- 输入区（含情绪快捷行） ---- */
.input-area {
  display: flex;
  flex-direction: column;
  background: var(--cream);
  border-top: 1px solid var(--line);
  position: relative;
  z-index: 3;
}

/* 情绪快捷行：折叠在输入区顶部 */
.mood-strip {
  display: flex;
  gap: 6px;
  padding: 6px 16px 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.mood-strip::-webkit-scrollbar {
  display: none;
}
.mood-chip {
  flex-shrink: 0;
  padding: 5px 12px;
  border-radius: var(--radius-pill);
  background: var(--cream-2);
  font-size: 13px;
  color: var(--text-sub);
  white-space: nowrap;
  transition: all 0.2s;
}
.mood-chip:active {
  background: var(--accent-soft);
  color: var(--accent-deep);
}
.mood-chip.active {
  background: var(--accent-soft);
  color: var(--accent-deep);
}

/* 输入控件行 */
.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px 12px;
}
.input-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  flex-shrink: 0;
}
.input-icon:active {
  background: var(--cream-2);
}
.input-icon.active {
  background: var(--accent-soft);
  color: var(--accent-deep);
}
.input-box {
  flex: 1;
  background: var(--input-bg);
  border: 1px solid var(--line);
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
  color: var(--text-main);
}
.input-box input::placeholder {
  color: var(--text-mute);
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

/* ---- 打字中动画 ---- */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0 4px 48px;
}
.typing {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}
.typing span {
  width: 6px;
  height: 6px;
  background: var(--text-mute);
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
  color: var(--text-mute);
}

/* ---- 情绪条选中 ---- */
.mood-chip.active {
  background: var(--accent-soft);
  color: var(--accent-deep);
}

/* ---- 底部留白 ---- */
.scroll-spacer {
  height: 16px;
  flex-shrink: 0;
}

/* ---- FAB 急救按钮：浮动在消息区右下角（覆盖全局 .fab 定位） ---- */
.fab {
  position: absolute !important;
  right: 16px !important;
  bottom: 16px !important;
  flex-shrink: 0;
  z-index: 10;
}

/* ---- 情绪行展开/收起动画 ---- */
.slide-down-enter-active {
  transition: all 0.2s ease-out;
}
.slide-down-leave-active {
  transition: all 0.15s ease-in;
}
.slide-down-enter-from {
  opacity: 0;
  max-height: 0;
}
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 60px;
}
</style>
