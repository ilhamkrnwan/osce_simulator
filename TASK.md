# TASK.md — status realisasi (disinkronkan dengan kode, Okt 2026)

> Kode dijalankan di **Nuxt 4 + Pinia + Three.js** (bukan Vite vanilla — lihat PRD §2 catatan realisasi).
> Semua item di bawah sudah direalisasi dalam struktur Nuxt: `app/game/`, `app/stores/`, `app/data/`, `app/components/`, `app/pages/`.

## Fase 1: Project Scaffolding & Core Setup — ✅ selesai

- [x] **1.1.** Nuxt 4 (SPA, ssr:false) di `127.0.0.1:5173`; deps: `three`, `gsap`, `pinia`, `tailwindcss`, `@lucide/vue`, `@nuxt/fonts`.
- [x] **1.2.** Struktur modular (Nuxt): `app/game/` (engine, audio, textures), `app/stores/osce.ts`, `app/data/stations.ts`, `app/components/`, `app/pages/`, `public/models/`.

## Fase 2: State Machine & Data Skenario 10 Stasiun — ✅ selesai

- [x] **2.1.** `useOsceStore`: mode (LATIHAN|SIMULASI), phase (`lobby|reading|exam|rekap`), timer, `checkedItems`, `completed`, `stepProgress`, `wrongSteps`, aksi `startReadingPhase/skipReadingTime/enterRoom/tick/completeStation/toggleRubricItem/autoCheckCategory/recordStep/reset`, persist localStorage (`osce-progress-v1`).
- [x] **2.2.** Konten medis 10 stasiun selevel penting: Station 01 penuh (10 butir); 02–10 skenario + rubrik ringkas (6–10 butir) + dokumen/prop: diare anak (03), skrining resep interaksi (04), inhaler (02), insulin pen (05), peracikan (06), MESO (07), cold chain (08), rekonstitusi (09), ibu hamil/menyusui (10).
  - shortcut: konten stasiun 02–10 masih draft klinik standar — perlu validasi tenaga farmasi sebelum dipakai pelatihan resmi.

## Fase 3: Pembangunan Dunia 3D & Optimasi Koridor — ✅ selesai

- [x] **3.1.** Koridor (lantai, dinding segmen bertirai celah pintu, plafon, LED strip, backdrop UKAI Labs); kursi tunggu `InstancedMesh` (2 draw call) **dengan collider AABB**.
- [x] **3.2.** 10 pintu kusen + daun pivot engsel (gsap swing), plang ungu dua sisi, papan klip skenario interaktif per pintu; **pintu tertutup kini penghalang fisik** (AABB di celah dinding).
- [x] **3.3.** First-person controller (WASD/panah, PointerLockControls + drag fallback), collision AABB (koridor + ruangan + kursi + pintu tertutup).

## Fase 4: Interior Ruangan, Kertas 3D, Aset — ✅ selesai (dengan koreksi jalur)

- [x] **4.1.** Lazy room spawn per stasiun aktif (spawn saat masuk exam / teleport, auto-dispose + free geometri/tekstur saat pindah).
- [x] **4.2.** CanvasTexture generator + raycast reticle reset/klik (< 4.5 m) dengan highlight tooltip.
- [x] **4.3. (koreksi jalur)** Innerscene CC0 (meja periksa + monitor tanda vital) diunduh manual → `npx gltfpack -cc` → intigrasi GLTFLoader per-spawn dengan cache.
  - shortcut: generator AI MCP tidak dipakai — tidak ada MCP server tersedia; prop farmasi spesifik = geometri prosedural + CanvasTexture (label).

## Fase 5: HUD, Modal, & Evaluasi — ✅ selesai

- [x] **5.1.** Top bar (UKAI Labs, RANGKAIAN 10 STATION, Peserta 001, **tombol Menu**), kartu kiri (giliran, timer, **skip hanya Mode Latihan**), tracker grid 01–10 (klik → hanya Mode Latihan di lobby), tooltip tengah, toast & legenda bawah. **Teleport disembunyikan dalam SIMULASI.**
- [x] **5.2.** DocModal: font scaler A−/A+, **tab pindah antar-dokumen meja**, **tombol Print**, Esc/klik tutup.
- [x] **5.3.** Rubrik checklist interaktif (bobot, skor berjalan) + **Rapor Evaluasi OSCE** (skor per stasiun, lulus ≥ 70, butir belum dipenuhi).

## Fase 6: Audio, Optimasi Akhir & QA — ✅ selesai (dengan shortcut)

- [x] **6.1.** SFX Web Audio: bel mulai/selesai, pintu buka/terkunci, kertas, klik langkah benar/salah/selesai + **mute global** (HUD & Menu) + **ambience rumah sakit** (loop file `public/audio/ambience.mp3` bila ada; fallback hum klinis + beep — degradasi aman tanpa file).
- [x] **6.2.** Dispose ruangan lengkap; GLB cache tidak ter-destroy di disposeRoom (marker userData), dispose penuh saat mesin mati; FPS audit manual via build produksi (tanpa FPS meter permanen).
  - shortcut: audit 60 FPS belum otomatis/berkelanjutan; jalankan `npm run build && node .output/server/index.mjs`, cek performa manual per stasiun kalau jarak berpindah terasa jatuh.
