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
          <span class="summary-value">{{ characterTagText || '未设置' }}</span>
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
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElInput, ElButton } from 'element-plus'
import StatusBar from '../../components/StatusBar.vue'
import NavBar from '../../components/NavBar.vue'
import { useUserStore } from '../../stores/user'
import { updateProfile as updateProfileApi } from '../../api/profile'

const router = useRouter()
const userStore = useUserStore()

const avatarList = ['🦊', '🐱', '🐶', '🐰', '🐼', '🐸', '🦋', '🌸', '🌻', '⭐']

/** 兜底：把后端可能返回的字符串/null 安全转成数组（兼容 JSON 字符串 / 逗号分隔） */
const characterTagText = computed(() => {
  const raw = userStore.characterTags as unknown
  let arr: string[] = []
  if (Array.isArray(raw)) {
    arr = raw
  } else if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed || trimmed === '[]') {
      arr = []
    } else if (trimmed.startsWith('[')) {
      // JSON 字符串，如 '["a","b"]'
      try {
        const parsed = JSON.parse(trimmed)
        arr = Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : []
      } catch {
        arr = []
      }
    } else {
      // 逗号 / 顿号 / 空白 分隔
      arr = trimmed.split(/[,，、\s]+/).filter(Boolean)
    }
  }
  return arr.slice(0, 3).join(' · ')
})

const editForm = reactive({
  name: userStore.name,
  avatar: userStore.avatar,
  phone: userStore.phone,
  companionDays: userStore.companionDays,
  chatCount: userStore.chatCount,
  diaryCount: userStore.diaryCount,
  collectionCount: userStore.collectionCount,
})

/** 进入页面：拉取后端最新资料，保证读到的是当前账号数据 */
onMounted(async () => {
  await userStore.loadProfile()
  editForm.name = userStore.name
  editForm.avatar = userStore.avatar
  editForm.phone = userStore.phone
  editForm.companionDays = userStore.companionDays
  editForm.chatCount = userStore.chatCount
  editForm.diaryCount = userStore.diaryCount
  editForm.collectionCount = userStore.collectionCount
})

const saving = ref(false)

async function saveProfile() {
  const trimmedName = editForm.name.trim()
  if (!trimmedName) {
    ElMessage.warning('昵称不能为空')
    return
  }
  if (saving.value) return
  saving.value = true
  try {
    // 后端只接受 name / avatar 两个字段，仅返回 name、avatar、phone
    const res = await updateProfileApi({
      name: trimmedName,
      avatar: editForm.avatar,
    })
    // 直接用后端返回的数据更新 store
    userStore.updateProfile(res)
    ElMessage.success('个人信息已更新')
    router.back()
  } catch {
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.screen-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--cream-2) 0%, var(--cream) 60%);
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
  background: var(--card-bg);
  border-radius: 20px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  border: 1.5px solid var(--line);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field label {
  font-size: 12px;
  color: var(--text-sub);
  display: block;
  margin-bottom: 6px;
}

/* el-input 定制样式 */
.field :deep(.el-input) {
  width: 100%;
}

.field :deep(.el-input__wrapper) {
  border: 1.5px solid var(--line);
  border-radius: 12px;
  background: var(--cream);
  box-shadow: none;
  transition: border-color 0.2s;
  padding: 0 14px;
}

.field :deep(.el-input__wrapper:hover) {
  border-color: var(--line);
  box-shadow: none;
}

.field :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent-deep);
  background: var(--card-bg);
  box-shadow: none;
}

.field :deep(.el-input__inner) {
  color: var(--text-main);
  height: 40px;
}

/* 禁用状态 */
.field :deep(.el-input__wrapper.is-disabled) {
  background: var(--cream);
  border-color: var(--line);
}

.field :deep(.el-input.is-disabled .el-input__inner) {
  color: var(--text-main);
  -webkit-text-fill-color: var(--text-main);
}

.field .hint {
  display: block;
  font-size: 11px;
  color: var(--text-mute);
  margin-top: 4px;
}

/* 只读字段 */
.field.readonly {
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
}

.field.readonly:last-child {
  border-bottom: none;
}

.readonly-value {
  font-size: 15px;
  color: var(--text-main);
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
  background: var(--cream);
  box-shadow: var(--shadow-md);
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
  background: var(--cream);
  border: 2px solid transparent;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s;
}

.avatar-option:hover {
  background: var(--cream-2);
}

.avatar-option.active {
  border-color: var(--accent-deep);
  background: var(--cream-2);
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
  background: linear-gradient(135deg, var(--accent-deep), var(--accent));
  color: #fff;
  box-shadow: var(--shadow-lg);
  transition: opacity 0.2s;
  padding: 22px 0;
}

.save-btn:hover {
  background: linear-gradient(135deg, var(--accent-deep), var(--accent));
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
  background: var(--cream);
  box-shadow: var(--shadow-sm);
}
.companion-label {
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 4px;
}
.companion-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-main);
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
  color: var(--text-mute);
}
.summary-value {
  font-size: 13px;
  color: var(--text-main);
  font-weight: 500;
}
.companion-divider {
  height: 1px;
  background: var(--line);
  margin-bottom: 14px;
}
.companion-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--accent-deep);
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
