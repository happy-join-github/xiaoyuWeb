<template>
  <div class="screen-bg"></div>
  <StatusBar />

  <div class="header">
    <router-link class="back" to="/mood">
      <SvgIcon name="back" :size="20" />
    </router-link>
    <div class="actions">
      <button class="icon-btn" @click="onEdit">
        <SvgIcon name="edit" :size="18" />
      </button>
      <button class="icon-btn" @click="onShare">
        <SvgIcon name="share" :size="18" />
      </button>
      <button class="icon-btn" @click="showMenu = true">
        <SvgIcon name="more" :size="18" />
      </button>
    </div>
  </div>

  <div class="content no-scrollbar">
    <div class="date-card fade-in">
      <div class="emoji-bg">😊</div>
      <div class="date"><b>7 月 19 日</b> · 周日</div>
      <div class="mood">😊 开心 · 5/5</div>
    </div>

    <div class="quote-section fade-up">
      <div class="text">今天的天空很蓝，楼下咖啡店换了新豆子，意外好喝 ☕</div>
      <div class="sign">— 小柚子 写于 9:32</div>
    </div>

    <div class="section fade-up">
      <div class="label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9C8B7E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
        今日关键词
      </div>
      <div class="keywords">
        <div class="kw"><b>#好天气</b></div>
        <div class="kw">☕ <b>咖啡</b></div>
        <div class="kw">📚 读书</div>
        <div class="kw">🌷 散步</div>
      </div>
    </div>

    <div class="section fade-up">
      <div class="label">
        <SvgIcon name="chat" :size="14" />
        关联对话
      </div>
      <div class="ai-card">
        <div class="av">🌸</div>
        <div class="body">
          <div class="name">{{ userStore.aiName }} · 早安问候</div>
          <div class="text">"早安呀 ☀️ 睡得好吗？今天想聊点什么都可以哦~"</div>
        </div>
      </div>
    </div>

    <div class="section action-section fade-up">
      <div class="action-row">
        <button class="btn btn-ghost" @click="onExport">
          <SvgIcon name="download" :size="16" />
          导出
        </button>
        <button class="btn btn-ghost" @click="onFavorite">
          <SvgIcon name="heart" :size="16" />
          收藏
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StatusBar from '../../components/StatusBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()


const showMenu = ref(false)

function onEdit() {}
function onShare() {}
function onExport() {}
function onFavorite() {}
</script>

<style scoped>
.screen-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #FFEFDF 0%, #FFE0CB 100%);
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
  color: #4A3A2E;
  border: none;
  cursor: pointer;
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
  color: #9C8B7E;
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
  background: #fff;
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
  background: linear-gradient(135deg, #FFE7D1 0%, #FFD4C2 100%);
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
  color: #9C8B7E;
  position: relative;
  z-index: 1;
}
.date-card .date b {
  color: #4A3A2E;
  font-weight: 600;
}
.date-card .mood {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  padding: 4px 10px;
  background: #FFE7D1;
  color: #E88A6B;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  position: relative;
  z-index: 1;
}
.quote-section {
  margin: 0 20px 16px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #FFF8F1 0%, #FFE7D1 100%);
  border-radius: 18px;
  position: relative;
}
.quote-section::before {
  content: "\201C";
  position: absolute;
  top: -4px;
  left: 16px;
  font-size: 60px;
  color: #F4A988;
  line-height: 1;
}
.quote-section .text {
  font-size: 16px;
  line-height: 1.7;
  color: #4A3A2E;
  font-weight: 500;
}
.quote-section .sign {
  font-size: 12px;
  color: #9C8B7E;
  margin-top: 12px;
  text-align: right;
}
.section {
  margin: 0 20px 16px;
}
.section .label {
  font-size: 12px;
  color: #9C8B7E;
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
  background: #fff;
  border-radius: 999px;
  font-size: 12px;
  color: #4A3A2E;
  box-shadow: var(--shadow-sm);
}
.kw b {
  color: #E88A6B;
}
.ai-card {
  background: #fff;
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
  background: linear-gradient(135deg, #FFD4C2 0%, #FFE7D1 100%);
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
  color: #9C8B7E;
}
.ai-card .body .text {
  font-size: 14px;
  color: #4A3A2E;
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
.action-row .btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 24px;
  border-radius: var(--radius-pill);
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
.action-row .btn-ghost {
  background: #fff;
  box-shadow: var(--shadow-sm);
  color: #4A3A2E;
}
</style>
