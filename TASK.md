## Fase 1: Project Scaffolding & Core Setup

- [ ] **1.1. Inisialisasi Vite + TypeScript:**
  - Buat proyek baru Vite di port `5173` (`vite.config.ts` -> `server: { host: '127.0.0.1', port: 5173 }`)[cite: 1].
  - Install dependencies utama: `three`, `@types/three`, `zustand`, `tailwindcss`, `lucide-react` (atau icon set), dan `gsap` (untuk animasi kamera/pintu yang mulus).
- [ ] **1.2. Struktur Direktori Modular:**
  - Buat struktur folder:
    - `src/core/` (SceneManager, Renderer, CameraController, Raycaster, AudioEngine)
    - `src/world/` (CorridorBuilder, StationRoomBuilder, DoorManager, InstancedProps)
    - `src/state/` (useOsceStore.ts - FSM ujian, timer, skor, rotasi 10 stasiun)
    - `src/data/` (stationsData.ts - JSON schema untuk Station 01 s/d Station 10)
    - `src/ui/` (HUD overlay, StationCard, RotationGrid, DocumentModal, EvaluationModal)
    - `public/models/` (Tempat menyimpan aset `.glb` terkompresi)

---

## Fase 2: State Machine & Data Skenario 10 Stasiun

- [ ] **2.1. Implementasi Store Ujian (`useOsceStore`):**
  - Buat state: `activeStationId` (`01` s/d `10`), `phase` (`READING` | `EXAM` | `COMPLETED`), `timeLeft`, `completedStations` (`string[]`), `mode` (`LATIHAN` | `UJIAN`), dan `rubricScores`[cite: 1, 2].
  - Buat action: `startReadingPhase()`, `skipReadingTime()`, `unlockAndOpenDoor()`, `completeStation()`, `selectStation(id)`[cite: 1, 2].
- [ ] **2.2. Penyusunan Data 10 Stasiun (`stationsData.ts`):**
  - Isi penuh skenario medis untuk 10 stasiun OSCE Apoteker:
    - **Station 01:** Konseling Informasi dan Edukasi resep pasien Diabetes Melitus (Glimepiride & Metformin)[cite: 1, 2].
    - **Station 02:** Konseling penggunaan alat khusus (Inhaler Asma / Turbuhaler).
    - **Station 03:** Pelayanan Swamedikasi (Diare Anak / Konstipasi / Dyspepsia).
    - **Station 04:** Skrining Resep & Penyelesaian Masalah Klinis (Interaksi Obat Hipertensi + Kolesterol).
    - **Station 05:** Konseling Penggunaan Insulin Pen & Penanganan Hipoglikemia.
    - **Station 06 - 10:** Compounding/Peracikan, Monitoring Efek Samping Obat (MESO), Pengelolaan Cold Chain (Vaksin), Antibiotik Pediatri, dan Konseling Ibu Hamil/Menyusui.

---

## Fase 3: Pembangunan Dunia 3D & Optimasi Koridor

- [ ] **3.1. Koridor Modular & `InstancedMesh`:**
  - Bangun geometri koridor rumah sakit dengan lantai reflektif halus, dinding berpanel, lampu plafon LED, dan backdrop resepsionis **UKAI Labs OSCE Center** di ujung lorong[cite: 1].
  - Gunakan `THREE.InstancedMesh` untuk me-render deretan kursi tunggu biru di sepanjang kiri-kanan lorong dalam 1 *draw call*[cite: 1].
- [ ] **3.2. Sistem 10 Pintu, Plang Stasiun, & Papan Klip Dinding:**
  - Buat 10 kusen dan daun pintu dengan pivot engsel yang akurat[cite: 1, 2].
  - Pasang plang gantung ungu dua sisi (`STATION 01 | 01` s/d `STATION 10 | 10`) di atas masing-masing pintu[cite: 1, 2].
  - Pasang papan klip (*clipboard*) skenario di dinding sebelah pintu untuk setiap stasiun[cite: 1, 2].
