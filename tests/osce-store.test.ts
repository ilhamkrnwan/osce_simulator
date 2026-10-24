import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useOsceStore } from '../app/stores/osce'
import { getStation, nextStationId } from '../app/data/stations'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('store OSCE', () => {
  it('mulai baca di stasiun 01 dengan 60 detik', () => {
    const s = useOsceStore()
    s.startReadingPhase()
    expect(s.activeStationId).toBe('01')
    expect(s.phase).toBe('reading')
    expect(s.timeLeft).toBe(60)
  })

  it('tick ×60 menutup waktu baca → bel masuk ruangan (540 detik)', () => {
    const s = useOsceStore()
    s.startReadingPhase()
    for (let i = 0; i < 60; i++) s.tick()
    expect(s.phase).toBe('exam')
    expect(s.timeLeft).toBe(540)
  })

  it('lewati waktu baca → langsung ruangan', () => {
    const s = useOsceStore()
    s.startReadingPhase()
    s.skipReadingTime()
    expect(s.phase).toBe('exam')
  })

  it('mode SIMULASI: skip waktu baca ditolak', () => {
    const s = useOsceStore()
    s.setMode('SIMULASI')
    s.startReadingPhase()
    s.skipReadingTime()
    expect(s.phase).toBe('reading')
  })

  it('tick saat waktu ujian habis menyelesaikan stasiun dengan skor 0', () => {
    const s = useOsceStore()
    s.startReadingPhase()
    s.skipReadingTime()
    for (let i = 0; i < 540; i++) s.tick()
    expect(s.completed['01']).toEqual({ score: 0, passed: false })
    expect(s.activeStationId).toBe('02')
    expect(s.phase).toBe('lobby')
  })

  it('skor rubrik Station 01 berbobot (item 10 điểm → 3 item dicentang = 30)', () => {
    const s = useOsceStore()
    s.toggleRubricItem('01', 's1-02')
    s.toggleRubricItem('01', 's1-05')
    s.toggleRubricItem('01', 's1-08')
    expect(s.scoreOf('01')).toBe(30)
    // uncheck → skor turun lagi
    s.toggleRubricItem('01', 's1-02')
    expect(s.scoreOf('01')).toBe(20)
  })

  it('stasiun 10 selesai → fase rekap', () => {
    const s = useOsceStore()
    for (const st of ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10']) {
      s.startReadingPhase(st)
      s.skipReadingTime()
      s.completeStation()
    }
    expect(s.completedCount).toBe(10)
    expect(s.phase).toBe('rekap')
  })

  it('lulus bila skor ≥ 70', () => {
    const s = useOsceStore()
    for (let i = 1; i <= 7; i++) s.toggleRubricItem('01', `s1-${String(i).padStart(2, '0')}`)
    s.startReadingPhase('01')
    s.skipReadingTime()
    s.completeStation()
    expect(s.completed['01']).toEqual({ score: 70, passed: true })
  })

  it('reset mengosongkan semuanya', () => {
    const s = useOsceStore()
    s.startReadingPhase()
    s.skipReadingTime()
    s.completeStation()
    s.reset()
    expect(s.phase).toBe('lobby')
    expect(s.completedCount).toBe(0)
  })
})

describe('data stasiun', () => {
  it('10 stasiun bergantian kiri/kanan dan urut', () => {
    expect(nextStationId('01')).toBe('02')
    expect(nextStationId('10')).toBeNull()
    expect(getStation('09').roomSide).toBe('left')
  })
})

describe('mekanik langkah prosedur (stasiun skill)', () => {
  it('urutan benar → langkah tersimpan; salah urutan → wrong + tidak tersimpan', () => {
    const s = useOsceStore()
    const st5 = getStation('05').procedure!.steps
    expect(s.recordStep('05', st5[1]!.id)).toBe('wrong')
    expect(s.stepProgress['05']).toBeUndefined()
    expect(s.recordStep('05', st5[0]!.id)).toBe('ok')
    expect(s.recordStep('05', st5[1]!.id)).toBe('ok')
    expect(s.stepProgress['05']).toEqual([st5[0]!.id, st5[1]!.id])
  })

  it('tuntas semua langkah → butir Tindakan terisi; tanpa salah → Urutan terisi', () => {
    const s = useOsceStore()
    const st5 = getStation('05').procedure!
    for (const step of st5.steps) s.recordStep('05', step.id)
    const tindakan = getStation('05').rubricItems.filter(it => it.category === 'Tindakan').map(it => it.id)
    expect(s.checkedItems['05']).toContain('s5-04') // Tindakan: prime 2 UI
    expect(s.checkedItems['05']).toEqual(expect.arrayContaining(tindakan))
    expect(s.checkedItems['05']).toContain('s5-08') // Urutan
  })

  it('pernah salah urutan → butir Urutan tidak terisi', () => {
    const s = useOsceStore()
    const st2 = getStation('02').procedure!.steps
    s.recordStep('02', st2[1]!.id) // salah
    for (const step of st2) s.recordStep('02', step.id)
    const ids = getStation('02').rubricItems.filter(it => it.category === 'Tindakan').map(it => it.id)
    expect(s.checkedItems['02']).toEqual(expect.arrayContaining(ids))
    expect(s.checkedItems['02']).not.toContain('s2-07') // butir Urutan Station 02
  })

  it('prop benar diklik → butir Pemilihan Station 03 terisi', () => {
    const s = useOsceStore()
    expect(s.autoCheckCategory('03', 'Pemilihan')).toBe(true)
    expect(s.checkedItems['03']).toContain('s3-03')
  })
})
