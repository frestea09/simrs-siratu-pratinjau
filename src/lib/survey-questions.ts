
export type SurveyDimension =
  | 'Kerja Tim dalam Unit'
  | 'Dukungan Manajemen'
  | 'Umpan Balik & Komunikasi'
  | 'Frekuensi Pelaporan Insiden'
  | 'Kerja Sama Antar Unit'
  | 'Respons Non-punitif'
  | 'Staf & Beban Kerja'
  | 'Persepsi Keselamatan Umum';

export type SurveyQuestion = {
  id: string;
  dimension: SurveyDimension;
  text: string;
  isNegative?: boolean; // Menandakan pertanyaan dengan kalimat negatif
};

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  // --- Dimensi: Kerja Tim dalam Unit ---
  {
    id: 'A1',
    dimension: 'Kerja Tim dalam Unit',
    text: 'Staf di unit ini saling mendukung satu sama lain.',
  },
  {
    id: 'A2',
    dimension: 'Kerja Tim dalam Unit',
    text: 'Di unit ini, staf saling menghargai.',
  },
  {
    id: 'A3',
    dimension: 'Kerja Tim dalam Unit',
    text: 'Bila banyak pekerjaan yang harus diselesaikan, staf di unit ini saling membantu.',
  },
  {
    id: 'A4',
    dimension: 'Kerja Tim dalam Unit',
    text: 'Di unit ini, kami bekerja sama sebagai tim yang efektif.',
  },
   // --- Dimensi: Dukungan Manajemen RS untuk Keselamatan Pasien ---
  {
    id: 'B1',
    dimension: 'Dukungan Manajemen',
    text: 'Manajemen rumah sakit ini menyediakan iklim kerja yang mendukung keselamatan pasien.',
  },
  {
    id: 'B2',
    dimension: 'Dukungan Manajemen',
    text: 'Tindakan manajemen rumah sakit menunjukkan bahwa keselamatan pasien adalah prioritas utama.',
  },
  {
    id: 'B3',
    dimension: 'Dukungan Manajemen',
    text: 'Manajemen rumah sakit hanya tertarik pada keselamatan pasien jika terjadi insiden.',
    isNegative: true,
  },
    // --- Dimensi: Umpan Balik & Komunikasi Tentang Insiden ---
  {
    id: 'C1',
    dimension: 'Umpan Balik & Komunikasi',
    text: 'Kami diberi umpan balik mengenai perubahan yang dilaksanakan berdasarkan laporan insiden.',
  },
  {
    id: 'C2',
    dimension: 'Umpan Balik & Komunikasi',
    text: 'Kami diberi tahu tentang insiden yang terjadi di unit lain.',
  },
  {
    id: 'C3',
    dimension: 'Umpan Balik & Komunikasi',
    text: 'Di unit ini, kami membahas cara untuk mencegah terulangnya kembali insiden.',
  },
   // --- Dimensi: Frekuensi Pelaporan Insiden ---
  {
    id: 'D1',
    dimension: 'Frekuensi Pelaporan Insiden',
    text: 'Bila terjadi kesalahan, tetapi sempat dicegah sebelum berdampak pada pasien, seberapa sering hal ini dilaporkan?',
  },
  {
    id: 'D2',
    dimension: 'Frekuensi Pelaporan Insiden',
    text: 'Bila terjadi kesalahan, tetapi tidak berpotensi mencelakakan pasien, seberapa sering hal ini dilaporkan?',
  },
  {
    id: 'D3',
    dimension: 'Frekuensi Pelaporan Insiden',
    text: 'Bila terjadi kesalahan yang dapat mencelakakan pasien tetapi tidak terjadi cedera, seberapa sering hal ini dilaporkan?',
  },
  // --- Dimensi: Kerja Sama Antar Unit ---
  {
    id: 'E1',
    dimension: 'Kerja Sama Antar Unit',
    text: 'Terdapat kerja sama yang baik antar unit kerja yang ada di rumah sakit ini.',
  },
  {
    id: 'E2',
    dimension: 'Kerja Sama Antar Unit',
    text: 'Antar unit di rumah sakit ini terdapat koordinasi yang baik.',
  },
  {
    id: 'E3',
    dimension: 'Kerja Sama Antar Unit',
    text: 'Seringkali tidak menyenangkan bekerja dengan staf dari unit lain di rumah sakit ini.',
    isNegative: true,
  },
  // --- Dimensi: Respons Non-punitif Terhadap Kesalahan ---
  {
    id: 'F1',
    dimension: 'Respons Non-punitif',
    text: 'Staf merasa leluasa berbicara jika melihat sesuatu yang dapat berdampak negatif pada pasien.',
  },
  {
    id: 'F2',
    dimension: 'Respons Non-punitif',
    text: 'Staf merasa bebas untuk mempertanyakan keputusan atau tindakan atasannya.',
  },
  {
    id: 'F3',
    dimension: 'Respons Non-punitif',
    text: 'Laporan insiden yang kami buat disimpan sebagai catatan dalam berkas kepegawaian kami.',
    isNegative: true,
  },
  // --- Dimensi: Staf & Beban Kerja ---
  {
    id: 'G1',
    dimension: 'Staf & Beban Kerja',
    text: 'Jumlah staf di unit kami cukup untuk menangani beban kerja yang ada.',
  },
  {
    id: 'G2',
    dimension: 'Staf & Beban Kerja',
    text: 'Staf di unit kami bekerja lebih lama dari jam kerja untuk merawat pasien.',
    isNegative: true,
  },
  {
    id: 'G3',
    dimension: 'Staf & Beban Kerja',
    text: 'Kami bekerja dalam "mode krisis", mencoba melakukan terlalu banyak dan terlalu cepat.',
    isNegative: true,
  },
    // --- Dimensi: Persepsi Keselamatan Pasien Secara Umum ---
  {
    id: 'H1',
    dimension: 'Persepsi Keselamatan Umum',
    text: 'Prosedur dan sistem di rumah sakit ini baik dalam mencegah terjadinya kesalahan.',
  },
  {
    id: 'H2',
    dimension: 'Persepsi Keselamatan Umum',
    text: 'Hanyalah sebuah kebetulan jika insiden yang lebih serius tidak terjadi di sini.',
    isNegative: true,
  },
  {
    id: 'H3',
    dimension: 'Persepsi Keselamatan Umum',
    text: 'Budaya keselamatan pasien di unit kami sudah baik.',
  },
];
