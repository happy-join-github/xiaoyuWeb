<template>
  <div class="screen-bg"></div>
  <StatusBar />
  <NavBar title="治愈卡片" left="">
    <template #right>
      <router-link to="/cards/detail" class="icon-btn">
        <SvgIcon name="search" :size="20" />
      </router-link>
    </template>
  </NavBar>

  <div class="scroll-area no-scrollbar">
    <!-- 类型切换 -->
    <div class="type-tabs no-scrollbar">
      <div
        v-for="tab in typeTabs"
        :key="tab.key"
        class="type-tab"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- 今日推荐 Hero -->
    <router-link class="hero fade-in" to="/cards/detail">
      <div class="deco">🌸</div>
      <div class="date">7 月 19 日 · 今日推荐</div>
      <h2>
        不必成为任何人期待的样子，<br />你只是你自己就已经足够好了。
      </h2>
      <div class="signature">
        <span class="avatar-sm">🌸</span>
        <span>{{ userStore.aiName }} · 写给今天的你</span>
      </div>
    </router-link>

    <!-- 主题合集 -->
    <div class="card-section">
      <h3>
        主题合集
        <router-link to="/cards/detail">全部 →</router-link>
      </h3>
      <div class="topic-row no-scrollbar">
        <div v-for="topic in topics" :key="topic.label" :class="['topic', topic.class]">
          <div class="t1">{{ topic.sub }}</div>
          <div class="t2">{{ topic.label }}</div>
        </div>
      </div>
    </div>

    <!-- 今日治愈 -->
    <div class="card-section">
      <h3>
        今日治愈
        <router-link to="/cards/detail">更多 →</router-link>
      </h3>
      <div class="card-grid">
        <!-- 引用卡片 c-1 -->
        <router-link class="quote-card c-1 fade-up" to="/cards/detail">
          <div class="quote-mark">"</div>
          <div class="text">
            允许自己慢一点，<br />那不叫懒，<br />那叫在好好生活。
          </div>
          <div class="foot">
            <span class="date">暖心话 · No.142</span>
            <button class="like-btn" @click.stop>
              <SvgIcon name="heart" :size="14" />
            </button>
          </div>
        </router-link>

        <!-- 引用卡片 c-2 -->
        <router-link class="quote-card c-2 fade-up" to="/cards/detail">
          <div class="quote-mark">"</div>
          <div class="text">
            难过的时候，<br />就当世界在给你<br />一个长长的拥抱。
          </div>
          <div class="foot">
            <span class="date">暖心话 · No.143</span>
            <button class="like-btn" @click.stop>
              <SvgIcon name="heart_fill" :size="14" />
            </button>
          </div>
        </router-link>

        <!-- 风景卡片 -->
        <router-link class="landscape-card l-1 fade-up" to="/cards/detail">
          <div class="mountain"></div>
          <div class="text">
            <div class="t1">SUNSET</div>
            <div class="t2">
              晚霞，是天空最温柔的<br />一句"今天辛苦了"。
            </div>
          </div>
        </router-link>

        <!-- 音频卡片 -->
        <div class="audio-card fade-up">
          <div class="ic-play">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <div class="title">窗外的雨</div>
          <div class="desc">30 秒白噪音 · 适合午后</div>
          <div class="wave">
            <span style="height:6px;animation-delay:0s;"></span>
            <span style="height:12px;animation-delay:0.1s;"></span>
            <span style="height:18px;animation-delay:0.2s;"></span>
            <span style="height:8px;animation-delay:0.3s;"></span>
            <span style="height:14px;animation-delay:0.4s;"></span>
            <span style="height:6px;animation-delay:0.5s;"></span>
            <span style="height:18px;animation-delay:0.6s;"></span>
            <span style="height:10px;animation-delay:0.7s;"></span>
            <span style="height:14px;animation-delay:0.8s;"></span>
            <span style="height:6px;animation-delay:0.9s;"></span>
            <span style="height:18px;animation-delay:1.0s;"></span>
            <span style="height:12px;animation-delay:1.1s;"></span>
            <span style="height:8px;animation-delay:1.2s;"></span>
          </div>
        </div>

        <!-- 引用卡片 c-3 -->
        <router-link class="quote-card c-3 fade-up" to="/cards/detail">
          <div class="quote-mark">"</div>
          <div class="text">
            吃饭要慢慢吃，<br />走路要慢慢走，<br />喜欢你也是。
          </div>
          <div class="foot">
            <span class="date">暖心话 · No.144</span>
            <button class="like-btn" @click.stop>
              <SvgIcon name="heart" :size="14" />
            </button>
          </div>
        </router-link>

        <!-- 引用卡片 c-4 -->
        <router-link class="quote-card c-4 fade-up" to="/cards/detail">
          <div class="quote-mark">"</div>
          <div class="text">
            今天也是被世界<br />悄悄爱着的一天，<br />只是你还没发现。
          </div>
          <div class="foot">
            <span class="date">暖心话 · No.145</span>
            <button class="like-btn" @click.stop>
              <SvgIcon name="heart" :size="14" />
            </button>
          </div>
        </router-link>
      </div>
    </div>

    <div style="height: 20px"></div>
  </div>

  <TabBar activeKey="cards" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StatusBar from '../../components/StatusBar.vue'
import NavBar from '../../components/NavBar.vue'
import TabBar from '../../components/TabBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()

const activeTab = ref('warm')

const typeTabs = [
  { key: 'warm', label: '🌅 暖心话' },
  { key: 'audio', label: '🎧 声音' },
  { key: 'scene', label: '🖼 风景' },
  { key: 'collection', label: '💌 合集' },
]

