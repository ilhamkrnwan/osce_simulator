<script setup lang="ts">
import type { DocPayload, TooltipInfo } from '../game/engine'

const emit = defineEmits<{
  tooltip: [info: TooltipInfo | null]
  'open-document': [doc: DocPayload]
  'prop-inspect': [label: string, isCorrect: boolean | undefined]
  toast: [text: string]
}>()

const store = useOsceStore()
const props = defineProps<{ modalOpen: boolean }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
// engine interface dipisah daripada import class (dynamic import client-only)
type EngineLike = {
  updatePhase: (p: string, id: string | null) => void
  teleport: (t: 'lobby' | 'door' | 'room') => void
  dispose: () => void
  lockEnabled: boolean
}
let engine: EngineLike | null = null

onMounted(() => {
  import('../game/engine').then(({ OsceEngine }) => {
    if (!canvasRef.value) return
    engine = new OsceEngine(canvasRef.value, {
      onTooltip: i => emit('tooltip', i),
      onOpenDocument: d => emit('open-document', d),
      onPropInspect: (label, isCorrect) => emit('prop-inspect', label, isCorrect),
      onDoorRequested: (stationId) => {
        store.startReadingPhase(stationId)
        emit('toast', `Waktu baca dimulai — giliran Anda Station ${stationId}. Pintu masih terkunci sampai bel berbunyi.`)
      },
      onToast: t => emit('toast', t),
    })
    engine.updatePhase(store.phase, store.activeStationId)
  })
})

watch(() => props.modalOpen, (open) => {
  if (engine) engine.lockEnabled = !open
})

// fase store → dunia 3D (bel, buka/tutup pintu, spawn/destroy ruangan)
watch(() => [store.phase, store.activeStationId] as const, ([p, id]) => {
  engine?.updatePhase(p, id)
})

onBeforeUnmount(() => {
  engine?.dispose()
  engine = null
})

defineExpose({ teleport: (t: 'lobby' | 'door' | 'room') => engine?.teleport(t) })
</script>

<template>
  <canvas ref="canvasRef" class="fixed inset-0 block h-full w-full" />
</template>
