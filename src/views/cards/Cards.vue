<template>
  <router-view v-if="isChildRoute" />
  <template v-else>
    <div class="screen-bg"></div>
    <StatusBar />
    <NavBar title="治愈卡片" left="">
      <template #right>
        <router-link to="/cards/create" class="icon-btn">
          <el-icon :size="20"><Plus /></el-icon>
        </router-link>
      </template>
    </NavBar>

    <div class="scroll-area no-scrollbar">
      <!-- Loading -->
      <div v-if="cardStore.loading" class="loading-state">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- Error -->
      <div v-else-if="cardStore.error" class="error-state">
        <el-empty :description="cardStore.error" />
        <el-button type="warning" round @click="cardStore.fetchAllCards()">重试</el-button>
      </div>

      <template v-else>
        <!-- 搜索栏 -->
        <div class="search-bar-wrap">
          <el-input
            v-model="cardStore.searchQuery"
            :prefix-icon="Search"
            clearable
            placeholder="搜索卡片内容..."
            class="search-input-el"
          />
        </div>

        <!-- Tabs -->
        <div class="tabs-wrap">
          <el-tabs
            v-model="cardStore.activeTab"
            class="card-tabs"
          >
            <el-tab-pane
              v-for="tab in TAB_CONFIG"
              :key="tab.key"
              :label="tab.label"
              :name="tab.key"
            />
          </el-tabs>
        </div>

        <!-- 今日推荐 Hero（仅 recommend Tab） -->
        <template v-if="cardStore.activeTab === 'recommend' && cardStore.todayRecommend">
          <router-link class="hero fade-in" :to="`/cards/${cardStore.todayRecommend.id}`">
            <div class="deco">🌸</div>
            <div class="date">{{ todayDate }} · 今日推荐</div>
            <h2 v-html="cardStore.todayRecommend.content.replace(/<br>/g, '<br>')" />
            <div class="signature">
              <span class="avatar-sm">🌸</span>
              <span>{{ userStore.aiName }} · 写给今天的你</span>
            </div>
          </router-link>
        </template>

        <!-- 主题合集（仅 recommend Tab） -->
        <template v-if="cardStore.activeTab === 'recommend'">
          <div class="card-section">
            <h3>
              主题合集
              <span class="more-link">全部 →</span>
            </h3>
            <div class="topic-row no-scrollbar">
              <router-link
                v-for="topic in cardStore.topics"
                :key="topic.label"
                :to="`/cards/topic/${topic.id}`"
                class="topic"
                :class="topic.class"
              >
                <div class="t1">{{ topic.sub }}</div>
                <div class="t2">{{ topic.label }}</div>
              </router-link>
            </div>
          </div>
        </template>

        <!-- 我的创作 - 空状态 -->
        <div
          v-if="cardStore.activeTab === 'my-cards' && cardStore.userCards.length === 0"
          class="empty-section"
        >
          <el-empty description="还没有创作过卡片">
            <template #image>
              <div class="empty-icon">🌸</div>
            </template>
            <p class="empty-desc">记录下今天的心情，或是写下想对自己说的话</p>
            <router-link to="/cards/create">
              <el-button type="warning" round>
                <el-icon :size="16"><Plus /></el-icon>
                制作第一张卡片
              </el-button>
            </router-link>
          </el-empty>
        </div>

        <!-- 社区广场 - 空状态 -->
        <div
          v-if="cardStore.activeTab === 'community' && cardStore.communityCards.length === 0"
          class="empty-section"
        >
          <el-empty description="还没有人分享卡片">
            <template #image>
              <div class="empty-icon">🌻</div>
            </template>
            <p class="empty-desc">来制作你的第一张公开卡片，和大家一起分享治愈时刻吧</p>
            <router-link to="/cards/create">
              <el-button type="warning" round>
                <el-icon :size="16"><Plus /></el-icon>
                制作并公开
              </el-button>
            </router-link>
          </el-empty>
        </div>

        <!-- 卡片网格 -->
        <div class="card-section">
          <h3>
            {{ sectionTitle }}
            <el-tag v-if="cardStore.displayCards.length" size="small" type="warning" effect="plain">
              {{ cardStore.displayCards.length }}
            </el-tag>
          </h3>
          <div v-if="cardStore.displayCards.length" class="card-grid">
            <template
              v-for="card in (cardStore.searchQuery ? cardStore.searchedCards : cardStore.displayCards)"
              :key="card.id"
            >
              <div
                class="card-link"
                :class="{ clickable: card.type !== 'audio' }"
                @click="card.type !== 'audio' && goToCard(card.id)"
              >
                <CardItem :card="card" @collect="cardStore.toggleCollect" />
              </div>
            </template>
          </div>
          <div v-else-if="cardStore.searchQuery" class="empty-filter">
            没有找到 "{{ cardStore.searchQuery }}" 相关的卡片
          </div>
          <div
            v-else-if="cardStore.activeTab !== 'my-cards' && cardStore.activeTab !== 'community'"
            class="empty-filter"
          >
            没有找到这类卡片
          </div>

          <!-- 无限滚动触发哨兵 -->
          <div
            v-if="cardStore.activeTab === 'recommend' && cardStore.hasMore"
            ref="sentinelRef"
            class="sentinel"
          >
            <div v-if="cardStore.loadingMore" class="loading-more">
              <el-icon class="is-loading" :size="16"><Refresh /></el-icon>
              <span>加载更多…</span>
            </div>
            <span v-else class="scroll-hint">向下滑动查看更多</span>
          </div>
        </div>
      </template>

      <div style="height: 80px" />
    </div>

    <!-- FAB 创建按钮 -->
    <router-link to="/cards/create" class="fab">
      <el-button type="warning" circle :icon="Plus" size="large" />
    </router-link>

    <TabBar activeKey="cards" />
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElSkeleton, ElEmpty, ElButton, ElInput, ElTabs, ElTabPane, ElTag, ElIcon } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import StatusBar from '../../components/StatusBar.vue'
import NavBar from '../../components/NavBar.vue'
import TabBar from '../../components/TabBar.vue'
import CardItem from './CardItem.vue'
import { useCardStore, TAB_CONFIG } from '../../stores/cards'
import { useUserStore } from '../../stores/user'

