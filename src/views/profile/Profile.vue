<template>
  <router-view v-if="isChildRoute" />
  <template v-else>
  <div class="screen-bg"></div>
  <StatusBar />
  <NavBar title="我的" left="">
    <template #right>
      <router-link to="/profile/settings">
        <el-button circle size="small" class="nav-icon-btn">
          <SvgIcon name="settings" :size="22" />
        </el-button>
      </router-link>
    </template>
  </NavBar>

    <div class="scroll-area no-scrollbar">
      <!-- 顶部用户区 -->
      <div class="user-hero fade-in">
        <div class="avatar lg user-avatar">{{ userStore.avatar }}</div>
        <div class="info">
          <div class="name">
            {{ userStore.name }}
          </div>
          <div class="meta">
            <span>陪伴 {{ userStore.companionDays }} 天</span>
             <svg style="vertical-align: middle" width="16" height="16" viewBox="0 0 24 24" fill="#E88A6B">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>今天 9:32 在线</span>
          </div>
        </div>
        <router-link to="/profile/edit">
          <el-button circle size="small">
            <SvgIcon name="edit" :size="16" />
          </el-button>
        </router-link>
      </div>

      <!-- 数据面板 -->
      <div class="data-panel fade-up">
        <div class="row">
          <div class="item">
            <div class="num">{{ userStore.companionDays }}</div>
            <div class="label">陪伴天数</div>
          </div>
          <div class="item">
            <div class="num">{{ userStore.chatCount }}</div>
            <div class="label">聊天轮次</div>
          </div>
          <div class="item">
            <div class="num">{{ userStore.diaryCount }}</div>
            <div class="label">日记录</div>
          </div>
          <div class="item">
            <div class="num">{{ userStore.collectionCount }}</div>
            <div class="label">收藏卡片</div>
          </div>
        </div>
      </div>

      <!-- AI 伙伴卡 -->
      <router-link class="ai-card fade-up" to="/profile/ai-settings">
        <div class="info">
          <div class="name">{{ userStore.aiName }} · 你的伙伴</div>
          <div class="desc">称呼你为「{{ userStore.name }}」· 温柔陪伴中</div>
        </div>
        <div class="right-btn">编辑 →</div>
      </router-link>

      <!-- 功能列表 -->
      <div class="section fade-up">
        <router-link class="list-item" to="/mood">
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
            <div class="t1">情绪周报 <el-tag size="small" type="danger">NEW</el-tag></div>
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

      <!-- ========== 设置区域 ========== -->

      <!-- 通知设置（内联） -->
      <div class="section fade-up">
        <div class="section-inner-title">通知</div>
        <div class="setting-item">
          <div class="ic peach"><SvgIcon name="bell" :size="16" /></div>
          <span class="label">每日卡片推送</span>
          <el-switch v-model="settings.dailyCardPush" />
        </div>
        <div class="setting-item">
          <div class="ic blue"><SvgIcon name="moon" :size="16" /></div>
          <span class="label">晚安提醒</span>
          <el-switch v-model="settings.goodnightReminder" />
        </div>
        <div class="setting-item">
          <div class="ic sage">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 12l4-4 4 6 5-8"/></svg>
          </div>
          <span class="label">情绪周报推送</span>
          <el-switch v-model="settings.weeklyReport" />
        </div>
        <div class="setting-item">
          <div class="ic cream">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <span class="label">打卡提醒</span>
          <el-switch v-model="settings.checkinReminder" />
        </div>
      </div>

      <!-- 退出登录 -->
      <div class="section fade-up">
        <div class="list-item" @click="onLogout" style="cursor: pointer;">
          <div class="ic peach">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <div class="text">
            <div class="t1">退出登录</div>
          </div>
          <SvgIcon class="right" name="right" :size="18" />
        </div>
      </div>
    </div>

    <TabBar activeKey="me" />
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StatusBar from '../../components/StatusBar.vue'
import NavBar from '../../components/NavBar.vue'
import TabBar from '../../components/TabBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import { ElSwitch, ElTag, ElButton } from 'element-plus'
import { useUserStore } from '../../stores/user'
import service from "../../api/index.ts"

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isChildRoute = computed(() => route.path !== '/profile')

/** 内联设置的状态 */
const settings = reactive({
  dailyCardPush: true,
  goodnightReminder: true,
  weeklyReport: true,
  checkinReminder: false,
})

function onLogout() {
  userStore.logout()
  router.push({ name: 'Login' })
}

onMounted(async () => {
  try {
    const res: any = await service.get("/profile")
    if (res?.code === 200) {
      userStore.updateProfile(res.data)
    }
  } catch {
    // 静默处理 — 401 等情况由拦截器处理
  }
})
</script>

<style scoped>
.screen-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #FFEAD9 0%, #FFF8F1 60%);
}

.scroll-area {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

/* navbar 设置齿轮按钮 — 透明圆形 */
.nav-icon-btn.el-button {
  border: none;
  background: transparent;
  padding: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #9C8B7E;
  font-size: inherit;
}
.nav-icon-btn.el-button:hover {
  background: rgba(0, 0, 0, 0.04);
}

/* 顶部用户区 */
.user-hero {
  padding: 8px 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 72px;
  height: 72px;
  font-size: 36px;
  box-shadow: 0 8px 24px rgba(244, 169, 136, 0.3);
  position: relative;
}
.user-avatar::after {
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

/* 头像旁的编辑按钮 — 透明圆形 */
.user-hero .el-button {
  border: none;
  background: rgba(255, 255, 255, 0.7);
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #9C8B7E;
  flex-shrink: 0;
  font-size: inherit;
}
.user-hero .el-button:hover {
  background: rgba(255, 255, 255, 0.9);
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

/* 数据面板 */
.data-panel {
  margin: 0 16px 16px;
  background: #fff;
  border-radius: 20px;
  padding: 20px 16px 12px;
  box-shadow: 0 2px 12px rgba(232, 138, 107, 0.12);
  border: 1.5px solid #FFE0CB;
}

.data-panel .row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 16px;
  text-align: center;
}

.data-panel .item .num {
  font-size: 22px;
  font-weight: 700;
  color: #E88A6B;
  line-height: 1.2;
}

.data-panel .item .label {
  font-size: 11px;
  color: #9C8B7E;
  margin-top: 2px;
}

/* AI 伙伴卡 */
.ai-card {
  margin: 0 16px 16px;
  padding: 18px 16px;
  background: linear-gradient(135deg, #4A3A2E 0%, #2B1F18 100%);
  border-radius: 20px;
  color: #FFE9D6;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 6px 20px rgba(74, 58, 46, 0.2);
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

/* 手机号显示 */
.phone {
  font-size: 12px;
  color: #9C8B7E;
  margin-top: 2px;
}

/* ========== 内联设置样式 ========== */
.section-inner-title {
  padding: 14px 16px 4px;
  font-size: 12px;
  color: #9C8B7E;
}

.setting-item {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #FAF1E5;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item .ic {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.setting-item .ic.peach {
  background: #FFE7D1;
  color: #E88A6B;
}

.setting-item .ic.blue {
  background: #E5F1F8;
  color: #6BA4C9;
}

.setting-item .ic.sage {
  background: #E8F0E2;
  color: #7BA970;
}

.setting-item .ic.cream {
  background: #FFF4E8;
  color: #D4A574;
}

.setting-item .label {
  flex: 1;
  font-size: 14px;
  color: #4A3A2E;
}

.setting-item .right-text {
  color: #9C8B7E;
  font-size: 12px;
}
</style>
