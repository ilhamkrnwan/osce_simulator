// Persist progres latihan ke localStorage (customer Q4 ronde 2)
import { useOsceStore } from '~/stores/osce'

const KEY = 'osce-progress-v1'

export default defineNuxtPlugin(() => {
  const store = useOsceStore()
  if (typeof localStorage === 'undefined') return

  try {
    const raw = localStorage.getItem(KEY)
    if (raw) store.hydrate(JSON.parse(raw))
  } catch {
    localStorage.removeItem(KEY)
  }

  store.$subscribe(() => {
    const data = {
      mode: store.mode,
      activeStationId: store.activeStationId,
      completed: store.completed,
      checkedItems: store.checkedItems,
      stepProgress: store.stepProgress,
      wrongSteps: store.wrongSteps,
    }
    localStorage.setItem(KEY, JSON.stringify(data))
  })
})
