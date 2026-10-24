
# UKAI Labs — OSCE Center 3D (Simulasi Konseling Apoteker)

Aplikasi web interaktif berbasis 3D untuk simulasi **OSCE (Objective Structured Clinical Examination)** Apoteker. Proyek ini mensimulasikan alur ujian klinik mulai dari fase baca soal di lorong stasiun, pembukaan pintu ruangan saat bel berbunyi, hingga interaksi pembacaan dokumen medis dan pengisian rubrik penilaian di dalam ruang konseling.

---

## Fitur Utama

* **Lingkungan 3D Modular & Ringan**
  * Koridor klinik dengan deretan stasiun (`Station 01` hingga `Station 10`), kursi tunggu (InstancedMesh + collider), lampu plafon, dan area resepsionis.
  * Ruang konseling per stasiun (lazy-spawn & auto-dispose per stasiun aktif) lengkap dengan meja konseling, monitor SIMRS e-Farmasi, prop obat 3D, meja periksa + monitor tanda vital (aset GLB CC0).
* **10 Stasiun Uji Data-Driven**
  * Station 01–10 dengan skenario, dokumen medis (resep/lab), rubrik berbobot, dan prop 3D per stasiun (`app/data/stations.ts`).
  * Stasiun skill (02, 05, 06, 08, 09) punya **mekanik langkah prosedur 3D**: klik hotspot langkah berurutan; salah urutan membatalkan butir rubrik "Urutan".
  * Stasiun pemeriksaan (03, 04, 10) memakai **pemilihan prop benar/salah** → butir rubrik "Pemilihan" terisi otomatis.
* **4 Kertas & Dokumen 3D Interaktif (Raycasting + Modal Reader)**
  * Lembar Skenario Kandidat (papan klip dinding luar), Lembar Resep Dokter, Hasil Laboratorium & Rekam Medis, dan Checklist & Rubrik Penilaian OSCE.
* **Modal Pembaca Dokumen (Document Viewer)**
  * Modal beresolusi tinggi di atas canvas 3D, pengatur ukuran huruf (`A-`/`A+`), tab pindah antar-dokumen di meja, dan tombol print.
* **Sistem Alur & Timer OSCE (FSM)**
  * Rangkaian `lobby → reading (60 dtk) → exam (540 dtk) → rekap`. Mendukung **Mode Latihan** (bebas pilih stasiun, skip waktu, teleport) dan **Mode SIMULASI** (10 stasiun berurutan tanpa skip/teleport).
  * **Rapor Evaluasi OSCE**: rekap skor per stasiun, lulus/gagal (≥ 70), dan daftar butir rubrik yang belum dipenuhi.
  * Efek suara sintetis berbasis **Web Audio API** + ambience ruang sakit (degrading tanpa file) tanpa ketergantungan aset audio eksternal. Mute dari Menu.
* **Navigasi Ganda & Berkembang (Manual & Teleportasi)** — Mode Latihan
  * Pergerakan first-person (WASD, pointer lock + drag fallback), tombol Quick Teleport, dan fitur aksesibilitas untuk pengguna dengan motion sickness.
* **Progres tersimpan otomatis** (localStorage) — mode, skor, rubrik, dan langkah prosedur mulus restore saat browser dibuka lagi.

---

## Teknologi yang Digunakan

| Komponen                     | Teknologi                                                 | Keterangan                                                                                                |
| :--------------------------- | :-------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **Framework**          | [Nuxt 4](https://nuxt.com/) (SPA, ssr: false)              | Struktur `app/` (pages, components, stores, data, game).                                                   |
| **3D Engine**          | [Three.js](https://threejs.org/) (r186)                    | Rendering WebGL, GLTFLoader (asek `.glb`), InstancedMesh, *Raycasting*, gsap untuk animasi engsel pintu. |
| **State Management**   | [Pinia](https://pinia.dev/)                                 | FSM ujian, timer stasiun, rubrik & skor, rotasi 10 stasiun, persist localStorage.                          |
| **Tekstur Prosedural** | HTML5 `CanvasTexture`                                     | Merender tulisan pada kertas 3D, plang stasiun, dan layar komputer secara dinamis tanpa file gambar.       |
| **Aset 3D**            | Innerscene CC0 (meja periksa & monitor tanda vital), dikompres `gltfpack -cc` | Prop furnitur medis realistis; prop obat tetap geometri prosedural + label CanvasTexture.               |
| **UI & HUD Overlay**   | [Tailwind CSS](https://tailwindcss.com/) (v4)              | Antarmuka HUD ujian, kartu status stasiun, modal dokumen, rapor, menu.                                     |
| **Sound Engine**       | Web Audio API                                             | Sintesis gelombang suara real-time untuk bel, pintu, kertas, langkah, ambience.                            |
| **Font**               | `@nuxt/fonts` (Plus Jakarta Sans & JetBrains Mono)         | Tipografi antarmuka medis dan penunjuk waktu.                                                              |

---

## Kontrol Navigasi

| Input / Tombol                           | Fungsi                                                                                  |
| :--------------------------------------- | :--------------------------------------------------------------------------------------- |
| `W` `A` `S` `D` / `Arrow Keys` | Berjalan mengelilingi lorong dan masuk ke ruang konseling                                 |
| `Drag Mouse Kiri` / `Pointer Lock`   | Mengarahkan pandangan kamera 360 derajat                                                 |
| `Klik Kiri` atau Tombol `E`          | Membuka pintu stasiun, membaca kertas dokumen 3D, atau mengerjakan langkah tindakan       |
| `Esc`                                  | Menutup modal / menu                                                     |

---

## Cara Menjalankan Proyek

```bash
npm install
npm run dev     # buka http://127.0.0.1:5173
```

Test & lint:

```bash
npm run test    # vitest — FSM, skor rubrik, mekanik langkah
npm run lint    # @nuxt/eslint
```

Build produksi:

```bash
npm run build && node .output/server/index.mjs
```

---

## Struktur Direktori

```
app/
├── components/     # GameCanvas, HudOverlay, DocModal, RaporModal, MenuModal
├── data/           # stations.ts — skenario + rubrik + langkah prosedur 10 stasiun
├── game/           # engine.ts (Three.js), audio.ts, textures.ts
├── pages/          # index.vue
├── plugins/        # osce-persist.client.ts (localStorage)
└── stores/         # osce.ts — FSM ujian
public/
└── models/         # exam-table.glb, vital-monitor.glb (CC0, gltfpack)
tests/
└── osce-store.test.ts
```
