// Mesin 3D murni Three.js: koridor, 10 pintu, FPC + raycast + ruangan dinamis.
// Terputus dari Pinia — komunikasi via updatePhase()/teleport() (Vue→mesin) dan hooks (mesin→Vue).
import * as THREE from 'three'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import gsap from 'gsap'
import { stations, getStation, type StationScenario, type DocumentItem, type PropItem } from '../data/stations'
import { makeTextTexture, makeSignTexture } from './textures'
import { sfx } from './audio'

type Rect = { minX: number, maxX: number, minZ: number, maxZ: number }
type OscePhase = 'lobby' | 'reading' | 'exam' | 'rekap'

export interface TooltipInfo { title: string, subtitle?: string }
export interface DocPayload { stationId: string, title: string, type: string, contentHtml: string }

export interface EngineHooks {
  onTooltip: (info: TooltipInfo | null) => void
  onOpenDocument: (doc: DocPayload) => void
  onPropInspect: (label: string, isCorrect: boolean | undefined) => void
  onDoorRequested: (stationId: string) => void // pemain menekan pintu saat lobby → Vue mulai reading
  onToast: (text: string) => void
}

const DOOR_W = 1.6
const DOOR_H = 2.6
const WALL_X = 3
const SPEED = 2.6
const EYE = 1.7

interface Interactable {
  mesh: THREE.Object3D
  kind: 'door' | 'document' | 'rubric' | 'prop'
  stationId: string
  label: string
  doc?: DocumentItem
  prop?: PropItem
  isLockedNow?: boolean
}

function inside(r: Rect, p: { x: number, z: number }, m = 0.25) {
  return p.x >= r.minX + m && p.x <= r.maxX - m && p.z >= r.minZ + m && p.z <= r.maxZ - m
}

export class OsceEngine {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private controls: PointerLockControls
  private hooks: EngineHooks
  private clock = new THREE.Clock()
  private raycaster = new THREE.Raycaster()
  private keys = new Set<string>()
  private dragging = false
  private frameId = 0
  private disposed = false
  /** Vue mematikan saat modal terbuka agar klik layar tidak mengunci pointer */
  lockEnabled = true

  private player = new THREE.Vector3(0, EYE, 3)
  private forward = new THREE.Vector3()
  private right = new THREE.Vector3()

  private corridorRect: Rect = { minX: -WALL_X + 0.4, maxX: WALL_X - 0.4, minZ: -40, maxZ: 4 }
  private extraRects: Rect[] = []
  private roomGroup: THREE.Group | null = null
  private openStationId: string | null = null

  private doors = new Map<string, { pivot: THREE.Group, open: boolean }>()
  private interactables: Interactable[] = []
  private hover: Interactable | null = null
  private phase: OscePhase = 'lobby'
  private activeStationId: string | null = null

  constructor(canvas: HTMLCanvasElement, hooks: EngineHooks) {
    this.hooks = hooks
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)

    this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
    this.camera.rotation.order = 'YXZ'
    this.camera.position.copy(this.player)

    this.scene.background = new THREE.Color(0xdfe4ec)
    this.scene.fog = new THREE.Fog(0xdfe4ec, 18, 62)
    this.controls = new PointerLockControls(this.camera, canvas)

    this.buildLights()
    this.buildShell()
    this.buildStations()
    this.buildChairs()

    canvas.addEventListener('click', this.onClick)
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('mousedown', this.onMouseDown)
    window.addEventListener('mousemove', this.onMouseMove)
    window.addEventListener('mouseup', this.onMouseUp)
    window.addEventListener('resize', this.onResize)

