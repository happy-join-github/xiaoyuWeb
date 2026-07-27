<template>
  <div class="screen-bg"></div>
  <StatusBar />
  <NavBar :title="navTitle" left="back">
    <template #right>
      <!-- 用户卡片专属操作 -->
      <template v-if="card?.source === 'user' && cardStore.userCards.some(c => c.id === card?.id)">
        <button class="icon-btn" @click="onEdit">
          <el-icon :size="18"><Edit /></el-icon>
        </button>
        <button class="icon-btn" @click="onDelete">
          <el-icon :size="18"><Close /></el-icon>
        </button>
      </template>
      <button v-else class="icon-btn" @click="onRefresh">
        <el-icon :size="18"><Refresh /></el-icon>
      </button>
    </template>
  </NavBar>

  <!-- Loading -->
  <div v-if="loading" class="loading-state">
    <el-skeleton :rows="5" animated />
  </div>

  <!-- Not found -->
  <div v-else-if="!card" class="error-state">
    <el-empty description="卡片不存在" />
    <el-button round @click="router.back()">返回</el-button>
  </div>

  <template v-else>
    <div class="scroll-area no-scrollbar">

      <!-- ====== 系统卡片 - 引用大卡片 ====== -->
      <div ref="cardRef" class="capture-container">
        <div v-if="card.type === 'quote' && card.source === 'system'" class="big-card fade-in">
          <div class="top-row">
            <el-tag size="small" effect="plain" type="warning">🌅 暖心话</el-tag>
            <div class="deco-flower">🌸</div>
          </div>
          <div class="text-area">
            <div class="q">"</div>
            <div class="text" v-html="card.content" />
          </div>
          <div class="bottom">
            <div class="sign">— {{ userStore.aiName }} 🌷</div>
            <div class="date-tag">{{ card.date }}</div>
          </div>
        </div>

        <!-- ====== 系统卡片 - 风景 ====== -->
        <div v-else-if="card.type === 'landscape' && card.source === 'system'" class="big-landscape" :class="card.styleClass">
          <div class="mountain" />
          <div class="overlay-text">
            <el-tag size="small" effect="dark" style="background:rgba(255,255,255,0.3);border:none;color:#fff">🖼 风景</el-tag>
            <div class="title">{{ card.date }}</div>
            <div class="desc" v-html="card.content" />
          </div>
        </div>

        <!-- ====== 系统卡片 - 音频 ====== -->
        <div v-else-if="card.type === 'audio' && card.source === 'system'" class="audio-wrapper">
          <AudioPlayer
            :title="card.date || '窗外的雨'"
            :autoPlay="false"
            @close="onRefresh"
          />
        </div>

        <!-- ====== 用户卡片 ====== -->
        <div v-else-if="card.source === 'user'" class="big-user-card" :class="card.bgTemplate || 'warm'">
          <div class="user-top">
            <div class="user-info">
              <span class="user-avatar-big">{{ card.author?.charAt(0) || '我' }}</span>
              <div>
                <div class="user-name-big">{{ card.author || '我' }}</div>
                <div class="user-date-big">{{ formatDate(card.createdAt || '') }}</div>
              </div>
            </div>
            <el-tag :type="card.isPublic ? 'success' : 'info'" size="small" effect="plain">
              {{ card.isPublic ? '公开' : '私密' }}
            </el-tag>
          </div>
          <div class="user-text-big" v-html="card.customText || ''" />
          <div v-if="card.customImage" class="user-image-big">
            <img :src="card.customImage" alt="配图" />
          </div>
        </div>
      </div>

      <!-- ====== 操作区 ====== -->
      <div class="actions fade-up">
        <div class="action" :class="{ active: cardStore.isCollected(card.id) }" @click="cardStore.toggleCollect(card.id)">
          <div class="ic">
            <SvgIcon :name="cardStore.isCollected(card.id) ? 'heart_fill' : 'heart'" :size="18" />
          </div>
          <span>{{ cardStore.isCollected(card.id) ? '已收藏' : '收藏' }}</span>
        </div>
        <div class="action" @click="drawerVisible = true">
          <div class="ic">
            <el-icon :size="18"><StarFilled /></el-icon>
          </div>
          <span>收藏集</span>
        </div>
        <div class="action" @click="onShare">
          <div class="ic">
            <el-icon :size="18"><Share /></el-icon>
          </div>
          <span>分享</span>
        </div>
        <div class="action" @click="onSave">
          <div class="ic">
            <el-icon :size="18"><Download /></el-icon>
          </div>
          <span>保存图片</span>
        </div>
      </div>

      <!-- 收藏集抽屉 -->
      <el-drawer
        v-model="drawerVisible"
        title="加入收藏集"
        direction="btt"
        size="50%"
        :with-header="true"
        class="collection-drawer"
      >
        <div class="drawer-body">
          <div v-if="cardStore.collections.length === 0" class="no-collections">
            <el-empty description="还没有收藏集，创建一个吧" />
          </div>
          <div v-else class="collection-list">
            <div
              v-for="col in cardStore.collections"
              :key="col.id"
              class="collection-item"
              :class="{ active: cardStore.getCollectionsByCard(card.id).some((c) => c.id === col.id) }"
              @click="onToggleCollection(col.id)"
            >
              <div class="col-info">
                <div class="col-name">{{ col.name }}</div>
                <div class="col-count">{{ col.cardIds.length }} 张</div>
              </div>
              <el-icon v-if="cardStore.getCollectionsByCard(card.id).some((c) => c.id === col.id)" color="#E88A6B" :size="18">
                <Check />
              </el-icon>
            </div>
          </div>
          <!-- 新建收藏集 -->
          <div class="create-collection">
            <el-input
              v-model="newCollectionName"
              placeholder="新建收藏集名称"
              clearable
              @keyup.enter="onCreateCollection"
            />
            <el-button type="warning" :disabled="!newCollectionName.trim()" @click="onCreateCollection">
              创建
            </el-button>
          </div>
        </div>
      </el-drawer>

      <!-- 换一张 -->
      <div class="switch-row">
        <span class="switch-link" @click="onRefresh">
          <el-icon :size="16"><Refresh /></el-icon>
          换一张
        </span>
      </div>

      <div style="height: 24px" />
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ElMessage,
  ElMessageBox,
  ElSkeleton,
  ElEmpty,
  ElButton,
  ElTag,
  ElIcon,
  ElDrawer,
  ElInput,
} from 'element-plus'
import {
  StarFilled,
  Share,
  Download,
  Edit,
  Close,
  Refresh,
  Check,
} from '@element-plus/icons-vue'
import SvgIcon from '../../components/SvgIcon.vue'
import StatusBar from '../../components/StatusBar.vue'
import NavBar from '../../components/NavBar.vue'
import { useCardStore } from '../../stores/cards'
import { useUserStore } from '../../stores/user'
import { saveCardAsImage, cardToBlob } from '../../utils/saveCard'
import AudioPlayer from './AudioPlayer.vue'

