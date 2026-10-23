<script setup lang="ts">
import { Volume2, VolumeX, Keyboard, Mouse, DoorOpen } from '@lucide/vue'

const props = defineProps<{
  tooltip: { title: string, subtitle?: string } | null
  toast: string
  debug: boolean
}>()

const store = useOsceStore()
const emit = defineEmits<{
  next: []
  prev: []
  teleport: [t: 'lobby' | 'door' | 'room']
  togglesound: []
  debugdoc: []
}>()

const soundOn = ref(true)

const timeLabel = computed(() => {
  const t = Math.max(0, store.timeLeft)
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
})

const phaseLabel = computed(() => ({
  lobby: 'Masuk ke pintu stasiun untuk mulai',
  reading: 'Waktu baca — pintu terkunci',
  exam: 'Sesi konseling berjalan',
  rekap: 'Rangkaian selesai',
} as Record<string, string>)[store.phase] ?? '')

const stationLabel = computed(() => store.activeStation?.title ?? 'Lorong tengah')
</script>

<template>
  <div class="pointer-events-none fixed inset-0 select-none text-neutral-900">
    <!-- atas: brand kiri, peserta kanan -->
    <div class="absolute inset-x-0 top-0 flex items-center justify-between bg-violet-950/85 px-4 py-2 text-white">
      <div class="flex items-center gap-3">
        <span class="rounded bg-violet-500 px-2 py-0.5 text-xs font-bold tracking-wider">UKAI LABS</span>
        <span class="text-sm font-semibold">OSCE Center</span>
        <button class="pointer-events-auto ml-2 rounded p-1 hover:bg-white/10" :title="soundOn ? 'Mute' : 'Unmute'" @click="() => { soundOn = !soundOn; emit('togglesound') }">
          <Volume2 v-if="soundOn" class="h-4 w-4" />
          <VolumeX v-else class="h-4 w-4" />
        </button>
      </div>
      <div class="flex items-center gap-3 text-xs">
        <span class="rounded-full bg-white/10 px-2 py-0.5">RANGKAIAN 10 STATION</span>
        <span class="font-mono">Peserta 001</span>
      </div>
    </div>

    <!-- kartu kiri: giliran -->
    <div class="absolute left-3 top-14 w-72 rounded-xl bg-white/95 p-3 shadow-lg">
      <div class="text-[10px] font-bold tracking-widest text-violet-600">GILIRAN ANDA</div>
      <div class="mt-1 text-sm font-bold leading-tight">{{ stationLabel }}</div>
      <div class="mt-2 flex items-center gap-2 text-xs">
        <span class="rounded bg-violet-100 px-2 py-0.5 font-semibold text-violet-700">Mode {{ store.mode }}</span>
        <span class="rounded bg-neutral-100 px-2 py-0.5 font-mono">{{ timeLabel }}</span>
      </div>
      <div class="mt-1 text-[11px] text-neutral-600">{{ phaseLabel }}</div>
      <div v-if="store.phase === 'exam'" class="mt-2 rounded bg-amber-50 p-2 text-[11px] text-amber-800">
        Bel berbunyi — lakukan konseling, buka dokumen & isi rubrik di dalam ruangan.
      </div>
      <button
        v-if="store.phase === 'reading' && store.mode === 'LATIHAN'"
        class="pointer-events-auto mt-2 w-full rounded bg-violet-600 py-1.5 text-xs font-semibold text-white hover:bg-violet-500"
        @click="store.skipReadingTime()"
      >
        Lewati sisa waktu →
      </button>
      <div v-if="debug" class="mt-2 space-y-1 text-[10px] text-neutral-500">
        <div><span class="font-mono">debug:</span> fase {{ store.phase }} · skor S01 `{{ store.scoreOf('01') }}`</div>
        <button class="pointer-events-auto rounded bg-neutral-200 px-2 py-0.5" @click="emit('debugdoc')">openDoc()</button>
        <button class="pointer-events-auto rounded bg-neutral-200 px-2 py-0.5" @click="store.completeStation()">completeStation()</button>
        <button class="pointer-events-auto rounded bg-neutral-200 px-2 py-0.5" @click="store.reset()">reset()</button>
      </div>
    </div>

    <!-- tracker kanan -->
    <div class="absolute right-3 top-14 rounded-xl bg-white/95 p-3 shadow-lg">
      <div class="text-right text-[10px] font-bold tracking-widest text-slate-500">ROTASI</div>
      <div class="mt-0.5 text-right text-xl font-bold">{{ store.completedCount }}<span class="text-sm font-normal text-neutral-500">/10 selesai</span></div>
      <div class="mt-2 grid grid-cols-5 gap-1">
        <button
          v-for="i in 10" :key="i"
          class="pointer-events-auto h-7 w-7 rounded text-xs font-bold transition"
          :class="[
            store.completed[String(i).padStart(2, '0')]
              ? (store.completed[String(i).padStart(2, '0')].passed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white')
              : store.activeStationId === String(i).padStart(2, '0') ? 'bg-violet-600 text-white ring-2 ring-violet-300' : 'bg-neutral-200 text-neutral-700',
          ]"
          :title="store.completed[String(i).padStart(2, '0')] ? `Selesai — skor ${store.completed[String(i).padStart(2, '0')].score}` : `Station ${i}`"
          @click="store.phase === 'lobby' && store.startReadingPhase(String(i).padStart(2, '0'))"
        >
          {{ String(i).padStart(2, '0') }}
        </button>
      </div>
      <div class="mt-2 text-right text-[10px] text-neutral-500">60 dtk waktu baca · 9 mnt sesi per stasiun</div>
    </div>

    <!-- crosshair + tooltip -->
    <div v-if="!props.tooltip" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div class="h-2.5 w-2.5 rounded-full border-2 border-white/90 shadow" />
    </div>
    <div v-if="props.tooltip" class="absolute left-1/2 top-1/2 ml-4 mt-4 max-w-xs rounded-lg bg-white/95 px-3 py-2 shadow-lg">
      <div class="text-xs font-bold">{{ props.tooltip.title }}</div>
      <div v-if="props.tooltip.subtitle" class="text-[11px] text-neutral-600">{{ props.tooltip.subtitle }}</div>
    </div>

    <!-- legenda kontrol + telepton -->
    <div class="absolute bottom-3 left-3 space-y-1 font-mono text-[11px] text-neutral-800">
      <div><Keyboard class="mr-1 inline h-3 w-3" /> WASD / panah — jalan</div>
      <div><Mouse class="mr-1 inline h-3 w-3" /> klik — kunci / buka target</div>
      <div><DoorOpen class="mr-1 inline h-3 w-3" /> E — baca / interaksi</div>
      <div>Esc — lepas kursor / tutup modal</div>
    </div>
    <div class="absolute bottom-3 right-3 flex gap-1">
      <div class="pointer-events-auto rounded-lg bg-white/90 p-1 text-[10px] shadow">
        <div class="px-1 pb-1 font-bold text-neutral-600">Quick teleport</div>
        <div class="flex gap-1">
          <button class="rounded bg-violet-100 px-2 py-1 hover:bg-violet-200" @click="emit('teleport', 'lobby')">Lorong</button>
          <button class="pointer-events-auto rounded bg-violet-100 px-2 py-1 hover:bg-violet-200" @click="emit('teleport', 'door')">Dep. pintu</button>
          <button class="pointer-events-auto rounded bg-violet-100 px-2 py-1 hover:bg-violet-200" @click="emit('teleport', 'room')">Meja</button>
        </div>
      </div>
    </div>

    <!-- toast bawah -->
    <div v-if="toast" class="absolute bottom-16 left-1/2 -translate-x-1/2 rounded-lg bg-neutral-900/90 px-4 py-2 text-xs text-white shadow">
      {{ toast }}
    </div>
  </div>
</template>
