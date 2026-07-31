<template>
  <div class="screen-bg"></div>
  <StatusBar />

  <NavBar title="树洞历史" left="back" />

  <div class="search-bar">
    <div class="search-input">
      <el-input v-model="searchQuery" placeholder="搜索树洞内容…" clearable @input="onSearch">
        <template #prefix>
          <SvgIcon name="search" :size="16" />
        </template>
      </el-input>
    </div>
  </div>

  <!-- 空状态 -->
  <div v-if="filteredSessions.length === 0" class="empty-state">
    <div class="empty-icon">🌙</div>
    <p class="empty-text" v-if="searchQuery">没有找到匹配的树洞记录</p>
    <p class="empty-text" v-else>还没有树洞记录<br/>去「树洞」开始第一次倾诉吧</p>
  </div>

  <div v-else class="scroll-area no-scrollbar">
    <template v-for="group in groupedSessions" :key="group.label">
      <div class="date-group">{{ group.label }}</div>
      <div
        v-for="session in group.sessions"
        :key="session.id"
        class="conv-item fade-up"
        @click="goToTreehole(session.id)"
      >
        <div class="av treehole">🌙</div>
        <div class="body">
          <div class="top">
            <span class="name">树洞倾诉</span>
            <span class="time">{{ formatTime(session.lastMessageAt) }}</span>
          </div>
          <div class="preview">{{ session.preview || session.title }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElInput } from 'element-plus'
import StatusBar from '../../components/StatusBar.vue'
import NavBar from '../../components/NavBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import { getSessions, formatTime, getDateGroupLabel, type TreeholeStoredSession } from '../../utils/treeholeStorage'

const router = useRouter()
const searchQuery = ref('')

const allSessions = computed(() => getSessions())

const filteredSessions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return allSessions.value
  return allSessions.value.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.preview.toLowerCase().includes(q)
  )
})

interface SessionGroup {
  label: string
  sessions: TreeholeStoredSession[]
}

const groupedSessions = computed(() => {
  const groups: SessionGroup[] = []
  const map = new Map<string, TreeholeStoredSession[]>()

  for (const s of filteredSessions.value) {
    const label = getDateGroupLabel(s.lastMessageAt)
    const arr = map.get(label) || []
    arr.push(s)
    map.set(label, arr)
  }

  const order = ['今天', '昨天', '周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const sorted = Array.from(map.entries()).sort((a, b) => {
    const ia = order.indexOf(a[0])
    const ib = order.indexOf(b[0])
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    const aMax = Math.max(...a[1].map(s => new Date(s.lastMessageAt).getTime()))
    const bMax = Math.max(...b[1].map(s => new Date(s.lastMessageAt).getTime()))
    return bMax - aMax
  })

  for (const [label, sessions] of sorted) {
    groups.push({ label, sessions })
  }
  return groups
})

function goToTreehole(sessionId: string) {
  router.push({ path: '/treehole', query: { sessionId } })
}

function onSearch() {
  // computed handles reactivity
}
</script>

<style scoped>
.screen-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #2A1F1B 0%, #1A130E 100%);
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
  background: rgba(255,255,255,0.08);
  border-radius: 999px;
  padding: 4px 12px;
  display: flex;
  align-items: center;
}
.search-input :deep(.el-input__wrapper) {
  background: transparent;
  box-shadow: none;
}
.search-input :deep(.el-input__inner) {
  color: rgba(255,255,255,0.85);
}
.search-input :deep(.el-input__inner)::placeholder {
  color: rgba(255,255,255,0.35);
}
.search-input :deep(.el-input__prefix) {
  color: rgba(255,255,255,0.4);
}
.date-group {
  padding: 12px 16px 4px;
  font-size: 11px;
  color: rgba(255,255,255,0.4);
}
.conv-item {
  margin: 0 12px 10px;
  background: rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s;
}
.conv-item:active {
  background: rgba(255,255,255,0.1);
}
.conv-item .av {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2A1F1B 0%, #1A130E 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.1);
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
  color: rgba(255,255,255,0.85);
}
.conv-item .body .time {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
}
.conv-item .body .preview {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---- 空状态 ---- */
.empty-state {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}
.empty-text {
  font-size: 14px;
  color: rgba(255,255,255,0.4);
  line-height: 1.6;
}
</style>
