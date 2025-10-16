<template>
  <div class="effect-preview">
    <div v-if="!beforeImage" class="effect-preview-placeholder">
      Click to upload or drop an image
    </div>
    <div v-else class="effect-preview-img">
      <ImageMorph
        v-if="!loading && animating"
        :beforeImage="beforeImage"
        :afterImage="afterImage"
        :pieces="50"
        :duration="900"
        ref="imageMorphRef"
      />
      <ImageCompare
        v-else-if="sliderMode"
        :beforeImage="beforeImage"
        :afterImage="afterImage"
        :duration="900"
        ref="imageMorphRef"
      />
      <img
        v-else
        class="effect-preview-img--simple"
        :src="previewImage"
        alt="Processed Image"
        @mousedown="simplaCompare"
        @mouseup="previewImage = afterImage"
      />
      <div class="loading-overlay" v-if="loading">loading...</div>
    </div>
    <div class="effect-preview-actions">
      <div class="effect-preview-actions--left">
        <span class="effect-label">Effect: </span>{{ effect || 'Please select an effect...' }}
      </div>
      <div class="effect-preview-actions--right">
        <font-awesome-icon
          class="icon-btn"
          :class="{
            active: simpleCompareMode && previewImage === afterImage,
          }"
          icon="fa-solid fa-wand-magic-sparkles"
          @mousedown="simplaCompare"
          @mouseup="previewImage = afterImage"
        />

        <font-awesome-icon
          class="icon-btn"
          :class="{
            active: sliderMode,
          }"
          icon="fa-solid fa-panorama"
          @click="
            () => {
              sliderMode = !sliderMode
              simpleCompareMode = false
            }
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ImageMorph from './ImageMorph.vue'
import ImageCompare from './ImageCompare.vue'

const props = withDefaults(
  defineProps<{
    beforeImage?: string
    afterImage?: string
    effect?: string
  }>(),
  {
    beforeImage: '',
    afterImage: '',
    effect: '',
  },
)

const imageMorphRef = ref<InstanceType<typeof ImageMorph | typeof ImageCompare> | null>(null)

const loading = ref(false)
const animating = ref(false)
const previewImage = ref(props.beforeImage)

const sliderMode = ref(false)
const simpleCompareMode = ref(true)

const simplaCompare = () => {
  previewImage.value = props.beforeImage
  simpleCompareMode.value = true
  sliderMode.value = false
}

const tick = async (time: number = 1000) => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}

watch(
  () => props.effect,
  async () => {
    previewImage.value = props.beforeImage
    simpleCompareMode.value = true
    sliderMode.value = false
    loading.value = true
    await tick(1000)
    loading.value = false
    animating.value = true
    await tick(100)
    imageMorphRef.value?.reset()
    imageMorphRef.value?.start()
    await tick(1500)
    previewImage.value = props.afterImage
    animating.value = false
  },
)
</script>

<style lang="scss">
.effect-preview {
  width: 500px;
  height: auto;
  min-height: 100px;
  padding: 3rem;

  display: flex;
  flex-direction: column;

  border-radius: 10px;
  background-color: var(--color-border);
  align-self: flex-start;

  &-placeholder {
    height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 1.25rem;
    font-weight: 400;

    border: 1px dashed var(--color-text);
    border-radius: 10px;
  }

  &-img {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    position: relative;
    min-height: 600px;

    .image-morph {
      border-radius: 10px;
      overflow: hidden;
    }

    img {
      width: 100%;
      height: auto;
      border-radius: 10px;
      object-fit: cover;
    }

    &--simple {
      cursor: pointer;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      backdrop-filter: blur(4px);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      border-radius: 10px;
      transition: all 0.3s ease;
    }
  }

  &-actions {
    padding: 1rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .icon-btn {
      cursor: pointer;

      &.active {
        color: var(--primary-color);
      }
    }

    &--left {
      font-size: 0.75rem;
      .effect-label {
        font-weight: 600;
        margin-right: 0.125rem;
      }
    }
    &--right {
      display: flex;
      gap: 1rem;
    }
  }
}
</style>
