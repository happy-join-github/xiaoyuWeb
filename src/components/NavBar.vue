<template>
  <div class="nav-bar" :class="{ center: center }">
    <div class="left">
      <template v-if="left === 'back'">
        <button class="icon-btn" @click="goBack">
          <svg-icon name="back" :size="24" />
        </button>
      </template>
      <slot name="left" />
    </div>
    <div class="title">{{ title }}</div>
    <div class="right">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import SvgIcon from './SvgIcon.vue'

const props = withDefaults(defineProps<{
  title?: string
  left?: string
  center?: boolean
}>(), {
  title: '',
  left: '',
  center: false,
})

const router = useRouter()

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/chat')
  }
}
</script>
