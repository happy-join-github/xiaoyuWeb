<template>
  <div class="phone-frame">
    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.phone-frame {
  position: relative;
  width: 100%;
  height: 100vh;
  max-width: 100%;
  max-height: 100vh;
  background: var(--cream);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
