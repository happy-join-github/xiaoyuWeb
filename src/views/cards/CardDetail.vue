<template>
  <div class="screen-bg"></div>
  <StatusBar />
  <NavBar title="卡片详情" left="back">
    <template #right>
      <button class="icon-btn" @click="onRefresh">
        <SvgIcon name="refresh" :size="18" />
      </button>
    </template>
  </NavBar>

  <div class="scroll-area no-scrollbar">
    <!-- 大卡片 -->
    <div class="big-card fade-in">
      <div class="top-row">
        <div class="type-tag">🌅 暖心话</div>
        <div class="deco-flower">🌸</div>
      </div>
      <div class="text-area">
        <div class="q">"</div>
        <div class="text">
          不必成为任何人期待的样子，<br />你只是你自己<br />就已经足够好了。
        </div>
      </div>
      <div class="bottom">
        <div class="sign">— {{ userStore.aiName }} 🌷</div>
        <div class="date-tag">No.142 · 7.19</div>
      </div>
    </div>

    <!-- 操作区 -->
    <div class="actions fade-up">
      <div class="action" :class="{ collected: isCollected }" @click="toggleCollect">
        <div class="ic">
          <SvgIcon :name="isCollected ? 'heart_fill' : 'heart'" :size="18" />
        </div>
        <span>{{ isCollected ? '已收藏' : '收藏' }}</span>
      </div>
      <div class="action" @click="onShare">
        <div class="ic">
          <SvgIcon name="share" :size="18" />
        </div>
        <span>分享</span>
      </div>
      <div class="action" @click="onSave">
        <div class="ic">
          <SvgIcon name="download" :size="18" />
        </div>
        <span>保存图片</span>
      </div>
    </div>

    <!-- 换一张 -->
    <div class="switch-row">
      <router-link to="/cards/detail">
        <SvgIcon name="refresh" :size="16" />
        换一张
      </router-link>
    </div>

    <div style="height: 24px"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StatusBar from '../../components/StatusBar.vue'
import NavBar from '../../components/NavBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()

const isCollected = ref(true)

function toggleCollect() {
  isCollected.value = !isCollected.value
}

function onShare() {
  // TODO: implement share
}

function onSave() {
  // TODO: implement save image
}

function onRefresh() {
  // TODO: implement refresh / next card
}
</script>

<style scoped>
.screen-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #FFD4C2 0%, #FFE7D1 50%, #FFEFDF 100%);
}

/* icon-btn inside nav-bar slot needs explicit styling here */
.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub, #9C8B7E);
}

.scroll-area {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 24px;
}

/* 大卡片 */
.big-card {
  margin: 12px 0 16px;
  background: linear-gradient(135deg, #FFE7D1 0%, #FFD4C2 50%, #FFC8A8 100%);
  border-radius: 28px;
  padding: 32px 28px;
  box-shadow: 0 20px 40px rgba(244, 169, 136, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  min-height: 300px;
}

.big-card::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 60%);
}

.big-card::after {
  content: '';
  position: absolute;
  bottom: -50px;
  left: -50px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 60%);
}

.big-card .top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.big-card .type-tag {
  background: rgba(255, 255, 255, 0.5);
  color: #E88A6B;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.big-card .deco-flower {
  font-size: 60px;
  opacity: 0.3;
}

.big-card .text-area {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 0;
}

.big-card .text-area .q {
  font-size: 60px;
  line-height: 0.6;
  color: #fff;
  opacity: 0.5;
}

.big-card .text-area .text {
  font-size: 22px;
  line-height: 1.6;
  color: #4A3A2E;
  font-weight: 500;
  margin-top: 12px;
}

.big-card .bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  z-index: 1;
}

.big-card .sign {
  font-size: 12px;
  color: #6B5A4D;
}

.big-card .date-tag {
  font-size: 11px;
  color: #9C8B7E;
}

/* 操作区 */
.actions {
  display: flex;
  gap: 10px;
}

.actions .action {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #4A3A2E;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.actions .action .ic {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFE7D1;
  color: #E88A6B;
}

.actions .action.collected .ic {
  background: #E88A6B;
  color: #fff;
}

.actions .action.collected {
  color: #E88A6B;
  font-weight: 600;
}

/* 切换 */
.switch-row {
  margin-top: 12px;
  text-align: center;
}

.switch-row a {
  color: #9C8B7E;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
