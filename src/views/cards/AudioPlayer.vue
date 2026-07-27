<template>
  <div class="audio-player" :class="{ playing: isPlaying }">
    <!-- 主控制区 -->
    <div class="player-main">
      <button class="play-btn" @click="togglePlay">
        <svg v-if="!isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="6 3 20 12 6 21 6 3" />
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      </button>

      <div class="info">
        <div class="title">{{ title }}</div>
        <div class="duration">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</div>
      </div>

      <button class="close-btn" @click="$emit('close')">
        <el-icon :size="16"><Close /></el-icon>
      </button>
    </div>

    <!-- 进度条 -->
    <div class="progress-bar" ref="progressRef" @click="seek">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progressPct + '%' }" />
        <div class="progress-thumb" :style="{ left: progressPct + '%' }" />
      </div>
    </div>

    <!-- 实时波形可视化 -->
    <div class="visualizer" ref="visualizerRef">
      <span
        v-for="(h, i) in bars"
        :key="i"
        class="bar"
        :style="{ height: h + 'px', animationPlayState: isPlaying ? 'running' : 'paused' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElIcon } from 'element-plus'
import { Close } from '@element-plus/icons-vue'

const props = withDefaults(defineProps<{
  title?: string
  src?: string
  autoPlay?: boolean
}>(), {
  title: '窗外的雨',
  src: '',
  autoPlay: false,
})

defineEmits<{
  close: []
}>()

// ====== Web Audio API 上下文 ======
let audioCtx: AudioContext | null = null
let oscillator: OscillatorNode | null = null
let gainNode: GainNode | null = null
let analyser: AnalyserNode | null = null
let audioElement: HTMLAudioElement | null = null
let sourceNode: MediaElementAudioSourceNode | null = null

// ====== 状态 ======
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(180)
const bars = ref<number[]>(new Array(32).fill(4))
const progressRef = ref<HTMLElement | null>(null)
const visualizerRef = ref<HTMLElement | null>(null)

let animFrameId = 0
let timerInterval: ReturnType<typeof setInterval> | null = null

const progressPct = computed(() => {
  if (duration.value <= 0) return 0
  return (currentTime.value / duration.value) * 100
})

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ====== 初始化音频 ======
function initAudio() {
  if (audioCtx) return
  audioCtx = new AudioContext()

  analyser = audioCtx.createAnalyser()
  analyser.fftSize = 64

  if (props.src) {
    audioElement = new Audio(props.src)
    audioElement.loop = true
    sourceNode = audioCtx.createMediaElementSource(audioElement)
    sourceNode.connect(analyser)
    analyser.connect(audioCtx.destination)

    audioElement.addEventListener('loadedmetadata', () => {
      duration.value = audioElement!.duration || 180
    })
    audioElement.addEventListener('timeupdate', () => {
      currentTime.value = audioElement!.currentTime
    })
    audioElement.addEventListener('ended', () => {
      isPlaying.value = false
      currentTime.value = 0
    })
  } else {
    oscillator = audioCtx.createOscillator()
    gainNode = audioCtx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = 200 + Math.random() * 100

    gainNode.gain.value = 0.08

    oscillator.connect(gainNode)
    gainNode.connect(analyser)
    analyser.connect(audioCtx.destination)

    const lfo = audioCtx.createOscillator()
    const lfoGain = audioCtx.createGain()
    lfo.frequency.value = 0.5
    lfoGain.gain.value = 80
    lfo.connect(lfoGain)
    lfoGain.connect(oscillator.frequency)
    lfo.start()
  }
}

