export const copy = {
  appName: "ElakHujan",
  appTagline: "Perancang Hujan untuk Rider",

  nav: {
    weekly: "Mingguan",
    leave: "Masa Balik",
    settings: "Tetapan",
  },

  onboarding: {
    stepOf: (current: number, total: number) =>
      `Langkah ${current} daripada ${total}`,
    next: "Seterusnya",
    back: "Kembali",
    finish: "Selesai",

    location: {
      title: "Lokasi Anda",
      subtitle:
        "Tetapkan lokasi rumah dan pejabat untuk ramalan cuaca yang tepat.",
      homeLabel: "Rumah",
      homePlaceholder: "Cari lokasi rumah...",
      officeLabel: "Pejabat",
      officePlaceholder: "Cari lokasi pejabat...",
      stateLabel: "Negeri",
      statePlaceholder: "Pilih negeri",
      searching: "Mencari...",
      noResults: "Tiada keputusan. Cuba carian lain.",
      selectResult: "Pilih lokasi daripada senarai.",
    },

    commute: {
      title: "Waktu Perjalanan",
      subtitle: "Berapa lama masa perjalanan anda ke dan dari pejabat?",
      morningLabel: "Perjalanan Pagi",
      eveningLabel: "Perjalanan Petang",
      startLabel: "Mula",
      endLabel: "Tamat",
    },

    days: {
      title: "Hari Pejabat",
      subtitle: "Berapa hari anda pergi ke pejabat setiap minggu?",
      daysPerWeekLabel: "Bilangan hari seminggu",
      preferredDaysLabel: "Hari yang diutamakan",
      days: {
        monday: "Isn",
        tuesday: "Sel",
        wednesday: "Rab",
        thursday: "Kha",
        friday: "Jum",
      },
    },
  },

  settings: {
    title: "Tetapan",
    sectionLocation: "Lokasi",
    sectionCommute: "Waktu Perjalanan",
    sectionOfficeDays: "Hari Pejabat",
    sectionRisk: "Had Risiko Hujan",
    rainThresholdHelper: (value: number) =>
      `Perjalanan dianggap berisiko apabila kebarangkalian hujan melebihi ${value}%.`,
    saveButton: "Simpan Tetapan",
    saved: "Disimpan!",
    resetTitle: "Set Semula Aplikasi",
    resetButton: "Padam semua data",
    resetConfirm:
      "Ini akan memadam semua tetapan anda dan kembali ke skrin persediaan. Teruskan?",
  },

  errors: {
    weatherFetch: "Gagal mendapatkan data cuaca. Cuba lagi.",
    locationSearch: "Gagal mencari lokasi. Cuba lagi.",
  },

  weekly: {
    title: "Rancangan Minggu Ini",
    recommended: "Disyorkan",
    officeDay: "Hari Pejabat",
    loading: "Memuatkan ramalan cuaca...",
    errorFetch: "Gagal memuatkan cuaca. Cuba lagi.",
    staleData: "Data tidak dapat dikemas kini — menunjukkan ramalan lama.",
    morning: "Pagi",
    evening: "Petang",
  },

  leaveAdvisor: {
    title: "Masa Terbaik Balik",
    panelLabel: "Terbaik bertolak",
    recommendedSlot: "Masa yang disyorkan",
    noDryWindow:
      "Tiada tetingkap kering — pilih masa dengan risiko paling rendah.",
    scanWindowTitle: "Tetingkap petang",
    rollingTitle: "Dari sekarang",
    refresh: "Muat semula",
    loading: "Mengira masa terbaik...",
    noOfficeWeather: "Data cuaca pejabat tidak tersedia.",
  },

  dayDetail: {
    loading: "Memuatkan data cuaca...",
    noData: "Data cuaca tidak tersedia untuk hari ini.",
    morningSection: "Perjalanan Pagi",
    eveningSection: "Perjalanan Petang",
    chartTitle: "Ramalan Hujan Sehari Penuh",
    legendMorning: "Pagi",
    legendEvening: "Petang",
    homeNote: "Lokasi Rumah",
    officeNote: "Lokasi Pejabat",
  },
};
