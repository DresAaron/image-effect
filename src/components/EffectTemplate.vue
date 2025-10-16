<template>
  <div class="effect-template">
    <div class="effect-selector">
      <div class="effect-groups">
        <div
          class="effect-groups-item"
          v-for="item in effectGroups"
          :key="item"
          @click="selectedGroup = item"
          :class="{
            'effect-groups-item-active': selectedGroup === item,
          }"
        >
          {{ item }}
        </div>
      </div>
      <div class="effect-group-container">
        <div
          class="effect-item"
          v-for="effect in effectTemplates"
          :key="effect.key"
          @click="selectedEffect = effect.name"
        >
          <img :src="effect.image" alt="effect" class="effect-item--img" />
        </div>
      </div>
    </div>

    <EffectPreview :before-image="beforeImage" :after-image="afterImage" :effect="selectedEffect" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import EffectPreview from './EffectPreview.vue'

const effectGroups = [
  'Body Enhancer',
  'Camera Control',
  'Clothes Changer',
  'Pose Changer',
  'Photo Enhancer',
  'Photoshoot',
  'Travel',
  'Creative App',
]
const effectTemplates = [
  'Vintage Antique Bed',
  'Red Sofa',
  'Pink Bed',
  'Dark Corner',
  'Cute Rug',
  'Bubble Soak',
  'Black Bed',
  'Window Side',
  'Water Ripple',
  'Water Reflection',
  'Water Play',
  'Toilet Paper',
  'Toilet Seat',
  'Steam Shower',
  'Steam Corner',
].map((item, idx) => {
  return {
    name: item,
    key: item.split(' ').join('-').toLowerCase(),
    image: `effect-${idx % 3}.png`,
  }
})

const selectedGroup = ref(effectGroups[0])
const selectedEffect = ref('')
const beforeImage = ref('')
const afterImage =
  'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80&sat=-100&brightness=130&contrast=120'

watch(selectedEffect, () => {
  beforeImage.value =
    'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
})
</script>

<style lang="scss">
.effect-template {
  width: 100%;
  height: 100%;

  display: flex;
  gap: 2rem;

  .effect-selector {
    min-width: 300px;
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .effect-groups {
    display: flex;
    gap: 1rem;
    max-width: 100%;
    height: 100px;
    overflow-y: auto;

    &-item {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      width: auto;
      height: 100px;
      padding: 1rem 2rem;
      border-radius: 10px;
      background-color: var(--color-border);
      line-height: 1;
      text-wrap: nowrap;
      border: 2px solid transparent;

      &-active {
        border-color: var(--primary-color);
        color: var(--vt-c-white);
        font-weight: 500;
      }
    }
  }

  .effect-group-container {
    margin-top: 2rem;
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    flex: 1;
    min-height: 100px;
    overflow-y: auto;

    .effect-item {
      width: 100%;

      &--img {
        width: 100%;
        height: auto;
        object-fit: cover;
        border-radius: 10px;
        cursor: pointer;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
}
</style>
