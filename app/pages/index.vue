<script setup lang="ts">
import type { DocPayload, TooltipInfo } from '../game/engine'
import RaporModal from '../components/RaporModal.vue'
import WelcomeOverlay from '../components/WelcomeOverlay.vue'
import { getStation } from '../data/stations'
import { startAmbience, stopAmbience, sfx } from '../game/audio'

useHead({ title: 'UKAI Labs — OSCE Center 3D' })

const store = useOsceStore()

const tooltip = ref<TooltipInfo | null>(null)
const toast = ref('')
const activeDoc = ref<DocPayload | null>(null)
const raporDismissed = ref(false)
const welcome = ref(true)
const menuOpen = ref(false)
const gameRef = ref<{ teleport: (t: 'lobby' | 'door' | 'room') => void, setMove: (dir: 'up' | 'down' | 'left' | 'right', on: boolean) => void } | null>(null)

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

// ambience rumah sakit: bunyi saat menunggu (lobby/reading), hening saat sesi ujian
watch(() => store.phase, (p) => {
  if (p === 'rekap') raporDismissed.value = false
  if (p === 'lobby' || p === 'reading') void startAmbience()
  else stopAmbience()
})

const modalOpen = computed(() => activeDoc.value !== null || welcome.value || menuOpen.value)

function startGame(mode: 'LATIHAN' | 'SIMULASI') {
  store.setMode(mode)
  store.setUnlimitedTime(true)
  welcome.value = false
  void startAmbience() // gesture pertama — AudioContext legal mulai di sini
}

// debug: fake raycast — buka dokumen stasiun aktif bergantian
let docCursor = 0
function openDocDebug() {
  const docs = store.activeStation?.documents ?? []
  if (docs.length === 0) return
  const d = docs[docCursor++ % docs.length]
  activeDoc.value = { stationId: store.activeStationId ?? '01', id: d.id, title: d.title, type: d.type, contentHtml: d.contentHtml }
}

function onDocComplete() {
  activeDoc.value = null
  store.completeStation()
  showToast('Stasiun selesai — skor disimpan, lanjut ke berikutnya.')
}

// prop di meja dipilih: benar → butir Pemilihan auto-terisi (st 03/04/10), salah → toast
function onPropInspect(stationId: string, label: string, isCorrect: boolean | undefined) {
  if (label.includes('Penguji') || label.includes('Pasien')) {
    showToast('Penguji OSCE: "Silakan periksa resep & hasil lab di meja. Amati sediaan obat yang tersedia untuk pasien."')
    return
  }
  if (label.includes('SIMRS')) {
    showToast('Layar SIMRS: Menampilkan rekam medis elektronik & profil terapi pasien.')
    return
  }
  if (isCorrect === true) {
    const filled = store.autoCheckCategory(stationId, 'Pemilihan')
    showToast(filled ? `${label} ✓ pilihan tepat — butir Pemilihan terisi` : `${label} ✓ pilihan tepat`)
  } else if (isCorrect === false) {
    showToast(`${label} — periksa kembali pilihan Anda`)
  } else {
    showToast(label)
  }
}

// langkah prosedur 3D (st 02/05/06/08/09): urutan dipakai mesin store
function onStepAttempt(stationId: string, stepId: string) {
  const steps = getStation(stationId).procedure?.steps ?? []
  const label = steps.find(s => s.id === stepId)?.label ?? ''
  const res = store.recordStep(stationId, stepId)
  if (res === 'done') {
    sfx.stepDone()
    showToast('Tindakan selesai ✓ — butir Tindakan (dan Urutan bila sempurna) terisi otomatis.')
  } else if (res === 'ok') {
    sfx.stepOk()
    showToast(`Benar: ${label}`)
  } else {
    sfx.stepWrong()
    showToast('Salah urutan — langkah harus diulang dari urutan yang benar. Butir Urutan tidak akan terisi.')
  }
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
        @prop-inspect="onPropInspect"
        @step-attempt="onStepAttempt"
        @toast="showToast"
      />
    </ClientOnly>

    <HudOverlay
      v-if="!welcome"
      :tooltip="tooltip"
      :toast="toast"
      :debug="true"
      @teleport="t => gameRef?.teleport(t)"
      @move="(dir, on) => gameRef?.setMove(dir, on)"
      @debugdoc="openDocDebug"
      @menu-change="m => (menuOpen = m)"
    />

    <WelcomeOverlay v-if="welcome" @start="startGame" />

    <DocModal
      v-if="activeDoc"
      :doc="activeDoc"
      @close="activeDoc = null"
      @complete="onDocComplete"
    />

    <RaporModal
      v-if="store.phase === 'rekap' && !raporDismissed"
      @close="raporDismissed = true"
    />
  </div>
</template>
