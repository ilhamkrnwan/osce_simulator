# DESIGN.md — Klinik Glass Dark

Sistem visual seluruh UI overlay UKAI Labs · OSCE Center 3D (dibangun Okt 2026; from-built dokumentasi, bukan pledoi).

## Dunia
Kaca gelap yang mengapung di atas ruang klinik 3D yang terang. Lapisan HTML tidak pernah menutup penuh dunia — hanya panel-panel kecil berkaca dengan sudut tumpul.

## Warna
- **Ground/panel:** `#0D1420` @ 50–72% alpha + `backdrop-blur` + border `white/10–12%` (utility `glass`, `glass-soft` di `app/assets/css/main.css`).
- **Teks:** primer `#F2F6FD`; sekunder slate-300/400 tinted, tidak pernah abu netral di atas warna.
- **Aksi/brand/aktif:** violet — `violet-500` (kalkulasi hover `violet-400`); untuk percikan teks di atas gelap pakai tint `bg-violet-500/15 text-violet-300`.
- **Semantik:** emerald = lulus, rose = gagal/waiter kritis, amber = peringatan/butir belum. Tidak ada warna lain yang berperan semantik.
- Strategi: *restrained* — netral gelap + satu aksen.

## Tipografi
- `font-display` = **Sora** — heading, judul panel, angka besar non-pengukur.
- `font-sans` = **Plus Jakarta Sans** — teks isi, tombol.
- `font-mono` = **JetBrains Mono** — eksklusif untuk yang mengukur: timer, skor, nomor stasiun, peserta, badge debug. Selalu `tabular-nums` untuk yang berjalan.
- Skala: heading 16–20px (modal) / 30px (welcome hero), body 12–14px, label mikro 10–11px.

## Bentuk & kedalaman
- Radius: 12–16px (panel `rounded-2xl`, kontrol `rounded-xl`, pill hanya tab/chip kecil).
- Bayangan: soft offset (`0 16px 48px rgb(2 6 16/.45)`), tanpa halo nol-offset.
- Kaca = satu border + blur; tidak ada border ganda + bayangan bersamaan pada elemen kecil.

## Motion
- Masuk: `animate-fade-up` (0.55s, ease-out cubic `.22,1,.36,1`), stagger per kartu via `[animation-delay:Xms]`.
- Pop untuk muncul-instan: `animate-pop` (tooltip, toast, modal).
- Halus: pulse `animate-pulse-soft` hanya untuk sinyal (timer kritis ≤60 dtk, titik status).
- Interaksi: hover lift `-translate-y-0.5` pada CTA utama saja; kontrol kecil pakai `active:scale-90` (D-pad).

## Pemetaan komponen
| Komponen | Pola |
|---|---|
| WelcomeOverlay | panel kaca pusat + CTA solid satu-satunya |
| HudOverlay top bar | strip kaca penuh, chip brand violet, aksi di kanan |
| Kartu giliran & tracker | dua panel kaca kiri-kanan, stagger masuk |
| Tooltip/Toast | pill kaca `animate-pop`, muncul di atas crosshair / bawah |
| DocModal | lembar kaca, tab pill aktif `bg-violet-600`, isi `.doc-prose` |
| MenuModal/RaporModal | lembar kaca, baris `bg-white/4` hover `white/8` |
| D-pad | 4 lingkaran kaca, ikon lucide chevron, `active:bg-violet-500/50` |

## Chrome
Seleksi, scrollbar, fokus (ring violet 2px), `accent-color` checkbox — semuanya di-temakan di `main.css`.

## Anti-referensi (ditinggalkan dari dunia lama)
Kartu putih polos, `bg-violet-950/85` band penuh, label huruf besar-kecil-kapital ala "eyebrow" untuk dekorasi, ikon panah unicode (↑←↓→) sebagai tombol, warna prop yang membocorkan jawaban.
