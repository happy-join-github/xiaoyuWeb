<template>
  <div class="treehole">
    <!-- 装饰层 -->
    <div class="deco-stars">
      <span class="star s1">✦</span>
      <span class="star s2">✦</span>
      <span class="star s3">✦</span>
      <span class="star s4">✦</span>
      <span class="star s5">✦</span>
    </div>
    <div class="moon"></div>

    <StatusBar />

    <!-- 自定义导航栏 -->
    <div class="nav-bar">
      <div class="left">
        <button class="icon-btn" @click="goBack">
          <SvgIcon name="back" :size="24" />
        </button>
      </div>
      <div class="title">树洞</div>
      <div class="right">
        <span class="anon-tag">🔒 匿名</span>
      </div>
    </div>

    <!-- 安全标签 -->
    <div class="safety-label">这里很安全，不会有人评价你</div>

    <!-- 内容滚动区 -->
    <div class="scroll-area content">
      <!-- 引言 -->
      <div class="intro-text">
        把心里的话，<br>留在这里。<br>没有人会知道是你。
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

      <!-- 打字中动画 -->
      <div class="typing-indicator">
        <div class="typing">
          <span></span><span></span><span></span>
        </div>
        <span class="typing-label">{{ userStore.aiName }}正在输入...</span>
      </div>

      <!-- 保存提示 -->
      <router-link to="/mood/checkin" class="save-card">
        <span class="save-icon">📔</span>
        <span class="save-text">保存到日记</span>
        <SvgIcon name="chevron_right" :size="18" />
      </router-link>
    </div>

    <!-- 输入区 -->
    <div class="input-area">
      <button class="input-icon" aria-label="语音">
        <SvgIcon name="mic" :size="22" />
      </button>
      <div class="input-box">
        <input type="text" placeholder="说点什么..." />
      </div>
      <button class="send-btn" aria-label="发送">
        <SvgIcon name="send" :size="20" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import StatusBar from '../../components/StatusBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import { mockTreeholeMessages } from '../../api/mock'
import { useUserStore } from '../../stores/user'

const messages = mockTreeholeMessages

const router = useRouter()
const userStore = useUserStore()

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/chat')
  }
}
</script>

<style scoped>
.treehole {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: linear-gradient(180deg, #2A1F1B 0%, #1A130E 100%);
  overflow: hidden;
}

/* ---- 让 StatusBar 文字变浅色 ---- */
:deep(.status-bar) {
  color: rgba(255, 255, 255, 0.8);
}

/* ---- 星星装饰 ---- */
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
}
.s1 { top: 12%; left: 10%; font-size: 10px; opacity: 0.5; }
.s2 { top: 20%; right: 18%; font-size: 16px; opacity: 0.6; }
.s3 { top: 35%; left: 6%; font-size: 12px; opacity: 0.3; }
.s4 { top: 45%; right: 12%; font-size: 10px; opacity: 0.4; }
.s5 { top: 8%; left: 50%; font-size: 8px; opacity: 0.35; }

/* ---- 月亮 ---- */
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
}

/* ---- 自定义导航 ---- */
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
}
.anon-tag {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 10px;
  border-radius: 99px;
  white-space: nowrap;
}

/* ---- 安全标签 ---- */
.safety-label {
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  padding: 4px 16px 8px;
  position: relative;
  z-index: 4;
}

/* ---- 内容区 ---- */
.content {
  padding: 4px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  z-index: 2;
}

/* 引言 */
.intro-text {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
  padding: 8px 0;
}

/* ---- 消息时间线 ---- */
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

/* ---- 保存提示 ---- */
.save-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-md);
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
}
.save-icon {
  font-size: 20px;
  line-height: 1;
}
.save-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

/* ---- 输入区 ---- */
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
