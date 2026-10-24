<script setup lang="ts">
import { Volume2, VolumeX, Keyboard, Mouse, DoorOpen, Menu as MenuIcon, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Joystick as JoystickIcon } from '@lucide/vue'
import { setMuted } from '~/game/audio'
import MenuModal from './MenuModal.vue'

const props = defineProps<{
  tooltip: { title: string, subtitle?: string } | null
  toast: string
  debug: boolean
}>()

const store = useOsceStore()
const emit = defineEmits<{
  teleport: [t: 'lobby' | 'door' | 'room']
  move: [dir: 'up' | 'down' | 'left' | 'right', on: boolean]
  debugdoc: []
  'menu-change': [open: boolean]
}>()

const soundOn = ref(true)
const menuOpen = ref(false)

watch(menuOpen, (open) => {
  emit('menu-change', open)
})

// D-pad: pointerdown = jalan, pointerup/leave/cancel = berhenti
function press(dir: 'up' | 'down' | 'left' | 'right') {
  return {
    onPointerdown: () => emit('move', dir, true),
    onPointerup: () => emit('move', dir, false),
    onPointerleave: () => emit('move', dir, false),
    onPointercancel: () => emit('move', dir, false),
  }
}

// Joystick analog: dipetakan ke 4 arah boolean yang sama (tanpa ubah engine).
const { scheme } = useControls()
const joy = ref({ dx: 0, dy: 0 })
const joyDirs = { up: false, down: false, left: false, right: false }

function updateJoy(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  let dx = e.clientX - (r.left + r.width / 2)
  let dy = e.clientY - (r.top + r.height / 2)
  const max = r.width / 2
  const len = Math.hypot(dx, dy) || 1
  if (len > max) {
    dx = (dx / len) * max
    dy = (dy / len) * max
  }
  joy.value.dx = dx
  joy.value.dy = dy
  const thr = max * 0.25
  const want = { up: dy < -thr, down: dy > thr, left: dx < -thr, right: dx > thr }
  for (const dir of ['up', 'down', 'left', 'right'] as const) {
    if (joyDirs[dir] !== want[dir]) {
      joyDirs[dir] = want[dir]
      emit('move', dir, want[dir])
    }
  }
}

function joyStart(e: PointerEvent) {
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  updateJoy(e)
}

function joyEnd() {
  joy.value.dx = 0
  joy.value.dy = 0
  for (const dir of ['up', 'down', 'left', 'right'] as const) {
    if (joyDirs[dir]) {
      joyDirs[dir] = false
      emit('move', dir, false)
    }
  }
}

function toggleSound() {
  soundOn.value = !soundOn.value
  setMuted(!soundOn.value)
}

const timeLabel = computed(() => {
  const t = Math.max(0, store.timeLeft)
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
})

const timeCritical = computed(() =>
  (store.phase === 'exam' || store.phase === 'reading') && store.timeLeft <= 60)

const phaseLabel = computed(() => ({
  lobby: 'Masuk ke pintu stasiun untuk mulai',
  reading: 'Waktu baca — pintu terkunci',
  exam: 'Sesi konseling berjalan',
  rekap: 'Rangkaian selesai',
} as Record<string, string>)[store.phase] ?? '')

const stationLabel = computed(() => store.activeStation?.title ?? 'Lorong tengah')
</script>

