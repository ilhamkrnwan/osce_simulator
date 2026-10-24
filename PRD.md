
# Product Requirements Document (PRD)

**Nama Proyek:** UKAI Labs — OSCE Center 3D (Full Edition)[cite: 1, 2]
**Platform:** Web Application (Desktop & Tablet Browser - WebGL/Three.js)
**Target Port Dev:** `http://127.0.0.1:5173` (Vite)[cite: 1]

---

## 1. Visi & Tujuan Produk

Membangun platform simulasi ujian klinik 3D berbasis web untuk persiapan **OSCE (Objective Structured Clinical Examination) Apoteker** di Indonesia[cite: 1, 2]. Aplikasi ini mereplikasi pengalaman nyata rangkaian 10 stasiun ujian mulai dari menunggu di lorong klinik, membaca skenario di depan pintu saat waktu baca, masuk ke ruang stasiun saat bel berbunyi, berinteraksi dengan dokumen/obat 3D, hingga melakukan konseling dan evaluasi rubrik[cite: 1, 2].

---

## 2. Arsitektur Teknis & Tech Stack

> **Catatan realisasi:** rencana awal Vite + vanilla dijalankan sebagai **Nuxt 4 (SPA) + Pinia + Three.js r186** — sudah stabil dan dipilih dipertahankan. State 'Zustand' direalisasikan Pinia. Aset furnitur medis dari **Innerscene CC0** (`public/models`, dikompres `gltfpack -cc`); prop obat spesifik dibuat **prosedural + CanvasTexture** (generator AI/MCP tidak dipakai karena tidak ada MCP server tersedia saat pengerjaan).

* **Framework & Dev Server:** Nuxt 4 (SPA, `ssr: false`), dev server `127.0.0.1:5173`.
* **3D Rendering Engine:** Three.js (Modular ES6) — PointerLockControls, GLTFLoader, InstancedMesh, GSAP.
* **State Management:** Pinia (`app/stores/osce.ts` — FSM ujian, timer, rotasi 10 stasiun, skor rubrik).
* **UI & HUD Layer:** Tailwind CSS v4 (HTML DOM Overlay terpisah dari WebGL Canvas untuk ketajaman teks).
* **3D Asset Pipeline:**
  * Furnitur medis ruangan: Innerscene CC0 (meja periksa, monitor tanda vital).
  * Prop medis spesifik: geometri prosedural + `CanvasTexture` (bukan file .glb).
  * Optimasi: `npx gltfpack -i in.glb -o out.glb -cc`.
* **Audio Engine:** Web Audio API Synthesizer (bel, pintu, kertas, langkah tindakan) + ambience rumah sakit + mute global.

---

## 3. Alur Pengguna & State Machine Ujian (Core Loop)

Setiap stasiun dalam rangkaian 10 stasiun memiliki siklus *Finite State Machine (FSM)* berikut[cite: 1, 2]:

1. **`LOBBY_OVERVIEW`**
   * Pemain memilih mode ujian: **Mode Latihan** (bebas pilih stasiun & bisa lewati waktu) atau **Mode Simulasi Penuh** (10 stasiun berurutan sesuai timer resmi)[cite: 1, 2].
2. **`READING_PHASE` (Waktu Baca - 60 Detik)**
   * Pemain berada di lorong di depan pintu stasiun aktif (misal: `Station 01`)[cite: 1, 2].
   * Status pintu: **Terkunci - Tunggu bel mulai**[cite: 2].
   * Notifikasi bawah muncul: *"Waktu baca dimulai. Giliran Anda: Station X. Semua pintu masih terkunci."*[cite: 1, 2].
   * Pemain dapat mengarahkan kursor ke papan klip soal di dinding luar (`E - Baca / masuk`) untuk membuka modal skenario kandidat[cite: 1, 2].
   * Di Mode Latihan, tersedia tombol **"Lewati sisa waktu ->"** untuk langsung membuka pintu[cite: 1, 2].
3. **`EXAM_PHASE` (Sesi Ruangan - 9 Menit)**
   * Bel berbunyi, kunci pintu terbuka, dan pemain masuk ke dalam ruang stasiun.
   * Pemain berinteraksi dengan objek di meja/ruangan:
     * **Kertas 3D (Modal Reader):** Lembar Resep, Rekam Medis/Lab, literatur (IONI/PERKENI), dan Lembar Kerja.
     * **Prop Obat & Alkes 3D:** Kotak obat, botol sirup, inhaler, insulin pen, tensimeter (dapat diinspeksi/dipilih).
     * **Simulasi Pasien / Penguji (NPC):** Sistem dialog interaktif atau checklist tindakan konseling (KIE)[cite: 1, 2].
4. **`STATION_COMPLETE` & `ROTATION_TRANSITION`**
   * Bel selesai berbunyi. Sistem menyimpan skor rubrik stasiun tersebut.
   * Tracker kanan atas diperbarui (misal dari `0/10 selesai` menjadi `1/10 selesai`) dan mengarahkan pemain ke pintu stasiun berikutnya (`02` s/d `10`)[cite: 1, 2].