// ====== 播放/暂停 ======
async function togglePlay() {
  if (!audioCtx) initAudio()

  if (audioCtx?.state === 'suspended') {
    await audioCtx.resume()
  }

  if (props.src && audioElement) {
    if (isPlaying.value) {
      audioElement.pause()
    } else {
      audioElement.play()
    }
    isPlaying.value = !isPlaying.value
  } else if (oscillator) {
    if (isPlaying.value) {
      try { oscillator?.stop() } catch {}
      isPlaying.value = false
      stopVisualizer()
    } else {
      oscillator = audioCtx!.createOscillator()
      gainNode = audioCtx!.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = 200 + Math.random() * 100
      gainNode.gain.value = 0.08

      oscillator.connect(gainNode)
      gainNode.connect(analyser!)
      analyser!.connect(audioCtx!.destination)

      const lfo = audioCtx!.createOscillator()
      const lfoGain = audioCtx!.createGain()
      lfo.frequency.value = 0.5
      lfoGain.gain.value = 80
      lfo.connect(lfoGain)
      lfoGain.connect(oscillator.frequency)
      lfo.start()

      oscillator.start()
      isPlaying.value = true
      startVisualizer()
    }
  }

  if (isPlaying.value) {
    startVisualizer()
    startTimer()
  } else {
    stopVisualizer()
    stopTimer()
  }
}

// ====== 进度跳转 ======
function seek(e: MouseEvent) {
  if (!progressRef.value || !audioElement || !props.src) return
  const rect = progressRef.value.getBoundingClientRect()
  const pct = (e.clientX - rect.left) / rect.width
  audioElement.currentTime = pct * duration.value
}

// ====== 波形可视化 ======
function startVisualizer() {
  const draw = () => {
    if (!analyser) return
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(dataArray)

    bars.value = Array.from(dataArray.slice(0, 32)).map((v) =>
      Math.max(2, (v / 255) * 20)
    )

    animFrameId = requestAnimationFrame(draw)
  }
  draw()
}

function stopVisualizer() {
  cancelAnimationFrame(animFrameId)
  bars.value = new Array(32).fill(4)
}

// ====== 计时器 ======
function startTimer() {
  timerInterval = setInterval(() => {
    if (!props.src) {
      currentTime.value += 1
      if (currentTime.value >= duration.value) {
        currentTime.value = 0
        isPlaying.value = false
        stopVisualizer()
        stopTimer()
      }
    }
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

onMounted(async () => {
  nextTick(() => {
    if (props.autoPlay) {
      togglePlay()
    }
  })
})

onUnmounted(() => {
  stopVisualizer()
  stopTimer()
  try { oscillator?.stop() } catch {}
  audioElement?.pause()
  audioCtx?.close()
})
</script>

<style scoped>
.audio-player {
  background: linear-gradient(135deg, #4A3A2E 0%, #2B1F18 100%);
  border-radius: 20px;
  padding: 20px;
  color: #FFE9D6;
  transition: all 0.3s;
}
.audio-player.playing {
  box-shadow: 0 0 30px rgba(244, 169, 136, 0.15);
}

.player-main {
  display: flex;
  align-items: center;
  gap: 14px;
}

.play-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 233, 214, 0.15);
  border: none;
  color: #FFE9D6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}
.play-btn:active {
  background: rgba(255, 233, 214, 0.25);
}

.info {
  flex: 1;
  min-width: 0;
}
.info .title {
  font-size: 15px;
  font-weight: 600;
}
.info .duration {
  font-size: 11px;
  color: #C4B5A6;
  margin-top: 2px;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #C4B5A6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

/* ====== 进度条 ====== */
.progress-bar {
  margin-top: 14px;
  padding: 4px 0;
  cursor: pointer;
}
.progress-track {
  position: relative;
  height: 4px;
  background: rgba(255, 233, 214, 0.15);
  border-radius: 2px;
  overflow: visible;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #F4A988, #E88A6B);
  border-radius: 2px;
  transition: width 0.3s linear;
}
.progress-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #F4A988;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s;
}
.progress-bar:hover .progress-thumb {
  opacity: 1;
}

/* ====== 波形 ====== */
.visualizer {
  display: flex;
  gap: 3px;
  align-items: flex-end;
  height: 24px;
  margin-top: 14px;
  justify-content: center;
}
.bar {
  width: 3px;
  background: #F4A988;
  border-radius: 2px;
  transition: height 0.08s ease;
  animation: bar-pulse 1.5s ease-in-out infinite;
}
@keyframes bar-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
</style>
