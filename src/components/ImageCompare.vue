<template>
  <div class="comparison-container" ref="comparisonRef">
    <div class="comparison-image-container">
      <img class="comparison-image-before" :src="beforeImage" alt="Before" ref="imageBeforeRef" />
      <div class="comparison-image-after-container">
        <img class="comparison-image-after" :src="afterImage" alt="After" ref="imageAfterRef" />
      </div>
    </div>
    <div class="slider" ref="sliderRef" @pointerdown="onPointerDown"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'

withDefaults(
  defineProps<{
    beforeImage: string
    afterImage: string
  }>(),
  {
    beforeImage: '',
    afterImage: '',
  },
)

const comparisonRef = ref<HTMLElement | null>(null)
const sliderRef = ref<HTMLElement | null>(null)
const imageBeforeRef = ref<HTMLElement | null>(null)
// imageAfterRef now refers to the actual after <img> element; we'll use clip-path
const imageAfterRef = ref<HTMLImageElement | null>(null)

let isDragging = false
const pxMargin = 10
const direction = 1 // 1 for right, -1 for left
let currentPercentage = 50
// Performance helpers
let rafId: number | null = null
let scheduled = false
let pendingPercentage = 50
let containerRectCache: DOMRect | null = null
let autoplayRaf: number | null = null
let autoplayLastTs = 0

// Handlers declared in module scope so onUnmounted can reference them
function scheduleUpdateFromClientX(clientX: number) {
  if (!containerRectCache) return
  let x = clientX - containerRectCache.left
  const minX = pxMargin
  const maxX = containerRectCache.width - pxMargin
  x = Math.max(minX, Math.min(maxX, x))
  const percentage = (x / containerRectCache.width) * 100
  const clamped = Math.max(0, Math.min(100, percentage))
  pendingPercentage = clamped
  if (!scheduled) {
    scheduled = true
    rafId = requestAnimationFrame(() => {
      updateSliderPosition(pendingPercentage)
      scheduled = false
    })
  }
}

function onPointerDown(e: PointerEvent) {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  isDragging = true
  document.body.style.cursor = 'ew-resize'
  containerRectCache = comparisonRef.value!.getBoundingClientRect()
  sliderRef.value?.setPointerCapture?.(e.pointerId)
  scheduleUpdateFromClientX(e.clientX)
  e.preventDefault()
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging) return
  scheduleUpdateFromClientX(e.clientX)
}

function onPointerUp(e: PointerEvent) {
  isDragging = false
  document.body.style.cursor = 'default'
  sliderRef.value?.releasePointerCapture?.(e.pointerId)
  containerRectCache = null
}

const resizeHandler = () => {
  if (comparisonRef.value) containerRectCache = comparisonRef.value.getBoundingClientRect()
}

function updateSliderPosition(percentage: number) {
  const clampedPercentage = Math.max(0, Math.min(100, percentage))
  // use clip-path on the image so the image itself doesn't resize or shift
  // clip-path: inset(top right bottom left)
  const rightInset = 100 - clampedPercentage
  imageAfterRef.value!.style.clipPath = `inset(0 ${rightInset}% 0 0)`
  sliderRef.value!.style.left = `${clampedPercentage}%`
  currentPercentage = clampedPercentage
}

function autoplayStep(ts: number) {
  if (!autoplayLastTs) autoplayLastTs = ts
  const dt = ts - autoplayLastTs
  autoplayLastTs = ts
  // previous speed: 0.5 per 20ms => 25 per second => 0.025 per ms
  const deltaPerMs = 0.1
  const newPos = currentPercentage + direction * dt * deltaPerMs
  updateSliderPosition(newPos)
  if (newPos >= 100) return
  autoplayRaf = requestAnimationFrame(autoplayStep)
}

const start = () => {
  if (autoplayRaf) {
    cancelAnimationFrame(autoplayRaf)
    autoplayRaf = null
    autoplayLastTs = 0
  } else {
    autoplayLastTs = 0
    autoplayRaf = requestAnimationFrame(autoplayStep)
  }
}

const reset = () => {
  updateSliderPosition(0)
  if (autoplayRaf) {
    cancelAnimationFrame(autoplayRaf)
    autoplayRaf = null
  }
}

defineExpose({
  start,
  reset,
})

onMounted(() => {
  // Use Pointer Events to reduce duplicated mouse/touch logic and improve performance
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp)
  window.addEventListener('resize', resizeHandler)

  if (comparisonRef.value) {
    containerRectCache = comparisonRef.value.getBoundingClientRect()
    const minPercent = (pxMargin / containerRectCache.width) * 100
    updateSliderPosition(minPercent)
  } else {
    updateSliderPosition(10)
  }
})

onUnmounted(() => {
  // remove named pointer listeners and window resize listener
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('resize', resizeHandler)
  if (rafId) cancelAnimationFrame(rafId)
  if (autoplayRaf) cancelAnimationFrame(autoplayRaf)
})
</script>
<style>
.comparison-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.comparison-image-container {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
}

.comparison-image-before {
  position: relative;
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
}

.comparison-image-after {
  width: 100%;
  height: 100%;
  object-fit: cover;
  left: 0;
  position: absolute;
  top: 0;
}

.comparison-image-after-container {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  z-index: 5;
}

.slider {
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 100%;
  background: white;
  cursor: ew-resize;
  transform: translateX(-50%);
  z-index: 10;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.7);
}

.slider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
  transition: all 0.3s ease;
}

.slider:hover::before {
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
}

.slider::after {
  content: '⟷';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  color: #333;
  font-weight: bold;
}
</style>