const route = useRoute()
const router = useRouter()
const cardStore = useCardStore()
const userStore = useUserStore()

const loading = ref(true)
const saving = ref(false)
const cardRef = ref<HTMLElement | null>(null)
const drawerVisible = ref(false)
const newCollectionName = ref('')

const cardId = computed(() => Number(route.params.id))
const card = computed(() => {
  const allCards = [...cardStore.systemCards, ...cardStore.userCards, ...cardStore.communityCards]
  return allCards.find((c) => c.id === cardId.value) || null
})

const navTitle = computed(() => {
  if (!card.value) return '卡片详情'
  if (card.value.source === 'user') {
    if (cardStore.communityCards.some(c => c.id === card.value?.id)) {
      return '广场 · ' + (card.value.author || '社区')
    }
    return '我的卡片'
  }
  if (card.value.type === 'quote') return '暖心话'
  if (card.value.type === 'landscape') return '风景'
  if (card.value.type === 'audio') return '声音'
  return '卡片详情'
})

async function loadCard() {
  loading.value = true
  if (cardStore.systemCards.length === 0) {
    await cardStore.fetchAllCards()
  }
  loading.value = false
}

onMounted(loadCard)
watch(() => route.params.id, loadCard)

async function onSave() {
  if (!cardRef.value || saving.value) return
  saving.value = true
  try {
    const filename = card.value?.source === 'user'
      ? `手账-${card.value?.id}`
      : `治愈卡片-${card.value?.id}`
    await saveCardAsImage(cardRef.value, filename)
    ElMessage.success('图片已保存')
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function onShare() {
  if (!card.value || !cardRef.value) return

  const shareData: ShareData = {
    title: '治愈卡片',
    text: card.value.source === 'user'
      ? (card.value.customText || '')
      : (card.value.content?.replace(/<br>/g, '') || ''),
    url: window.location.href,
  }

  if (navigator.share) {
    try {
      const blob = await cardToBlob(cardRef.value)
      if (blob && navigator.canShare?.({ files: [new File([blob], 'card.png', { type: 'image/png' })] })) {
        shareData.files = [new File([blob], 'card.png', { type: 'image/png' })]
      }
      await navigator.share(shareData)
      return
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        fallbackShare(shareData)
      }
      return
    }
  }

  fallbackShare(shareData)
}

async function fallbackShare(data: ShareData) {
  try {
    await navigator.clipboard.writeText(data.url || window.location.href)
    ElMessage.success('链接已复制到剪贴板，快去分享吧 🌷')
  } catch {
    ElMessage.warning('分享功能暂不可用，请手动复制链接')
  }
}

function onRefresh() {
  const allCards = card.value?.source === 'user'
    ? cardStore.userCards
    : cardStore.systemCards.filter((c) => c.type === card.value?.type)

  const others = allCards.filter((c) => c.id !== cardId.value)
  if (others.length > 0) {
    const next = others[Math.floor(Math.random() * others.length)]
    router.push(`/cards/${next.id}`)
  }
}

function onEdit() {
  if (!card.value || card.value.source !== 'user') return
  router.push(`/cards/create?edit=${card.value.id}`)
}

function onDelete() {
  if (!card.value || card.value.source !== 'user') return
  ElMessageBox.confirm('确定删除这张卡片吗？', '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    cardStore.removeUserCard(card.value!.id)
    router.push('/cards')
  }).catch(() => {
    // 取消操作
  })
}

