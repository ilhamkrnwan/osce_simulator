<script setup lang="ts">
// MenuModal — Modal Pengaturan & Jeda OSCE Center 3D
// Mengikuti standar visual 'Klinik Glass Dark' & referensi high-end fintech/healthtech.
import {
  Play,
  Volume2,
  VolumeX,
  RotateCcw,
  DoorOpen,
  X,
  Settings2,
  ShieldAlert,
} from '@lucide/vue'
import { setMuted } from '~/game/audio'

const emit = defineEmits<{ close: [], 'goto-lobby': [] }>()
const store = useOsceStore()
const soundOn = ref(true)
const showResetConfirm = ref(false)

function toggleSound() {
  soundOn.value = !soundOn.value
  setMuted(!soundOn.value)
}

function resetSession() {
  localStorage.removeItem('osce-progress-v1')
  store.reset()
  emit('close')
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.stopPropagation()
    emit('close')
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div
    class="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in select-none"
    @click.self="emit('close')"
  >
    <!-- Background Ambient Glow Behind Modal -->
    <div class="pointer-events-none absolute h-72 w-72 rounded-full bg-violet-600/25 blur-[90px]" />

    <!-- Modal Box Container -->
    <div
      class="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 animate-pop sm:p-7"
    >
      <!-- Subtle top inner reflection border -->
      <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <!-- Header: Title & Close -->
      <div class="flex items-center justify-between pb-4 border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/30">
            <Settings2 class="h-5 w-5" />
          </div>
          <div>
            <h2 class="font-display text-base sm:text-lg font-bold text-white">Menu Pengaturan</h2>
            <p class="text-xs text-slate-400">UKAI Labs · OSCE Center 3D</p>
          </div>
        </div>
        <button
          class="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/15 hover:text-white"
          @click="emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Live Session Context Pill -->
      <div class="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
        <div class="min-w-0 pr-2">
          <div class="flex items-center gap-2">
            <span class="rounded bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300">
              Mode {{ store.mode }}
            </span>
            <span class="truncate text-xs font-semibold text-white">
              {{ store.activeStation ? `Station ${store.activeStation.id}: ${store.activeStation.title}` : 'Lorong Utama Klinik' }}
            </span>
          </div>
          <p class="mt-0.5 text-[11px] text-slate-400">
            Progress: {{ store.completedCount }} / 10 Stasiun Selesai
          </p>
        </div>
        <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse-soft" />
      </div>

      <!-- Action Items List -->
      <div class="mt-4 space-y-2.5 text-sm">
        <!-- Primary Action: Lanjutkan -->
        <button
          class="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-white py-3 font-bold text-slate-950 shadow-[0_8px_25px_rgba(255,255,255,0.2)] transition duration-150 hover:bg-slate-100 hover:scale-[1.01] active:scale-[0.99]"
          @click="emit('close')"
        >
          <Play class="h-4 w-4 fill-current text-slate-950 transition-transform group-hover:scale-110" />
          <span>Lanjutkan Simulasi</span>
        </button>

        <!-- Toggle Sound -->
        <button
          class="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-slate-200 transition duration-150 hover:bg-white/12 hover:border-white/20"
          @click="toggleSound()"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 text-violet-300">
              <Volume2 v-if="soundOn" class="h-4 w-4" />
              <VolumeX v-else class="h-4 w-4 text-slate-400" />
            </div>
            <div class="text-left">
              <span class="block text-xs font-semibold text-white">Efek Suara & Ambience</span>
              <span class="text-[11px] text-slate-400">Suara bel stasiun dan latar klinik</span>
            </div>
          </div>
          <span
            class="rounded-full px-2.5 py-1 text-[10px] font-bold transition"
            :class="soundOn ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/10 text-slate-400 border border-white/10'"
          >
            {{ soundOn ? 'Aktif' : 'Muted' }}
          </span>
        </button>

        <!-- Kembali ke Lobby (Hanya mode latihan) -->
        <button
          v-if="store.mode === 'LATIHAN'"
          class="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-slate-200 transition duration-150 hover:bg-white/12 hover:border-white/20"
          @click="emit('goto-lobby'); emit('close')"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 text-violet-300">
              <DoorOpen class="h-4 w-4" />
            </div>
            <div class="text-left">
              <span class="block text-xs font-semibold text-white">Kembali ke Lobby</span>
              <span class="text-[11px] text-slate-400">Teleport ke tengah lorong klinik</span>
            </div>
          </div>
          <span class="text-xs text-slate-400">Latihan</span>
        </button>

        <!-- Reset Progress Sesi -->
        <div v-if="!showResetConfirm">
          <button
            class="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-slate-300 transition duration-150 hover:bg-rose-500/15 hover:border-rose-400/30 hover:text-rose-200"
            @click="showResetConfirm = true"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 text-slate-300">
                <RotateCcw class="h-4 w-4" />
              </div>
              <div class="text-left">
                <span class="block text-xs font-semibold">Reset Sesi Ujian</span>
                <span class="text-[11px] text-slate-400">Hapus skor lokal & mulai dari awal</span>
              </div>
            </div>
          </button>
        </div>

        <!-- Confirm Reset State -->
        <div
          v-else
          class="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3.5 animate-fade-in"
        >
          <div class="flex items-center gap-2 text-rose-300 text-xs font-bold">
            <ShieldAlert class="h-4 w-4" />
            <span>Yakin ingin mereset seluruh sesi?</span>
          </div>
          <p class="mt-1 text-[11px] text-rose-200/80">
            Skor ke-10 stasiun akan dihapus dan posisi kembali ke stasiun pertama.
          </p>
          <div class="mt-3 flex items-center justify-end gap-2">
            <button
              class="rounded-lg px-3 py-1.5 text-xs text-slate-300 hover:text-white"
              @click="showResetConfirm = false"
            >
              Batal
            </button>
            <button
              class="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-rose-600/30 hover:bg-rose-500"
              @click="resetSession"
            >
              Ya, Reset Sesi
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="mt-5 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-slate-400">
        <p v-if="store.mode === 'SIMULASI'">
          🔒 <strong class="text-slate-300">Mode Simulasi Penuh:</strong> Opsi kembali ke lobby dinonaktifkan untuk menjaga rotasi waktu 10 station berurutan.
        </p>
        <p v-else>
          💡 <strong class="text-slate-300">Mode Latihan:</strong> Anda dapat bebas mencoba kembali prosedur stasiun kapan saja tanpa batasan waktu.
        </p>
      </div>
    </div>
  </div>
</template>
