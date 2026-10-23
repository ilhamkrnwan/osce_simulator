// Data-driven konten 10 stasiun (PRD §5). Tidak ada logika 3D di sini.

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

export interface StationScenario {
  id: string // "01" - "10"
  number: number
  title: string
  competencyCategory: 'KIE' | 'Skrining_Resep' | 'Swamedikasi' | 'Compounding' | 'Monitoring_Efek_Samping'
  roomSide: 'left' | 'right'
  corridorZIndex: number
  documents: DocumentItem[]
  props3D: PropItem[]
  rubricItems: RubricItem[]
}

export const READ_DURATION_SEC = 60
export const EXAM_DURATION_SEC = 540
export const PASSING_GRADE = 70

const station01RubricNote = `
<h3>Rubrik Penilaian OSCE — Station 01</h3>
<p>Centang setiap butir KIE yang sudah Anda lakukan terhadap pasien. Skor = Σ bobot butir terpenuhi / total bobot × 100.</p>
<p>Butir rubrik aktif ditampilkan pada modal evaluasi di dalam ruangan.</p>
`

// Rubrik generik untuk stasiun V1 yang kontennya belum diisi penuh
const genericRubric: RubricItem[] = [
  { id: 'gen-01', category: 'Komunikasi', label: 'Sapaan dan identifikasi identitas pasien', weight: 10 },
  { id: 'gen-02', category: 'Informasi', label: 'Menginformasikan manfaat pengobatan / tujuan obat', weight: 10 },
  { id: 'gen-03', category: 'Edukasi', label: 'Edukasi cara penggunaan / tata cara minum obat', weight: 10 },
  { id: 'gen-04', category: 'Edukasi', label: 'Edukasi efek samping dan cara menanganinya', weight: 10 },
  { id: 'gen-05', category: 'Monitoring', label: 'Monitoring efektivitas dan evaluasi terapi', weight: 10 },
]

function genericStation(
  id: string,
  title: string,
  category: StationScenario['competencyCategory'],
): StationScenario {
  const number = Number(id)
  return {
    id,
    number,
    title,
    competencyCategory: category,
    roomSide: number % 2 === 1 ? 'left' : 'right',
    corridorZIndex: number,
    documents: [
      {
        id: `s${id}-board`,
        title: `Lembar Skenario Kandidat — Station ${id}`,
        type: 'scenario_board',
        position: [1.55, 1.5, 0],
        contentHtml: `<h2>Station ${id}</h2><p>${title}</p><p>Konten skenario lengkap belum diisi — lihat TASK.md Fase 2.2.</p>`,
      },
    ],
    props3D: [],
    rubricItems: genericRubric,
  }
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
  genericStation('02', 'Konseling penggunaan alat khusus — inhaler asma (Turbuhaler)', 'KIE'),
  genericStation('03', 'Pelayanan Swamedikasi — diare anak', 'Swamedikasi'),
  genericStation('04', 'Skrining Resep & Penyelesaian Masalah Klinis — interaksi obat hipertensi + kolesterol', 'Skrining_Resep'),
  genericStation('05', 'Konseling penggunaan insulin pen & penanganan hipoglikemia', 'KIE'),
  genericStation('06', 'Compounding / peracikan', 'Compounding'),
  genericStation('07', 'Monitoring Efek Samping Obat (MESO)', 'Monitoring_Efek_Samping'),
  genericStation('08', 'Pengelolaan cold chain — penyimpanan vaksin', 'Monitoring_Efek_Samping'),
  genericStation('09', 'Antibiotik pediatri — rekonstitusi dosis anak', 'Compounding'),
  genericStation('10', 'Konseling obat untuk ibu hamil dan menyusui', 'KIE'),
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