const topics = [
  { class: 't-1', sub: '10 句话', label: '睡前的轻声' },
  { class: 't-2', sub: '致你', label: '给焦虑的你' },
  { class: 't-3', sub: '一个人', label: '一个人的晚餐' },
  { class: 't-4', sub: '慢生活', label: '30 天晚安' },
]
</script>

<style scoped>
.screen-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #FFF8F1 0%, #FFEAD9 100%);
}

/* icon-btn inside nav-bar slot needs explicit styling here */
.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub, #9C8B7E);
}

.scroll-area {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
}

/* 类型切换 */
.type-tabs {
  padding: 8px 16px 0;
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.type-tab {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px;
  color: #9C8B7E;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-tab.active {
  background: linear-gradient(135deg, #F4A988 0%, #E88A6B 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(244, 169, 136, 0.3);
}

/* 今日推荐大字 */
.hero {
  display: block;
  margin: 16px 16px 0;
  padding: 28px 24px;
  background: linear-gradient(135deg, #FFE7D1 0%, #FFD4C2 100%);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(244, 169, 136, 0.15);
}

.hero .date {
  font-size: 12px;
  color: #9C8B7E;
  letter-spacing: 1px;
}

.hero h2 {
  font-size: 22px;
  line-height: 1.5;
  color: #4A3A2E;
  margin: 12px 0 16px;
  font-weight: 600;
}

.hero .signature {
  font-size: 12px;
  color: #9C8B7E;
  display: flex;
  align-items: center;
  gap: 6px;
}

.hero .deco {
  position: absolute;
  top: -30px;
  right: -20px;
  font-size: 120px;
  opacity: 0.15;
  transform: rotate(15deg);
}

.avatar-sm {
  display: inline-flex;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
}

/* 卡片网格 */
.card-section {
  padding: 24px 16px 8px;
}

.card-section h3 {
  font-size: 14px;
  color: #9C8B7E;
  font-weight: 500;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-section h3 a {
  font-size: 12px;
  color: #E88A6B;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* 暖心话卡片 */
.quote-card {
  background: #fff;
  border-radius: 20px;
  padding: 18px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 180px;
  position: relative;
  overflow: hidden;
}

.quote-card.c-1 {
  background: linear-gradient(135deg, #FFE7D1 0%, #FFF4E8 100%);
}

.quote-card.c-2 {
  background: linear-gradient(135deg, #CDE3F2 0%, #E5F1F8 100%);
}

.quote-card.c-3 {
  background: linear-gradient(135deg, #D8E4D2 0%, #E8F0E2 100%);
}

.quote-card.c-4 {
  background: linear-gradient(135deg, #FFD4C2 0%, #FFE4D6 100%);
}

.quote-card .quote-mark {
  font-size: 30px;
  color: #F4A988;
  line-height: 1;
}

.quote-card .text {
  font-size: 14px;
  line-height: 1.7;
  color: #4A3A2E;
  flex: 1;
}

.quote-card .foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quote-card .foot .date {
  font-size: 11px;
  color: #9C8B7E;
}

.quote-card .like-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9C8B7E;
  cursor: pointer;
  border: none;
}

/* 声音卡 */
.audio-card {
  background: linear-gradient(135deg, #4A3A2E 0%, #2B1F18 100%);
  border-radius: 20px;
  padding: 20px;
  color: #FFE9D6;
  position: relative;
  overflow: hidden;
}

.audio-card .ic-play {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 233, 214, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFE9D6;
  margin-bottom: 12px;
}

.audio-card .title {
  font-size: 15px;
  font-weight: 600;
}

.audio-card .desc {
  font-size: 11px;
  color: #C4B5A6;
  margin-top: 4px;
}

.audio-card .wave {
  display: flex;
  gap: 2px;
  align-items: flex-end;
  height: 20px;
  margin-top: 12px;
}

.audio-card .wave span {
  width: 2px;
  background: #F4A988;
  border-radius: 1px;
  animation: wave 1.2s ease-in-out infinite;
}

@keyframes wave {
  0%,
  100% {
    height: 4px;
  }
  50% {
    height: 18px;
  }
}

/* 风景卡 */
.landscape-card {
  border-radius: 20px;
  height: 200px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: 16px;
  color: #fff;
}

.landscape-card.l-1 {
  background: linear-gradient(135deg, #FFB89A 0%, #F4A988 50%, #C28F76 100%);
}

.landscape-card .mountain {
  position: absolute;
  inset: 0;
  opacity: 0.4;
  background:
    radial-gradient(circle at 20% 60%, #fff 0%, transparent 6%),
    radial-gradient(circle at 70% 40%, #FFE9D6 0%, transparent 4%),
    radial-gradient(circle at 50% 70%, #fff 0%, transparent 8%);
}

.landscape-card .text {
  position: relative;
  z-index: 1;
}

.landscape-card .text .t1 {
  font-size: 12px;
  opacity: 0.8;
  letter-spacing: 1px;
}

.landscape-card .text .t2 {
  font-size: 14px;
  margin-top: 4px;
  font-weight: 500;
}

/* 主题合集 */
.topic-row {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0 8px;
}

.topic {
  flex-shrink: 0;
  width: 130px;
  border-radius: 16px;
  padding: 14px;
  color: #fff;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.topic.t-1 {
  background: linear-gradient(135deg, #F4A988 0%, #E88A6B 100%);
}

.topic.t-2 {
  background: linear-gradient(135deg, #6BA4C9 0%, #4A85A8 100%);
}

.topic.t-3 {
  background: linear-gradient(135deg, #7BA970 0%, #5A8B4F 100%);
}

.topic.t-4 {
  background: linear-gradient(135deg, #C490C4 0%, #A06FA0 100%);
}

.topic .t1 {
  font-size: 11px;
  opacity: 0.85;
}

.topic .t2 {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}
</style>
