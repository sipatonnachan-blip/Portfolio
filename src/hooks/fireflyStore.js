import { useSyncExternalStore } from 'react'

// Hand-off between the site-wide firefly companion and the Tech Stack lamp
// scene. `lampReady` is true once the companion has flown to the lamp and
// landed; until then the scene keeps its own lamp firefly hidden so there are
// never two on screen.
let lampReady = false
const listeners = new Set()

export const fireflyStore = {
  getLampReady: () => lampReady,
  setLampReady(value) {
    if (lampReady === value) return
    lampReady = value
    listeners.forEach((listener) => listener())
  },
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

export function useLampReady() {
  return useSyncExternalStore(fireflyStore.subscribe, fireflyStore.getLampReady)
}
