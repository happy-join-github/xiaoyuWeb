<template>
  <div class="screen-bg"></div>
  <StatusBar />

  <div class="content no-scrollbar">
    <div class="nav">
      <button class="back" @click="router.back()">
        <SvgIcon name="back" :size="20" />
      </button>
      <div class="title">小愈的设置</div>
      <button class="save" @click="onSave">保存</button>
    </div>

    <div class="preview-card fade-in">
      <div class="name">{{ aiName }}</div>
      <div class="preview">"{{ userName }}，今天也辛苦啦 💛"</div>
    </div>

    <div class="section fade-up">
      <div class="section-title">基础信息</div>
      <div class="field">
        <span class="label">小愈的名字</span>
        <input class="input" v-model="aiName">
        <SvgIcon class="arrow" name="right" :size="14" />
      </div>
      <div class="field">
        <span class="label">你的昵称</span>
        <input class="input" v-model="userName">
        <SvgIcon class="arrow" name="right" :size="14" />
      </div>
      <div class="field">
        <span class="label">小愈称呼你为</span>
        <span class="input">{{ userName }}</span>
        <SvgIcon class="arrow" name="right" :size="14" />
      </div>
    </div>

    <div class="section fade-up">
      <div class="section-title">小愈的称呼偏好</div>
      <div class="title-options">
        <div
          v-for="title in titleOptions"
          :key="title"
          class="title-opt"
          :class="{ selected: selectedTitle === title }"
          @click="selectedTitle = title"
        >
          {{ title }}
        </div>
      </div>
    </div>

    <div class="section fade-up">
      <div class="section-title">对话风格</div>
      <div class="slider-row">
        <div class="label">温柔程度</div>
        <input type="range" class="range" min="0" max="100" v-model.number="gentleness">
        <div class="ticks"><span>理性</span><span>适中</span><span>很温柔</span></div>
      </div>
      <div class="slider-row" style="border-top: 1px solid #FAF1E5;">
        <div class="label">话多 / 话少</div>
        <input type="range" class="range" min="0" max="100" v-model.number="talkativeness">
        <div class="ticks"><span>惜字如金</span><span>适中</span><span>很啰嗦</span></div>
      </div>
    </div>

    <div class="section fade-up">
      <div class="field">
        <span class="label">声线偏好</span>
        <span class="input">温柔女声</span>
        <SvgIcon class="arrow" name="right" :size="14" />
      </div>
      <div class="field">
        <span class="label">对话记忆</span>
        <span class="input" style="color: #E88A6B;">已开启</span>
        <SvgIcon class="arrow" name="right" :size="14" />
      </div>
    </div>

    <button class="btn btn-primary" style="margin-top: 8px; width: 100%;" @click="onSave">保存设置</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import StatusBar from '../../components/StatusBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

const aiName = ref(userStore.aiName)
const userName = ref(userStore.name)
const selectedTitle = ref(userStore.name)
const gentleness = ref(80)
const talkativeness = ref(50)

const titleOptions = ['宝贝', userStore.name, '朋友', '同学', '小朋友', '知己']

function onSave() {
  const trimmed = aiName.value.trim()
  if (trimmed) userStore.aiName = trimmed
  if (userName.value.trim()) userStore.name = userName.value.trim()
  router.push('/profile')
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
.nav .back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4A3A2E;
  border: none;
  cursor: pointer;
}
.nav .title {
  font-size: 17px;
  font-weight: 600;
}
.nav .save {
  color: #E88A6B;
  font-weight: 600;
  font-size: 14px;
  padding: 6px 12px;
  background: none;
  border: none;
  cursor: pointer;
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
.slider-row {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.slider-row .label {
  font-size: 14px;
  color: #4A3A2E;
}
.slider-row .range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #FFE7D1;
  outline: none;
}
.slider-row .range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #E88A6B;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(232, 138, 107, 0.4);
}
.slider-row .ticks {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #9C8B7E;
}
</style>
