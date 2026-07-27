<template>
  <div class="screen-bg"></div>
  <StatusBar />

  <NavBar title="聊天历史" left="back" />

  <div class="search-bar">
    <div class="search-input">
      <el-input v-model="searchQuery" placeholder="搜索聊天内容…" clearable @input="onSearch">
        <template #prefix>
          <SvgIcon name="search" :size="16" />
        </template>
      </el-input>
    </div>
  </div>

  <!-- 空状态 -->
  <div v-if="filteredSessions.length === 0" class="empty-state">
    <div class="empty-icon">&#x1F50D;</div>
    <p class="empty-text" v-if="searchQuery">没有找到匹配的聊天记录</p>
    <p class="empty-text" v-else>还没有聊天记录<br/>去「聊聊」开始第一次对话吧</p>
  </div>

  <div v-else class="scroll-area no-scrollbar">
    <template v-for="group in groupedSessions" :key="group.label">
      <div class="date-group">{{ group.label }}</div>
      <router-link
        v-for="session in group.sessions"
        :key="session.id"
        class="conv-item fade-up"
        :to="session.type === 'treehole' ? '/treehole' : '/chat'"
      >
        <div class="av" :class="session.type">
          {{ session.type === 'treehole' ? '🌙' : '🌸' }}
        </div>
        <div class="body">
          <div class="top">
            <span class="name">
              {{ session.type === 'treehole' ? '树洞倾诉' : userStore.aiName }}
            </span>
            <span class="time">{{ formatTime(session.lastMessageAt) }}</span>
          </div>
          <div class="preview">{{ session.preview || session.title }}</div>
        </div>
        <el-tag v-if="session.type === 'treehole'" size="small" class="tag tree">树洞</el-tag>
      </router-link>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElInput, ElTag } from 'element-plus'
import StatusBar from '../../components/StatusBar.vue'
import NavBar from '../../components/NavBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import { useUserStore } from '../../stores/user'
import { getSessions, formatTime, getDateGroupLabel, type StoredSession } from '../../utils/chatStorage'

const userStore = useUserStore()
const searchQuery = ref('')

// 所有会话（已按时间倒序）
const allSessions = computed(() => getSessions())

// 搜索过滤
const filteredSessions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return allSessions.value
  return allSessions.value.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.preview.toLowerCase().includes(q)
  )
})

// 按日期分组
interface SessionGroup {
  label: string
  sessions: StoredSession[]
}

const groupedSessions = computed(() => {
  const groups: SessionGroup[] = []
  const map = new Map<string, StoredSession[]>()

  for (const s of filteredSessions.value) {
    const label = getDateGroupLabel(s.lastMessageAt)
    const arr = map.get(label) || []
    arr.push(s)
    map.set(label, arr)
  }

  // 按 label 排序：今天 > 昨天 > 本周 > 更早
  const order = ['今天', '昨天', '周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const sorted = Array.from(map.entries()).sort((a, b) => {
    const ia = order.indexOf(a[0])
    const ib = order.indexOf(b[0])
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    // 都是日期字符串，按最后消息时间倒序
    const aMax = Math.max(...a[1].map(s => new Date(s.lastMessageAt).getTime()))
    const bMax = Math.max(...b[1].map(s => new Date(s.lastMessageAt).getTime()))
    return bMax - aMax
  })

  for (const [label, sessions] of sorted) {
    groups.push({ label, sessions })
  }
  return groups
})

function onSearch() {
  // computed 会响应 searchQuery 变化，无需额外逻辑
}
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
  padding: 4px 12px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
}
.search-input :deep(.el-input__wrapper) {
  background: transparent;
  box-shadow: none;
}
.search-input :deep(.el-input__inner) {
  color: #4A3A2E;
}
.search-input :deep(.el-input__inner)::placeholder {
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
/* Tag positioning inside conv-item */
.conv-item .tag.el-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  border: none;
  font-size: 10px;
  padding: 0 8px;
  height: auto;
  line-height: 20px;
}
.conv-item .tag.tree.el-tag {
  --el-tag-bg-color: #2B1F18;
  --el-tag-text-color: #FFE9D6;
  --el-tag-border-color: #2B1F18;
}
.conv-item .tag:not(.tree).el-tag {
  --el-tag-bg-color: #FFE7D1;
  --el-tag-text-color: #E88A6B;
  --el-tag-border-color: #FFE7D1;
}

/* 树洞头像暗色背景 */
.conv-item .av.treehole {
  background: linear-gradient(135deg, #2A1F1B 0%, #1A130E 100%);
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
  color: #C4B5A6;
  line-height: 1.6;
}
</style>