// ====== 收藏集 ======
function onCreateCollection() {
  const name = newCollectionName.value.trim()
  if (!name || !card.value) return
  const col = cardStore.createCollection(name)
  cardStore.addCardToCollection(col.id, card.value.id)
  newCollectionName.value = ''
}

function onToggleCollection(colId: number) {
  if (!card.value) return
  const collections = cardStore.getCollectionsByCard(card.value.id)
  const inCol = collections.find((c) => c.id === colId)
  if (inCol) {
    cardStore.removeCardFromCollection(colId, card.value.id)
  } else {
    cardStore.addCardToCollection(colId, card.value.id)
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`
}
</script>

<style scoped>
.screen-bg {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, #FFD4C2 0%, #FFE7D1 50%, #FFEFDF 100%);
}
.icon-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-sub, #9C8B7E);
}
.loading-state {
  padding: 24px 20px;
}
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 20px;
}
.scroll-area {
  position: relative; z-index: 1;
  flex: 1; overflow-y: auto;
  padding: 0 20px 24px;
}

/* ====== 系统-引用大卡片 ====== */
.big-card {
  margin: 12px 0 16px;
  background: linear-gradient(135deg, #FFE7D1 0%, #FFD4C2 50%, #FFC8A8 100%);
  border-radius: 28px;
  padding: 32px 28px;
  box-shadow: 0 20px 40px rgba(244, 169, 136, 0.3);
  display: flex; flex-direction: column;
  justify-content: space-between;
  position: relative; overflow: hidden;
  min-height: 300px;
}
.big-card::before {
  content: ''; position: absolute;
  top: -50px; right: -50px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 60%);
}
.big-card::after {
  content: ''; position: absolute;
  bottom: -50px; left: -50px;
  width: 180px; height: 180px;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 60%);
}
.big-card .top-row {
  display: flex; justify-content: space-between; align-items: center;
  position: relative; z-index: 1;
}
.big-card .deco-flower { font-size: 60px; opacity: 0.3; }
.big-card .text-area {
  position: relative; z-index: 1;
  flex: 1; display: flex; flex-direction: column;
  justify-content: center; padding: 20px 0;
}
.big-card .text-area .q {
  font-size: 60px; line-height: 0.6;
  color: #fff; opacity: 0.5;
}
.big-card .text-area .text {
  font-size: 22px; line-height: 1.6;
  color: #4A3A2E; font-weight: 500; margin-top: 12px;
}
.big-card .bottom {
  display: flex; justify-content: space-between; align-items: flex-end;
  position: relative; z-index: 1;
}
.big-card .sign { font-size: 12px; color: #6B5A4D; }
.big-card .date-tag { font-size: 11px; color: #9C8B7E; }

/* ====== 系统-风景大卡片 ====== */
.big-landscape {
  margin: 12px 0 16px;
  border-radius: 28px;
  height: 340px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: 24px;
  color: #fff;
}
.big-landscape.l-1 {
  background: linear-gradient(135deg, #FFB89A 0%, #F4A988 50%, #C28F76 100%);
}
.big-landscape .mountain {
  position: absolute; inset: 0; opacity: 0.4;
  background:
    radial-gradient(circle at 20% 60%, #fff 0%, transparent 6%),
    radial-gradient(circle at 70% 40%, #FFE9D6 0%, transparent 4%),
    radial-gradient(circle at 50% 70%, #fff 0%, transparent 8%);
}
.big-landscape .overlay-text { position: relative; z-index: 1; }
.big-landscape .title { font-size: 16px; font-weight: 600; letter-spacing: 1px; margin-top: 8px; }
.big-landscape .desc { font-size: 15px; margin-top: 8px; line-height: 1.6; }

/* ====== 系统-音频播放器 ====== */
.audio-wrapper {
  margin: 12px 0 16px;
}

/* ====== 用户大卡片 ====== */
.big-user-card {
  margin: 12px 0 16px;
  border-radius: 28px;
  padding: 32px 28px;
  min-height: 280px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(156, 139, 126, 0.15);
}
.big-user-card.warm { background: linear-gradient(135deg, #FFE7D1 0%, #FFF4E8 100%); }
.big-user-card.calm { background: linear-gradient(135deg, #CDE3F2 0%, #E5F1F8 100%); }
.big-user-card.dream { background: linear-gradient(135deg, #E8D8F0 0%, #F0E6F8 100%); }

.user-top { display: flex; justify-content: space-between; align-items: flex-start; }
.user-info { display: flex; align-items: center; gap: 10px; }
.user-avatar-big {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: #F4A988;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
}
.user-name-big { font-size: 14px; font-weight: 600; color: #4A3A2E; }
.user-date-big { font-size: 11px; color: #9C8B7E; margin-top: 2px; }
.user-text-big {
  font-size: 22px;
  line-height: 1.7;
  color: #4A3A2E;
  font-weight: 500;
  margin-top: 28px;
  white-space: pre-wrap;
}
.user-image-big {
  margin-top: 20px;
  border-radius: 16px;
  overflow: hidden;
}
.user-image-big img { width: 100%; display: block; }

/* ====== 操作区 ====== */
.actions { display: flex; gap: 10px; }
.actions .action {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  padding: 14px;
  display: flex; flex-direction: column;
  align-items: center; gap: 6px;
  font-size: 12px; color: #4A3A2E;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s;
}
.actions .action .ic {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: #FFE7D1; color: #E88A6B;
  transition: all 0.2s;
}
.actions .action.active .ic {
  background: #E88A6B; color: #fff;
}
.actions .action.active {
  color: #E88A6B;
  font-weight: 600;
}

/* ====== 切换 ====== */
.switch-row {
  margin-top: 16px;
  text-align: center;
}
.switch-link {
  color: #9C8B7E;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

/* ====== 收藏集抽屉 ====== */
.collection-drawer :deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #4A3A2E;
}
.collection-drawer :deep(.el-drawer__body) {
  padding: 12px 20px 24px;
}
.drawer-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.no-collections {
  text-align: center;
}
.collection-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.collection-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 12px;
  background: #FFF8F1;
  cursor: pointer;
  transition: all 0.2s;
}
.collection-item.active {
  background: #FFE7D1;
  border: 1px solid #F4A988;
}
.col-name {
  font-size: 14px;
  font-weight: 500;
  color: #4A3A2E;
}
.col-count {
  font-size: 11px;
  color: #9C8B7E;
  margin-top: 2px;
}
.create-collection {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
</style>
