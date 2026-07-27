<template>
  <div class="screen-bg"></div>
  <StatusBar />

  <div class="content no-scrollbar">
    <div class="nav">
      <el-button class="back" @click="router.back()">
        <SvgIcon name="back" :size="20" />
      </el-button>
      <div class="title">{{ aiName }}的设置</div>
      <el-button class="save" @click="onSave">保存</el-button>
    </div>

    <div class="preview-card fade-in">
      <div class="name">{{ aiName }}</div>
      <div class="preview">"{{ userName }}，今天也辛苦啦 💛"</div>
    </div>

    <div class="section fade-up">
      <div class="section-title">基础信息</div>
      <div class="field">
        <span class="label">ai的名字</span>
        <el-input v-model="aiName" />
      </div>

      <div class="field">
        <span class="label">{{ aiName }}称呼您为</span>
        <span class="input">{{ userName }}</span>
      </div>
    </div>

    <div class="section fade-up">
      <div class="section-title">角色设定</div>
      <div class="sub-title">性格标签</div>
      <div class="title-options">
        <div
          v-for="tag in characterTagOptions"
          :key="tag"
          class="title-opt"
          :class="{ selected: selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >{{ tag }}</div>
      </div>
      <div class="field" style="border-bottom: none; flex-direction: column; align-items: stretch; gap: 6px;">
        <span class="label" style="flex: none;">角色简介</span>
        <el-input
          type="textarea"
          v-model="characterBio"
          :rows="3"
          placeholder="描述你希望小愈扮演的角色，比如：一个总是耐心倾听、温柔鼓励我的知心朋友…"
          :maxlength="200"
          show-word-limit
        />
      </div>
    </div>

    <div class="section fade-up">
      <div class="section-title">声线偏好</div>
      <div class="title-options">
        <div
          v-for="voice in voiceOptions"
          :key="voice"
          class="title-opt"
          :class="{ selected: selectedVoice === voice }"
          @click="selectedVoice = voice"
        >
          {{ voice }}
        </div>
      </div>
    </div>

    <div class="section fade-up">
      <div class="section-title">主动问候</div>
      <div class="field">
        <span class="label">早安问候时间</span>
        <el-select v-model="morningGreeting" class="time-select" placeholder="选择时间">
          <el-option v-for="t in timeSlots" :key="t" :label="t" :value="t" />
        </el-select>
      </div>
      <div class="field" style="border-bottom: none;">
        <span class="label">晚安问候时间</span>
        <el-select v-model="eveningGreeting" class="time-select" placeholder="选择时间">
          <el-option v-for="t in timeSlots" :key="t" :label="t" :value="t" />
        </el-select>
      </div>
    </div>

    <el-button class="btn btn-primary" style="margin-top: 8px; width: 100%;" @click="onSave">保存设置</el-button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElInput, ElButton, ElSelect, ElOption, ElMessage } from 'element-plus'
import StatusBar from '../../components/StatusBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import { useUserStore } from '../../stores/user'
import { updateAiSettings } from '../../api/profile'

const router = useRouter()
const userStore = useUserStore()

const aiName = ref(userStore.aiName)
const userName = ref(userStore.name)

const voiceOptions = ['温柔女声', '温暖男声', '可爱少女', '知性御姐', '阳光少年', '沉稳大叔']
const selectedVoice = ref(userStore.voice)

const morningGreeting = ref(userStore.morningGreeting)
const eveningGreeting = ref(userStore.eveningGreeting)

const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0')
  const m = i % 2 === 0 ? '00' : '30'
  return `${h}:${m}`
})

const characterTagOptions = ['聆听者', '知心姐姐', '人生导师', '开心果', '守护者', '树洞']
const selectedTags = ref<string[]>([...userStore.characterTags])
const characterBio = ref(userStore.characterBio)

const saving = ref(false)

function toggleTag(tag: string) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx >= 0) selectedTags.value.splice(idx, 1)
  else selectedTags.value.push(tag)
}

/** 进入页面：拉取后端的 AI 设置覆盖本地默认值 */
onMounted(async () => {
  const data = await userStore.loadAiSettings()
  if (data) {
    aiName.value = userStore.aiName
    selectedVoice.value = userStore.voice
    morningGreeting.value = userStore.morningGreeting
    eveningGreeting.value = userStore.eveningGreeting
    selectedTags.value = [...userStore.characterTags]
    characterBio.value = userStore.characterBio
  }
})

