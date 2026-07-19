<template>
  <div class="svg-icon" v-html="iconSvg" :style="iconStyle"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { icons } from '../utils/icons'

const props = withDefaults(defineProps<{
  name: string
  size?: number
}>(), {
  size: 22,
})

const iconSvg = computed(() => {
  const svg = icons[props.name]
  if (!svg) return icons.sparkle
  return svg.replace('<svg ', `<svg width="${props.size}" height="${props.size}" `)
})

const iconStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}))
</script>
