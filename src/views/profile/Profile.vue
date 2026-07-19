<template>
  <div class="screen-bg"></div>
  <StatusBar />
  <NavBar title="我的" left="">
    <template #right>
      <router-link to="/profile/settings" class="icon-btn">
        <SvgIcon name="settings" :size="22" />
      </router-link>
    </template>
  </NavBar>

  <div class="scroll-area no-scrollbar">
    <!-- 顶部用户区 -->
    <div class="user-hero fade-in">
      <div class="avatar lg" style="width: 72px; height: 72px; font-size: 36px">🦊</div>
      <div class="info">
        <div class="name">
          {{ userStore.name }}
          <svg style="vertical-align: middle" width="16" height="16" viewBox="0 0 24 24" fill="#E88A6B">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <div class="meta">
          <span>陪伴 14 天</span>
          <span style="color: #C4B5A6">·</span>
          <span>今天 9:32 在线</span>
        </div>
      </div>
      <button class="edit-btn" @click="onEditProfile">
        <SvgIcon name="edit" :size="16" />
      </button>
    </div>

    <!-- 数据面板 -->
    <div class="data-panel fade-up">
      <div class="row">
        <div class="item">
          <div class="num">14</div>
          <div class="label">陪伴天数</div>
        </div>
        <div class="divider"></div>
        <div class="item">
          <div class="num">86</div>
          <div class="label">聊天轮次</div>
        </div>
        <div class="divider"></div>
        <div class="item">
          <div class="num">14</div>
          <div class="label">日记数</div>
        </div>
        <div class="divider"></div>
        <div class="item">
          <div class="num">12</div>
          <div class="label">收藏卡片</div>
        </div>
      </div>
    </div>

    <!-- AI 伙伴卡 -->
    <router-link class="ai-card fade-up" to="/profile/ai-settings">
      <div class="av">🌸</div>
      <div class="info">
        <div class="name">{{ userStore.aiName }} · 你的伙伴</div>
        <div class="desc">称呼你为「{{ userStore.name }}」· 温柔陪伴中</div>
      </div>
      <div class="right-btn">编辑 →</div>
    </router-link>

    <!-- 功能列表 -->
    <div class="section fade-up">
      <router-link class="list-item" to="/mood/calendar">
        <div class="ic peach">
          <SvgIcon name="calendar" :size="16" />
        </div>
        <div class="text">
          <div class="t1">我的心情</div>
          <div class="t2">查看日历 · 共 14 条记录</div>
        </div>
        <SvgIcon class="right" name="right" :size="18" />
      </router-link>
      <router-link class="list-item" to="/mood/report">
        <div class="ic blue">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18" />
            <path d="M7 12l4-4 4 6 5-8" />
          </svg>
        </div>
        <div class="text">
          <div class="t1">情绪周报 <span class="badge">NEW</span></div>
          <div class="t2">这一周的你 · 已生成</div>
        </div>
        <SvgIcon class="right" name="right" :size="18" />
      </router-link>
      <router-link class="list-item" to="/chat/history">
        <div class="ic sage">
          <SvgIcon name="chat" :size="16" />
        </div>
        <div class="text">
          <div class="t1">聊天历史</div>
          <div class="t2">86 条对话 · 7 天前</div>
        </div>
        <SvgIcon class="right" name="right" :size="18" />
      </router-link>
      <router-link class="list-item" to="/cards">
        <div class="ic cream">
          <SvgIcon name="cards" :size="16" />
        </div>
        <div class="text">
          <div class="t1">我的收藏</div>
          <div class="t2">12 张治愈卡片</div>
        </div>
        <SvgIcon class="right" name="right" :size="18" />
      </router-link>
    </div>

    <!-- 设置面板 -->
    <div class="section fade-up">
      <router-link class="list-item" to="/profile/settings">
        <div class="ic peach">
          <SvgIcon name="bell" :size="16" />
        </div>
        <div class="text">
          <div class="t1">通知设置</div>
        </div>
        <SvgIcon class="right" name="right" :size="18" />
      </router-link>
      <router-link class="list-item" to="/profile/settings">
        <div class="ic blue">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div class="text">
          <div class="t1">关于{{ userStore.aiName }}</div>
        </div>
        <SvgIcon class="right" name="right" :size="18" />
      </router-link>
      <router-link class="list-item" to="/profile/settings">
        <div class="ic sage">
          <SvgIcon name="shield" :size="16" />
        </div>
        <div class="text">
          <div class="t1">隐私与数据</div>
        </div>
        <SvgIcon class="right" name="right" :size="18" />
      </router-link>
    </div>

    <!-- 紧急提示 -->
    <div class="emergency">
      <div class="ic">
        <SvgIcon name="phone" :size="16" />
      </div>
      <div>
        如果你正在经历困难，请拨打 24 小时心理援助热线：
        <b style="color: #E88A6B">400-161-9995</b>
      </div>
    </div>

    <div style="height: 16px"></div>
  </div>

  <TabBar activeKey="me" />