- [ ] **3.3. First-Person Controller & Collision System:**
  - Implementasikan jalan `WASD / Arrow Keys` dan rotasi kamera `PointerLockControls` + fallback drag mouse[cite: 1, 2].
  - Tambahkan *AABB Collision Detection* untuk batas dinding koridor, kursi tunggu, dan penghalang pintu saat masih berstatus `Terkunci`[cite: 1, 2].

---

## Fase 4: Interior Ruangan, Kertas 3D, & Integrasi Aset (MCP)

- [ ] **4.1. Dynamic Interior Spawner:**
  - Buat sistem yang me-load isi ruang stasiun (meja dokter/apoteker, kursi pasien, monitor SIMRS, poster klinis) ketika pemain mendekati atau membuka pintu stasiun aktif.
- [ ] **4.2. Kertas 3D Bertekstur Kanvas & Raycasting:**
  - Buat modul generator `CanvasTexture` untuk kertas 3D (Skenario Dinding, Resep Dokter, Map Hasil Lab, Papan Klip Rubrik).
  - Implementasikan *Raycaster* dari titik tengah layar (reticle) yang mendeteksi jarak dekat (< 4.5 meter) dan menampilkan *highlight* beserta tooltip konteks[cite: 2].
- [ ] **4.3. Pipeline Aset 3D Gratis & MCP Generator:**
  - Integrasikan aset `.glb` CC0 (kursi, meja, komputer) atau gunakan MCP Server (Blender MCP / Hugging Face Trellis / TripoSR) untuk men-generate prop farmasi spesifik (kotak obat, inhaler, botol sirup, insulin pen).
  - Jalankan script kompresi `npx gltfpack -i input.glb -o output.glb -cc` untuk semua aset baru.

---

## Fase 5: Antarmuka HUD, Modal Dokumen, & Evaluasi

- [ ] **5.1. Replikasi Presisi HUD Ujian:**
  - Buat komponen Top Bar (**UKAI Labs OSCE Center**, **RANGKAIAN 10 STATION**, **Peserta 001**, **Menu Esc**)[cite: 1, 2].
  - Buat Kartu Kiri (**GILIRAN ANDA**, Judul Stasiun, **Mode Latihan**, **Waktu baca**, tombol **Lewati sisa waktu ->**)[cite: 1, 2].
  - Buat Kartu Kanan (**0/10 selesai**, **Rotasi**, tombol grid `01` s/d `10` yang bisa diklik untuk berpindah stasiun di Mode Latihan)[cite: 1, 2].
  - Buat Tooltip Tengah (**Pintu Station XX — Terkunci - Tunggu bel mulai**) dan Bar Bawah (Toast status & legenda tombol `WASD`, `Mouse`, `E`, `Esc`)[cite: 1, 2].
- [ ] **5.2. High-Resolution Document Reader Modal:**
  - Buat modal baca dokumen saat kertas 3D diklik atau tombol `E` ditekan[cite: 1, 2].
  - Tambahkan fitur *Font Size Scaler* (`A-` / `A+`), tab perpindahan cepat antar-dokumen di meja, dan tombol cetak/ringkasan.
- [ ] **5.3. Sistem Rubrik Interaktif & Rekap Skor Akhir:**
  - Buat checklist rubrik penilaian di dalam modal di mana pengguna dapat mencentang poin-poin konseling yang sudah dilakukan.
  - Buat layar **Rapor Evaluasi OSCE** yang menampilkan nilai per stasiun dan status kelulusan (*Passing Grade*) setelah stasiun selesai.

---

## Fase 6: Audio, Optimasi Akhir & QA

- [ ] **6.1. Sound Effects (Web Audio API):**
  - Integrasikan bunyi bel stasiun (*ting-tong* saat waktu baca habis dan saat waktu ujian selesai), suara buka/tutup pintu, suara kertas dibalik, dan bunyi klik pintu terkunci.
- [ ] **6.2. Audit Performa & Memory Leak:**
  - Pastikan geometri dan tekstur interior stasiun lama di-*dispose* saat berpindah stasiun.
  - Uji coba navigasi penuh dari Station 01 sampai Station 10 dan pastikan FPS stabil di 60 FPS.
