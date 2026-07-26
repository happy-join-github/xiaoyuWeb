<template>
  <div class="screen-bg"></div>
  <StatusBar />
  <NavBar title="编辑个人信息" left="back" @click-left="$router.back()" />

  <div class="scroll-area no-scrollbar">
    <!-- 头像 -->
    <div class="card fade-up">
      <div class="card-title">我的头像</div>
      <div class="avatar-section">
        <div class="current-avatar">{{ editForm.avatar }}</div>
        <div class="avatar-picker">
          <span
            v-for="e in avatarList"
            :key="e"
            class="avatar-option"
            :class="{ active: editForm.avatar === e }"
            @click="editForm.avatar = e"
          >{{ e }}</span>
        </div>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="card fade-up">
      <div class="card-title">基本信息</div>
      <div class="field-group">
        <div class="field">
          <label>昵称</label>
          <el-input
            v-model="editForm.name"
            maxlength="12"
            placeholder="输入你的昵称"
          />
          <span class="hint">最多 12 个字符</span>
        </div>
        <div class="field">
          <label>手机号</label>
          <el-input
            v-model="editForm.phone"
            :disabled="true"
          />
        </div>
      </div>
    </div>

    <!-- AI 伙伴 -->
    <div class="card fade-up">
      <div class="card-title">AI 伙伴</div>
      <div class="companion-header">
        <div class="companion-avatar">{{ userStore.avatar || '🦊' }}</div>
        <div>
          <div class="companion-label">伙伴名称</div>
          <div class="companion-name">{{ userStore.aiName || '小愈' }}</div>
        </div>
      </div>
      <div class="companion-summary">
        <div class="summary-item">
          <span class="summary-label">声线</span>
          <span class="summary-value">{{ userStore.voice }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">角色</span>
          <span class="summary-value">{{ userStore.characterTags.slice(0, 3).join(' · ') || '未设置' }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">问候</span>
          <span class="summary-value">{{ userStore.morningGreeting }} / {{ userStore.eveningGreeting }}</span>
        </div>
      </div>
      <div class="companion-divider"></div>
      <router-link to="/profile/ai-settings" class="companion-link">
        <span>编辑角色设定、声线偏好、问候时间</span>
        <span class="link-arrow">→</span>
      </router-link>
    </div>

    <!-- 不可修改的信息 -->
    <div class="card fade-up">
      <div class="card-title">成长数据</div>
      <div class="field-group">
        <div class="field readonly">
          <label>陪伴天数</label>
          <div class="readonly-value">{{ userStore.companionDays }} 天</div>
        </div>
        <div class="field readonly">
          <label>聊天轮次</label>
          <div class="readonly-value">{{ userStore.chatCount }} 轮</div>
        </div>
        <div class="field readonly">
          <label>日记记录</label>
          <div class="readonly-value">{{ userStore.diaryCount }} 篇</div>
        </div>
        <div class="field readonly">
          <label>收藏卡片</label>
          <div class="readonly-value">{{ userStore.collectionCount }} 张</div>
        </div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="action-bar fade-up">
      <el-button type="primary" round class="save-btn" @click="saveProfile">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElInput, ElButton } from 'element-plus'
import StatusBar from '../../components/StatusBar.vue'
import NavBar from '../../components/NavBar.vue'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

const avatarList = ['🦊', '🐱', '🐶', '🐰', '🐼', '🐸', '🦋', '🌸', '🌻', '⭐']

const editForm = reactive({
  name: userStore.name,
  avatar: userStore.avatar,
  phone: userStore.phone,
  companionDays: userStore.companionDays,
  chatCount: userStore.chatCount,
  diaryCount: userStore.diaryCount,
  collectionCount: userStore.collectionCount,
})

function saveProfile() {
  const trimmedName = editForm.name.trim()
  if (!trimmedName) {
    ElMessage.warning('昵称不能为空')
    return
  }
  // 用户图标
  userStore.updateProfile({
    name: trimmedName,
    // avatar: editForm.avatar,
  })

  ElMessage.success('个人信息已更新')
  router.back()
}
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
  padding-bottom: 32px;
}