</template>

<script setup lang="ts">
import StatusBar from '../../components/StatusBar.vue'
import NavBar from '../../components/NavBar.vue'
import TabBar from '../../components/TabBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()

function onEditProfile() {
  // TODO: implement edit profile
}
</script>

<style scoped>
.screen-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #FFEAD9 0%, #FFF8F1 60%);
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
  padding-bottom: 16px;
}

/* 顶部用户区 */
.user-hero {
  padding: 8px 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-hero .avatar {
  box-shadow: 0 8px 24px rgba(244, 169, 136, 0.3);
  position: relative;
}

.user-hero .avatar::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  background: #fff;
  border: 3px solid #FFEAD9;
  border-radius: 50%;
  box-sizing: border-box;
}

.user-hero .info {
  flex: 1;
}

.user-hero .name {
  font-size: 20px;
  font-weight: 700;
  color: #4A3A2E;
}

.user-hero .meta {
  font-size: 12px;
  color: #9C8B7E;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-hero .edit-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  color: #9C8B7E;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
}

/* 数据面板 */
.data-panel {
  margin: 0 16px 16px;
  background: #fff;
  border-radius: 20px;
  padding: 20px 16px;
  box-shadow: var(--shadow-sm);
}

.data-panel .row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  text-align: center;
}

.data-panel .item .num {
  font-size: 20px;
  font-weight: 700;
  color: #E88A6B;
}

.data-panel .item .label {
  font-size: 11px;
  color: #9C8B7E;
  margin-top: 4px;
}

.data-panel .divider {
  width: 1px;
  background: #F1E5D7;
  align-self: stretch;
}

/* AI 伙伴卡 */
.ai-card {
  margin: 0 16px 16px;
  padding: 16px;
  background: linear-gradient(135deg, #4A3A2E 0%, #2B1F18 100%);
  border-radius: 20px;
  color: #FFE9D6;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 6px 20px rgba(74, 58, 46, 0.2);
}

.ai-card .av {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD4C2 0%, #FFE7D1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  flex-shrink: 0;
}

.ai-card .info {
  flex: 1;
}

.ai-card .info .name {
  font-size: 16px;
  font-weight: 600;
}

.ai-card .info .desc {
  font-size: 11px;
  color: #C4B5A6;
  margin-top: 4px;
}

.ai-card .right-btn {
  background: rgba(255, 233, 214, 0.12);
  color: #FFE9D6;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  flex-shrink: 0;
}

/* 列表 */
.section {
  margin: 0 16px 16px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.list-item {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #FAF1E5;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item .ic {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.list-item .ic.peach {
  background: #FFE7D1;
  color: #E88A6B;
}

.list-item .ic.blue {
  background: #E5F1F8;
  color: #6BA4C9;
}

.list-item .ic.sage {
  background: #E8F0E2;
  color: #7BA970;
}

.list-item .ic.cream {
  background: #FFF4E8;
  color: #D4A574;
}

.list-item .text {
  flex: 1;
}

.list-item .text .t1 {
  font-size: 14px;
  color: #4A3A2E;
}

.list-item .text .t2 {
  font-size: 11px;
  color: #9C8B7E;
  margin-top: 2px;
}

.list-item .right {
  color: #C4B5A6;
  flex-shrink: 0;
}

.list-item .badge {
  background: #E88A6B;
  color: #fff;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  margin-right: 6px;
}

/* 紧急提示 */
.emergency {
  margin: 0 16px 16px;
  padding: 12px 16px;
  background: #FFF4E8;
  border-radius: 14px;
  font-size: 11px;
  color: #9C8B7E;
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 8px;
}

.emergency .ic {
  color: #E88A6B;
  flex-shrink: 0;
}
</style>
