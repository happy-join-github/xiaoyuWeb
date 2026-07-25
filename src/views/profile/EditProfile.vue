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
          <input
            v-model="editForm.name"
            class="input"
            maxlength="12"
            placeholder="输入你的昵称"
          />
          <span class="hint">最多 12 个字符</span>
        </div>
        <div class="field">
          <label>手机号</label>
          <input
            v-model="editForm.phone"
            class="input"
            :disabled="true"
            type="tel"
          />
        </div>
      </div>
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
      <button class="save-btn" @click="saveProfile">保存</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
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

.field .input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #FFE0CB;
  border-radius: 12px;
  font-size: 15px;
  color: #4A3A2E;
  background: #FFFBF8;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.field .input:focus {
  border-color: #E88A6B;
  background: #fff;
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

.save-btn {
  width: 100%;
  padding: 14px 0;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #E88A6B, #E07A5A);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(232, 138, 107, 0.35);
  transition: opacity 0.2s;
}

.save-btn:active {
  opacity: 0.85;
}
</style>