/* 卡片 */
.card {
  margin: 0 16px 16px;
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(232, 138, 107, 0.10);
  border: 1.5px solid #FFE0CB;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #4A3A2E;
  margin-bottom: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field label {
  font-size: 12px;
  color: #9C8B7E;
  display: block;
  margin-bottom: 6px;
}

/* el-input 定制样式 */
.field :deep(.el-input) {
  width: 100%;
}

.field :deep(.el-input__wrapper) {
  border: 1.5px solid #FFE0CB;
  border-radius: 12px;
  background: #FFFBF8;
  box-shadow: none;
  transition: border-color 0.2s;
  padding: 0 14px;
}

.field :deep(.el-input__wrapper:hover) {
  border-color: #FFE0CB;
  box-shadow: none;
}

.field :deep(.el-input__wrapper.is-focus) {
  border-color: #E88A6B;
  background: #fff;
  box-shadow: none;
}

.field :deep(.el-input__inner) {
  color: #4A3A2E;
  height: 40px;
}

/* 禁用状态 */
.field :deep(.el-input__wrapper.is-disabled) {
  background: #FFFBF8;
  border-color: #FFE0CB;
}

.field :deep(.el-input.is-disabled .el-input__inner) {
  color: #4A3A2E;
  -webkit-text-fill-color: #4A3A2E;
}

.field .hint {
  display: block;
  font-size: 11px;
  color: #C4B5A6;
  margin-top: 4px;
}

/* 只读字段 */
.field.readonly {
  padding: 10px 0;
  border-bottom: 1px solid #FAF1E5;
}

.field.readonly:last-child {
  border-bottom: none;
}

.readonly-value {
  font-size: 15px;
  color: #4A3A2E;
  font-weight: 500;
}

/* 头像区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* 头像预览 */
.current-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  background: #FFF8F1;
  box-shadow: 0 8px 24px rgba(244, 169, 136, 0.25);
}

.avatar-picker {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.avatar-option {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #FFF8F1;
  border: 2px solid transparent;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s;
}

.avatar-option:hover {
  background: #FFEAD9;
}

.avatar-option.active {
  border-color: #E88A6B;
  background: #FFEAD9;
  transform: scale(1.1);
}

/* 操作栏 */
.action-bar {
  margin: 0 16px;
}

/* el-button 定制样式 */
.save-btn {
  --el-border-radius-round: 999px;
  --el-button-bg-color: transparent;
  --el-button-border-color: transparent;
  --el-button-hover-bg-color: transparent;
  --el-button-hover-border-color: transparent;
  --el-button-active-bg-color: transparent;
  --el-button-active-border-color: transparent;
  --el-button-text-color: #fff;
  --el-button-hover-text-color: #fff;
  --el-button-active-text-color: #fff;
  width: 100%;
  border: none;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #E88A6B, #E07A5A);
  color: #fff;
  box-shadow: 0 4px 16px rgba(232, 138, 107, 0.35);
  transition: opacity 0.2s;
  padding: 22px 0;
}

.save-btn:hover {
  background: linear-gradient(135deg, #E88A6B, #E07A5A);
  opacity: 0.9;
}

.save-btn:active {
  opacity: 0.85;
}

/* 伙伴状态卡 */
.companion-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 16px;
}
.companion-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  background: #FFF8F1;
  box-shadow: 0 4px 14px rgba(244, 169, 136, 0.2);
}
.companion-label {
  font-size: 12px;
  color: #9C8B7E;
  margin-bottom: 4px;
}
.companion-name {
  font-size: 17px;
  font-weight: 600;
  color: #4A3A2E;
}
.companion-summary {
  display: flex;
  gap: 16px;
  padding-bottom: 14px;
}
.summary-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.summary-label {
  font-size: 11px;
  color: #C4B5A6;
}
.summary-value {
  font-size: 13px;
  color: #4A3A2E;
  font-weight: 500;
}
.companion-divider {
  height: 1px;
  background: #FAF1E5;
  margin-bottom: 14px;
}
.companion-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #E88A6B;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  padding: 2px 0;
}
.link-arrow {
  font-size: 16px;
  line-height: 1;
}
</style>
