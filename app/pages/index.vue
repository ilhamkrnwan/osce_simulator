<script setup lang="ts">
import type { DocPayload, TooltipInfo } from '../game/engine'

useHead({ title: 'UKAI Labs — OSCE Center 3D' })

const store = useOsceStore()

const tooltip = ref<TooltipInfo | null>(null)
const toast = ref('')
const activeDoc = ref<DocPayload | null>(null)
const gameRef = ref<{ teleport: (t: 'lobby' | 'door' | 'room') => void } | null>(null)

let toastTimer: ReturnType<typeof setTimeout> | undefined

function showToast(text: string) {
  toast.value = text
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 4000)
}

// jam game 1 detik — memanggil tick FSM (interval sederhana, tanpa drift)
let clockTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  clockTimer = setInterval(() => store.tick(), 1000)
})
onBeforeUnmount(() => clearInterval(clockTimer))

const modalOpen = computed(() => activeDoc.value !== null)

// debug: purid raycast — buka dokumen stasiun aktif bergantian
let docCursor = 0
function openDocDebug() {
  const docs = store.activeStation?.documents ?? []
  if (docs.length === 0) return
  const d = docs[docCursor++ % docs.length]
  activeDoc.value = { stationId: store.activeStationId ?? '01', title: d.title, type: d.type, contentHtml: d.contentHtml }
}

function onDocComplete() {
  activeDoc.value = null
  store.completeStation()
  showToast('Stasiun selesai — skor disimpan, lanjut ke berikutnya.')
}
</script>

<template>
  <div class="fixed inset-0 bg-black">
    <ClientOnly>
      <GameCanvas
        ref="gameRef"
        :modal-open="modalOpen"
        @tooltip="i => (tooltip = i)"
        @open-document="d => (activeDoc = d)"
        @prop-inspect="(l, c) => showToast(l + (c === true ? ' ✓ pilihan tepat' : c === false ? ' — periksa kembali' : ''))"
        @toast="showToast"
      />
    </ClientOnly>

    <HudOverlay
      :tooltip="tooltip"
      :toast="toast"
      :debug="true"
      @teleport="t => gameRef?.teleport(t)"
      @togglesound="() => {}"
      @debugdoc="openDocDebug"
    />

    <DocModal
      v-if="activeDoc"
      :doc="activeDoc"
      @close="activeDoc = null"
      @complete="onDocComplete"
    />
  </div>
</template>
