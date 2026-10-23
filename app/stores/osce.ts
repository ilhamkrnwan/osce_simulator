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

  const activeStation = computed<StationScenario | null>(() =>
    activeStationId.value ? getStation(activeStationId.value) : null,
  )

  const completedCount = computed(() => Object.keys(completed.value).length)

  function setMode(m: OsceMode) {
    mode.value = m
  }

  function startReadingPhase(stationId?: string) {
    const id = stationId ?? activeStationId.value ?? stations[0].id
    activeStationId.value = id
    phase.value = 'reading'
    timeLeft.value = READ_DURATION_SEC
  }

  function skipReadingTime() {
    if (phase.value === 'reading') enterRoom()
  }

  function enterRoom() {
    if (phase.value !== 'reading' || !activeStationId.value) return
    phase.value = 'exam'
    timeLeft.value = EXAM_DURATION_SEC
  }

  // Dipanggil jam game 1× / detik (composable jam menyusul di Fase 3)
  function tick() {
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
  }

  // suspend rehydrasi plugin persist (osce-persist.client.ts) menulis kedua field ini
  function hydrate(state: { mode?: OsceMode; activeStationId?: string | null; completed?: Record<string, StationResult>; checkedItems?: Record<string, string[]> }) {
    if (state.mode) mode.value = state.mode
    if (state.activeStationId) activeStationId.value = state.activeStationId
    if (state.completed) completed.value = state.completed
    if (state.checkedItems) checkedItems.value = state.checkedItems
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
    setMode,
    startReadingPhase,
    skipReadingTime,
    enterRoom,
    tick,
    toggleRubricItem,
    scoreOf,
    completeStation,
    reset,
    hydrate,
  }
})
