<template>
  <div class="status-bar">
    <span>{{ time }}</span>
    <div class="icons">
      <svg-icon name="signal" :size="16" />
      <svg-icon name="wifi" :size="14" />
      <svg-icon name="battery" :size="24" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SvgIcon from './SvgIcon.vue'

const time = ref('9:41')

function updateTime() {
  const now = new Date()
  const h = now.getHours().toString().padStart(2, '0')
  const m = now.getMinutes().toString().padStart(2, '0')
  time.value = `${h}:${m}`
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 30000)
})
</script>
