<template>
  <!-- 引用卡片（系统） -->
  <div v-if="card.type === 'quote' && card.source === 'system'" class="quote-card" :class="card.styleClass">
    <div class="quote-mark">"</div>
    <div class="text" v-html="card.content" />
    <div class="foot">
      <span class="date">{{ card.date }}</span>
      <button class="like-btn" :class="{ liked: card.liked }" @click.stop="$emit('collect', card.id)">
        <SvgIcon :name="card.liked ? 'heart_fill' : 'heart'" :size="14" />
      </button>
    </div>
  </div>

  <!-- 风景卡片（系统） -->
  <div v-else-if="card.type === 'landscape' && card.source === 'system'" class="landscape-card" :class="card.styleClass">
    <div class="mountain"></div>
    <div class="text">
      <div class="t1">{{ card.date }}</div>
      <div class="t2" v-html="card.content" />
    </div>
  </div>

  <!-- 音频卡片（系统） -->
  <div v-else-if="card.type === 'audio' && card.source === 'system'" class="audio-card">
    <div class="ic-play">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    </div>
    <div class="title">{{ card.date || '窗外的雨' }}</div>
    <div class="desc">30 秒白噪音 · 适合午后</div>
    <div class="wave">
      <span v-for="i in 13" :key="i"
        :style="{
          height: (6 + Math.sin(i * 0.8) * 10) + 'px',
          animationDelay: (i * 0.1) + 's'
        }"
      />
    </div>
  </div>

  <!-- 用户手账卡片 -->
  <div v-else-if="card.source === 'user'" class="user-card" :class="[card.styleClass, card.bgTemplate || 'warm']">
    <div class="user-header">
      <span class="user-avatar">{{ card.author?.charAt(0) || '我' }}</span>
      <span class="user-name">{{ card.author || '我' }}</span>
      <span v-if="card.createdAt" class="user-date">{{ formatDate(card.createdAt) }}</span>
      <el-tag v-if="card.isPublic" size="small" type="success" effect="plain">公开</el-tag>
      <el-tag v-else size="small" type="info" effect="plain">私密</el-tag>
    </div>
    <div class="user-text" v-html="card.customText || ''" />
    <div v-if="card.customImage" class="user-image">
      <img :src="card.customImage" alt="配图" />
    </div>
    <div class="user-foot">
      <button class="like-btn" :class="{ liked: card.liked }" @click.stop="$emit('collect', card.id)">
        <SvgIcon :name="card.liked ? 'heart_fill' : 'heart'" :size="14" />
        <span v-if="card.likes > 0">{{ card.likes }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElTag } from 'element-plus'
import SvgIcon from '../../components/SvgIcon.vue'
import type { CardItem } from '../../api/cards'

defineProps<{
  card: CardItem
}>()

defineEmits<{
  collect: [id: number]
}>()

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}.${d.getDate()}`
}
</script>

<style scoped>
/* ========== 引用卡片 ========== */
.quote-card {
  background: var(--card-bg);
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
.quote-card.c-1 { background: linear-gradient(135deg, var(--apricot) 0%, var(--cream) 100%); }
.quote-card.c-2 { background: linear-gradient(135deg, var(--blue-mist) 0%, var(--blue-soft) 100%); }
.quote-card.c-3 { background: linear-gradient(135deg, var(--sage) 0%, var(--blue-soft) 100%); }
.quote-card.c-4 { background: linear-gradient(135deg, var(--peach) 0%, var(--peach-soft) 100%); }
.quote-card .quote-mark { font-size: 30px; color: var(--accent); line-height: 1; }
.quote-card .text { font-size: 14px; line-height: 1.7; color: var(--text-main); flex: 1; }
.quote-card .foot { display: flex; align-items: center; justify-content: space-between; }
.quote-card .foot .date { font-size: 11px; color: var(--text-sub); }

/* ========== 风景卡片 ========== */
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
  background: linear-gradient(135deg, var(--accent-soft) 0%, var(--accent) 50%, var(--accent-deep) 100%);
}
.landscape-card .mountain {
  position: absolute; inset: 0;
  opacity: 0.4;
  background:
    radial-gradient(circle at 20% 60%, #fff 0%, transparent 6%),
    radial-gradient(circle at 70% 40%, var(--cream) 0%, transparent 4%),
    radial-gradient(circle at 50% 70%, #fff 0%, transparent 8%);
}
.landscape-card .text { position: relative; z-index: 1; }
.landscape-card .text .t1 { font-size: 12px; opacity: 0.8; letter-spacing: 1px; }
.landscape-card .text .t2 { font-size: 14px; margin-top: 4px; font-weight: 500; }

/* ========== 音频卡片 ========== */
.audio-card {
  background: linear-gradient(135deg, #4A3A2E 0%, #2B1F18 100%);
  border-radius: 20px;
  padding: 20px;
  color: #FFE9D6;
  position: relative;
  overflow: hidden;
}
.audio-card .ic-play {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: rgba(255, 233, 214, 0.15);
  display: flex; align-items: center; justify-content: center;
  color: #FFE9D6; margin-bottom: 12px;
}
.audio-card .title { font-size: 15px; font-weight: 600; }
.audio-card .desc { font-size: 11px; color: #C4B5A6; margin-top: 4px; }
.audio-card .wave {
  display: flex; gap: 2px; align-items: flex-end; height: 20px; margin-top: 12px;
}
.audio-card .wave span {
  width: 2px; background: var(--accent); border-radius: 1px;
  animation: wave 1.2s ease-in-out infinite;
}
@keyframes wave {
  0%, 100% { height: 4px; }
  50% { height: 18px; }
}

/* ========== 用户手账卡片 ========== */
.user-card {
  border-radius: 20px;
  padding: 20px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.user-card.warm { background: linear-gradient(135deg, var(--apricot) 0%, var(--cream) 100%); }
.user-card.calm { background: linear-gradient(135deg, var(--blue-mist) 0%, var(--blue-soft) 100%); }
.user-card.dream { background: linear-gradient(135deg, #E8D8F0 0%, #F0E6F8 100%); }

.user-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-main);
}
.user-avatar {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px;
  flex-shrink: 0;
}
.user-name { font-weight: 500; }
.user-date { color: var(--text-sub); margin-left: auto; }

.user-text {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-main);
  font-weight: 500;
  flex: 1;
}
.user-image {
  border-radius: 12px;
  overflow: hidden;
}
.user-image img {
  width: 100%;
  display: block;
}
.user-foot {
  display: flex;
  justify-content: flex-end;
}

/* ========== 通用 ========== */
.like-btn {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-sub);
  cursor: pointer; border: none;
  transition: all 0.2s;
  gap: 2px;
  font-size: 11px;
}
.like-btn.liked {
  background: var(--accent-deep);
  color: #fff;
}
</style>
