<script setup lang="ts">
// Rapor Evaluasi OSCE — layar rekap fase 'rekap'
import { RotateCcw, X } from '@lucide/vue'
import { getStation } from '~/data/stations'

const emit = defineEmits<{ close: [] }>()
const store = useOsceStore()

const rows = computed(() =>
  (['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'] as const).map((id) => {
    const st = getStation(id)
    const res = store.completed[id] ?? null
    const checked = new Set(store.checkedItems[id] ?? [])
    const missed = st.rubricItems.filter(it => !checked.has(it.id))
    return { id, title: st.title, score: res?.score ?? null, passed: res?.passed ?? false, missed }
  }),
)

const avg = computed(() => {
  const s = Object.values(store.completed).map(r => r.score)
  return s.length ? Math.round(s.reduce((a, b) => a + b, 0) / s.length) : 0
})

const passCount = computed(() =>
  Object.values(store.completed).filter(r => r.passed).length)

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-[#020409]/75 p-4 backdrop-blur-sm" @click.self="emit('close')">
    <div class="glass animate-fade-up flex max-h-[88vh] w-full max-w-3xl flex-col rounded-2xl">
      <header class="flex items-start justify-between gap-4 border-b border-white/10 p-5">
        <div>
          <h2 class="font-display text-xl font-bold text-white">Rapor Evaluasi</h2>
          <p class="mt-1 text-xs text-slate-400">Rangkaian 10 stasiun selesai — lulus per stasiun ≥ 70 poin.</p>
        </div>
        <div class="flex items-center gap-5">
          <div class="text-right">
            <span class="font-mono block text-xs text-slate-400">stasiun lulus</span>
            <span class="font-display block text-xl font-bold text-white">{{ passCount }}<span class="text-sm font-normal text-slate-400">/10</span></span>
          </div>
          <div class="text-right">
            <span class="font-mono block text-xs text-slate-400">rata-rata</span>
            <span
              class="font-display block text-3xl font-bold tabular-nums"
              :class="avg >= 70 ? 'text-emerald-400' : 'text-rose-400'"
            >{{ avg }}</span>
          </div>
          <button class="grid h-8 w-8 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white" @click="emit('close')">
            <X class="h-4 w-4" />
          </button>
        </div>
      </header>

      <div class="flex-1 space-y-2 overflow-y-auto p-5">
        <div
          v-for="(r, idx) in rows" :key="r.id"
          class="animate-fade-up rounded-xl border border-white/8 bg-white/4 p-3.5"
          :style="{ animationDelay: `${idx * 35}ms` }"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-start gap-3">
              <span class="font-mono mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-500/18 text-[11px] font-bold text-violet-300">{{ r.id }}</span>
              <span class="truncate text-sm font-semibold text-white/92">{{ r.title }}</span>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <span
                class="font-mono text-sm font-bold"
                :class="r.score == null ? 'text-slate-500' : r.passed ? 'text-emerald-400' : 'text-rose-400'"
              >{{ r.score == null ? '—' : r.score }}</span>
              <span
                class="rounded-md px-2 py-0.5 text-[10px] font-bold"
                :class="r.score == null
                  ? 'bg-white/6 text-slate-400'
                  : r.passed ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'"
              >
                {{ r.score == null ? 'BELUM' : r.passed ? 'LULUS' : 'GAGAL' }}
              </span>
            </div>
          </div>
          <div v-if="r.missed.length" class="mt-2 rounded-lg bg-amber-400/8 p-2.5">
            <div class="text-[10px] font-bold tracking-wide text-amber-300/90">Butir belum dipenuhi ({{ r.missed.length }})</div>
            <ul class="mt-1 space-y-0.5 text-[11px] leading-relaxed text-amber-100/80">
              <li v-for="it in r.missed.slice(0, 6)" :key="it.id">• {{ it.category }}: {{ it.label }} ({{ it.weight }}p)</li>
              <li v-if="r.missed.length > 6" class="italic text-amber-100/50">+{{ r.missed.length - 6 }} lainnya…</li>
            </ul>
          </div>
        </div>
      </div>

      <footer class="flex items-center justify-between border-t border-white/10 p-4 text-xs text-slate-400">
        <span>Progres tersimpan otomatis — boleh ditutup dan dilanjutkan kapan pun.</span>
        <div class="flex gap-2">
          <button class="rounded-xl bg-white/8 px-4 py-2.5 font-semibold text-white transition hover:bg-white/15" @click="emit('close')">Tutup</button>
          <button
            class="flex items-center gap-1.5 rounded-xl bg-violet-500 px-4 py-2.5 font-bold text-white transition hover:-translate-y-0.5 hover:bg-violet-400"
            @click="store.reset(); emit('close')"
          >
            <RotateCcw class="h-3.5 w-3.5" /> Ulangi rangkaian
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>
