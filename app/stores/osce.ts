// FSM ujian OSCE: LOBBY → READING (60s) → EXAM (540s) → rotasi → REKAP (PRD §3)
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  EXAM_DURATION_SEC,
  PASSING_GRADE,
  READ_DURATION_SEC,
  stations,
  getStation,
  nextStationId,
  type StationScenario,
} from '../data/stations'

export type OsceMode = 'LATIHAN' | 'SIMULASI'
export type OscePhase = 'lobby' | 'reading' | 'exam' | 'rekap'

export interface StationResult {
  score: number // 0..100
  passed: boolean
}

export const useOsceStore = defineStore('osce', () => {
  const mode = ref<OsceMode>('LATIHAN')
  const phase = ref<OscePhase>('lobby')
  const activeStationId = ref<string | null>(null)
  const timeLeft = ref(0)
  // per stasiun: ids butir rubrik yang dicentang kandidat
  const checkedItems = ref<Record<string, string[]>>({})
  // per stasiun: hasil skorFinal saat stasiun selesai
  const completed = ref<Record<string, StationResult>>({})
  // per stasiun: ids langkah prosedur yang sudah dikerjakan (mekanik langkah 3D)
  const stepProgress = ref<Record<string, string[]>>({})
  // per stasiun: jumlah langkah yang salah urutan
  const wrongSteps = ref<Record<string, number>>({})

  const activeStation = computed<StationScenario | null>(() =>
    activeStationId.value ? getStation(activeStationId.value) : null,
  )

  const completedCount = computed(() => Object.keys(completed.value).length)

  const unlimitedTime = ref(false)

  function setUnlimitedTime(val: boolean) {
    unlimitedTime.value = val
  }

  function setMode(m: OsceMode) {
    mode.value = m
  }

  function enterStation(stationId: string) {
    activeStationId.value = stationId
    phase.value = 'exam'
    timeLeft.value = EXAM_DURATION_SEC
  }

  function startReadingPhase(stationId?: string) {
    const id = stationId ?? activeStationId.value ?? stations[0].id
    activeStationId.value = id
    phase.value = 'reading'
    timeLeft.value = READ_DURATION_SEC
  }

  function skipReadingTime() {
    if (phase.value !== 'reading' || mode.value === 'SIMULASI') return
    enterRoom()
  }

  function enterRoom() {
    if (phase.value !== 'reading' || !activeStationId.value) return
    phase.value = 'exam'
    timeLeft.value = EXAM_DURATION_SEC
  }

  // Dipanggil jam game 1× / detik
  function tick() {
    if (unlimitedTime.value) {
      // Mode eksplorasi tanpa batasan waktu: tidak pernah mengusir pemain dari ruangan
      if (phase.value === 'reading') {
        if (timeLeft.value > 0) timeLeft.value--
        if (timeLeft.value <= 0) enterRoom()
      } else if (phase.value === 'exam') {
        if (timeLeft.value > 0) timeLeft.value--
      }
      return
    }

    if (phase.value === 'reading') {
      timeLeft.value--
      if (timeLeft.value <= 0) enterRoom()
    } else if (phase.value === 'exam') {
      timeLeft.value--
      if (timeLeft.value <= 0) completeStation()
    }
  }

  function toggleRubricItem(stationId: string, itemId: string) {
    const list = checkedItems.value[stationId] ?? []
    const next = list.includes(itemId)
      ? list.filter(i => i !== itemId)
      : [...list, itemId]
    checkedItems.value = { ...checkedItems.value, [stationId]: next }
  }

  // otomatis centang semua butir rubrik pada kategori tertentu (dipanggil mesin 3D:
  // 'Pemilihan' saat prop benar diklik; 'Tindakan'/'Urutan' saat langkah prosedur tuntas)
  function autoCheckCategory(stationId: string, category: string) {
    const done = (checkedItems.value[stationId] ?? [])
    const ids = getStation(stationId).rubricItems
      .filter(it => it.category === category && !done.includes(it.id))
      .map(it => it.id)
    if (ids.length === 0) return false
    checkedItems.value = { ...checkedItems.value, [stationId]: [...done, ...ids] }
    return true
  }

  // hasil tekan langkah prosedur di prop 3D: validasi urutan + auto-check rubrik
  // status: 'ok' (langkah benar, lanjut) | 'done' (tuntas) | 'wrong' (salah urutan)
  function recordStep(stationId: string, stepId: string): 'ok' | 'done' | 'wrong' {
    const steps = getStation(stationId).procedure?.steps
    if (!steps) return 'wrong'
    const done = stepProgress.value[stationId] ?? []
    if (done.includes(stepId)) return 'ok'
    const expected = steps[done.length]?.id
    if (stepId !== expected) {
      wrongSteps.value = { ...wrongSteps.value, [stationId]: (wrongSteps.value[stationId] ?? 0) + 1 }
      return 'wrong'
    }
    const next = [...done, stepId]
    stepProgress.value = { ...stepProgress.value, [stationId]: next }
    if (next.length === steps.length) {
      autoCheckCategory(stationId, 'Tindakan')
      if ((wrongSteps.value[stationId] ?? 0) === 0) autoCheckCategory(stationId, 'Urutan')
      return 'done'
    }
    return 'ok'
  }

  function resetSteps(stationId: string) {
    const { [stationId]: _s, ...restProgress } = stepProgress.value  
    const { [stationId]: _w, ...restWrong } = wrongSteps.value  
    void _s
    void _w
    stepProgress.value = restProgress
    wrongSteps.value = restWrong
  }

  function scoreOf(stationId: string): number {
    const station = getStation(stationId)
    const total = station.rubricItems.reduce((sum, it) => sum + it.weight, 0)
    if (total === 0) return 0
    const checked = new Set(checkedItems.value[stationId] ?? [])
    const earned = station.rubricItems
      .filter(it => checked.has(it.id))
      .reduce((sum, it) => sum + it.weight, 0)
    return Math.round((earned / total) * 100)
  }

  function completeStation() {
    if (!activeStationId.value || completed.value[activeStationId.value]) return
    const id = activeStationId.value
    const score = scoreOf(id)
    completed.value = { ...completed.value, [id]: { score, passed: score >= PASSING_GRADE } }
    timeLeft.value = 0
    const next = nextStationId(id)
    if (!next) {
      phase.value = 'rekap'
      return
    }
    activeStationId.value = next
    phase.value = 'lobby'
  }

  function reset() {
    mode.value = 'LATIHAN'
    phase.value = 'lobby'
    activeStationId.value = null
    timeLeft.value = 0
    checkedItems.value = {}
    completed.value = {}
    stepProgress.value = {}
    wrongSteps.value = {}
  }

  // suspend rehydrasi plugin persist (osce-persist.client.ts) menulis kedua field ini
  function hydrate(state: {
    mode?: OsceMode
    activeStationId?: string | null
    completed?: Record<string, StationResult>
    checkedItems?: Record<string, string[]>
    stepProgress?: Record<string, string[]>
    wrongSteps?: Record<string, number>
  }) {
    if (state.mode) mode.value = state.mode
    if (state.activeStationId) activeStationId.value = state.activeStationId
    if (state.completed) completed.value = state.completed
    if (state.checkedItems) checkedItems.value = state.checkedItems
    if (state.stepProgress) stepProgress.value = state.stepProgress
    if (state.wrongSteps) wrongSteps.value = state.wrongSteps
  }

  return {
    mode,
    phase,
    activeStationId,
    activeStation,
    timeLeft,
    checkedItems,
    completed,
    completedCount,
    stepProgress,
    wrongSteps,
    unlimitedTime,
    setUnlimitedTime,
    enterStation,
    setMode,
    startReadingPhase,
    skipReadingTime,
    enterRoom,
    tick,
    toggleRubricItem,
    autoCheckCategory,
    recordStep,
    resetSteps,
    scoreOf,
    completeStation,
    reset,
    hydrate,
  }
})
