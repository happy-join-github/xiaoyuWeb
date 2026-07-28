<template>
  <div class="screen-bg"></div>
  <StatusBar />
  <NavBar :title="topic?.label || '主题合集'" left="back" />

  <div class="scroll-area no-scrollbar">
    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="4" animated />
    </div>

    <!-- Topic 不存在 -->
    <div v-else-if="!topic" class="error-state">
      <el-empty description="主题不存在" />
      <el-button round @click="router.back()">返回</el-button>
    </div>

    <template v-else>
      <!-- 主题头部 -->
      <div class="topic-header" :class="topic.class">
        <div class="topic-sub">{{ topic.sub }}</div>
        <div class="topic-title">{{ topic.label }}</div>
        <div class="topic-count">{{ cards.length }} 张卡片</div>
      </div>

      <!-- 卡片列表 -->
      <div class="card-section">
        <h3>包含的卡片</h3>
        <div v-if="cards.length" class="card-grid">
          <div
            v-for="card in cards"
            :key="card.id"
            class="card-link clickable"
            @click="router.push(`/cards/${card.id}`)"
          >
            <CardItem :card="card" @collect="cardStore.toggleCollect" />
          </div>
        </div>
        <el-empty v-else description="这个主题还没有卡片" />
      </div>

      <div style="height: 24px" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElSkeleton, ElEmpty, ElButton } from 'element-plus'
import StatusBar from '../../components/StatusBar.vue'
import NavBar from '../../components/NavBar.vue'
import CardItem from './CardItem.vue'
import { useCardStore } from '../../stores/cards'

const route = useRoute()
const router = useRouter()
const cardStore = useCardStore()

const loading = ref(true)

const topicId = computed(() => Number(route.params.topicId))
const topic = computed(() => {
  const t = cardStore.topics.find((t) => t.id === topicId.value)
  return t || null
})
const cards = computed(() => {
  if (!topic.value) return []
  return cardStore.systemCards.filter((c) => topic.value!.cardIds.includes(c.id))
})

onMounted(async () => {
  if (cardStore.topics.length === 0) {
    await cardStore.fetchAllCards()
  }
  loading.value = false
})
</script>

<style scoped>
.screen-bg {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, var(--cream) 0%, var(--cream-2) 100%);
}
.scroll-area {
  position: relative; z-index: 1;
  flex: 1; overflow-y: auto;
  padding: 0 20px 24px;
}

.loading-state {
  padding: 24px 0;
}
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 20px;
}

/* ====== Topic Header ====== */
.topic-header {
  margin: 12px 0 16px;
  border-radius: 24px;
  padding: 28px 24px;
  color: #fff;
}
.topic-header.t-1 { background: linear-gradient(135deg, #F4A988 0%, #E88A6B 100%); }
.topic-header.t-2 { background: linear-gradient(135deg, #6BA4C9 0%, #4A85A8 100%); }
.topic-header.t-3 { background: linear-gradient(135deg, #7BA970 0%, #5A8B4F 100%); }
.topic-header.t-4 { background: linear-gradient(135deg, #C490C4 0%, #A06FA0 100%); }

.topic-sub { font-size: 12px; opacity: 0.85; }
.topic-title { font-size: 22px; font-weight: 600; margin-top: 6px; }
.topic-count { font-size: 12px; opacity: 0.7; margin-top: 8px; }

/* ====== Card Grid ====== */
.card-section { padding: 0 0 8px; }
.card-section h3 {
  font-size: 14px; color: var(--text-sub); font-weight: 500;
  margin-bottom: 12px;
}
.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.card-link {
  text-decoration: none;
  position: relative;
}
.card-link.clickable {
  cursor: pointer;
}
</style>
