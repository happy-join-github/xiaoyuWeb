<template>
  <div class="screen-bg"></div>
  <StatusBar />

  <div class="content">
    <div class="close-row">
      <router-link to="/chat" class="close-btn">
        <SvgIcon name="close" :size="18" />
      </router-link>
    </div>

    <div class="greeting fade-in">
      <h1>嗨，今天<br />感觉怎么样 ☁️</h1>
      <p>只要 10 秒，告诉我你的心情 💛</p>
    </div>

    <div class="emotion-grid">
      <div
        v-for="emotion in emotions"
        :key="emotion.value"
        class="emotion-card fade-up"
        :class="{ selected: selectedEmotion === emotion.value }"
        @click="selectedEmotion = emotion.value"
      >
        <div class="emoji">{{ emotion.emoji }}</div>
        <div class="name">{{ emotion.label }}</div>
      </div>
    </div>

    <div class="note-box fade-up">
      <label>今天想说的一句小话（选填）</label>
      <textarea
        v-model="note"
        placeholder="比如：今天的天空很蓝…"
        maxlength="30"
      ></textarea>
      <div class="count">{{ note.length }}/30</div>
    </div>

    <div class="reward fade-up">
      <div class="ic">
        <SvgIcon name="star" :size="16" />
      </div>
      <div class="text">
        <div class="t1">完成打卡，获得 1 张治愈卡片 ✨</div>
        <div class="t2">已坚持打卡 7 天 · 离「一周的礼物」还差 0 天</div>
      </div>
    </div>

    <div class="actions">
      <router-link to="/mood" class="btn btn-primary">保存今天的心情</router-link>
      <div class="skip"><router-link to="/chat">下次再说</router-link></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StatusBar from '../../components/StatusBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'

const selectedEmotion = ref('happy')
const note = ref('今天的天空很蓝，楼下咖啡店换了新豆子，意外好喝 ☕')

const emotions = [
  { emoji: '😊', label: '开心', value: 'happy' },
  { emoji: '😌', label: '平静', value: 'calm' },
  { emoji: '😔', label: '低落', value: 'sad' },
  { emoji: '😣', label: '焦虑', value: 'anxious' },
  { emoji: '😡', label: '烦躁', value: 'irritable' },
  { emoji: '🥺', label: '想哭', value: 'tearful' },
]
</script>

<style scoped>
.screen-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #FFEFDF 0%, #FFE0CB 100%);
}
.content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 24px 32px;
}
.close-row {
  display: flex;
  justify-content: flex-end;
}
.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(74, 58, 46, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9C8B7E;
}
.greeting {
  margin-top: 16px;
}
.greeting h1 {
  font-size: 26px;
  color: #4A3A2E;
  font-weight: 700;
  line-height: 1.3;
}
.greeting p {
  color: #9C8B7E;
  margin-top: 8px;
  font-size: 14px;
}
.emotion-grid {
  margin: 28px 0 8px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.emotion-card {
  aspect-ratio: 1;
  background: #fff;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(244, 169, 136, 0.08);
  border: 2px solid transparent;
  transition: all 0.2s;
  cursor: pointer;
}
.emotion-card.selected {
  border-color: #F4A988;
  background: linear-gradient(135deg, #FFF 0%, #FFE7D1 100%);
}
.emotion-card .emoji {
  font-size: 30px;
}
.emotion-card .name {
  font-size: 12px;
  color: #4A3A2E;
}
.emotion-card.selected .name {
  color: #E88A6B;
  font-weight: 600;
}
.note-box {
  margin-top: 24px;
  background: #fff;
  border-radius: 18px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(244, 169, 136, 0.08);
}
.note-box label {
  display: block;
  font-size: 12px;
  color: #9C8B7E;
  margin-bottom: 8px;
}
.note-box textarea {
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  min-height: 60px;
  font: inherit;
  color: #4A3A2E;
}
.note-box .count {
  text-align: right;
  font-size: 11px;
  color: #C4B5A6;
  margin-top: 4px;
}
.actions {
  margin-top: auto;
  padding-top: 20px;
}
.actions .btn-primary {
  width: 100%;
}
.skip {
  text-align: center;
  margin-top: 12px;
}
.skip a {
  color: #9C8B7E;
  font-size: 13px;
}
.reward {
  margin-top: 16px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #FFF4E8 0%, #FFE7D1 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.reward .ic {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  color: #E88A6B;
  display: flex;
  align-items: center;
  justify-content: center;
}
.reward .text {
  flex: 1;
}
.reward .text .t1 {
  font-size: 13px;
  color: #4A3A2E;
  font-weight: 600;
}
.reward .text .t2 {
  font-size: 11px;
  color: #9C8B7E;
  margin-top: 2px;
}
</style>
