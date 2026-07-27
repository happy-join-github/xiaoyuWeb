<template>
  <div class="tabbar">
    <div
      v-for="item in items"
      :key="item.key"
      class="tab-item"
      :class="{ active: activeKey === item.key }"
      @click="onTabClick(item.path, item.key)"
    >
      <div class="ic">
        <svg-icon :name="item.key" :size="24" />
      </div>
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import SvgIcon from './SvgIcon.vue'

const props = withDefaults(defineProps<{
  activeKey?: string
}>(), {
  activeKey: 'chat',
})

const router = useRouter()
const items = [
  { key: 'chat', label: '聊聊', path: '/chat' },
  { key: 'treehole', label: '树洞', path: '/treehole' },
  { key: 'cards', label: '卡片', path: '/cards' },
  { key: 'me', label: '我的', path: '/profile' },
]

function onTabClick(path: string, key: string) {
  if (props.activeKey === key) {
    // 已在当前 tab：滚动到页面顶部
    const scrollArea = document.querySelector('.scroll-area')
    if (scrollArea) {
      scrollArea.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } else {
    router.push(path)
  }
}
</script>
