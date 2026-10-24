// Data-driven konten 10 stasiun (PRD §5). Tidak ada logika 3D di sini.
// Kategori rubrik khusus: 'Tindakan' (auto-terisi saat langkah prosedur selesai),
// 'Urutan' (auto-terisi bila tidak ada langkah salah urut), 'Pemilihan' (auto-terisi bila prop benar dipilih).

export interface DocumentItem {
  id: string
  title: string
  type: 'scenario_board' | 'prescription' | 'lab_result' | 'rubric_checklist'
  position: [number, number, number]
  contentHtml: string
}

export interface PropItem {
  id: string
  label: string
  position: [number, number, number]
  isCorrectChoice?: boolean
}

export interface RubricItem {
  id: string
  category: string
  label: string
  weight: number
}

// Mekanik langkah 3D generik: tiap stasiun skill punya urutan langkah
export interface ProcedureStep {
  id: string
  label: string
  offset: [number, number, number] // posisi hotspot relatif di prop dasar
}

export interface Procedure {
  kind: 'inhaler' | 'insulin' | 'peracikan' | 'coldchain' | 'rekonstitusi'
  steps: ProcedureStep[]
}

export interface StationScenario {
  id: string // "01" - "10"
  number: number
  title: string
  competencyCategory: 'KIE' | 'Skrining_Resep' | 'Swamedikasi' | 'Compounding' | 'Monitoring_Efek_Samping'
  roomSide: 'left' | 'right'
  corridorZIndex: number
  documents: DocumentItem[]
  props3D: PropItem[]
  procedure?: Procedure
  rubricItems: RubricItem[]
}

export const READ_DURATION_SEC = 60
export const EXAM_DURATION_SEC = 540
export const PASSING_GRADE = 70

const station01RubricNote = `
<h3>Rubrik Penilaian OSCE — Station 01</h3>
<p>Centang setiap butir KIE yang sudah Anda lakukan terhadap pasien. Skor = Σ bobot butir terpenuhi / total bobot × 100.</p>
<p>Butir rubrik aktif ditampilkan pada modal evaluasi di dalam ruangan.</p>`

// Catatan rubrik ringkas yang identik antar stasiun
function rubricNote(id: string, intro = 'Centang butir yang sudah Anda lakukan.') {
  return `<h3>Rubrik Penilaian OSCE — Station ${id}</h3><p>${intro} Skor = Σ bobot / total × 100, lulus ≥ 70.</p>`
}