    this.loop()
  }

  // ===== lingkungan statis =====
  private buildLights() {
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8892a8, 1.15))
    const dir = new THREE.DirectionalLight(0xfff4e0, 1.0)
    dir.position.set(4, 8, 3)
    this.scene.add(dir)
    for (let z = 0; z > -40; z -= 7) {
      const p = new THREE.PointLight(0xf2f5ff, 8, 14, 2)
      p.position.set(0, 3.1, z)
      this.scene.add(p)
    }
  }

  private panel(w: number, h: number, tex: THREE.Texture): THREE.Mesh {
    return new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({ map: tex }),
    )
  }

  private buildShell() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(6.6, 50),
      new THREE.MeshStandardMaterial({ color: 0xdadfe6, roughness: 0.35, metalness: 0.35 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.z = -18
    this.scene.add(floor)

    // dinding koridor segmen: celah DOOR_W+0.5 di posisi tiap pintu
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
    const gapHalf = (DOOR_W + 0.5) / 2
    for (const sx of [-1, 1]) {
      let z0 = 6
      for (const st of stations) {
        const dz = this.stationZ(st.number)
        const segLen = (z0 - (dz + gapHalf))
        if (segLen > 0.01) {
          const seg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.4, segLen), wallMat)
          seg.position.set(sx * (WALL_X + 0.1), 1.7, z0 - segLen / 2)
          this.scene.add(seg)
        }
        z0 = dz - gapHalf
      }
      const segLen = z0 - (-43)
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.4, segLen), wallMat)
      seg.position.set(sx * (WALL_X + 0.1), 1.7, -43 + segLen / 2)
      this.scene.add(seg)
    }
    const ceil = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.15, 50), new THREE.MeshStandardMaterial({ color: 0xf2f3f7 }))
    ceil.position.set(0, 3.45, -18)
    this.scene.add(ceil)

    const stripMat = new THREE.MeshStandardMaterial({ color: 0xf6f8ff, emissive: 0xf0f4ff, emissiveIntensity: 1.4 })
    for (let z = 0; z > -42; z -= 4.5) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 1.4), stripMat)
      strip.position.set(0, 3.34, z)
      this.scene.add(strip)
    }

    const brandEnd = this.panel(6.6, 3.2, makeTextTexture(
      ['UKAI Labs', 'OSCE Center', '', 'Rangkaian 10 Station'],
      { bg: '#6d28d9', color: '#ffffff', fontSize: 72, lineHeight: 96 },
    ))
    brandEnd.position.set(0, 1.7, -42.9)
    this.scene.add(brandEnd)

    const brandLobby = this.panel(6.6, 3.2, makeTextTexture(
      ['UKAI Labs — OSCE Center', 'Selamat datang, Peserta 001', '', 'Klik pintu stasiun untuk memulai', 'E — baca papan skenario'],
      { bg: '#4c1d95', color: '#ffffff', fontSize: 60, lineHeight: 82 },
    ))
    brandLobby.position.set(0, 1.7, 4.9)
    brandLobby.rotation.y = Math.PI
    this.scene.add(brandLobby)
  }

  private buildStations() {
    for (const st of stations) {
      const side = st.roomSide === 'left' ? -1 : 1
      const z = this.stationZ(st.number)
      const doorGroup = new THREE.Group()
      doorGroup.position.set(side * WALL_X, 0, z)

      const frameMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 })
      const jambTop = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.15, DOOR_W + 0.3), frameMat)
      jambTop.position.set(0.02, DOOR_H + 0.075, 0)
      doorGroup.add(jambTop)
      for (const sz of [-1, 1]) {
        const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.18, DOOR_H, 0.15), frameMat)
        jamb.position.set(0.02, DOOR_H / 2, sz * (DOOR_W / 2 + 0.075))
        doorGroup.add(jamb)
      }

      // daun pintu dengan pivot engsel kiri
      const pivot = new THREE.Group()
      pivot.position.set(0.02, 0, -DOOR_W / 2)
      const leaf = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, DOOR_H, DOOR_W),
        new THREE.MeshStandardMaterial({ color: 0xcdd5e4, roughness: 0.6 }),
      )
      leaf.position.set(0, DOOR_H / 2, DOOR_W / 2)
      pivot.add(leaf)
      const knob = new THREE.Mesh(
        new THREE.SphereGeometry(0.05),
        new THREE.MeshStandardMaterial({ color: 0xd0a150, metalness: 0.9, roughness: 0.3 }),
      )
      knob.position.set(-0.1, 1.05, DOOR_W - 0.16)
      pivot.add(knob)
      doorGroup.add(pivot)
      this.scene.add(doorGroup)
      this.doors.set(st.id, { pivot, open: false })

      const sign = this.panel(DOOR_W + 0.6, 0.9, makeSignTexture(st.id))
      sign.position.set(side * (WALL_X - 0.06), DOOR_H + 0.65, z)
      sign.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2
      this.scene.add(sign)

      const clip = this.panel(0.34, 0.48, makeTextTexture(
        ['Skenario', `Station ${st.id}`, '', '(E untuk baca)'],
        { fontSize: 36, lineHeight: 48, bg: '#fdfdf7', color: '#1e293b' },
      ))
      clip.position.set(side * (WALL_X - 0.08), 1.55, z + 1.35)
      clip.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2
      this.scene.add(clip)

      const doc = st.documents.find(d => d.type === 'scenario_board') ?? st.documents[0]
      if (doc) {
        this.interactables.push({
          mesh: clip,
          kind: 'document',
          stationId: st.id,
          label: `Papan Skenario Kandidat — Station ${st.id}`,
          doc,
        })
      }
      this.interactables.push({
        mesh: pivot,
        kind: 'door',
        stationId: st.id,
        label: `Pintu Station ${st.id}`,
      })
    }
  }

  private buildChairs() {
    const seatGeo = new THREE.BoxGeometry(0.5, 0.32, 0.5)
    const backGeo = new THREE.BoxGeometry(0.5, 0.5, 0.07)
    const mat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.7 })
    const n = 28
    const seats = new THREE.InstancedMesh(seatGeo, mat, n)
    const backs = new THREE.InstancedMesh(backGeo, mat, n)
    const m = new THREE.Matrix4()
    let i = 0
    for (const sx of [-1, 1]) {
      for (let k = 0; k < 14; k++) {
        if (i >= n) break
        const z = -1.5 - k * 2.4
        m.makeRotationY(sx * (Math.PI / 2))
        m.setPosition(sx * 2.38, 0.36, z)
        seats.setMatrixAt(i, m)
        m.setPosition(sx * 2.38 + sx * 0.25, 0.62, z)
        backs.setMatrixAt(i, m)
        i++
      }
    }
    seats.count = i
    backs.count = i
    this.scene.add(seats, backs)
  }

  // ===== ruangan dinamis (lazy: hanya saat sesi ujian stasiun aktif) =====
  private spawnRoom(st: StationScenario) {
    if (this.roomGroup) this.disposeRoom()
    const side = st.roomSide === 'left' ? -1 : 1
    const doorZ = this.stationZ(st.number)
    const cx = side * (WALL_X + 2.6)

    const g = new THREE.Group()

    // dinding & langit ruangan (mem-enclose interior)
    const rWallMat = new THREE.MeshStandardMaterial({ color: 0xf5f2ec, roughness: 0.95 })
    const depth = 5.2
    const farX = side * (WALL_X + depth)
    const far = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.4, 4.5), rWallMat)
    far.position.set(farX + side * 0.1, 1.7, doorZ)
    g.add(far)
    for (const sz of [-1, 1]) {
      const zw = new THREE.Mesh(new THREE.BoxGeometry(depth, 3.4, 0.2), rWallMat)
      zw.position.set(side * (WALL_X + depth / 2), 1.7, doorZ + sz * 2.25)
      g.add(zw)
    }
    const roomCeil = new THREE.Mesh(
      new THREE.BoxGeometry(depth, 0.15, 4.5),
      new THREE.MeshStandardMaterial({ color: 0xeef0f4 }),
    )
    roomCeil.position.set(side * (WALL_X + depth / 2), 3.45, doorZ)
    g.add(roomCeil)
    for (let k = 1; k <= 2; k++) {
      const p = new THREE.PointLight(0xfff8ee, 6, 8, 2)
      p.position.set(side * (WALL_X + 2.6), 3.1, doorZ + (k === 1 ? 1.2 : -1.2))
      g.add(p)
    }

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 4.5),
      new THREE.MeshStandardMaterial({ color: 0xe9e2d6, roughness: 0.5 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.set(cx, 0.01, doorZ)
    g.add(floor)

    // meja konseling + monitor SIMRS
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.08, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.7 }),
    )
    table.position.set(cx - side * 0.2, 0.75, doorZ + 0.4)
    g.add(table)
    const legMat = new THREE.MeshStandardMaterial({ color: 0x5f3d22 })
    for (const lx of [-0.72, 0.72]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.74, 0.7), legMat)
      leg.position.set(table.position.x + side * lx, 0.37, table.position.z)
      g.add(leg)
    }

    const monitor = this.panel(0.7, 0.45, makeTextTexture(
      ['SIMRS', 'e-Farmasi', '', 'Pasien: Tn. M (56th)', 'Diagnosa: DM tipe 2'],
      { bg: '#0f766e', color: '#ffffff', fontSize: 40, lineHeight: 52 },
    ))
    monitor.position.set(cx + side * 0.45, 1.45, doorZ + 0.25)
    monitor.rotation.y = side < 0 ? -Math.PI / 2.4 : Math.PI / 2.4
    g.add(monitor)
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.08), new THREE.MeshStandardMaterial({ color: 0x222222 }))
    stand.position.set(monitor.position.x, 1.0, monitor.position.z)
    g.add(stand)

    // dokumen medis di meja
    const tableDocs = st.documents.filter(d => d.type === 'prescription' || d.type === 'lab_result' || d.type === 'rubric_checklist')
    tableDocs.forEach((doc, i) => {
      const paper = this.panel(0.32, 0.46, makeTextTexture(
        [wrap(doc.title, 16), wrap2(doc.title, 16), '', '(E — baca)'],
        { fontSize: 26, lineHeight: 34, bg: '#fbfaf4' },
      ))
      paper.rotation.set(-Math.PI / 2, 0, (side < 0 ? Math.PI : 0) + i * 0.25)
      paper.position.set(cx + side * (i * 0.3), 0.793 + i * 0.004, doorZ + 0.15 + i * 0.2)
      g.add(paper)
      this.interactables.push({
        mesh: paper,
        kind: doc.type === 'rubric_checklist' ? 'rubric' : 'document',
        stationId: st.id,
        label: doc.title,
        doc,
      })
    })

    // papan klip rubrik berdiri di meja
    if (st.documents.some(d => d.type === 'rubric_checklist')) {
      const rub = st.documents.find(d => d.type === 'rubric_checklist')!
      const board = this.panel(0.4, 0.55, makeTextTexture(
        ['Rubrik', `Station ${st.id}`, 'OSCE', '(E — isi)'],
        { fontSize: 34, lineHeight: 44, bg: '#eef2ff' },
      ))
      board.position.set(cx + side * 0.9, 1.15, doorZ - 0.6)
      board.rotation.y = side < 0 ? Math.PI / 3 : -Math.PI / 3
      g.add(board)
      this.interactables.push({ mesh: board, kind: 'rubric', stationId: st.id, label: `Checklist & Rubrik — Station ${st.id}`, doc: rub })
    }

    // prop obat 3D
    for (const prop of st.props3D) {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.12, 0.28),
        new THREE.MeshStandardMaterial({ color: prop.isCorrectChoice ? 0x166534 : 0x9f1239 }),
      )
      const label = this.panel(0.19, 0.1, makeTextTexture(
        prop.label.split(' ').slice(0, 3),
        { fontSize: 26, bg: prop.isCorrectChoice ? '#dcfce7' : '#fee2e2' },
      ))
      label.position.set(0, 0.02, 0.15)
      box.add(label)
      box.position.set(cx + side * prop.position[0], 0.83, doorZ + 0.9 + prop.position[2]
      )
      g.add(box)
      this.interactables.push({ mesh: box, kind: 'prop', stationId: st.id, label: prop.label, prop })
    }

    this.scene.add(g)
    this.roomGroup = g

    // area lakangmayap: ruang + celah pintu
    const room: Rect = side < 0
      ? { minX: -(WALL_X + 4.6), maxX: -(WALL_X - 0.2), minZ: doorZ - 2, maxZ: doorZ + 2 }
      : { minX: WALL_X + 0.2, maxX: WALL_X + 4.6, minZ: doorZ - 2, maxZ: doorZ + 2 }
    const doorway: Rect = { minX: -(WALL_X + 0.35), maxX: WALL_X + 0.35, minZ: doorZ - 0.7, maxZ: doorZ + 0.7 }
    this.extraRects = [room, doorway]
  }

  private disposeRoom() {
    if (!this.roomGroup) return
    const g = this.roomGroup
    this.roomGroup = null
    this.extraRects = []
    this.interactables = this.interactables.filter(it => !g.getObjectById(it.mesh.id))
    g.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose()
      const mat = mesh.material as THREE.MeshStandardMaterial | undefined
      if (mat?.map) mat.map.dispose()
      mat?.dispose()
    })
    this.scene.remove(g)
  }

  // ===== jalur komunikasi Vue =====
  updatePhase(phase: OscePhase, activeStationId: string | null) {
    const prev = this.phase
    this.phase = phase
    this.activeStationId = activeStationId

    if (prev !== 'exam' && phase === 'exam' && activeStationId) {
      sfx.bellStart()
      this.openDoor(activeStationId)
      this.spawnRoom(getStation(activeStationId))
      this.hooks.onToast('Bel mulai — pintu terbuka, masuk ke ruangan.')
    }
    if (prev === 'exam' && phase !== 'exam') {
      sfx.bellEnd()
      closeDoor(this.doors.get(this.openStationId ?? ''))
      this.openStationId = null
      this.player.set(0, EYE, this.stationZOfActive() + 2.5)
      this.camera.position.copy(this.player)
      setTimeout(() => this.disposeRoom(), 600)
      if (phase === 'rekap') this.hooks.onToast('Rangkaian selesai — buka rapor evaluasi.')
    }
  }

  private stationZOfActive() {
    if (!this.activeStationId) return 2
    const st = getStation(this.activeStationId)
    return this.stationZ(st.number)
  }

  private stationZ(n: number) {
    return 2 - (n - 1) * 4.5
  }

  teleport(target: 'lobby' | 'door' | 'room') {
    const z = this.stationZOfActive()
    if (target === 'lobby') {
      this.player.set(0, EYE, 3)
    }
    else if (target === 'door') {
      this.player.set(0, EYE, z + 1.8)
    }
    else {
      const st = this.activeStationId ? getStation(this.activeStationId) : null
      if (!st) { this.hooks.onToast('Tidak ada stasiun aktif untuk teleport.'); return }
      // ruangan belum dipanggil (mis. masih lobby) → spawn dulu sebagai preview
      if (!this.roomGroup || this.openStationId !== st.id) this.spawnRoom(st)
      const side = st.roomSide === 'left' ? -1 : 1
      const px = side * (WALL_X + 1.0)
      const pz = z + 1.0
      this.player.set(px, EYE, pz)
      // menghadap meja konseling
      const tx = side * (WALL_X + 2.6) - side * 0.2
      this.camera.rotation.y = Math.atan2(-(tx - px), -((z + 0.4) - pz))
      this.camera.rotation.x = 0
    }
    this.camera.position.copy(this.player)
    this.hooks.onToast(`Teleport: ${target === 'room' ? 'ruang stasiun aktif' : target === 'door' ? 'depan pintu stasiun aktif' : 'lorong tengah'}`)
  }

  private openDoor(stationId: string) {
    const d = this.doors.get(stationId)
    if (!d || d.open) return
    d.open = true
    this.openStationId = stationId
    sfx.doorOpen()
    gsap.to(d.pivot.rotation, { y: Math.PI * 0.55, duration: 0.9, ease: 'power2.out' })
  }

  // ===== input =====
  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return
    this.keys.add(e.code)
    if (e.code === 'KeyE' && this.controls.isLocked) this.interact()
  }

  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code)

  private onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) this.dragging = true
  }

  private onMouseUp = () => {
    this.dragging = false
  }

  private onMouseMove = (e: MouseEvent) => {
    if (!this.dragging || this.controls.isLocked || this.disposed) return
    // fallback drag look (tablet / tanpa pointer lock)
    this.camera.rotation.y -= e.movementX * 0.0035
    this.camera.rotation.x = THREE.MathUtils.clamp(this.camera.rotation.x - e.movementY * 0.0035, -1.3, 1.3)
  }

  private onClick = () => {
    if (!this.lockEnabled || this.disposed) return
    if (!this.controls.isLocked) {
      this.controls.lock()
      return
    }
    this.interact()
  }

  // E pada target hover; door saat lobby = minta mulai reading (diputus Vue)
  private interact() {
    const t = this.hover
    if (!t) return
    const locked = this.isDoorLocked(t)
    if (t.kind === 'door') {
      if (locked) {
        sfx.doorLocked()
        this.hooks.onToast(t.stationId === this.activeStationId
          ? 'Pintu terkunci — tunggu bel mulai.'
          : `Station ${t.stationId} belum jiliran Anda.`)
        return
      }
      if (this.phase === 'lobby') this.hooks.onDoorRequested(t.stationId)
      return
    }
    if (t.kind === 'prop') {
      this.hooks.onPropInspect(t.label, t.prop?.isCorrectChoice)
      return
    }
    if (t.doc) {
      sfx.paperFlip()
      this.hooks.onOpenDocument({ stationId: t.stationId, title: t.doc.title, type: t.doc.type, contentHtml: t.doc.contentHtml })
    }
  }

  private isDoorLocked(t: Interactable) {
    if (t.kind !== 'door') return false
    if (this.phase === 'lobby') return false
    if (this.phase === 'reading') return true
    return !(this.phase === 'exam' && this.activeStationId === t.stationId)
  }

  // ===== raycast per frame =====
  private updateHover() {
    if (this.phase === 'rekap') { this.setTooltip(null); return }
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera)
    const hits = this.raycaster.intersectObjects(this.interactables.map(it => it.mesh), false)
    let target: Interactable | null = null
    if (hits.length > 0 && hits[0].distance < 4.5) {
      target = this.interactables.find(it => it.mesh === hits[0].object) ?? null
    }
    const t = this.hover
    const changed = (t ?? null) !== (target ?? null) || (target && t && t.label !== target.label)
    if (changed) this.setTooltip(target ? this.tooltipFor(target) : null)
    if (target) target.isLockedNow = this.isDoorLocked(target)
    this.hover = target
  }

  private tooltipFor(t: Interactable): TooltipInfo {
    if (t.kind === 'door') {
      const locked = this.isDoorLocked(t)
      return { title: `Pintu Station ${t.stationId}`, subtitle: locked ? 'Terkunci — tunggu bel mulai' : 'Tekan E / klik untuk buka' }
    }
    if (t.kind === 'prop') return { title: t.label, subtitle: 'Prop konseling — inspect' }
    return { title: t.label, subtitle: 'Baca dokumen — tekan E' }
  }

  private setTooltip(info: TooltipInfo | null) {
    this.hooks.onTooltip(info)
  }

  // ===== loop =====
  private loop = () => {
    if (this.disposed) return
    this.frameId = requestAnimationFrame(this.loop)
    const dt = Math.min(this.clock.getDelta(), 0.05)

    if (this.controls.isLocked) {
      this.forward.set(0, 0, -1).applyQuaternion(this.camera.quaternion)
      this.forward.y = 0
      this.forward.normalize()
      this.right.set(1, 0, 0).applyQuaternion(this.camera.quaternion)
      const move = this.forward.clone()
      if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) move.add(this.forward)
      if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) move.sub(this.forward)
      if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) move.sub(this.right)
      if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) move.add(this.right)
      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(SPEED * dt)
        const nx = this.player.x + move.x
        const nz = this.player.z + move.z
        const tryMove = (x: number, z: number) => this.validPos(x, z)
        if (tryMove(nx, nz)) {
          this.player.x = nx
          this.player.z = nz
        }
        else if (tryMove(nx, this.player.z)) this.player.x = nx
        else if (tryMove(this.player.x, nz)) this.player.z = nz
        this.camera.position.set(this.player.x, EYE, this.player.z)
      }
    }

    this.updateHover()
    this.renderer.render(this.scene, this.camera)
  }

  private validPos(x: number, z: number) {
    const p = { x, z }
    if (inside(this.corridorRect, p)) return true
    for (const r of this.extraRects) if (inside(r, p)) return true
    return false
  }

  // ===== situasi lain =====
  private onResize = () => {
    const c = this.renderer.domElement
    this.renderer.setSize(c.clientWidth, c.clientHeight, false)
    this.camera.aspect = c.clientWidth / c.clientHeight
    this.camera.updateProjectionMatrix()
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.frameId)
    this.controls.unlock()
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('mousedown', this.onMouseDown)
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('mouseup', this.onMouseUp)
    window.removeEventListener('resize', this.onResize)
    this.disposeRoom()
    this.renderer.dispose()
  }
}

function closeDoor(d?: { pivot: THREE.Group, open: boolean }) {
  if (!d) return
  d.open = false
  gsap.to(d.pivot.rotation, { y: 0, duration: 0.7, ease: 'power2.in' })
}

function wrap(text: string, at: number) {
  return text.slice(0, at)
}

function wrap2(text: string, at: number) {
  return text.length > at ? `… ${text.slice(at, at + 14)}` : ''
}
