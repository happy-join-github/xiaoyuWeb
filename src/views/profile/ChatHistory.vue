<template>
  <div class="screen-bg"></div>
  <StatusBar />

  <NavBar title="聊天历史" left="back" />

  <div class="search-bar">
    <div class="search-input">
      <SvgIcon name="search" :size="16" />
      <input v-model="searchQuery" type="text" placeholder="搜索聊天内容…">
    </div>
  </div>

  <div class="scroll-area no-scrollbar">
    <div class="date-group">今天</div>
    <router-link class="conv-item fade-up" to="/chat">
      <div class="av">🌸</div>
      <div class="body">
        <div class="top"><span class="name">{{ userStore.aiName }}</span><span class="time">9:32</span></div>
        <div class="preview">早安呀 ☀️ 睡得好吗？今天想聊点什么都可以哦~</div>
      </div>
    </router-link>

    <div class="date-group">昨天 · 7 月 18 日</div>
    <router-link class="conv-item fade-up" to="/treehole">
      <div class="av">🌙</div>
      <div class="body">
        <div class="top"><span class="name">树洞倾诉</span><span class="time">23:15</span></div>
        <div class="preview">嗯…听起来真的很沉重。累了就先这样待一会儿…</div>
      </div>
      <div class="tag tree">树洞</div>
    </router-link>
    <router-link class="conv-item fade-up" to="/chat">
      <div class="av">🌸</div>
      <div class="body">
        <div class="top"><span class="name">{{ userStore.aiName }}</span><span class="time">21:08</span></div>
        <div class="preview">晚餐吃了吗？吃饱了才有力气对抗坏情绪哦 🥣</div>
      </div>
    </router-link>

    <div class="date-group">7 月 17 日 · 周四</div>
    <router-link class="conv-item fade-up" to="/chat">
      <div class="av">🌸</div>
      <div class="body">
        <div class="top"><span class="name">{{ userStore.aiName }}</span><span class="time">14:22</span></div>
        <div class="preview">项目 deadline 让你很焦虑，今天好点了吗？</div>
      </div>
    </router-link>

    <div class="date-group">本周早些时候</div>
    <router-link class="conv-item fade-up" to="/chat">
      <div class="av">🌸</div>
      <div class="body">
        <div class="top"><span class="name">{{ userStore.aiName }}</span><span class="time">7/15</span></div>
        <div class="preview">运动完是不是舒服多了？以后累的时候…</div>
      </div>
      <div class="tag">已转日记</div>
    </router-link>
    <router-link class="conv-item fade-up" to="/chat">
      <div class="av">🌸</div>
      <div class="body">
        <div class="top"><span class="name">{{ userStore.aiName }}</span><span class="time">7/14</span></div>
        <div class="preview">每个人的节奏都不一样，停下来也是一种前进…</div>
      </div>
    </router-link>
    <router-link class="conv-item fade-up" to="/chat">
      <div class="av">🌸</div>
      <div class="body">
        <div class="top"><span class="name">{{ userStore.aiName }}</span><span class="time">7/12</span></div>
        <div class="preview">想吃火锅吗？辣的和不辣的都好吃，看你今天…</div>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StatusBar from '../../components/StatusBar.vue'
import NavBar from '../../components/NavBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const searchQuery = ref('')
</script>

<style scoped>
.screen-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #FFF8F1 0%, #FFEFDF 100%);
}
.scroll-area {
  position: relative;
  z-index: 1;
}
.search-bar {
  padding: 4px 16px 12px;
  position: relative;
  z-index: 2;
}
.search-input {
  background: #fff;
  border-radius: 999px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow-sm);
}
.search-input input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: #4A3A2E;
}
.search-input input::placeholder {
  color: #C4B5A6;
}
.date-group {
  padding: 12px 16px 4px;
  font-size: 11px;
  color: #9C8B7E;
}
.conv-item {
  margin: 0 12px 10px;
  background: #fff;
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  gap: 12px;
  align-items: center;
  position: relative;
  color: inherit;
  text-decoration: none;
}
.conv-item .av {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD4C2 0%, #FFE7D1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.conv-item .body {
  flex: 1;
  min-width: 0;
}
.conv-item .body .top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.conv-item .body .name {
  font-size: 14px;
  font-weight: 600;
  color: #4A3A2E;
}
.conv-item .body .time {
  font-size: 11px;
  color: #9C8B7E;
}
.conv-item .body .preview {
  font-size: 12px;
  color: #9C8B7E;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.conv-item .tag {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #FFE7D1;
  color: #E88A6B;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 999px;
}
.conv-item .tag.tree {
  background: #2B1F18;
  color: #FFE9D6;
}
</style>
