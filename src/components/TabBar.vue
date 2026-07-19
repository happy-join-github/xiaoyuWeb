<template>
  <div class="tabbar">
    <router-link
      v-for="item in items"
      :key="item.key"
      class="tab-item"
      :class="{ active: activeKey === item.key }"
      :to="item.path"
    >
      <div class="ic">
        <svg-icon :name="item.key" :size="24" />
      </div>
      <span>{{ item.label }}</span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from './SvgIcon.vue'

const props = withDefaults(defineProps<{
  activeKey?: string
}>(), {
  activeKey: 'chat',
})

const items = [
  { key: 'chat', label: '聊聊', path: '/chat' },
  { key: 'treehole', label: '树洞', path: '/treehole' },
  { key: 'cards', label: '卡片', path: '/cards' },
  { key: 'me', label: '我的', path: '/profile' },
]
</script>
