# PRODUCT.md — UKAI Labs · OSCE Center 3D

## Produk
Simulator web 3D ujian OSCE (Objective Structured Clinical Examination) untuk mahasiswa apoteker Indonesia (persiapan UKAI/UKOM). Pengguna berperan sebagai peserta ujian nomor 001 yang menempuh rangkaian 10 stasiun klinik: konseling resep, swamedikasi, skrining, compounding, dsb.

## Mekanisme unik
Ujian OSCE digital pertama berbasis first-person 3D: peserta berjalan di koridor klinik, menunggu waktu baca di depan pintu, masuk ruangan saat bel, membaca dokumen medis 3D, mengerjakan langkah prosedur pada prop 3D, dan menghasilkan rapor skor berbobot — semua stateful (localStorage).

## Audiens & skenario penggunaan
Mahasiswa farmasi & kampus pendidikan farmasi; dipakai di laptop/PC (backbone) dengan dukungan sentuh (D-pad). Konteks: belajar mandiri dan latihan terstruktur — perlu fokus; UI harus tenang, terbaca, tidak berisik.

## Keputusan brand yang dikunci (dari wawancara 24-10-2026)
1. **Arah visual: "Klinik Glass Dark"** — overlay kaca gelap di atas dunia 3D terang; aksen violet (brand), emerald/rose/amber hanya semantik (lulus/gagal/peringatan).
2. **Cakupan:** seluruh UI (welcome, HUD, modal dokumen, menu, rapor).
3. **Motion:** mikro-halus (fade/slide/stagger, pulse timer kritis) — tidak mengganggu konsentrasi.
4. **Tipografi:** Plus Jakarta Sans (body) + **Sora** (display/heading) + JetBrains Mono (angka, pengukuran).

## Batas
- Konten medis 02–10 masih draft (perlu validasi tenaga farmasi) — bukan bagian tugas desain UI.
- Game engine (Three.js) milik dunia sendiri; tugas desain mencakup layer HTML overlay + tipografi di scene via CanvasTexture.