<template>
  <div class="pointer-events-none fixed inset-0 select-none text-white">
    <!-- atas: strip kaca melayang -->
    <header class="glass-soft absolute inset-x-3 top-3 flex items-center justify-between rounded-2xl px-4 py-2">
      <div class="flex items-center gap-3">
        <span class="rounded-lg bg-violet-500 px-2.5 py-1 text-xs font-bold tracking-wide">UKAI LABS</span>
        <span class="font-display text-sm font-semibold text-white/85">OSCE Center</span>
        <button
          class="pointer-events-auto ml-1 rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
          :title="soundOn ? 'Mute' : 'Unmute'"
          @click="toggleSound"
        >
          <Volume2 v-if="soundOn" class="h-4 w-4" />
          <VolumeX v-else class="h-4 w-4" />
        </button>
      </div>
      <div class="flex items-center gap-3 text-xs text-white/75">
        <span class="rounded-full bg-white/8 px-2.5 py-1">Rangkaian 10 station</span>
        <span class="font-mono text-white/85">Peserta 001</span>
        <button
          class="pointer-events-auto flex items-center gap-1.5 rounded-lg bg-white/8 px-2.5 py-1.5 font-semibold text-white transition hover:bg-white/15"
          @click="menuOpen = true"
        >
          <MenuIcon class="h-3.5 w-3.5" /> Menu
        </button>
      </div>
    </header>

    <MenuModal v-if="menuOpen" @close="menuOpen = false" @goto-lobby="emit('teleport', 'lobby')" />

    <!-- kartu giliran kiri -->
    <section class="glass animate-fade-up absolute left-3 top-20 w-[19rem] rounded-2xl p-4">
      <div class="flex items-start gap-3">
        <span class="font-mono grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-500/20 text-sm font-bold text-violet-300">
          {{ store.activeStation?.id ?? '—' }}
        </span>
        <div class="min-w-0">
          <div class="font-display text-[13px] font-bold leading-snug text-white">{{ stationLabel }}</div>
          <div class="mt-1 text-[11px] text-slate-300/85">{{ phaseLabel }}</div>
        </div>
      </div>

      <div v-if="store.phase === 'reading' || store.phase === 'exam'" class="mt-3 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/8">
        <span class="text-[11px] font-medium text-slate-400">Waktu tersisa</span>
        <span
          class="font-mono text-lg font-bold tabular-nums transition-colors"
          :class="timeCritical ? 'animate-pulse-soft text-rose-400' : 'text-white'"
        >{{ timeLabel }}</span>
      </div>
      <div class="mt-2 flex items-center gap-2 text-[11px]">
        <span class="rounded-md bg-violet-500/15 px-2 py-0.5 font-semibold text-violet-300">Mode {{ store.mode }}</span>
        <span v-if="store.phase === 'exam'" class="text-amber-300/90">Bel berbunyi — kerjakan tugas di dalam ruangan</span>
      </div>

      <button
        v-if="store.phase === 'reading' && store.mode === 'LATIHAN'"
        class="pointer-events-auto mt-3 w-full rounded-xl bg-violet-500 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-violet-400"
        @click="store.skipReadingTime()"
      >
        Lewati sisa waktu →
      </button>

      <div v-if="debug" class="mt-3 space-y-1 border-t border-white/10 pt-2 font-mono text-[10px] text-slate-400">
        <div>debug: fase {{ store.phase }} · skor S01 {{ store.scoreOf('01') }}</div>
        <div class="flex gap-1.5">
          <button class="pointer-events-auto rounded-md bg-white/8 px-2 py-0.5 transition hover:bg-white/15" @click="emit('debugdoc')">openDoc()</button>
          <button class="pointer-events-auto rounded-md bg-white/8 px-2 py-0.5 transition hover:bg-white/15" @click="store.completeStation()">completeStation()</button>
          <button class="pointer-events-auto rounded-md bg-white/8 px-2 py-0.5 transition hover:bg-white/15" @click="store.reset()">reset()</button>
        </div>
      </div>
    </section>

    <!-- tracker rotasi kanan -->
    <section class="glass animate-fade-up absolute right-3 top-20 rounded-2xl p-4 [animation-delay:80ms]">
      <div class="flex items-baseline justify-end gap-1.5">
        <span class="font-display text-2xl font-bold text-white">{{ store.completedCount }}</span>
        <span class="font-mono text-xs text-slate-400">/ 10 stasiun</span>
      </div>
      <div class="mt-3 grid grid-cols-5 gap-1.5">
        <button
          v-for="i in 10" :key="i"
          class="pointer-events-auto grid h-8 w-8 place-items-center rounded-lg font-mono text-[11px] font-bold transition duration-150 hover:-translate-y-0.5"
          :class="[
            store.completed[String(i).padStart(2, '0')]
              ? (store.completed[String(i).padStart(2, '0')].passed ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white')
              : store.activeStationId === String(i).padStart(2, '0')
                ? 'bg-violet-500 text-white ring-2 ring-violet-300/70'
                : 'bg-white/8 text-slate-300 hover:bg-white/15',
          ]"
          :title="store.completed[String(i).padStart(2, '0')] ? `Selesai — skor ${store.completed[String(i).padStart(2, '0')].score}` : `Station ${i}`"
          @click="store.phase === 'lobby' && store.mode === 'LATIHAN' && store.startReadingPhase(String(i).padStart(2, '0'))"
        >
          {{ String(i).padStart(2, '0') }}
        </button>
      </div>
      <div class="mt-3 text-right text-[10px] text-slate-400">60 dtk baca · 9 mnt sesi per stasiun</div>
    </section>

    <!-- crosshair + tooltip -->
    <div v-if="!props.tooltip" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div class="h-2.5 w-2.5 rounded-full border-2 border-white/80 shadow-[0_0_0_2px_rgb(2_6_16/0.35)]" />
    </div>
    <div
      v-if="props.tooltip"
      class="glass-soft animate-pop absolute left-1/2 top-1/2 ml-5 mt-5 max-w-xs rounded-xl px-3.5 py-2.5"
    >
      <div class="text-sm font-bold text-white">{{ props.tooltip.title }}</div>
      <div v-if="props.tooltip.subtitle" class="mt-0.5 text-[11px] text-slate-300/85">{{ props.tooltip.subtitle }}</div>
    </div>

    <!-- legenda kontrol -->
    <div class="glass-soft absolute bottom-3 right-1/2 translate-x-1/2 hidden items-center gap-3 rounded-full px-4 py-1.5 text-[11px] text-slate-200/85 md:flex">
      <span class="flex items-center gap-1.5"><Keyboard class="h-3.5 w-3.5 text-white/60" /> WASD / panah — jalan</span>
      <span class="text-white/20">·</span>
      <span class="flex items-center gap-1.5"><Mouse class="h-3.5 w-3.5 text-white/60" /> klik — kunci kamera & buka target</span>
      <span class="text-white/20">·</span>
      <span class="flex items-center gap-1.5"><DoorOpen class="h-3.5 w-3.5 text-white/60" /> E — baca / interaksi</span>
      <span class="text-white/20">·</span>
      <kbd class="rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono">Esc</kbd>
    </div>

    <!-- teleport cepat (hanya latihan) -->
    <div v-if="store.mode === 'LATIHAN'" class="glass-soft animate-fade-up absolute bottom-3 right-3 rounded-xl p-1.5 [animation-delay:120ms]">
      <div class="px-1.5 pb-1 text-[10px] font-bold tracking-wide text-slate-400">Teleport</div>
      <div class="flex gap-1">
        <button class="pointer-events-auto rounded-lg bg-white/8 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-violet-500/40" @click="emit('teleport', 'lobby')">Lorong</button>
        <button class="pointer-events-auto rounded-lg bg-white/8 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-violet-500/40" @click="emit('teleport', 'door')">Dep. pintu</button>
        <button class="pointer-events-auto rounded-lg bg-white/8 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-violet-500/40" @click="emit('teleport', 'room')">Meja</button>
      </div>
    </div>

    <!-- D-pad tombol gerak (skema: tombol layar) -->
    <div v-if="scheme === 'dpad'" class="absolute bottom-16 left-4 select-none">
      <div class="grid grid-cols-3 gap-1.5">
        <span />
        <button
          class="glass-soft pointer-events-auto grid h-12 w-12 place-items-center rounded-xl text-white transition duration-100 active:scale-90 active:bg-violet-500/50 sm:h-10 sm:w-10"
          v-bind="press('up')"
        >
          <ChevronUp class="h-5 w-5" />
        </button>
        <span />
        <button
          class="glass-soft pointer-events-auto grid h-12 w-12 place-items-center rounded-xl text-white transition duration-100 active:scale-90 active:bg-violet-500/50 sm:h-10 sm:w-10"
          v-bind="press('left')"
        >
          <ChevronLeft class="h-5 w-5" />
        </button>
        <button
          class="glass-soft pointer-events-auto grid h-12 w-12 place-items-center rounded-xl text-white transition duration-100 active:scale-90 active:bg-violet-500/50 sm:h-10 sm:w-10"
          v-bind="press('down')"
        >
          <ChevronDown class="h-5 w-5" />
        </button>
        <button
          class="glass-soft pointer-events-auto grid h-12 w-12 place-items-center rounded-xl text-white transition duration-100 active:scale-90 active:bg-violet-500/50 sm:h-10 sm:w-10"
          v-bind="press('right')"
        >
          <ChevronRight class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Joystick analog (skema: joystick) — geser knob, lepas = berhenti -->
    <div v-else-if="scheme === 'joystick'" class="absolute bottom-16 left-4 select-none">
      <div
        class="glass-soft pointer-events-auto relative h-28 w-28 touch-none rounded-full"
        @pointerdown="joyStart"
        @pointermove="updateJoy"
        @pointerup="joyEnd"
        @pointercancel="joyEnd"
      >
        <span class="absolute left-1/2 top-1/2 h-px w-10 -translate-x-1/2 bg-white/10" />
        <span class="absolute left-1/2 top-1/2 h-10 w-px -translate-y-1/2 bg-white/10" />
        <div
          class="absolute left-1/2 top-1/2 grid h-12 w-12 place-items-center rounded-full bg-white/20 ring-1 ring-white/30"
          :style="{ transform: `translate(calc(-50% + ${joy.dx}px), calc(-50% + ${joy.dy}px))` }"
        >
          <JoystickIcon class="h-5 w-5 text-white/85" />
        </div>
      </div>
    </div>

    <!-- toast bawah -->
    <div
      v-if="toast"
      class="glass animate-pop absolute bottom-24 left-1/2 max-w-md -translate-x-1/2 rounded-xl px-4 py-2.5 text-xs leading-relaxed text-white"
    >
      {{ toast }}
    </div>
  </div>
</template>
