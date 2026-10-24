<script setup lang="ts">
// Modal Pembaca Dokumen: font scaler, tab antar-dokumen meja, print
import { sfx } from '~/game/audio'
import { ArrowDown, ArrowUp, Printer, X } from '@lucide/vue'

const props = defineProps<{ doc: { id?: string, title: string, type: string, contentHtml: string, stationId: string } }>()
const emit = defineEmits<{ close: [], complete: [] }>()

const store = useOsceStore()
const fontSize = ref(15)

const stationDocs = computed(() => {
  if (props.doc.type === 'scenario_board') {
    // Papan klip di dinding luar pintu: HANYA tampilkan pengantar skenario
    return [props.doc]
  }
  // Dokumen kasus klinis meja (resep, lab) & rubrik penilaian di dalam ruangan
  const all = store.activeStation?.documents ?? [props.doc]
  return all.filter(d => d.type !== 'scenario_board')
})

// tab: dokumen aktif di meja; default = dokumen yang dibuka mesin
const activeId = ref(props.doc.id ?? stationDocs.value[0]?.id)
watch(() => props.doc, (newDoc) => {
  if (newDoc) {
    activeId.value = newDoc.id ?? stationDocs.value[0]?.id
  }
}, { immediate: true })

const active = computed(() => stationDocs.value.find(d => d.id === activeId.value) ?? props.doc)

function selectTab(id: string) {
  activeId.value = id
  sfx.paperFlip()
}

const isRubric = computed(() => active.value?.type === 'rubric_checklist')
const checked = computed(() => store.checkedItems[props.doc.stationId] ?? [])
const items = computed(() => store.activeStation?.rubricItems ?? [])

function toggle(id: string) {
  store.toggleRubricItem(props.doc.stationId, id)
}

const liveScore = computed(() => store.scoreOf(props.doc.stationId))

function printDoc() {
  if (!active.value) return
  const w = window.open('', '_blank', 'width=720,height=900')
  if (!w) return
  w.document.write(`<html><head><title>${active.value.title}</title><style>body{font-family:system-ui;margin:32px;}table{border-collapse:collapse}table td{border:1px solid #ccc;padding:4px 10px}</style></head><body>${active.value.contentHtml}</body></html>`)
  w.document.close()
  w.print()
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-[#020409]/70 p-4 backdrop-blur-sm" @click.self="emit('close')">
    <div class="glass animate-pop flex max-h-[86vh] w-full max-w-2xl flex-col rounded-2xl">
      <header class="flex items-start justify-between gap-4 border-b border-white/10 p-5">
        <div class="min-w-0">
          <h2 class="font-display text-base font-bold leading-tight text-white">{{ active?.title }}</h2>
        </div>
        <div class="flex shrink-0 items-center gap-1 text-xs">
          <button class="grid h-8 w-8 place-items-center rounded-lg bg-white/8 text-white/80 transition hover:bg-white/15" title="Cetak" @click="printDoc">
            <Printer class="h-3.5 w-3.5" />
          </button>
          <button
            class="grid h-8 w-8 place-items-center rounded-lg bg-white/8 font-mono text-white/80 transition hover:bg-white/15"
            title="Perkecil huruf" @click="fontSize = Math.max(11, fontSize - 2)"
          >
            <ArrowDown class="h-3.5 w-3.5" />
          </button>
          <button
            class="grid h-8 w-8 place-items-center rounded-lg bg-white/8 font-mono text-white/80 transition hover:bg-white/15"
            title="Perbesar huruf" @click="fontSize = Math.min(24, fontSize + 2)"
          >
            <ArrowUp class="h-3.5 w-3.5" />
          </button>
          <button class="ml-1 grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white transition hover:bg-rose-500/60" @click="emit('close')">
            <X class="h-4 w-4" />
          </button>
        </div>
      </header>

      <!-- tab pindah cepat antar-dokumen di meja -->
      <nav v-if="stationDocs.length > 1" class="flex gap-1 overflow-x-auto border-b border-white/8 px-4 py-2.5">
        <button
          v-for="d in stationDocs" :key="d.id"
          class="whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition duration-150"
          :class="d.id === activeId
            ? 'bg-violet-600 text-white'
            : 'text-slate-200 hover:bg-white/8'"
          @click="selectTab(d.id!)"
        >
          {{ d.title.split('— Station')[0]!.trim() }}
        </button>
      </nav>

      <!-- eslint-disable-next-line vue/no-v-html -- konten statis milik sendiri, bukan input user -->
      <div v-if="!isRubric" class="doc-prose animate-fade-in overflow-y-auto p-6" :style="{ fontSize: fontSize + 'px' }" v-html="active?.contentHtml" />

      <div v-else class="doc-prose flex-1 overflow-y-auto p-6" :style="{ fontSize: fontSize + 'px' }">
        <!-- eslint-disable-next-line vue/no-v-html -- konten statis milik sendiri, bukan input user -->
        <p v-html="active?.contentHtml" />
        <div class="mt-4 space-y-1.5">
          <label
            v-for="(it, idx) in items" :key="it.id"
            class="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/4 p-3 transition duration-150 hover:border-white/20 hover:bg-white/8"
            :class="checked.includes(it.id) ? 'border-emerald-400/50 bg-emerald-400/10' : ''"
          >
            <input
              type="checkbox" class="mt-0.5 h-4 w-4"
              :checked="checked.includes(it.id)"
              @change="toggle(it.id)"
            >
            <span class="flex-1 text-[13px] leading-snug text-white/90">
              <span class="mr-1.5 inline-block rounded bg-white/8 px-1.5 py-0.5 align-middle text-[10px] font-semibold text-slate-300">{{ it.category }}</span>
              <span class="align-middle">{{ it.label }}</span>
            </span>
            <span class="font-mono text-[11px] text-slate-400">{{ it.weight }}p</span>
            <span class="sr-only">butir {{ idx + 1 }}</span>
          </label>
        </div>
        <div class="mt-4 flex items-center justify-between rounded-xl bg-violet-500/12 px-4 py-3 ring-1 ring-violet-400/25">
          <span class="text-xs text-slate-200/90">Skor berjalan — lulus ≥ 70</span>
          <span class="font-mono text-xl font-bold" :class="liveScore >= 70 ? 'text-emerald-400' : 'text-white'">{{ liveScore }}<span class="text-xs text-slate-400">/100</span></span>
        </div>
      </div>

      <footer class="flex items-center justify-between border-t border-white/10 p-4 text-[11px] text-slate-400">
        <span><kbd class="rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono">Esc</kbd> tutup · klik kanvas untuk lanjut</span>
        <button
          v-if="store.mode === 'LATIHAN'"
          class="rounded-xl bg-violet-500 px-4 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-violet-400"
          @click="emit('complete')"
        >
          Selesai & lanjut →
        </button>
      </footer>
    </div>
  </div>
</template>
