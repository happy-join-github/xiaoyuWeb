<template>
  <div class="screen-bg"></div>
  <StatusBar />
  <NavBar :title="isEditMode ? '编辑卡片' : '制作卡片'" left="back" />

  <div class="scroll-area no-scrollbar">
    <!-- 1. 选模板 -->
    <section class="section">
      <h3>选择背景</h3>
      <div class="template-row">
        <div
          v-for="tpl in templates"
          :key="tpl.key"
          class="template-item"
          :class="{ active: form.bgTemplate === tpl.key }"
          @click="form.bgTemplate = tpl.key"
        >
          <div class="preview" :class="tpl.key">
            <span class="preview-text">{{ tpl.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. 写文字 -->
    <section class="section">
      <h3>写一段话</h3>
      <el-input
        v-model="form.customText"
        type="textarea"
        :rows="4"
        maxlength="200"
        show-word-limit
        placeholder="写下你想对自己说的话…"
        class="text-input-el"
      />
    </section>

    <!-- 3. 可见性 -->
    <section class="section">
      <h3>可见性</h3>
      <el-radio-group v-model="form.isPublic" class="privacy-group">
        <el-radio :value="false" class="privacy-option-card">
          <el-icon :size="16"><Lock /></el-icon>
          <div class="privacy-text">
            <div class="label">仅自己可见</div>
            <div class="desc">存放在你的私密手账中</div>
          </div>
        </el-radio>
        <el-radio :value="true" class="privacy-option-card">
          <el-icon :size="16"><MagicStick /></el-icon>
          <div class="privacy-text">
            <div class="label">公开</div>
            <div class="desc">让这份温暖传递给更多人</div>
          </div>
        </el-radio>
      </el-radio-group>
    </section>

    <!-- 4. 预览 -->
    <section class="section">
      <h3>预览</h3>
      <div class="preview-card" :class="form.bgTemplate || 'warm'">
        <div class="preview-header">
          <span class="pv-avatar">{{ userStore.name?.charAt(0) || '我' }}</span>
          <span class="pv-name">{{ userStore.name || '我' }}</span>
          <span class="pv-date">{{ todayStr }}</span>
          <el-tag size="small" :type="form.isPublic ? 'success' : 'info'" effect="plain">
            {{ form.isPublic ? '公开' : '私密' }}
          </el-tag>
        </div>
        <div class="preview-body" v-if="form.customText">
          {{ form.customText }}
        </div>
        <div class="preview-body placeholder" v-else>
          你的文字会出现在这里
        </div>
      </div>
    </section>

    <!-- 保存按钮 -->
    <el-button
      type="warning"
      size="large"
      class="save-btn"
      :disabled="!form.customText.trim() || saving"
      :loading="saving"
      @click="onSave"
    >
      {{ isEditMode ? '更新卡片' : '保存卡片' }}
    </el-button>

    <!-- 删除按钮（编辑模式） -->
    <el-button
      v-if="isEditMode"
      class="delete-btn"
      @click="onDelete"
    >
      <el-icon :size="16"><Close /></el-icon>
      删除这张卡片
    </el-button>

    <div style="height: 40px" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElInput, ElRadioGroup, ElRadio, ElButton, ElTag, ElIcon, ElMessageBox } from 'element-plus'
import { Lock, MagicStick, Close } from '@element-plus/icons-vue'
import StatusBar from '../../components/StatusBar.vue'
import NavBar from '../../components/NavBar.vue'
import { useCardStore } from '../../stores/cards'
import { useUserStore } from '../../stores/user'

const route = useRoute()
const router = useRouter()
const cardStore = useCardStore()
const userStore = useUserStore()

const saving = ref(false)

const editId = computed(() => Number(route.query.edit) || 0)
const isEditMode = computed(() => editId.value > 0)

const templates = [
  { key: 'warm', label: '暖阳' },
  { key: 'calm', label: '宁静' },
  { key: 'dream', label: '梦境' },
]

const form = reactive({
  bgTemplate: 'warm',
  customText: '',
  isPublic: false,
})

const todayStr = computed(() => {
  const d = new Date()
  return `${d.getMonth() + 1}.${d.getDate()}`
})

onMounted(() => {
  if (isEditMode.value) {
    const card = [...cardStore.userCards, ...cardStore.systemCards]
      .find((c) => c.id === editId.value)
    if (card && card.source === 'user') {
      form.bgTemplate = card.bgTemplate || 'warm'
      form.customText = card.customText || ''
      form.isPublic = card.isPublic || false
    } else {
      router.push('/cards')
    }
  }
})

async function onSave() {
  if (!form.customText.trim() || saving.value) return
  saving.value = true
  try {
    if (isEditMode.value) {
      await cardStore.updateUserCard(editId.value, {
        bgTemplate: form.bgTemplate,
        customText: form.customText,
        isPublic: form.isPublic,
      })
    } else {
      await cardStore.createUserCard({
        bgTemplate: form.bgTemplate,
        customText: form.customText,
        isPublic: form.isPublic,
      })
    }
    router.push('/cards')
  } catch {
    // 错误已在 store 中处理
  } finally {
    saving.value = false
  }
}

function onDelete() {
  if (!editId.value) return
  ElMessageBox.confirm('确定删除这张卡片吗？', '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    cardStore.removeUserCard(editId.value)
    router.push('/cards')
  }).catch(() => {
    // 取消操作
  })
}
</script>

