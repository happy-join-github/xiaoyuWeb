<template>
  <div class="screen-bg"></div>
  <StatusBar />

  <div class="content">
    <div class="nav">
      <button class="close" @click="router.back()">
        <SvgIcon name="close" :size="20" />
      </button>
      <div class="title">情绪急救</div>
      <div class="placeholder"></div>
    </div>

    <div class="breath-area">
      <div class="breath-ball-wrap">
        <div class="breath-ball">
          <div class="label">和我一起呼吸</div>
          <div class="phase">{{ breathPhase }}</div>
        </div>
      </div>
      <div class="breath-tip">跟随小球 <b>吸气 4 秒 · 屏住 4 秒 · 呼气 4 秒</b><br />重复 3 轮，会好很多 💛</div>
    </div>

    <div class="comfort-list">
      <div class="comfort-title">先读读这些 🌷</div>
      <div
        v-for="(msg, index) in comfortMessages"
        :key="index"
        class="comfort-card"
        @click="onComfortClick(msg)"
      >
        {{ msg }}
      </div>
    </div>

    <div class="quick-actions">
      <router-link class="qa" to="/treehole">
        <div class="ic">
          <SvgIcon name="shield" :size="20" />
        </div>
        <div class="text">去树洞<br />把心事说给我听</div>
      </router-link>
      <router-link class="qa" to="/cards">
        <div class="ic">
          <SvgIcon name="volume" :size="20" />
        </div>
        <div class="text">听一段<br />白噪音</div>
      </router-link>
    </div>

    <div class="emergency-line">
      <div class="ic">
        <SvgIcon name="phone" :size="20" />
      </div>
      <div class="text">如果你需要专业帮助，<br />24 小时心理援助热线：<b>400-161-9995</b></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import StatusBar from '../../components/StatusBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'

const router = useRouter()
const breathPhase = ref('吸气…')

const comfortMessages = [
  '这一刻很难，但不会一直这样。我陪着你。',
  '你已经做得很好了，累的时候允许自己停一停。',
  '不需要向任何人证明什么，你本来就可以。',
]

function onComfortClick(_msg: string) {
  // handle comfort card click
}
</script>

<style scoped>
.screen-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 200, 170, 0.5) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(205, 227, 242, 0.4) 0%, transparent 50%),
    linear-gradient(180deg, #FFEAD9 0%, #FFE0CB 100%);
  z-index: 0;
}
.content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 24px 24px;
}
.nav {
  padding: 8px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav .close {
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
.nav .placeholder {
  width: 36px;
}
.breath-area {
  margin: 24px 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.breath-ball-wrap {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.breath-ball {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fff 0%, #FFE7D1 50%, #FFD4C2 100%);
  box-shadow: 0 0 60px rgba(244, 169, 136, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
  animation: breath 8s ease-in-out infinite;
}
@keyframes breath {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.15); }
  50% { transform: scale(1); }
  75% { transform: scale(0.9); }
}
.breath-ball .label {
  font-size: 14px;
  color: #4A3A2E;
  font-weight: 600;
}
.breath-ball .phase {
  font-size: 12px;
  color: #9C8B7E;
}
.breath-tip {
  margin-top: 16px;
  font-size: 13px;
  color: #6B5A4D;
  text-align: center;
}
.breath-tip b {
  color: #E88A6B;
}
.comfort-list {
  margin-top: 16px;
}
.comfort-title {
  font-size: 13px;
  color: #9C8B7E;
  margin-bottom: 10px;
}
.comfort-card {
  background: #fff;
  border-radius: 18px;
  padding: 16px 18px;
  margin-bottom: 10px;
  box-shadow: var(--shadow-sm);
  font-size: 14px;
  color: #4A3A2E;
  line-height: 1.7;
  position: relative;
  cursor: pointer;
}
.comfort-card::before {
  content: "\201C";
  position: absolute;
  top: -4px;
  left: 14px;
  color: #F4A988;
  font-size: 40px;
  line-height: 1;
}
.comfort-card:active {
  background: #FFE7D1;
}
.quick-actions {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.qa {
  background: #fff;
  border-radius: 18px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: var(--shadow-sm);
  color: #4A3A2E;
  text-decoration: none;
}
.qa .ic {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFE7D1;
  color: #E88A6B;
  flex-shrink: 0;
}
.qa .text {
  font-size: 13px;
  line-height: 1.4;
}
.emergency-line {
  margin-top: 18px;
  padding: 14px 16px;
  background: #2B1F18;
  color: #FFE9D6;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.emergency-line .ic {
  color: #F4A988;
  flex-shrink: 0;
}
.emergency-line .text {
  flex: 1;
  font-size: 12px;
  line-height: 1.5;
}
.emergency-line .text b {
  color: #F4A988;
  font-size: 14px;
}
</style>
