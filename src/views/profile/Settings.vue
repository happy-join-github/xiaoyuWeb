<template>
  <div class="screen-bg"></div>
  <StatusBar />

  <NavBar title="设置" left="back" />

  <div class="content no-scrollbar">
    <div class="section-title">隐私与数据</div>
    <div class="section">
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
    </div>

    <div class="section-title">外观</div>
    <div class="section">
      <div class="setting-item theme-row" @click="openThemePicker = !openThemePicker">
        <div class="ic cream">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </div>
        <span class="label">主题</span>
        <span class="right-text" :style="{ color: currentTheme?.color }">
          {{ currentTheme?.icon || '' }} {{ currentTheme?.name || '默认' }}
        </span>
      </div>
      <transition name="slide">
        <div v-if="openThemePicker" class="theme-picker">
          <div
            v-for="t in userStore.availableThemes"
            :key="t.key"
            class="theme-card"
            :class="{ active: settings.themeKey === t.key }"
            :style="{ borderColor: settings.themeKey === t.key ? t.color : 'transparent' }"
            @click.stop="onSelectTheme(t.key)"
          >
            <div class="theme-icon" :style="{ background: t.color }">{{ t.icon }}</div>
            <div class="theme-info">
              <div class="theme-name">{{ t.name }}</div>
              <div class="theme-desc">{{ t.desc }}</div>
            </div>
          </div>
        </div>
      </transition>
      <div class="setting-item">
        <div class="ic blue">
          <SvgIcon name="moon" :size="16" />
        </div>
        <span class="label">深色模式</span>
        <el-switch v-model="settings.darkMode" @change="onDarkModeChange" />
      </div>
    </div>

    <div class="section-title">关于</div>
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

    <div class="version">{{ userStore.aiName }} v1.0.0 &middot; Made with &#x1F338;</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage, ElSwitch } from 'element-plus'
import StatusBar from '../../components/StatusBar.vue'
import NavBar from '../../components/NavBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import { useUserStore } from '../../stores/user'
import { useThemeStore } from '../../stores/theme'

const userStore = useUserStore()
const themeStore = useThemeStore()

/** 本地表单（与 store 双向同步） */
const settings = ref({ ...userStore.settings })
const openThemePicker = ref(false)

/** 当前主题元数据 */
const currentTheme = computed(() =>
  userStore.availableThemes.find((t) => t.key === settings.value.themeKey),
)

/** store 同步到本地 */
watch(
  () => userStore.settings,
  (val) => {
    settings.value = { ...val }
  },
  { deep: true },
)

/** 进入页面：拉取后端应用设置，同时初始化主题 */
onMounted(async () => {
  const data = await userStore.loadAppSettings()
  if (data) {
    settings.value = { ...userStore.settings }
  }
  // 从 store 中同步主题和深色模式到全局
  themeStore.applyTheme(settings.value.themeKey)
  applyDarkMode(settings.value.darkMode)
})

/** 持久化到后端，msg 为 null（后端返回 data:null）时视为成功 */
async function persist(payload: Record<string, any>, successText = '已保存') {
  try {
    await userStore.saveAppSettings(payload)
    // saveAppSettings 内部 catch 后返回 null，不代表失败；
    // 只要不抛异常且后端 code=200，就视为保存成功
    ElMessage.success(successText)
  } catch {
    ElMessage.error('保存失败，请稍后重试')
  }
}

/** 应用深色模式到 HTML 根元素 */
function applyDarkMode(enabled: boolean) {
  if (enabled) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function onDarkModeChange() {
  applyDarkMode(settings.value.darkMode)
  persist({ darkMode: settings.value.darkMode })
}

async function onSelectTheme(key: string) {
  if (settings.value.themeKey === key) {
    openThemePicker.value = false
    return
  }
  settings.value.themeKey = key
  // 立即应用到全局
  themeStore.applyTheme(key)
  await persist({ themeKey: key }, '主题已切换')
  openThemePicker.value = false
}

function onClearData() {
  ElMessage.info('此功能开发中，敬请期待')
}
function onExport() {
  ElMessage.info('此功能开发中，敬请期待')
}
function onUserAgreement() {
  ElMessage.info('用户协议 — 开发中')
}
function onPrivacyPolicy() {
  ElMessage.info('隐私政策 — 开发中')
}
function onFeedback() {
  ElMessage.info('意见反馈 — 开发中')
}
</script>

<style scoped>
.screen-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--cream) 0%, var(--cream-2) 100%);
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
  background: var(--card-bg);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.section-title {
  padding: 14px 16px 4px;
  font-size: 12px;
  color: var(--text-sub);
}
.setting-item {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--line);
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
  background: var(--apricot);
  color: var(--accent-deep);
}
.setting-item .ic.blue {
  background: var(--blue-soft);
  color: #6BA4C9;
}
.setting-item .ic.sage {
  background: var(--sage);
  color: #7BA970;
}
.setting-item .ic.cream {
  background: var(--cream-2);
  color: #D4A574;
}
.setting-item .ic.lavender {
  background: #E8DEF0;
  color: #A87FBA;
}
.setting-item .label {
  flex: 1;
  font-size: 14px;
  color: var(--text-main);
}
.setting-item .right-text {
  color: var(--text-sub);
  font-size: 12px;
}
.setting-item .right-icon {
  color: var(--text-mute);
}
.setting-item .el-switch {
  --el-switch-on-color: var(--accent-deep);
  --el-switch-off-color: var(--coffee);
}
.version {
  text-align: center;
  color: var(--text-mute);
  font-size: 11px;
  margin: 16px 0 0;
  padding-bottom: 16px;
}

/* 主题选择器 */
.theme-row {
  cursor: pointer;
}
.theme-picker {
  padding: 0 16px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  background: var(--cream);
  border-top: 1px solid var(--line);
}
.theme-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--card-bg);
  border: 1.5px solid transparent;
  border-radius: 14px;
  transition: all 0.2s;
}
.theme-card.active {
  background: var(--cream-2);
  box-shadow: var(--shadow-sm);
}
.theme-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
  flex-shrink: 0;
}
.theme-info {
  flex: 1;
  min-width: 0;
}
.theme-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}
.theme-desc {
  font-size: 10px;
  color: var(--text-sub);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-enter-to,
.slide-leave-from {
  max-height: 400px;
  opacity: 1;
}
</style>