export const stations: StationScenario[] = [
  {
    id: '01',
    number: 1,
    title: 'Konseling Informasi dan Edukasi resep untuk pasien diabetes melitus',
    competencyCategory: 'KIE',
    roomSide: 'left',
    corridorZIndex: 1,
    documents: [
      {
        id: 's01-board',
        title: 'Lembar Skenario Kandidat — Station 01',
        type: 'scenario_board',
        position: [1.55, 1.5, 0],
        contentHtml: `
          <h2>Lembar Skenario Kandidat</h2>
          <p><strong>Station 01</strong> — Konseling Informasi dan Edukasi (KIE) resep untuk pasien diabetes melitus tipe 2.</p>
          <p>Tn. M (56 th) poliklinik metabolik dikirim oleh dokter dengan resep baru. Anda memiliki 1 menit waktu baca dan 9 menit sesi konseling.</p>
          <ul>
            <li>Periksa resep, rekam medis dan hasil lab di meja.</li>
            <li>Lakukan KIE lengkap sesuai rubrik penilaian.</li>
          </ul>`,
      },
      {
        id: 's01-res',
        title: 'Lembar Resep Dokter',
        type: 'prescription',
        position: [0, 0.78, -1.25],
        contentHtml: `
          <h3>SIMRS e-Farmasi — Poliklinik Metabolik</h3>
          <p>R/ Metformin 500 mg — No. 30 tab<br>S1 dd cp 3 × 1 a.c.</p>
          <p>R/ Glimepiride 2 mg — No. 60 tab<br>S1 dd cp 2 × 1 30 menit sebelum sarapan & makan malam</p>
          <p>R/ Simvastatin 10 mg — No. 30 tab<br>S1 dd cp 1 × 1 hs</p>
        `,
      },
      {
        id: 's01-lab',
        title: 'Hasil Laboratorium & Rekam Medis',
        type: 'lab_result',
        position: [-0.9, 0.78, -1.25],
        contentHtml: `
          <h3>Hasil Laboratorium — 20 Okt 2026</h3>
          <table>
            <tr><td>GDP</td><td>186 mg/dL</td></tr>
            <tr><td>GDPP</td><td>245 mg/dL</td></tr>
            <tr><td>HbA1c</td><td>9,1%</td></tr>
            <tr><td>eGFR</td><td>92 mL/min/1,73 m²</td></tr>
          </table>
          <p><strong>Dx:</strong> DM tipe 2 (baru terdiagnosis), kolesterol total 252 mg/dL.</p>
        `,
      },
      {
        id: 's01-rubric',
        title: 'Checklist & Rubrik Penilaian OSCE',
        type: 'rubric_checklist',
        position: [0, 0.78, -1.4],
        contentHtml: station01RubricNote,
      },
    ],
    props3D: [
      { id: 'prop-glimepiride', label: 'Kotak obat Glimepiride 2 mg', position: [0.3, 0.78, -1], isCorrectChoice: true },
      { id: 'prop-metformin', label: 'Kotak obat Metformin 500 mg', position: [-0.3, 0.78, -1], isCorrectChoice: true },
      { id: 'prop-sirup', label: 'Sirup Antasida Doenzyme', position: [0.75, 0.78, -1.1], isCorrectChoice: false },
    ],
    rubricItems: [
      { id: 's1-01', category: 'Komunikasi', label: 'Sapaan dan identifikasi identitas pasien', weight: 10 },
      { id: 's1-02', category: 'Informasi', label: 'Memberitahukan tujuan obat (DM dan kolesterol)', weight: 10 },
      { id: 's1-03', category: 'Edukasi', label: 'Metformin: 3 × 1 bersama makanan untuk mengurangi gangguan pencernaan (mual/nyeri perut)', weight: 10 },
      { id: 's1-04', category: 'Edukasi', label: 'Glimepiride: 2 × 1, 30 menit sebelum makan pagi; efek samping utama hipoglikemia', weight: 10 },
      { id: 's1-05', category: 'Edukasi', label: 'Simvastatin: 1 × 1 malam sesudah makan (hs)', weight: 10 },
      { id: 's1-06', category: 'Edukasi', label: 'Edukasi penanganan hipoglikemia: konsumsi 15 g karbohidrat cepat (gula tiga sendok)', weight: 10 },
      { id: 's1-07', category: 'Edukasi', label: 'Metformin TIDAK diberikan bila akan MRI/CT kontras — beri tahu tim medis', weight: 10 },
      { id: 's1-08', category: 'Monitoring', label: 'Menginformasikan urgensi kontrol glukosa & fungsi ginjal berkala (eGFR saat ini normal)', weight: 10 },
      { id: 's1-09', category: 'Edukasi', label: 'Gaya hidup: diet rendah gula & olahraga teratur', weight: 10 },
      { id: 's1-10', category: 'Komunikasi', label: 'Menutup: kesimpulan KIE + kesempatan bertanya pasien', weight: 10 },
    ],
  },

  {
    id: '02',
    number: 2,
    title: 'Konseling penggunaan alat khusus — inhaler asma (Turbuhaler)',
    competencyCategory: 'KIE',
    roomSide: 'right',
    corridorZIndex: 2,
    documents: [
      {
        id: 's02-board',
        title: 'Lembar Skenario Kandidat — Station 02',
        type: 'scenario_board',
        position: [1.55, 1.5, 0],
        contentHtml: `
          <h2>Lembar Skenario Kandidat</h2>
          <p><strong>Station 02</strong> — Konseling Teknik Penggunaan Alat Khusus: inhaler Turbuhaler untuk asma bronkial.</p>
          <p>Ny. S (34 th) baru mendapat resep budesonida Turbuhaler 200 mcg 1 × 1. Pasien mengeluh "obat terasa tidak ada efeknya" — teknik penggunaan salah.</p>
          <ul><li>Periksa alat di meja.</li><li>Demonstrasi & praktik penggunaan yang benar melalui langkah tindakan pada prop 3D.</li></ul>`,
      },
      {
        id: 's02-res',
        title: 'Lembar Resep Dokter',
        type: 'prescription',
        position: [0, 0.78, -1.2],
        contentHtml: `
          <h3>SIMRS e-Farmasi — Poliklinik Respirologi</h3>
          <p>R/ Budesonida Turbuhaler 200 mcg — No. 1 inhaler<br>S1 dd cp 1 × 1 pagi & malam, berkumur setelah pemakaian</p>
          <p>R/ Salbutamol inhaler 100 mcg/act — No. 1<br>S1 dd cp prn saat sesak</p>
        `,
      },
      {
        id: 's02-rubric',
        title: 'Checklist & Rubrik Penilaian OSCE',
        type: 'rubric_checklist',
        position: [0, 0.78, -1.4],
        contentHtml: rubricNote('02', 'Langkah tindakan pada prop 3D mengisi butir Tindakan otomatis; salah urutan membatalkan butir Urutan.'),
      },
    ],
    props3D: [
      { id: 'prop-turbuhaler', label: 'Turbuhaler Budesonida 200 mcg', position: [0, 0.78, -1], isCorrectChoice: true },
      { id: 'prop-salbutamol', label: 'Inhaler salbutamol 100 mcg (prn)', position: [0.55, 0.78, -1.05], isCorrectChoice: true },
    ],
    procedure: {
      kind: 'inhaler',
      steps: [
        { id: 's2-st1', label: 'Putar grip wadah sampai bunyi "klik" (memuat dosis)', offset: [0.1, 0.05, 0] },
        { id: 's2-st2', label: 'Buang habis napas — jangan ke arah alat', offset: [0.05, 0.05, 0.06] },
        { id: 's2-st3', label: 'Hisap kuat & dalam lewat mulut saat alat dipegang tegak', offset: [0, 0.05, 0.1] },
        { id: 's2-st4', label: 'Tahan napas 5–10 detik', offset: [-0.06, 0.05, 0.04] },
        { id: 's2-st5', label: 'Berkumur untuk mencegah kandidiasis oral', offset: [-0.1, 0.02, 0.06] },
      ],
    },
    rubricItems: [
      { id: 's2-01', category: 'Komunikasi', label: 'Sapaan + identifikasi masalah pasien (teknik penggunaan)', weight: 8 },
      { id: 's2-02', category: 'Tindakan', label: 'Memuat dosis — putar grip sampai klik', weight: 14 },
      { id: 's2-03', category: 'Tindakan', label: 'Buang napas sebelum hisap', weight: 14 },
      { id: 's2-04', category: 'Tindakan', label: 'Hisap cepat & dalam, alat dipegang tegak', weight: 14 },
      { id: 's2-05', category: 'Tindakan', label: 'Tahan napas 5–10 detik', weight: 14 },
      { id: 's2-06', category: 'Tindakan', label: 'Berkumur setelah pemakaian', weight: 14 },
      { id: 's2-07', category: 'Urutan', label: 'Demonstrasi semua langkah tanpa salah urutan', weight: 10 },
      { id: 's2-08', category: 'Edukasi', label: 'Edukasi salbutamol sebagai rescue (prn) dan kapan ke IGD (sesak tak membaik)', weight: 8 },
      { id: 's2-09', category: 'Komunikasi', label: 'Meminta pasien melakukan praktik balik (teach-back)', weight: 10 },
    ],
  },

  {
    id: '03',
    number: 3,
    title: 'Pelayanan Swamedikasi — diare akut pada anak',
    competencyCategory: 'Swamedikasi',
    roomSide: 'left',
    corridorZIndex: 3,
    documents: [
      {
        id: 's03-board',
        title: 'Lembar Skenario Kandidat — Station 03',
        type: 'scenario_board',
        position: [1.55, 1.5, 0],
        contentHtml: `
          <h2>Lembar Skenario Kandidat</h2>
          <p><strong>Station 03</strong> — Pelayanan Swamedikasi: diare akut tanpa tanda dehidrasi berat pada anak.</p>
          <p>Seorang ibu datang membawa putranya (Aldi, 2,5 th) yang BAB encer 5× sejak semalam, masih aktif, mau minum. Tidak ada darah atau lendir.</p>
          <ul><li>Triase singkat.</li><li>Pilih produk yang tepat di meja.</li><li>Berikan konseling keluarga.</li></ul>`,
      },
      {
        id: 's03-rubric',
        title: 'Checklist & Rubrik Penilaian OSCE',
        type: 'rubric_checklist',
        position: [0, 0.78, -1.4],
        contentHtml: rubricNote('03', 'Pilih produk tepat di meja → butir Pemilihan otomatis terisi.'),
      },
    ],
    props3D: [
      { id: 'prop-ors', label: 'ORB — oralit (sachet rehidrasi oral)', position: [0.3, 0.78, -1], isCorrectChoice: true },
      { id: 'prop-zinc', label: 'Suplemen Zinc 20 mg tablet kunyah', position: [0, 0.78, -1], isCorrectChoice: true },
      { id: 'prop-loperamid', label: 'Loperamid kapsul 2 mg', position: [-0.35, 0.78, -1.05], isCorrectChoice: false },
      { id: 'prop-antibiotik', label: 'Sirup antibiotik (tanpa resep)', position: [0.6, 0.78, -1.05], isCorrectChoice: false },
    ],
    rubricItems: [
      { id: 's3-01', category: 'Komunikasi', label: 'Sapaan dan sambutan yang baik', weight: 8 },
      { id: 's3-02', category: 'Triase', label: 'Menanyakan durasi, frekuensi BAB, minum, darah/lendir, dan demam', weight: 20 },
      { id: 's3-03', category: 'Pemilihan', label: 'Memilih produk tepat: ORB (+ zinc) — bukan loperamid/antibiotik', weight: 20 },
      { id: 's3-04', category: 'Edukasi', label: 'Dosis ORB sesuai umur/bobot & zinc selama 10 hari', weight: 16 },
      { id: 's3-05', category: 'Edukasi', label: 'Panduan keluarga: lanjut ASI/makan, cuci tangan, air masak, sanitasi', weight: 16 },
      { id: 's3-06', category: 'Red_Flag', label: 'Menjelaskan tanda bahaya ke dokter: dehidrasi berat, BAB berdarah, lemas, muntah terus', weight: 15 },
      { id: 's3-07', category: 'Komunikasi', label: 'Menutup konseling + kesempatan bertanya', weight: 5 },
    ],
  },

  {
    id: '04',
    number: 4,
    title: 'Skrining Resep & Penyelesaian Masalah Klinis — interaksi obat',
    competencyCategory: 'Skrining_Resep',
    roomSide: 'right',
    corridorZIndex: 4,
    documents: [
      {
        id: 's04-board',
        title: 'Lembar Skenario Kandidat — Station 04',
        type: 'scenario_board',
        position: [1.55, 1.5, 0],
        contentHtml: `
          <h2>Lembar Skenario Kandidat</h2>
          <p><strong>Station 04</strong> — Skrining Resep: temukan Masalah Terapi (MRP) pada resep pasien hipertensi + dislipidemia, lalu usulkan solusinya kepada dokter.</p>
          <ul><li>Baca resep & rekam medis di meja.</li><li>Skrining: indikasi, dosis, interaksi, duplikasi, efek samping, alergi.</li><li>Komunikasikan rekomendasi (SBAR).</li></ul>`,
      },
      {
        id: 's04-res',
        title: 'Lembar Resep Dokter',
        type: 'prescription',
        position: [0, 0.78, -1.2],
        contentHtml: `
          <h3>SIMRS e-Farmasi — Poliklinik Jantung</h3>
          <p>R/ Amlodipine 10 mg — No. 30 tab<br>S1 dd cp 2 × 1 pagi-malam</p>
          <p>R/ Amlodipine 5 mg — No. 30 tab<br>S1 dd cp 1 × 1 pagi</p>
          <p>R/ Simvastatin 40 mg — No. 10 tab<br>S1 dd cp 1 × 1 malam</p>
          <p>R/ Clarithromycin 500 mg — No. 15 tab<br>S1 dd cp 1 × 1 (bronkitis)</p>
        `,
      },
      {
        id: 's04-lab',
        title: 'Hasil Laboratorium',
        type: 'lab_result',
        position: [-0.9, 0.78, -1.2],
        contentHtml: `
          <h3>Rekam Medis</h3>
          <p>Tn. D (61 th). Dx: hipertensi, dislipidemia, bronkitis aktif. KSk (clearance kreatinin) 90 mL/menit, fungsi hati normal, tidak ada alergi obat.</p>
        `,
      },
      {
        id: 's04-rubric',
        title: 'Checklist & Rubrik Penilaian OSCE',
        type: 'rubric_checklist',
        position: [0, 0.78, -1.4],
        contentHtml: rubricNote('04', 'Kandidat menemukan masalah, memilih penyelesaian, dan merekomendasikan kepada dokter.'),
      },
    ],
    props3D: [
      { id: 'prop-azithro', label: 'Azitromisin 500 mg tab (alternatif lebih aman)', position: [0, 0.78, -1], isCorrectChoice: true },
      { id: 'prop-simva10', label: 'Simvastatin 10 mg tab (opsi turun dosis)', position: [-0.4, 0.78, -1], isCorrectChoice: false },
      { id: 'prop-amlodipine', label: 'Amlodipine 5 mg tab (koreksi duplikasi)', position: [0.55, 0.78, -1.05], isCorrectChoice: true },
    ],
    rubricItems: [
      { id: 's4-01', category: 'Skrining', label: 'MRP 1: duplikasi amlodipine 10 mg + 5 mg', weight: 18 },
      { id: 's4-02', category: 'Skrining', label: 'MRP 2: interaksi simvastatin + clarithromycin & amlodipine → risiko miopati/rabdomiolisis', weight: 25 },
      { id: 's4-03', category: 'Pemilihan', label: 'Mengusulkan solusi (ganti ke azitromisin; turun dosis/jeda simvastatin; sifarkan duplikasi amlodipine)', weight: 20 },
      { id: 's4-04', category: 'Skrining', label: 'Menilai dosis & fungsi ginjal (KSk normal)', weight: 12 },
      { id: 's4-05', category: 'Komunikasi', label: 'Komunikasi SBAR kepada dokter', weight: 15 },
      { id: 's4-06', category: 'Komunikasi', label: 'Menutup + kesepakatan tindak lanjut', weight: 10 },
    ],
  },

  {
    id: '05',
    number: 5,
    title: 'Konseling penggunaan insulin pen & penanganan hipoglikemia',
    competencyCategory: 'KIE',
    roomSide: 'left',
    corridorZIndex: 5,
    documents: [
      {
        id: 's05-board',
        title: 'Lembar Skenario Kandidat — Station 05',
        type: 'scenario_board',
        position: [1.55, 1.5, 0],
        contentHtml: `
          <h2>Lembar Skenario Kandidat</h2>
          <p><strong>Station 05</strong> — Konseling injeksi insulin (pen) pada pasien DM tipe 2 yang baru memulai insulin.</p>
          <p>Ny. R (49 th) mendapat insulin glargin 10 UI s.c. qd. Pasien takut jarum dan belum pernah dilatih.</p>
          <ul><li>Demonstrasi pen (langkah tindakan 3D).</li><li>Edukasi penyimpanan & penanganan hipoglikemia.</li></ul>`,
      },
      {
        id: 's05-res',
        title: 'Lembar Resep Dokter',
        type: 'prescription',
        position: [0, 0.78, -1.2],
        contentHtml: `
          <h3>SIMRS e-Farmasi — Poliklinik Endokrin</h3>
          <p>R/ Insulin glargin 100 UI/mL (3 mL) — No. 1 pen<br>S1 dd cp 10 UI s.c. 1 × 1 pada jam yang sama setiap hari</p>
          <p>Penyimpanan baru (belum dibuka): kulkas 2–8 °C, tidak dibekukan.<br>Sudah dibuka: suhu ruang ≤ 30 °C, pada durasi maksimal 28 hari.</p>
        `,
      },
      {
        id: 's05-rubric',
        title: 'Checklist & Rubrik Penilaian OSCE',
        type: 'rubric_checklist',
        position: [0, 0.78, -1.4],
        contentHtml: rubricNote('05', 'Langkah tindakan pen 3D mengisi butir Tindakan otomatis.'),
      },
    ],
    props3D: [
      { id: 'prop-glargin', label: 'Insulin glargin pen', position: [0, 0.78, -1], isCorrectChoice: true },
      { id: 'prop-gula', label: 'Gula berporsi (perlengkapan penanganan hipoglikemia)', position: [0.55, 0.78, -1.05], isCorrectChoice: true },
    ],
    procedure: {
      kind: 'insulin',
      steps: [
        { id: 's5-st1', label: 'Cek tanggal kedaluwarsa & penampilan insulin (tidak boleh beku/menggumpal)', offset: [0.1, 0.02, 0] },
        { id: 's5-st2', label: 'Pasang jarum steri baru & buka pelindung', offset: [0.05, 0.02, 0.06] },
        { id: 's5-st3', label: 'Prime 2 UI (keluarkan udara, ada tetes insulin)', offset: [0, 0.02, 0.1] },
        { id: 's5-st4', label: 'Dial dosis tepat 10 UI', offset: [-0.06, 0.02, 0.05] },
        { id: 's5-st5', label: 'Injeksi subkutan, tahan 10 detik', offset: [-0.1, 0.02, 0] },
        { id: 's5-st6', label: 'Buang jarum pada tempat aman khusus', offset: [-0.05, 0, 0.1] },
      ],
    },
    rubricItems: [
      { id: 's5-01', category: 'Komunikasi', label: 'Sapaan + konfirmasi pemahaman awal pasien', weight: 8 },
      { id: 's5-02', category: 'Tindakan', label: 'Cek insulin (kedaluwarsa, penampilan)', weight: 10 },
      { id: 's5-03', category: 'Tindakan', label: 'Pasang jarum baru', weight: 10 },
      { id: 's5-04', category: 'Tindakan', label: 'Prime 2 UI', weight: 10 },
      { id: 's5-05', category: 'Tindakan', label: 'Dial 10 UI', weight: 10 },
      { id: 's5-06', category: 'Tindakan', label: 'Injeksi subkutan + rotasi tempat suntik', weight: 10 },
      { id: 's5-07', category: 'Tindakan', label: 'Buang jarum pada tempat khusus', weight: 10 },
      { id: 's5-08', category: 'Urutan', label: 'Demonstrasi tanpa salah urutan', weight: 10 },
      { id: 's5-09', category: 'Edukasi', label: 'Penyimpanan insulin + tanda hipoglikemia & penanganannya (15 g karbohidrat cepat)', weight: 12 },
      { id: 's5-10', category: 'Komunikasi', label: 'Teach-back pasien', weight: 10 },
    ],
  },

  {
    id: '06',
    number: 6,
    title: 'Compounding / Peracikan sesuai resep (PNO)',
    competencyCategory: 'Compounding',
    roomSide: 'right',
    corridorZIndex: 6,
    documents: [
      {
        id: 's06-board',
        title: 'Lembar Skenario Kandidat — Station 06',
        type: 'scenario_board',
        position: [1.55, 1.5, 0],
        contentHtml: `
          <h2>Lembar Skenario Kandidat</h2>
          <p><strong>Station 06</strong> — Compounding/Peracikan sesuai Pedoman Obat Nasional (PNO).</p>
          <p>Racikan cairan oral sesuai resep PNO. Prosedur peracikan, perhitungan takaran, kemasan, dan pengecekan ulang (double check) harus dilakukan.</p>
          <ul><li>Ikuti urutan peracikan melalui langkah tindakan 3D.</li></ul>`,
      },
      {
        id: 's06-res',
        title: 'Resep Racikan',
        type: 'prescription',
        position: [0, 0.78, -1.2],
        contentHtml: `
          <h3>Resep Racikan — Pedoman Obat Nasional</h3>
          <p>Racikan sirup rehidrasi oral (PNO) 200 mL:<br>tambah air masak hingga garis 200 mL, kocok hingga larut.</p>
          <p>Aturan pakai: 1 sachet sirup + air 200 mL, diminum bertahap setiap BAB encer (maks: dokter).</p>
        `,
      },
      {
        id: 's06-rubric',
        title: 'Checklist & Rubrik Penilaian OSCE',
        type: 'rubric_checklist',
        position: [0, 0.78, -1.4],
        contentHtml: rubricNote('06', 'Urutan peracikan yang benar berpengaruh ke butir Urutan.'),
      },
    ],
    props3D: [
      { id: 'prop-timbangan', label: 'Timbangan analitik didigital', position: [0, 0.78, -1], isCorrectChoice: true },
      { id: 'prop-botolcoklat', label: 'Botol sirup coklat 200 mL + label', position: [-0.5, 0.78, -1], isCorrectChoice: true },
    ],
    procedure: {
      kind: 'peracikan',
      steps: [
        { id: 's6-st1', label: 'Pastikan takaran & bentuk sediaan mengikuti formula (PNO)', offset: [0.1, 0.02, 0] },
        { id: 's6-st2', label: 'Siapkan alat yang bersih & kering', offset: [0.05, 0.02, 0.06] },
        { id: 's6-st3', label: 'Periksa takaran: timbang zat tepat sesuai resep', offset: [0, 0.02, 0.1] },
        { id: 's6-st4', label: 'Campur hingga homogen sesuai urutan dalam resep', offset: [-0.08, 0.02, 0.04] },
        { id: 's6-st5', label: 'Masukkan ke botol + label lengkap (nama pasien, aturan pakai, tanggal)', offset: [-0.1, 0, 0.1] },
        { id: 's6-st6', label: 'Double check dengan apoteker kedua', offset: [-0.04, 0, 0.13] },
      ],
    },
    rubricItems: [
      { id: 's6-01', category: 'Komunikasi', label: 'Membaca/pahami resep dengan benar', weight: 8 },
      { id: 's6-02', category: 'Tindakan', label: 'Takaran & bentuk sediaan sesuai PNO', weight: 18 },
      { id: 's6-03', category: 'Tindakan', label: 'Alat bersih & kering siap sedia', weight: 15 },
      { id: 's6-04', category: 'Tindakan', label: 'Takaran zat tepat saat ditimbang', weight: 18 },
      { id: 's6-05', category: 'Tindakan', label: 'Label lengkap & jelas', weight: 15 },
      { id: 's6-06', category: 'Urutan', label: 'Urutan peracikan benar (tanpa langkah salah)', weight: 15 },
      { id: 's6-07', category: 'Tindakan', label: 'Double check dengan apoteker lain', weight: 11 },
    ],
  },

  {
    id: '07',
    number: 7,
    title: 'Monitoring Efek Samping Obat (MESO) — NSAID risiko GI',
    competencyCategory: 'Monitoring_Efek_Samping',
    roomSide: 'left',
    corridorZIndex: 7,
    documents: [
      {
        id: 's07board',
        title: 'Lembar Skenario Kandidat — Station 07',
        type: 'scenario_board',
        position: [1.55, 1.5, 0],
        contentHtml: `
          <h2>Lembar Skenario Kandidat</h2>
          <p><strong>Station 07</strong> — Monitoring Efek Samping Obat (MESO): penggunaan ibuprofen jangka panjang.</p>
          <p>Ny. T (66 th), osteoartritis lutut, memakai ibuprofen 400 mg 3 × 1 selama 2 bulan. Datang mengeluh nyeri ulu hati, mual, tinja berwarna sangat gelap.</p>
          <ul><li>Kenali efek samping GI.</li><li>Sarankan tindakan + opsi terapi pelindung.</li></ul>`,
      },
      {
        id: 's07-lab',
        title: 'Rekam Medis & Laporan Lab',
        type: 'lab_result',
        position: [-0.9, 0.78, -1.2],
        contentHtml: `
          <h3>Rekam medis</h3>
          <p>Ny. T (66 th), osteoartritis. Hemoglobin 10.4 g/dL (turun dari 12.8). Tidak riwayat tukak/GERD yang diketahui.</p>
        `,
      },
      {
        id: 's07-rubric',
        title: 'Checklist & Rubrik Penilaian OSCE',
        type: 'rubric_checklist',
        position: [0, 0.78, -1.4],
        contentHtml: rubricNote('07'),
      },
    ],
    props3D: [
      { id: 'prop-ppi', label: 'Kotak omeprazole (opsi pelindung lambung)', position: [0, 0.78, -1], isCorrectChoice: true },
      { id: 'prop-ibuf', label: 'Ibuprofen 400 mg (obat tersangka)', position: [-0.4, 0.78, -1], isCorrectChoice: true },
    ],
    rubricItems: [
      { id: 's7-01', category: 'Komunikasi', label: 'Sapaan & pengkajian keluhan', weight: 10 },
      { id: 's7-02', category: 'Monitoring', label: 'Menanyakan efek samping GI (nyeri ulu hati, mual, tinja hitam, perdarahan)', weight: 25 },
      { id: 's7-03', category: 'Monitoring', label: 'Menghubungkan efek GI dengan pemakaian NSAID jangka panjang', weight: 20 },
      { id: 's7-04', category: 'Monitoring', label: 'Menilai urgensi (Hb turun + tinja hitam → pelaporan MESO + rujukan segera ke dokter)', weight: 15 },
      { id: 's7-05', category: 'Edukasi', label: 'Menyarankan persetujuan dengan dokter: penyesuaian NSAID (+ opsi pelindung lambung)', weight: 20 },
      { id: 's7-06', category: 'Komunikasi', label: 'Menutup & mencatat pelaporan MESO', weight: 10 },
    ],
  },

  {
    id: '08',
    number: 8,
    title: 'Pengelolaan cold chain — penyimpanan vaksin 2–8 °C',
    competencyCategory: 'Monitoring_Efek_Samping',
    roomSide: 'right',
    corridorZIndex: 8,
    documents: [
      {
        id: 's08-board',
        title: 'Lembar Skenario Kandidat — Station 08',
        type: 'scenario_board',
        position: [1.55, 1.5, 0],
        contentHtml: `
          <h2>Lembar Skenario Kandidat</h2>
          <p><strong>Station 08</strong> — Pengelolaan cold chain: vaksin harus disimpan 2–8 °C dan tidak boleh dibekukan.</p>
          <p>Pagi ini kartu suhu menunjukkan suhu mencapai 9 °C selama 20 menit saat pemadaman listrik. Tindakan apa yang perlu Anda lakukan?</p>
          <ul><li>Ikuti langkah penyelamatan vaksin melalui tindakan 3D.</li></ul>`,
      },
      {
        id: 's08-rubric',
        title: 'Checklist & Rubrik Penilaian OSCE',
        type: 'rubric_checklist',
        position: [0, 0.78, -1.4],
        contentHtml: rubricNote('08', 'Langkah tindakan 3D adalah rangkaian penyelamatan vaksin.'),
      },
    ],
    props3D: [
      { id: 'prop-vaksin', label: 'Kotak vaksin (sensitif suhu)', position: [0, 0.78, -1], isCorrectChoice: true },
      { id: 'prop-thermo', label: 'Termometer min–maks', position: [0.5, 0.78, -1], isCorrectChoice: true },
    ],
    procedure: {
      kind: 'coldchain',
      steps: [
        { id: 's8-st1', label: 'Baca termometer/kartu suhu (baik minimum maupun maksimum)', offset: [0.08, 0.02, 0] },
        { id: 's8-st2', label: 'Catat waktu berlangsung & nilai suhu yang terbaca', offset: [0.04, 0.02, 0.05] },
        { id: 's8-st3', label: 'Lakukan tindakan khusus menjaga suhu tetap 2–8 °C (mis. paket es dengan penghalang) tanpa membekukan vaksin', offset: [-0.06, 0.02, 0] },
        { id: 's8-st4', label: 'Tandai lot mencurigakan (karantina) & laporkan ke supervisi', offset: [-0.06, 0.02, 0.08] },
        { id: 's8-st5', label: 'Kendalikan risiko membeku: pakai indikator Freeze Watch dan hindari kontak langsung dengan es', offset: [0.04, 0.02, 0.11] },
      ],
    },
    rubricItems: [
      { id: 's8-01', category: 'Komunikasi', label: 'Sapaan + konteks cold chain', weight: 10 },
      { id: 's8-02', category: 'Tindakan', label: 'Baca kartu suhu & catat waktu kejadian', weight: 18 },
      { id: 's8-03', category: 'Tindakan', label: 'Tindakan segera menjaga vaksin tetap 2–8 °C tanpa dibekukan', weight: 25 },
      { id: 's8-04', category: 'Tindakan', label: 'Tandai berkarantina & laporkan lot mencurigakan', weight: 12 },
      { id: 's8-05', category: 'Urutan', label: 'Urutan langkah penyelamatan benar', weight: 15 },
      { id: 's8-06', category: 'Edukasi', label: 'Menjelaskan tindak lanjut pelaporan insiden ketidaksesuaian suhu', weight: 20 },
    ],
  },

  {
    id: '09',
    number: 9,
    title: 'Antibiotik pediatri — rekonstitusi sirup kering',
    competencyCategory: 'Compounding',
    roomSide: 'left',
    corridorZIndex: 9,
    documents: [
      {
        id: 's09-board',
        title: 'Lembar Skenario Kandidat — Station 09',
        type: 'scenario_board',
        position: [1.55, 1.5, 0],
        contentHtml: `
          <h2>Lembar Skenario Kandidat</h2>
          <p><strong>Station 09</strong> — Rekonstitusi sirup kering antibiotik untuk pasien pediatri.</p>
          <p>Amoksisilin sirup kering 250 mg/5 mL. Lakukan rekonstitusi & aturan pemberian dosis pediatri (bobot 15 kg).</p>
          <ul><li>Langkah tindakan 3D.</li><li>Edukasi penyimpanan sirup jadi & sisa masa pakai.</li></ul>`,
      },
      {
        id: 's09-rubric',
        title: 'Checklist & Rubrik Penilaian OSCE',
        type: 'rubric_checklist',
        position: [0, 0.78, -1.4],
        contentHtml: rubricNote('09', 'Langkah rekonstitusi 3D mengisi butir Tindakan otomatis.'),
      },
    ],
    props3D: [
      { id: 'prop-amox', label: 'Botol amoksisilin sirup kering', position: [0, 0.78, -1], isCorrectChoice: true },
      { id: 'prop-aquadest', label: 'Aqua dest steril', position: [0.5, 0.78, -1], isCorrectChoice: true },
    ],
    procedure: {
      kind: 'rekonstitusi',
      steps: [
        { id: 's9-st1', label: 'Cek label: kekuatan final & jumlah air pengenceran', offset: [0.08, 0.02, 0] },
        { id: 's9-st2', label: 'Ketuk botol agar bubuk turun, lalu buka tutup', offset: [0.04, 0.02, 0.05] },
        { id: 's9-st3', label: 'Tambah aqua dest sampai garis tanda dalam 2–3 tahap', offset: [-0.04, 0.02, 0.08] },
        { id: 's9-st4', label: 'Kocok rata sampai suspensi homogen', offset: [-0.08, 0.02, 0.05] },
        { id: 's9-st5', label: 'Label: tanggal rekonstitusi, kedaluwarsa (7 hari), atur pakai', offset: [0, 0.02, 0.12] },
      ],
    },
    rubricItems: [
      { id: 's9-01', category: 'Komunikasi', label: 'Sapaan + identifikasi pasien anak & bobot', weight: 10 },
      { id: 's9-02', category: 'Tindakan', label: 'Cek label & jumlah air pengenceran', weight: 18 },
      { id: 's9-03', category: 'Tindakan', label: 'Air bertahap sampai garis, kocok rata', weight: 18 },
      { id: 's9-04', category: 'Tindakan', label: 'Label lengkap (tanggal rekonstitusi & sisa pakai)', weight: 18 },
      { id: 's9-05', category: 'Urutan', label: 'Urutan rekonstitusi benar', weight: 14 },
      { id: 's9-06', category: 'Edukasi', label: 'Dosis pediatri benar (mg/kg/hari dibagi dosis), penyimpanan kulkas, sisa 7 hari', weight: 22 },
    ],
  },

  {
    id: '10',
    number: 10,
    title: 'Konseling obat untuk ibu hamil dan menyusui',
    competencyCategory: 'KIE',
    roomSide: 'right',
    corridorZIndex: 10,
    documents: [
      {
        id: 's10-board',
        title: 'Lembar Skenario Kandidat — Station 10',
        type: 'scenario_board',
        position: [1.55, 1.5, 0],
        contentHtml: `
          <h2>Lembar Skenario Kandidat</h2>
          <p><strong>Station 10</strong> — Konseling pemilihan obat aman untuk ibu hamil (trimester 2) dan menyusui.</p>
          <p>Ny. W (28 th) hamil 24 minggu mengeluh sakit kepala & sembelit. Ibu tadi sempat membeli obat bebas singgung.</p>
          <ul><li>Pilih prop obat yang aman di meja.</li><li>Edukasi obat yang harus dihindari.</li></ul>`,
      },
      {
        id: 's10-rubric',
        title: 'Checklist & Rubrik Penilaian OSCE',
        type: 'rubric_checklist',
        position: [0, 0.78, -1.4],
        contentHtml: rubricNote('10', 'Butir Pemilihan terisi otomatis saat prop obat aman dipilih.'),
      },
    ],
    props3D: [
      { id: 'prop-paracetamol', label: 'Paracetamol 500 mg (sakit kepala — aman)', position: [0.3, 0.78, -1], isCorrectChoice: true },
      { id: 'prop-lactulosa', label: 'Laktulosa sirup (sembelit — aman)', position: [-0.3, 0.78, -1], isCorrectChoice: true },
      { id: 'prop-ibuprofen', label: 'Ibuprofen 400 mg (dihindari masa hamil/menyusui)', position: [0.7, 0.78, -1.05], isCorrectChoice: false },
    ],
    rubricItems: [
      { id: 's10-01', category: 'Komunikasi', label: 'Sapaan + konfirmasi usia kehamilan (24 minggu)', weight: 8 },
      { id: 's10-02', category: 'Pemilihan', label: 'Memilih paracetamol untuk sakit kepala (NSAID tidak)', weight: 14 },
      { id: 's10-03', category: 'Pemilihan', label: 'Memilih laktulosa untuk sembelit (bukan stimulan/obat hormon)', weight: 14 },
      { id: 's10-04', category: 'Edukasi', label: 'Pola hidup: air putih cukup, serat, aktivitas teratur', weight: 14 },
      { id: 's10-05', category: 'Edukasi', label: 'Daftar obat yang dihindari saat hamil/menyusui (NSAID, tetrasiklin, retinoid, dll.)', weight: 22 },
      { id: 's10-06', category: 'Edukasi', label: 'Mengupayakan resep dokter bila keluhan berlanjut', weight: 14 },
      { id: 's10-07', category: 'Komunikasi', label: 'Menutup + kesempatan bertanya', weight: 14 },
    ],
  },
]

export function getStation(id: string): StationScenario {
  const station = stations.find(s => s.id === id)
  if (!station) throw new Error(`Tidak ada stasiun dengan id "${id}"`)
  return station
}

export function nextStationId(id: string): string | null {
  const next = Number(id) + 1
  return next <= 10 ? String(next).padStart(2, '0') : null
}
