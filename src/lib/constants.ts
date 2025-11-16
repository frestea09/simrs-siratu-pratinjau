
export const INDICATOR_TEXTS = {
  defaults: {
    allUnits: "Semua Unit",
    allIndicators: "Semua Indikator",
  },
  filterCard: {
    title: "Filter & Tampilan Data",
    description: "Gunakan filter di bawah untuk menampilkan data yang lebih spesifik.",
    labels: {
      filter: "Filter Data",
      displayRange: "Tampilan & Rentang Waktu",
      custom: "Filter Kustom",
    },
    placeholders: {
      unit: "Pilih unit...",
      unitSearch: "Cari unit...",
      indicator: "Pilih indikator...",
      indicatorSearch: "Cari indikator...",
      range: "Pilih rentang...",
      date: "Pilih tanggal",
    },
    filterTypeOptions: [
      { value: "this_month", label: "Bulan Ini" },
      { value: "7d", label: "7 Hari Terakhir" },
      { value: "30d", label: "30 Hari Terakhir" },
      { value: "3m", label: "3 Bulan Terakhir" },
      { value: "6m", label: "6 Bulan Terakhir" },
      { value: "1y", label: "1 Tahun Terakhir" },
      { value: "daily", label: "Harian (Custom)" },
      { value: "monthly", label: "Bulanan (Custom)" },
      { value: "yearly", label: "Tahunan (Custom)" },
    ],
  },
  chartCard: {
    title: "Capaian Indikator Terkini",
    emptyState: "Tidak cukup data untuk menampilkan grafik.",
    tooltip: {
      capaian: "Capaian",
      standar: "Standar",
    },
  },
  dashboard: {
    chartDescriptions: {
      all: (category: string) =>
        `Menampilkan rata-rata capaian semua indikator ${category}.`,
      specific: (indicator: string) =>
        `Menampilkan tren untuk: ${indicator}.`,
    },
    report: {
      title: (pageTitle: string) => `Laporan ${pageTitle}`,
      description: (pageTitle: string) =>
        `Riwayat data ${pageTitle} yang telah diinput.`,
    },
    pageTitles: {
      "IMP-RS": "Indikator Mutu Prioritas RS (IMP-RS)",
      IMPU: "Indikator Mutu Prioritas Unit (IMPU)",
      SPM: "Standar Pelayanan Minimal (SPM)",
    },
    categoryLabels: {
      INM: "Indikator Nasional Mutu",
      "IMP-RS": "Indikator Mutu Prioritas RS",
      IMPU: "Indikator Mutu Prioritas Unit",
      SPM: "Standar Pelayanan Minimal",
    },
  },
  report: {
    defaultTitle: (category: string) => `Laporan Indikator ${category}`,
    defaultDescription: (category: string) =>
      `Riwayat data indikator ${category} yang telah diinput.`,
    inputButton: "Input Data Capaian",
    tooltip: (category: string) =>
      `Tidak ada indikator ${category} yang diverifikasi untuk unit Anda.`,
    emptyChart: "Tidak ada data untuk periode ini.",
    previewTitle: (title: string | undefined, category: string) =>
      `Laporan Capaian ${title || `Indikator ${category}`}`,
  },
  statCards: {
    totalTitle: (category: string) => `Total Indikator ${category}`,
    totalDescription: "indikator yang dimonitor",
    meetingTitle: "Memenuhi Standar",
    meetingDescription: "capaian bulan ini",
    notMeetingTitle: "Tidak Memenuhi Standar",
    notMeetingDescription: "capaian bulan ini",
  },
  reportTable: {
    headers: {
      indicator: "Indikator",
      category: "Kategori",
      period: "Periode",
      ratio: "Capaian",
      standard: "Standar",
      status: "Status",
      actions: "Aksi",
    },
    invalidDate: "Tanggal Invalid",
    tooltip: {
      title: "Rincian Perhitungan",
      formulaLabel: "Formula:",
      substitutionLabel: "Substitusi:",
    },
    emptyState: "Tidak ada hasil.",
    summary: (filtered: number, total: number) =>
      `Menampilkan ${filtered} dari ${total} total data.`,
    pagination: {
      previous: "Sebelumnya",
      next: "Berikutnya",
    },
  },
} as const;

export const HOSPITAL_UNITS = [
    "Rawat Inap - Bougenville",
    "Rawat Inap - Anggrek",
    "Rawat Inap - Flamboyan",
    "Rawat Inap - Mawar",
    "Rawat Inap - Anyelir",
    "Rawat Inap - Melati",
    "Rawat Inap - Dahlia/VK",
    "Rawat Inap - Camelia",
    "Rawat Inap - Kenanga",
    "Rawat Inap - WK",
    "ICU",
    "PICU",
    "NICU",
    "IGD",
    "PONEK",
    "IBS",
    "Gizi",
    "Farmasi",
    "Kesling & K3RS",
    "Rawat Jalan",
    "Laboratorium",
    "Radiologi",
    "IPSRS",
    "SIMRS",
    "CSSD",
    "Laundry",
    "Keuangan",
    "Kepegawaian",
    "Bagian Umum",
    "Program Humas & Program",
    "PKRS"
];
