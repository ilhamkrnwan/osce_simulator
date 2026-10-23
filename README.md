
# UKAI Labs — OSCE Center 3D (Simulasi Konseling Apoteker)

Aplikasi web interaktif berbasis 3D untuk simulasi **OSCE (Objective Structured Clinical Examination)** Apoteker[cite: 1, 2]. Proyek ini mensimulasikan alur ujian klinik mulai dari fase baca soal di lorong stasiun, pembukaan pintu ruangan saat bel berbunyi, hingga interaksi pembacaan dokumen medis dan pengisian rubrik penilaian di dalam ruang konseling[cite: 1, 2].

---

## Fitur Utama

* **Lingkungan 3D Modular & Ringan**
  * Koridor klinik dengan deretan stasiun (`Station 01` hingga `Station 10`), kursi tunggu, lampu plafon, dan area resepsionis[cite: 1, 2].
  * Ruang konseling **Station 01** lengkap dengan meja periksa, monitor SIMRS e-Farmasi, kemasan obat 3D (*Glimepiride* & *Metformin*), kursi pasien, dan poster pedoman klinis.
* **4 Kertas & Dokumen 3D Interaktif (Raycasting + Modal Reader)**
  * **Lembar Skenario Kandidat** (Papan klip di dinding luar dekat pintu Station 01)[cite: 1, 2].
  * **Lembar Resep Dokter** (Kertas resep di atas meja konseling).
  * **Hasil Laboratorium & Rekam Medis** (Map biru berisi data GDP, GDPP, HbA1c, dan eGFR).
  * **Checklist & Rubrik Penilaian OSCE** (Papan klip interaktif untuk simulasi penilaian mandiri dengan kalkulasi skor kelulusan otomatis).
* **Modal Pembaca Dokumen (Document Viewer)**
  * Tampilan baca beresolusi tajam di atas canvas 3D agar teks klinis dan angka laboratorium mudah dibaca.
  * Fitur pengatur ukuran huruf (`A-` / `A+`) dan navigasi pindah antar-dokumen secara langsung.
* **Sistem Alur & Timer OSCE**
  * Mendukung fase **Waktu Baca (00:58)** di depan pintu terkunci dan transisi ke **Sesi Konseling (09:00)** saat pintu dibuka[cite: 1, 2].
  * Efek suara sintetis berbasis **Web Audio API** (suara bel stasiun, engsel pintu, dan efek membalik kertas) tanpa ketergantungan aset audio eksternal.
* **Navigasi Ganda (Manual & Teleportasi)**
  * Pergerakan bebas *First-Person* maupun tombol *Quick Teleport* (**Lorong Tengah**, **Depan Pintu St.01**, **Meja Konseling**) untuk kemudahan pengujian dan akses di berbagai perangkat.

---

## Teknologi yang Digunakan

| Komponen                     | Teknologi                                                 | Keterangan                                                                                                |
| :--------------------------- | :-------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **3D Engine**          | [Three.js](https://threejs.org/) (r128)                    | Rendering WebGL, *Raycasting* objek 3D, pencahayaan, dan animasi engsel pintu.                          |
| **Tekstur Prosedural** | HTML5 `CanvasTexture`                                   | Merender tulisan pada kertas 3D, plang stasiun, dan layar komputer secara dinamis tanpa file gambar luar. |
| **UI & HUD Overlay**   | [Tailwind CSS](https://tailwindcss.com/)                   | Antarmuka HUD ujian, kartu status stasiun, dan modal dokumen medis.                                       |
| **Sound Engine**       | Web Audio API                                             | Sintesis gelombang suara real-time untuk bel ujian dan interaksi objek.                                   |
| **Font**               | Google Fonts (`Plus Jakarta Sans` & `JetBrains Mono`) | Tipografi antarmuka medis dan penunjuk waktu.                                                             |

---

## Kontrol Navigasi

| Input / Tombol                           | Fungsi                                                                                  |
| :--------------------------------------- | :-------------------------------------------------------------------------------------- |
| `W` `A` `S` `D` / `Arrow Keys` | Berjalan mengelilingi lorong dan masuk ke ruang konseling[cite: 1, 2]                   |
| `Drag Mouse Kiri` / `Pointer Lock`   | Mengarahkan pandangan kamera 360 derajat[cite: 1, 2]                                    |
| `Klik Kiri` atau Tombol `E`          | Membuka pintu stasiun atau membaca kertas dokumen 3D yang disorot[cite: 1, 2]           |
| `Esc`                                  | Menutup modal pembaca dokumen atau melepas kunci kursor (*unlock cursor*)[cite: 1, 2] |

---

## Cara Menjalankan Proyek

### 1. Menjalankan Langsung (Zero-Setup)

Karena seluruh logika, geometri prosedural, tekstur kanvas, dan audio dikemas dalam satu file mandiri:

1. Unduh atau simpan kode sebagai `index.html`.
2. Buka `index.html` langsung menggunakan browser modern (Chrome, Edge, Firefox, atau Safari).

### 2. Menggunakan Local Development Server (Disarankan)

Jika Anda ingin mengembangkan proyek lebih lanjut atau memuat aset `.glb` eksternal:

**Menggunakan Vite:**

```bash
npm create vite@latest ukai-osce-3d -- --template vanilla
cd ukai-osce-3d
# Ganti isi index.html dengan kode proyek ini
npm install
npm run dev
```
