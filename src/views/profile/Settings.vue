<template>
  <div class="screen-bg"></div>
  <StatusBar />

  <NavBar title="设置" left="back" />

  <div class="content no-scrollbar">
    <div class="section-title" style="padding: 16px 16px 4px;">通知</div>
    <div class="section">
      <div class="setting-item">
        <div class="ic peach">
          <SvgIcon name="bell" :size="16" />
        </div>
        <span class="label">每日卡片推送</span>
        <span class="switch" :class="{ on: dailyCardPush }" @click="dailyCardPush = !dailyCardPush"></span>
      </div>
      <div class="setting-item">
        <div class="ic blue">
          <SvgIcon name="moon" :size="16" />
        </div>
        <span class="label">晚安提醒</span>
        <span class="switch" :class="{ on: goodnightReminder }" @click="goodnightReminder = !goodnightReminder"></span>
      </div>
      <div class="setting-item">
        <div class="ic sage">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18"/><path d="M7 12l4-4 4 6 5-8"/>
          </svg>
        </div>
        <span class="label">情绪周报</span>
        <span class="switch" :class="{ on: weeklyReport }" @click="weeklyReport = !weeklyReport"></span>
      </div>
      <div class="setting-item">
        <div class="ic cream">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
          </svg>
        </div>
        <span class="label">打卡提醒</span>
        <span class="switch" :class="{ on: checkinReminder }" @click="checkinReminder = !checkinReminder"></span>
      </div>
    </div>

    <div class="section-title" style="padding: 14px 16px 4px;">隐私与数据</div>
    <div class="section">
      <div class="setting-item">
        <div class="ic blue">
          <SvgIcon name="shield" :size="16" />
        </div>
        <span class="label">匿名倾诉</span>
        <span class="switch" :class="{ on: anonymousMode }" @click="anonymousMode = !anonymousMode"></span>
      </div>
      <div class="setting-item" @click="onClearData">
        <div class="ic sage">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </div>
        <span class="label">清除所有数据</span>
        <SvgIcon class="right-icon" name="right" :size="18" />
      </div>
      <div class="setting-item" @click="onExport">
        <div class="ic lavender">
          <SvgIcon name="download" :size="16" />
        </div>
        <span class="label">导出我的日记</span>
        <SvgIcon class="right-icon" name="right" :size="18" />
      </div>
      <div class="setting-item" @click="onLogout">
        <div class="ic peach">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>
        <span class="label">退出登录</span>
        <SvgIcon class="right-icon" name="right" :size="18" />
      </div>
    </div>

    <div class="section-title" style="padding: 14px 16px 4px;">外观</div>
    <div class="section">
      <div class="setting-item">
        <div class="ic cream">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </div>
        <span class="label">主题</span>
        <span class="right-text">温柔奶油</span>
      </div>
      <div class="setting-item">
        <div class="ic blue">
          <SvgIcon name="moon" :size="16" />
        </div>
        <span class="label">深色模式</span>
        <span class="switch" :class="{ on: darkMode }" @click="darkMode = !darkMode"></span>
      </div>
      <div class="setting-item">
        <div class="ic sage">
          <SvgIcon name="check" :size="16" />
        </div>
        <span class="label">字号</span>
        <span class="right-text">标准</span>
      </div>
    </div>

    <div class="section-title" style="padding: 14px 16px 4px;">关于</div>
    <div class="section">
      <div class="setting-item">
        <div class="ic peach">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>
        <span class="label">关于{{ userStore.aiName }}</span>
        <span class="right-text">v1.0.0</span>
      </div>
      <div class="setting-item" @click="onUserAgreement">
        <div class="ic blue">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <span class="label">用户协议</span>
        <SvgIcon class="right-icon" name="right" :size="18" />
      </div>
      <div class="setting-item" @click="onPrivacyPolicy">
        <div class="ic sage">
          <SvgIcon name="shield" :size="16" />
        </div>
        <span class="label">隐私政策</span>
        <SvgIcon class="right-icon" name="right" :size="18" />
      </div>
      <div class="setting-item" @click="onFeedback">
        <div class="ic cream">
          <SvgIcon name="chat" :size="16" />
        </div>
        <span class="label">意见反馈</span>
        <SvgIcon class="right-icon" name="right" :size="18" />
      </div>
    </div>

    <div class="version">{{ userStore.aiName }} v1.0.0 · Made with 🌸</div>
  </div>

  <TabBar activeKey="me" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StatusBar from '../../components/StatusBar.vue'
import NavBar from '../../components/NavBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import TabBar from '../../components/TabBar.vue'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()

const dailyCardPush = ref(true)
const goodnightReminder = ref(true)
const weeklyReport = ref(true)
const checkinReminder = ref(false)
const anonymousMode = ref(true)
const darkMode = ref(false)

function onClearData() {}
function onExport() {}
function onLogout() {}
function onUserAgreement() {}
function onPrivacyPolicy() {}
function onFeedback() {}
</script>

<style scoped>
.screen-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #FFF8F1 0%, #FFEFDF 100%);
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
.section {
  margin: 0 16px 8px;
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.section-title {
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
  cursor: pointer;
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
.setting-item .ic.lavender {
  background: #E8DEF0;
  color: #A87FBA;
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
.setting-item .right-icon {
  color: #C4B5A6;
}
.switch {
  position: relative;
  width: 44px;
  height: 26px;
  background: #E8D5C4;
  border-radius: 13px;
  transition: background 0.2s;
  cursor: pointer;
  flex-shrink: 0;
}
.switch::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}
.switch.on {
  background: #E88A6B;
}
.switch.on::after {
  transform: translateX(18px);
}
.version {
  text-align: center;
  color: #C4B5A6;
  font-size: 11px;
  margin: 16px 0 0;
  padding-bottom: 16px;
}
</style>