<style scoped>
.screen-bg {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, #FFF8F1 0%, #FFEAD9 100%);
}
.scroll-area {
  position: relative; z-index: 1;
  flex: 1; overflow-y: auto;
  padding: 0 20px;
}

/* ====== Section ====== */
.section {
  margin-top: 20px;
}
.section h3 {
  font-size: 14px;
  font-weight: 600;
  color: #4A3A2E;
  margin-bottom: 12px;
}

/* ====== 模板选择 ====== */
.template-row {
  display: flex;
  gap: 12px;
}
.template-item {
  flex: 1;
  cursor: pointer;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s;
}
.template-item.active {
  border-color: #E88A6B;
  box-shadow: 0 0 0 2px rgba(232, 138, 107, 0.2);
}
.preview {
  height: 80px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview.warm { background: linear-gradient(135deg, #FFE7D1, #FFF4E8); }
.preview.calm { background: linear-gradient(135deg, #CDE3F2, #E5F1F8); }
.preview.dream { background: linear-gradient(135deg, #E8D8F0, #F0E6F8); }
.preview-text {
  font-size: 13px;
  color: #4A3A2E;
  font-weight: 500;
}

/* ====== 文字输入 ====== */
.text-input-el {
  --el-input-border-radius: 16px;
}
.text-input-el :deep(.el-textarea__inner) {
  padding: 16px;
  font-size: 14px;
  line-height: 1.7;
  color: #4A3A2E;
  font-family: inherit;
  border: none;
  box-shadow: none;
  background: #fff;
  border-radius: 16px;
}
.text-input-el :deep(.el-textarea__inner:focus) {
  outline: 2px solid #F4A988;
}
.text-input-el :deep(.el-input__count) {
  font-size: 11px;
  color: #9C8B7E;
  line-height: 1;
  bottom: 8px;
  right: 12px;
}

/* ====== 可见性 ====== */
.privacy-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
.privacy-option-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border-radius: 16px;
  border: 2px solid transparent;
  transition: all 0.2s;
  width: 100%;
  height: auto;
  margin-right: 0;
}
.privacy-option-card :deep(.el-radio__input) {
  display: none;
}
.privacy-option-card :deep(.el-radio__label) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0;
}
.privacy-option-card.is-checked {
  border-color: #E88A6B;
  background: #fff;
}
.privacy-text {
  display: flex;
  flex-direction: column;
}
.privacy-text .label {
  font-size: 13px;
  font-weight: 500;
  color: #4A3A2E;
}
.privacy-text .desc {
  font-size: 11px;
  color: #9C8B7E;
  margin-top: 2px;
}

/* ====== 预览 ====== */
.preview-card {
  border-radius: 20px;
  padding: 20px;
  min-height: 140px;
  box-shadow: var(--shadow-sm);
}
.preview-card.warm { background: linear-gradient(135deg, #FFE7D1, #FFF4E8); }
.preview-card.calm { background: linear-gradient(135deg, #CDE3F2, #E5F1F8); }
.preview-card.dream { background: linear-gradient(135deg, #E8D8F0, #F0E6F8); }

.preview-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6B5A4D;
}
.pv-avatar {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: #F4A988;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px;
}
.pv-name { font-weight: 500; }
.pv-date { color: #9C8B7E; margin-left: auto; }
.preview-body {
  font-size: 16px;
  line-height: 1.8;
  color: #4A3A2E;
  font-weight: 500;
  margin-top: 16px;
  white-space: pre-wrap;
}
.preview-body.placeholder {
  color: #C4B5A6;
  font-weight: 400;
}

/* ====== 保存按钮 ====== */
.save-btn {
  width: 100%;
  margin-top: 24px;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 16px;
  --el-button-bg-color: linear-gradient(135deg, #F4A988, #E88A6B);
  --el-button-border-color: transparent;
}
.save-btn.is-disabled {
  opacity: 0.5;
}

/* ====== 删除按钮（编辑模式） ====== */
.delete-btn {
  width: 100%;
  margin-top: 12px;
  padding: 14px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  border: 2px solid #E88A6B;
  color: #E88A6B;
  background: #fff;
}
</style>
