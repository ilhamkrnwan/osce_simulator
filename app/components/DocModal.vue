<script setup lang="ts">
const props = defineProps<{ doc: { title: string, type: string, contentHtml: string, stationId: string } }>()
const emit = defineEmits<{ close: [], complete: [] }>()

const store = useOsceStore()
const fontSize = ref(15)

const isRubric = computed(() => props.doc.type === 'rubric_checklist')
const checked = computed(() => store.checkedItems[props.doc.stationId] ?? [])
const items = computed(() => store.activeStation?.rubricItems ?? [])

function toggle(id: string) {
  if (store.phase === 'exam') store.toggleRubricItem(props.doc.stationId, id)
}

const liveScore = computed(() => store.scoreOf(props.doc.stationId))

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="emit('close')">
    <div class="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
      <div class="flex items-start justify-between gap-3 border-b border-neutral-200 p-4">
        <div>
          <div class="text-[10px] font-bold tracking-widest text-violet-600">DOKUMEN STASIUN {{ doc.stationId }}</div>
          <h2 class="text-base font-bold leading-tight">{{ doc.title }}</h2>
        </div>
        <div class="flex shrink-0 gap-1 text-xs">
          <button class="rounded bg-neutral-100 px-2 py-1 font-mono hover:bg-neutral-200" @click="fontSize = Math.max(11, fontSize - 2)">A−</button>
          <button class="rounded bg-neutral-100 px-2 py-1 font-mono hover:bg-neutral-200" @click="fontSize = Math.min(24, fontSize + 2)">A+</button>
          <button class="rounded bg-neutral-800 px-2 py-1 text-white hover:bg-neutral-700" @click="emit('close')">✕</button>
        </div>
      </div>

      <!-- eslint-disable-next-line vue/no-v-html -- konten statis milik sendiri, bukan input user -->
      <div v-if="!isRubric" class="overflow-y-auto p-5" :style="{ fontSize: fontSize + 'px' }" v-html="doc.contentHtml" />

      <div v-else class="flex-1 overflow-y-auto p-5" :style="{ fontSize: fontSize + 'px' }">
        <!-- eslint-disable-next-line vue/no-v-html -- konten statis milik sendiri, bukan input user -->
        <p v-html="doc.contentHtml" />
        <div class="mt-3 space-y-1.5">
          <label
            v-for="it in items" :key="it.id"
            class="pointer-events-auto flex cursor-pointer items-start gap-2 rounded-lg border p-2 transition"
            :class="checked.includes(it.id) ? 'border-emerald-400 bg-emerald-50' : 'border-neutral-200 hover:bg-neutral-50'"
          >
            <input
              type="checkbox" class="mt-0.5 h-4 w-4 accent-emerald-600"
              :checked="checked.includes(it.id)"
              @change="toggle(it.id)"
            >
            <span class="flex-1 leading-snug"><b class="text-neutral-500">{{ it.category }}:</b>{{ ' ' }}{{ it.label }}</span>
            <span class="font-mono text-[11px] text-neutral-400">{{ it.weight }}p</span>
          </label>
        </div>
        <div class="mt-3 rounded-lg bg-violet-50 p-3 text-sm">
          Skor berjalan: <b class="font-mono">{{ liveScore }}</b> / 100 — lulus ≥ 70
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-neutral-200 p-3 text-xs">
        <span class="text-neutral-500"><kbd class="font-mono">Esc</kbd> untuk tutup. Klik kanvas untuk lanjut berenang.</span>
        <button
          v-if="store.mode === 'LATIHAN'"
          class="rounded bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-500"
          @click="emit('complete')"
        >
          Selesai & lanjut →
        </button>
      </div>
    </div>
  </div>
</template>
