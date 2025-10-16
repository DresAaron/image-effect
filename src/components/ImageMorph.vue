<template>
  <div class="image-morph" ref="root">
    <!-- base (before) image -->
    <img :src="before" alt="before" class="base-image" ref="baseImg" />

    <!-- overlay tiles (after image split into tiles) -->
    <div class="tiles" aria-hidden="true">
      <div v-for="tile in tiles" :key="tile.key" class="tile" :style="tile.style"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps<{
  beforeImage: string
  afterImage: string
  pieces?: number
  duration?: number
}>()

const before = props.beforeImage
const after = props.afterImage
const pieces = props.pieces ?? 50
const duration = props.duration ?? 900 // ms

const root = ref<HTMLElement | null>(null)
const baseImg = ref<HTMLImageElement | null>(null)
// tile elements are selected directly via DOM when animating

type Tile = {
  key: string
  style: Record<string, string>
}

const tiles = ref<Tile[]>([])

function makeTiles(imgWidth: number, imgHeight: number) {
  tiles.value = []
  const cols = Math.ceil(Math.sqrt(pieces))
  const rows = Math.ceil(pieces / cols)

  // compute integer widths/heights per column/row so tiles exactly cover the image
  const baseColW = Math.floor(imgWidth / cols)
  const extraCols = imgWidth - baseColW * cols // remainder pixels to distribute
  const colWidths: number[] = []
  for (let c = 0; c < cols; c++) {
    colWidths.push(baseColW + (c < extraCols ? 1 : 0))
  }

  const baseRowH = Math.floor(imgHeight / rows)
  const extraRows = imgHeight - baseRowH * rows
  const rowHeights: number[] = []
  for (let r = 0; r < rows; r++) {
    rowHeights.push(baseRowH + (r < extraRows ? 1 : 0))
  }

  const totalTiles = rows * cols
  let idx = 0
  let topAcc = 0
  for (let r = 0; r < rows; r++) {
    const rowH = rowHeights[r] ?? baseRowH
    let leftAcc = 0
    for (let c = 0; c < cols; c++) {
      const colW = colWidths[c] ?? baseColW
      const left = leftAcc
      const top = topAcc

      const bgPosX = `${-left}px`
      const bgPosY = `${-top}px`

      const style: Record<string, string> = {
        width: `${colW}px`,
        height: `${rowH}px`,
        left: `${left}px`,
        top: `${top}px`,
        backgroundImage: `url(${after})`,
        backgroundPosition: `${bgPosX} ${bgPosY}`,
        backgroundSize: `${imgWidth}px ${imgHeight}px`,
        transition: `transform ${duration}ms cubic-bezier(0.2,0.8,0.2,1), opacity ${Math.round(
          duration / 1.2,
        )}ms ease`,
        transform: `translate3d(0,0,0) scale(1) rotate(0deg)`,
        opacity: '0',
      }

      tiles.value.push({ key: `tile-${idx}`, style })
      idx++
      leftAcc += colW
      if (idx >= totalTiles) break
    }
    topAcc += rowH
  }
}

async function setupTiles() {
  if (!baseImg.value) return
  if (!baseImg.value.complete) {
    await new Promise((res) => (baseImg.value!.onload = res))
  }

  // preload after image so tiles are not blank when animating
  if (after) {
    await new Promise<void>((resolve) => {
      const img = new Image()
      img.src = after
      if (img.complete) return resolve()
      img.onload = () => resolve()
      img.onerror = () => resolve()
    })
  }

  const rect = baseImg.value.getBoundingClientRect()
  const w = Math.round(rect.width)
  const h = Math.round(rect.height)
  makeTiles(w, h)

  await nextTick()
}

onMounted(async () => {
  await setupTiles()
  // re-setup on window resize
  window.addEventListener('resize', setupTiles)
})

onUnmounted(() => {
  window.removeEventListener('resize', setupTiles)
})

watch(
  () => props.afterImage,
  async () => {
    await setupTiles()
  },
)

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function start() {
  // animate tiles flying in to form the after image
  const els = root.value!.querySelectorAll('.tile') as NodeListOf<HTMLElement>
  const rect = root.value!.getBoundingClientRect()

  els.forEach((el, i) => {
    const delay = (i / els.length) * (duration * 0.7) + rand(-100, 100)

    // initial random position far away
    const fromX = rand(-rect.width * 1.2, rect.width * 1.2)
    const fromY = rand(-rect.height * 1.2, rect.height * 1.2)
    const fromZ = rand(-600, -80)
    const rotate = rand(-720, 720)

    // temporarily disable transition so we can jump tiles to the start position
    const prevTransition = el.style.transition
    el.style.transition = 'none'
    el.style.transform = `translate3d(${fromX}px, ${fromY}px, ${fromZ}px) rotate(${rotate}deg) scale(0.8)`
    el.style.opacity = '0'

    // force layout so the jump state is applied
    void el.offsetHeight

    // restore transition and set per-tile delay, then animate to final
    el.style.transition = prevTransition
    el.style.transitionDelay = `${Math.max(0, Math.round(delay))}ms`

    requestAnimationFrame(() => {
      el.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)'
      el.style.opacity = '1'
    })
  })
}

function reset() {
  const els = root.value!.querySelectorAll('.tile') as NodeListOf<HTMLElement>
  els.forEach((el) => {
    // clear any delay so reset happens immediately
    el.style.transitionDelay = '0ms'
    el.style.transform = `translate3d(0,0,0) rotate(0deg) scale(0.98)`
    el.style.opacity = '0'
  })
}

defineExpose({
  start,
  reset,
})
</script>

<style scoped>
.image-morph {
  position: relative;
  display: inline-block;
  overflow: hidden;
  cursor: pointer;
}

.image-morph .base-image {
  display: block;
  max-width: 100%;
  height: auto;
}

.image-morph .tiles {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.image-morph .tile {
  position: absolute;
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: contain;
  will-change: transform, opacity;
  backface-visibility: hidden;
}

/* ensure tiles are visible when animation plays */
/* tiles animate individually via inline styles when hover triggers JS */
</style>