---

## 4. Spesifikasi Fitur & Komponen (Functional Requirements)

### 4.1. Lingkungan 3D (WebGL Scene)

* **Koridor Utama (OSCE Center Hallway):**
  * Lorong memanjang dengan 10 pintu stasiun (5 di sisi kiri, 5 di sisi kanan)[cite: 1].
  * Plang penunjuk warna ungu di atas tiap pintu (`STATION 01 | 01` hingga `STATION 10 | 10`)[cite: 1, 2].
  * Deretan kursi tunggu biru di sepanjang dinding lorong yang di-render menggunakan `InstancedMesh`[cite: 1].
  * Papan klip (*clipboard*) skenario yang menempel di dinding samping tiap pintu stasiun[cite: 1, 2].
  * Papan branding **UKAI Labs OSCE Center** di ujung koridor dan pencahayaan lampu plafon LED[cite: 1].
* **Interior Ruang Stasiun (Lazy-Loaded / Dynamic):**
  * Hanya me-render isi furnitur & prop medis untuk stasiun yang sedang aktif agar memori tetap hemat.
  * Meja konseling, kursi apoteker & pasien, komputer SIMRS, rak obat, dan prop sesuai topik stasiun.
* **Kontrol & Navigasi Pemain:**
  * *First-Person Controller* dengan `PointerLockControls` (`WASD / panah - Berjalan`, `Mouse - Melihat`, `E - Baca / masuk`, `Esc - Menu`)[cite: 1, 2].
  * *Bounding Box Collision* agar pemain tidak menembus dinding, kursi, atau pintu yang masih terkunci[cite: 1, 2].
  * Fitur aksesibilitas tambahan: *Quick Camera Teleport* untuk pengguna yang mengalami *motion sickness*.

### 4.2. Antarmuka Pengguna (2D HUD & Modals)

* **Top Bar:**
  * Kiri: Logo & teks **UKAI Labs OSCE Center** beserta tombol Mute/Unmute Audio[cite: 1, 2].
  * Kanan: Badge **RANGKAIAN 10 STATION**, ID pengguna (**Peserta 001**), dan tombol **Menu Esc**[cite: 1, 2].
* **Kartu Status Stasiun (Kiri Atas):**
  * Menampilkan teks `GILIRAN ANDA`, nomor stasiun (`Station 01`), deskripsi tugas (contoh: *Konseling Informasi dan Edukasi resep untuk pasien diabetes melitus*), badge `Mode Latihan`, kotak `Waktu baca 00:58`, dan tombol `Lewati sisa waktu ->`[cite: 1, 2].
* **Panel Tracker Rotasi (Kanan Atas):**
  * Menampilkan progres `0/10 selesai`, label `Rotasi`, dan grid nomor `01` sampai `10` dengan indikator warna untuk stasiun aktif, selesai, dan belum dikerjakan[cite: 1, 2].
* **Crosshair & Floating Context Tooltip (Tengah):**
  * Reticle lingkaran di tengah layar[cite: 2].
  * Saat diarahkan ke pintu atau objek interaktif, muncul kartu mengambang (contoh: **Pintu Station 01 — Terkunci - Tunggu bel mulai**)[cite: 2].
* **Bottom HUD:**
  * Toast informasi status di bagian tengah bawah[cite: 1, 2].
  * Petunjuk kontrol keyboard/mouse di pojok kiri bawah[cite: 1, 2].
* **Modal Pembaca Dokumen (3D Paper to 2D High-Res Modal):**
  * Saat kertas 3D di dinding atau meja diklik (`E` / Klik Kiri), muncul modal beresolusi tinggi untuk membaca skenario, resep dokter, hasil lab, dan mengisi checklist rubrik penilaian.

---

## 5. Struktur Data Skenario (Data-Driven Schema)

Seluruh konten medis 10 stasiun wajib dipisahkan dari kode 3D dalam format JSON/TypeScript:

```typescript
export interface StationScenario {
  id: string; // "01" - "10"
  number: number;
  title: string; // e.g., "Konseling Informasi dan Edukasi resep untuk pasien diabetes melitus"
  competencyCategory: "KIE" | "Skrining_Resep" | "Swamedikasi" | "Compounding" | "Monitoring_Efek_Samping";
  readDurationSec: number; // default: 60
  examDurationSec: number; // default: 540
  roomSide: "left" | "right";
  corridorZIndex: number;
  documents: {
    id: string;
    title: string;
    type: "scenario_board" | "prescription" | "lab_result" | "rubric_checklist";
    position: [number, number, number];
    contentHtml: string;
  }[];
  props3D: {
    id: string;
    modelPath: string;
    label: string;
    position: [number, number, number];
    isCorrectChoice?: boolean;
  }[];
  rubricItems: {
    id: string;
    category: string;
    label: string;
    weight: number;
  }[];
}
```