const cardStore = useCardStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const isChildRoute = computed(() => route.path !== '/cards')

function goToCard(id: number) {
  router.push(`/cards/${id}`)
}

const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const todayDate = computed(() => {
  const d = new Date()
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`
})

const sectionTitle = computed(() => {
  const map: Record<string, string> = {
    recommend: '今日治愈',
    'my-cards': '我的创作',
    warm: '暖心话',
    audio: '声音',
    scene: '风景',
    community: '大家的分享',
  }
  return map[cardStore.activeTab] || '今日治愈'
})

onMounted(() => {
  if (cardStore.systemCards.length === 0) {
    cardStore.fetchAllCards()
  }

  // 每日推送
  const todayKey = `card_daily_${new Date().toISOString().slice(0, 10)}`
  if (!localStorage.getItem(todayKey)) {
    localStorage.setItem(todayKey, '1')
    setTimeout(() => {
      if (cardStore.todayRecommend) {
        ElMessage({
          message: '今日治愈卡片已送达 🌷 来看看吧',
          type: 'success',
          duration: 3000,
          offset: 60,
        })
      }
    }, 800)
  }

  // 无限滚动
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && cardStore.hasMore && !cardStore.loadingMore) {
        cardStore.loadMoreCards()
      }
    },
    { rootMargin: '200px' }
  )

  const checkSentinel = () => {
    if (sentinelRef.value) {
      observer?.observe(sentinelRef.value)
    }
  }
  setTimeout(checkSentinel, 300)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.screen-bg {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, var(--cream) 0%, var(--cream-2) 100%);
  pointer-events: none;
}
.icon-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-sub);
}

/* ====== Search Bar ====== */
.search-bar-wrap {
  padding: 12px 16px 8px;
}
.search-input-el {
  --el-input-border-radius: 999px;
}
.search-input-el :deep(.el-input__wrapper) {
  background: var(--card-bg);
  box-shadow: var(--shadow-sm);
}
.search-input-el :deep(.el-input__inner) {
  font-size: 13px;
}
.search-input-el :deep(.el-input__inner::placeholder) {
  color: var(--text-mute);
}

.scroll-area {
  position: relative; z-index: 1;
  flex: 1; overflow-y: auto;
}

/* ====== Tabs ====== */
.tabs-wrap {
  padding: 0 16px;
}
.card-tabs :deep(.el-tabs__header) {
  margin: 0;
}
.card-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}
.card-tabs :deep(.el-tabs__item) {
  font-size: 13px;
  color: var(--text-sub);
  padding: 0 12px;
  height: 36px;
  line-height: 36px;
  border-radius: 999px;
  transition: all 0.2s;
}
.card-tabs :deep(.el-tabs__item:hover) {
  color: var(--accent-deep);
}
.card-tabs :deep(.el-tabs__item.is-active) {
  color: #fff;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%);
  box-shadow: var(--shadow-md);
  border-radius: 999px;
  font-weight: 500;
}
.card-tabs :deep(.el-tabs__active-bar) {
  display: none;
}
.card-tabs :deep(.el-tabs__nav) {
  border: none;
  gap: 8px;
  flex-wrap: nowrap;
  overflow-x: auto;
}
.card-tabs :deep(.el-tabs__content) {
  display: none;
}

/* ====== Loading / Error ====== */
.loading-state {
  padding: 24px 16px;
}
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
}

/* ====== Empty ====== */
.empty-section {
  padding: 20px 16px 0;
}
.empty-section :deep(.el-empty__image) {
  width: auto;
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 8px;
}
.empty-desc {
  font-size: 13px;
  color: var(--text-sub);
  margin-bottom: 4px;
  line-height: 1.5;
}

.empty-filter {
  text-align: center;
  padding: 32px;
  color: var(--text-sub);
  font-size: 13px;
}

/* ====== Hero ====== */
.hero {
  display: block;
  margin: 8px 16px 0;
  padding: 28px 24px;
  background: linear-gradient(135deg, var(--apricot) 0%, var(--peach) 100%);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  text-decoration: none;
}
.hero .date { font-size: 12px; color: var(--text-sub); letter-spacing: 1px; }
.hero h2 {
  font-size: 22px; line-height: 1.5;
  color: var(--text-main); margin: 12px 0 16px; font-weight: 600;
}
.hero .signature { font-size: 12px; color: var(--text-sub); display: flex; align-items: center; gap: 6px; }
.hero .deco {
  position: absolute; top: -30px; right: -20px;
  font-size: 120px; opacity: 0.15; transform: rotate(15deg);
}
.avatar-sm {
  display: inline-flex; width: 18px; height: 18px;
  background: var(--card-bg); border-radius: 50%;
  align-items: center; justify-content: center;
}

/* ====== Card Section ====== */
.card-section {
  padding: 20px 16px 8px;
}
.card-section h3 {
  font-size: 14px; color: var(--text-sub); font-weight: 500;
  margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
}
.card-section h3 .more-link { font-size: 12px; color: var(--accent-deep); }
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

/* ====== Topic Row ====== */
.topic-row {
  display: flex; gap: 12px;
  overflow-x: auto; padding: 4px 0 8px;
}
.topic {
  flex-shrink: 0; width: 130px;
  border-radius: 16px; padding: 14px; color: #fff;
  min-height: 90px;
  display: flex; flex-direction: column; justify-content: space-between;
  cursor: pointer;
  text-decoration: none;
}
.topic.t-1 { background: linear-gradient(135deg, #F4A988 0%, #E88A6B 100%); }
.topic.t-2 { background: linear-gradient(135deg, #6BA4C9 0%, #4A85A8 100%); }
.topic.t-3 { background: linear-gradient(135deg, #7BA970 0%, #5A8B4F 100%); }
.topic.t-4 { background: linear-gradient(135deg, #C490C4 0%, #A06FA0 100%); }
.topic .t1 { font-size: 11px; opacity: 0.85; }
.topic .t2 { font-size: 14px; font-weight: 600; line-height: 1.4; }

/* ====== FAB ====== */
.fab {
  position: absolute;
  bottom: 80px;
  right: 20px;
  z-index: 10;
  text-decoration: none;
}
.fab .el-button {
  width: 56px; height: 56px;
  font-size: 24px;
  box-shadow: var(--shadow-lg);
  --el-button-bg-color: linear-gradient(135deg, var(--accent), var(--accent-deep));
  --el-button-border-color: transparent;
}

/* ====== 无限滚动 ====== */
.sentinel {
  text-align: center;
  padding: 16px 0;
  grid-column: 1 / -1;
}
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-sub);
}
.scroll-hint {
  font-size: 12px;
  color: var(--text-mute);
}
</style>
