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
    <div class="scroll-area content">
      <!-- 记忆卡片 -->
      <div class="card memory-card">
        <span class="memory-icon">🧠</span>
        <div class="memory-body">
          <span class="memory-label">上次提到</span>
          <span class="memory-text">...项目 deadline...</span>
        </div>
      </div>

      <!-- 树洞入口卡 -->
      <router-link to="/treehole" class="card treehole-card">
        <span class="th-icon">🌙</span>
        <div class="th-body">
          <span class="th-title">匿名倾诉</span>
          <span class="th-desc">有些话，说给树洞听</span>
        </div>
        <SvgIcon name="chevron_right" :size="18" />
      </router-link>

      <!-- 消息时间线 -->
      <div class="timeline">
        <div class="time-label">今天 9:32</div>

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
    </div>

    <!-- 快捷情绪行 -->
    <div class="mood-strip">
      <div class="mood-track">
        <button
          v-for="mood in moods"
          :key="mood.label"
          class="mood-chip"
        >
          {{ mood.emoji }} {{ mood.label }}
        </button>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="input-area">
      <button class="input-icon" aria-label="语音">
        <SvgIcon name="mic" :size="22" />
      </button>
      <div class="input-box">
        <input type="text" placeholder="说说你的心情..." />
      </div>
      <button class="input-icon" aria-label="表情">
        <SvgIcon name="smile" :size="22" />
      </button>
      <button class="send-btn" aria-label="发送">
        <SvgIcon name="send" :size="20" />
      </button>
    </div>

    <!-- FAB 急救按钮 -->
    <router-link to="/rescue" class="fab" aria-label="情绪急救">
      <SvgIcon name="heart" :size="24" />
    </router-link>

    <TabBar activeKey="chat" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import StatusBar from '../../components/StatusBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import TabBar from '../../components/TabBar.vue'
import { mockChatMessages } from '../../api/mock'
import { useUserStore } from '../../stores/user'

const route = useRoute()
const userStore = useUserStore()
const isChildRoute = computed(() => route.path !== '/chat')

const messages = mockChatMessages

const moods = [
  { emoji: '😌', label: '还好' },
  { emoji: '😔', label: '低落' },
  { emoji: '😣', label: '焦虑' },
  { emoji: '🥺', label: '想哭' },
  { emoji: '😊', label: '开心' },
]
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

/* 记忆卡片 */
.memory-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #CDE3F2 0%, #E5F1F8 100%);
  border-radius: var(--radius-md);
}
.memory-icon {
  font-size: 24px;
  line-height: 1;
}
.memory-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.memory-label {
  font-size: 12px;
  color: var(--text-sub);
}
.memory-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
}

/* 树洞入口 */
.treehole-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #2A1F1B 0%, #1A130E 100%);
  border-radius: var(--radius-md);
  color: #fff;
}
.th-icon {
  font-size: 24px;
  line-height: 1;
}
.th-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.th-title {
  font-size: 14px;
  font-weight: 600;
}
.th-desc {
  font-size: 12px;
  opacity: 0.7;
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

/* ---- 快捷情绪行 ---- */
.mood-strip {
  padding: 8px 16px;
  position: relative;
  z-index: 3;
}
.mood-track {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
}
.mood-track::-webkit-scrollbar {
  display: none;
}
.mood-chip {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  background: var(--cream-2);
  font-size: 14px;
  color: var(--text-sub);
  white-space: nowrap;
  transition: all 0.2s;
}
.mood-chip:active {
  background: var(--accent-soft);
  color: var(--accent-deep);
}

/* ---- 输入区 ---- */
.input-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 12px;
  background: var(--cream);
  border-top: 1px solid var(--line);
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
  color: var(--text-sub);
  flex-shrink: 0;
}
.input-icon:active {
  background: var(--cream-2);
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
  transition: transform 0.15s;
}
.send-btn:active {
  transform: scale(0.92);
}
</style>
