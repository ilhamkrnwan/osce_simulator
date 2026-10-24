// Skema kontrol peserta — dipilih di layar sambutan, bisa diganti dari Menu.
// Persist lokal; dibaca HudOverlay untuk memutuskan D-pad / joystick / tanpa on-screen.
export type ControlScheme = 'dpad' | 'joystick' | 'keyboard'

export function useControls() {
  const scheme = useState<ControlScheme>('osce-control-scheme', () => {
    if (import.meta.client) {
      const saved = localStorage.getItem('osce-controls')
      if (saved === 'dpad' || saved === 'joystick' || saved === 'keyboard') return saved
    }
    return 'dpad'
  })

  function setScheme(v: ControlScheme) {
    scheme.value = v
    if (import.meta.client) localStorage.setItem('osce-controls', v)
  }

  return { scheme, setScheme }
}
