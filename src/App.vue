<template>
  <EffectTemplate />
</template>

<script setup lang="ts">
// import ImageMorph from './components/ImageMorph.vue'
import EffectTemplate from './components/EffectTemplate.vue'

const imageBeforeUrl =
  'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
const imageAfterUrl =
  'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80&sat=-100&brightness=130&contrast=120'
</script>

<style lang="scss">
#app {
  width: 100vw;
  height: 100vh;

  padding: 3rem 0;
}
</style>
