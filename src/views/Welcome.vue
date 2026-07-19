<template>
  <div class="welcome">
    <!-- 装饰模糊圆 -->
    <div class="deco deco-1"></div>
    <div class="deco deco-2"></div>
    <div class="deco deco-3"></div>

    <StatusBar />

    <div class="body">
      <div class="hero">
        <div class="avatar-circle">
          <span class="hero-emoji">🌸</span>
        </div>
      </div>

      <div class="brand">
        <h1>嗨，我是<span class="brand-name">{{ userStore.aiName || '小愈' }}</span></h1>
        <p class="subtitle">你的温暖陪伴 · 随时倾听</p>
      </div>

      <div class="features">
        <div class="feature-item">
          <div class="feature-icon-wrap">💬</div>
          <div class="feature-text">
            <span class="feature-title">无评价聊天</span>
            <span class="feature-desc">畅所欲言，没有评判</span>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon-wrap">🌙</div>
          <div class="feature-text">
            <span class="feature-title">树洞匿名</span>
            <span class="feature-desc">秘密只说给树洞听</span>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon-wrap">💌</div>
          <div class="feature-text">
            <span class="feature-title">治愈卡片</span>
            <span class="feature-desc">每日一份暖心话</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom">
      <router-link to="/register" class="btn btn-primary start-btn">开始和{{ userStore.aiName }}聊天</router-link>
      <router-link to="/login" class="login-link">我已经有账号</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatusBar from '../components/StatusBar.vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
</script>

<style scoped>
.welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #FFEAD9 0%, #FFCFB6 100%);
  position: relative;
  overflow: hidden;
}

/* ---- 装饰模糊圆 ---- */
.deco {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
}
.deco-1 {
  width: 300px;
  height: 300px;
  background: rgba(255, 200, 170, 0.5);
  top: -60px;
  right: -80px;
}
.deco-2 {
  width: 200px;
  height: 200px;
  background: rgba(255, 180, 150, 0.4);
  top: 40%;
  left: -40px;
}
.deco-3 {
  width: 250px;
  height: 250px;
  background: rgba(255, 210, 180, 0.35);
  bottom: 20%;
  right: -60px;
}

/* ---- 主体内容 ---- */
.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 32px;
  position: relative;
  z-index: 1;
}

/* 插画 */
.hero {
  margin-bottom: 24px;
}
.avatar-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD4C2 0%, #FFB89A 100%);
  box-shadow: 0 12px 32px rgba(244, 169, 136, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-emoji {
  font-size: 48px;
  line-height: 1;
}

/* 品牌区 */
.brand {
  text-align: center;
  margin-bottom: 40px;
}
.brand h1 {
  font-size: 28px;
  font-weight: 700;
  color: #4A3A2E;
  margin-bottom: 8px;
}
.brand-name {
  color: #E88A6B;
  font-weight: 700;
}
.subtitle {
  font-size: 15px;
  color: #9C8B7E;
}

/* 特性列表 */
.features {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 300px;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}
.feature-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.feature-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.feature-title {
  font-size: 15px;
  font-weight: 600;
  color: #4A3A2E;
}
.feature-desc {
  font-size: 13px;
  color: #9C8B7E;
}

/* ---- 底部 ---- */
.bottom {
  padding: 20px 32px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.dots {
  display: none;
}

.start-btn {
  width: 100%;
  max-width: 320px;
  padding: 16px 24px;
  font-size: 16px;
}

.login-link {
  font-size: 14px;
  color: #9C8B7E;
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