async function onSave() {
  if (saving.value) return
  const trimmedAi = aiName.value.trim()
  if (!trimmedAi) {
    ElMessage.warning('请填写 AI 的名字')
    return
  }
  saving.value = true
  try {
    const data = await updateAiSettings({
      aiName: trimmedAi,
      voice: selectedVoice.value,
      characterTags: [...selectedTags.value],
      characterBio: characterBio.value,
      morningGreeting: morningGreeting.value,
      eveningGreeting: eveningGreeting.value,
    })
    // 用后端返回值刷新 store（接口失败时 data 为 null，本地兜底）
    if (data) {
      userStore.applyProfileData(data)
    } else {
      userStore.updateProfile({
        aiName: trimmedAi,
        voice: selectedVoice.value,
        characterTags: [...selectedTags.value],
        characterBio: characterBio.value,
        morningGreeting: morningGreeting.value,
        eveningGreeting: eveningGreeting.value,
      })
    }
    ElMessage.success('保存成功')
    router.push('/profile')
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
  background: linear-gradient(180deg, #FFF8F1 0%, #FFEAD9 100%);
}
.content {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 24px;
}
.content::-webkit-scrollbar {
  display: none;
}
.nav {
  padding: 8px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav .back.el-button {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #4A3A2E;
  border: none;
  font-size: inherit;
}
.nav .title {
  font-size: 17px;
  font-weight: 600;
}
.nav .save.el-button {
  color: #E88A6B;
  font-weight: 600;
  font-size: 14px;
  padding: 6px 12px;
  background: none;
  border: none;
}

/* 预览卡片（纯文字版本，无头像） */
.preview-card {
  margin: 8px 0 20px;
  padding: 32px 24px;
  background: linear-gradient(135deg, #FFE7D1 0%, #FFD4C2 100%);
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(244, 169, 136, 0.15);
}
.preview-card .name {
  font-size: 24px;
  font-weight: 700;
  color: #4A3A2E;
}
.preview-card .preview {
  margin-top: 10px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 14px;
  display: inline-block;
  font-size: 13px;
  color: #4A3A2E;
}
.section {
  background: #fff;
  border-radius: 18px;
  padding: 6px 0;
  margin-bottom: 14px;
  box-shadow: var(--shadow-sm);
}
.section-title {
  padding: 12px 16px 4px;
  font-size: 12px;
  color: #9C8B7E;
}
.field {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #FAF1E5;
}
.field:last-child {
  border-bottom: none;
}
.field .label {
  font-size: 14px;
  color: #4A3A2E;
  flex: 1;
}
/* Keep .field .input for the <span class="input"> elements */
.field .input {
  border: none;
  outline: none;
  background: transparent;
  text-align: right;
  font: inherit;
  color: #9C8B7E;
  min-width: 100px;
}
.field .arrow {
  color: #C4B5A6;
  flex-shrink: 0;
}
/* el-input inside .field - render inline, transparent */
.field :deep(.el-input) {
  flex: none;
  width: auto;
  min-width: 100px;
}
.field :deep(.el-input__wrapper) {
  background: transparent;
  box-shadow: none;
  padding: 0;
}
.field :deep(.el-input__inner) {
  text-align: right;
  color: #9C8B7E;
}
.time-select {
  width: 110px;
}
.time-select :deep(.el-input__wrapper) {
  background: #FFF8F1;
  box-shadow: none;
  border: 1.5px solid #FAF1E5;
  border-radius: 10px;
  padding: 2px 8px;
}
.time-select :deep(.el-input__inner) {
  text-align: center;
  color: #4A3A2E;
  font-size: 14px;
}
.time-select :deep(.el-select__caret) {
  color: #C4B5A6;
  font-size: 12px;
}
.sub-title {
  padding: 4px 16px 0;
  font-size: 12px;
  color: #9C8B7E;
}
.field :deep(.el-textarea__inner) {
  background: #FFF8F1;
  border: 1.5px solid #FAF1E5;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
  color: #4A3A2E;
  resize: none;
}
.field :deep(.el-textarea__inner:focus) {
  border-color: #E88A6B;
}
.field :deep(.el-input__count) {
  font-size: 11px;
  color: #9C8B7E;
  background: transparent;
}
.title-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
}
.title-opt {
  padding: 8px 14px;
  border-radius: 999px;
  background: #FFF8F1;
  color: #4A3A2E;
  font-size: 13px;
  border: 1.5px solid transparent;
  cursor: pointer;
}
.title-opt.selected {
  background: #FFE7D1;
  color: #E88A6B;
  border-color: #E88A6B;
  font-weight: 600;
}
</style>
