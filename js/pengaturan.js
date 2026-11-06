// Satu-satunya file yang perlu Anda edit untuk data toko.
var PENGATURAN = {
  namaToko: "Toko Bestari",
  tagline: "Plastik dan Peralatan Rumah Tangga",

  // Nomor WhatsApp diawali 62, tanpa + atau spasi. Kosong berarti tombol pesan nonaktif.
  waNomor: "6285136879923",
  waTampil: "0851-3687-9923",

  alamat: "Jl. Wirabumi No. 97, Gedangan, Sidoarjo",
  lokasiSingkat: "Gedangan, Sidoarjo",
  instagram: "bestari.store2",

  // Link CSV dari Google Sheets (File > Bagikan > Publikasikan ke web, format .csv).
  sheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIaFMLVXEA2sKENSW79x0tmdpKx8VtiieeaWeAwAipPTmCOeclfSbyjrhwyoqs0C3jaanlj45MBgNN/pub?gid=791871072&single=true&output=csv",

  folderFoto: "foto/",
  produkPerHalaman: 40,

  // Kata yang disarankan saat pencarian tidak menemukan hasil, juga tombol cepat di hero.
  saranCari: ["kresek", "mika", "gelas", "toples", "sedotan"],

  // Teks bagian besar di atas halaman.
  hero: {
    label: "Toko plastik dan perabot · Gedangan, Sidoarjo",
    judul: "Cari kebutuhan plastik dan perabot rumah tangga dengan mudah",
    sub: "Butuh kresek, mika, gelas cup, atau ember dan baskom? Temukan barangnya di sini, kirim pesanan lewat WhatsApp, lalu ambil di toko kami di Gedangan."
  },

  // Slide tambahan di hero. Slide pertama selalu judul toko di atas; slide di bawah ini menyusul.
  // Untuk menambah slide: taruh gambar di folder aset/, lalu salin satu blok { ... } di bawah.
  //   gambar   = lokasi file gambar (disarankan lebar 1200 px, di bawah 200 KB)
  //   gambarHP = (opsional) versi tegak untuk HP, misalnya 1080 x 1350 px, supaya tulisannya terbaca
  //   alt      = penjelasan isi gambar untuk pembaca layar dan saat gambar gagal dimuat
  //   judul    = keterangan singkat di bawah gambar
  //   panduan  = id panduan yang dibuka saat gambar diketuk (kosongkan kalau tidak ada)
  slideHero: [
    {
      gambar: "aset/hero-panduan-kresek.jpg",
      alt: "Panduan ukuran kresek: ukuran 15, 21, 24, 35, 40, dan 55 beserta kegunaannya, dan pilihan warna putih bening, hitam, warna-warni, dan putih susu.",
      judul: "Panduan ukuran kresek",
      panduan: "ukuran-kresek"
    }
  ],
  // Lama tiap slide tampil, dalam detik.
  slideDetik: 6,

  // Panduan belanja. Tiap panduan tampil sebagai kartu di bagian "Panduan belanja", dibuka dalam jendela,
  // dan muncul sebagai petunjuk saat pengunjung memilih kategorinya atau mencari salah satu kata kuncinya.
  // Untuk menambah panduan: salin satu blok { ... } di bawah, beri id baru, lalu ubah isinya.
  //   pilihan[].cari  = kata yang dicari saat tombol "Lihat ..." ditekan.
  //   warna[].contoh  = warna contoh (kode warna atau gradien CSS). Hapus bagian warna kalau tidak perlu.
  panduan: [
    {
      id: "ukuran-kresek",
      judul: "Panduan ukuran kresek",
      ringkas: "Bingung pilih ukuran? Lihat perbandingan ukuran 15 sampai 55 dan kegunaannya.",
      pengantar: "Bingung pilih ukuran? Kenali perbedaannya, lalu pilih kresek sesuai kebutuhan belanja Anda.",
      petunjuk: "Bingung pilih ukuran kresek?",
      kategori: "Kresek",
      kataKunci: ["kresek"],
      pilihan: [
        { nama: "Ukuran 15", label: "Kecil", untuk: "Untuk camilan, obat-obatan, aksesoris, dan barang kecil.", cari: "kresek 15" },
        { nama: "Ukuran 21", label: "Kecil hingga sedang", untuk: "Untuk kosmetik, makanan kemasan, dan belanjaan ringan.", cari: "kresek 21" },
        { nama: "Ukuran 24", label: "Sedang", untuk: "Untuk pakaian, produk rumah tangga, dan belanjaan harian.", cari: "kresek 24" },
        { nama: "Ukuran 35", label: "Sedang hingga besar", untuk: "Untuk bahan makanan, pakaian, dan kebutuhan toko.", cari: "kresek 35" },
        { nama: "Ukuran 40", label: "Besar", untuk: "Untuk belanja bulanan dan barang berukuran besar.", cari: "kresek 40" },
        { nama: "Ukuran 55", label: "Jumbo", untuk: "Untuk belanja grosir dan barang yang sangat besar.", cari: "kresek 55" }
      ],
      warnaJudul: "Pilihan warna",
      warna: [
        { nama: "Putih bening", contoh: "linear-gradient(135deg, #FFFFFF, #DCE4EE)" },
        { nama: "Hitam", contoh: "#16181D" },
        { nama: "Warna-warni", contoh: "conic-gradient(#E53935, #FB8C00, #FDD835, #43A047, #1E88E5, #8E24AA, #E53935)" },
        { nama: "Putih susu", contoh: "#F3EFE6" }
      ]
    }
  ],

  // Pertanyaan di footer. Tambah, hapus, atau ubah sesuai kebijakan toko.
  faq: [
    { tanya: "Bagaimana cara memesan?",
      jawab: "Pilih barang, tekan Tambah ke Keranjang, lalu buka keranjang dan tekan Kirim pesanan lewat WhatsApp. Daftar pesanan Anda terkirim otomatis sebagai chat, lalu kami balas dengan konfirmasi stok dan total." },
    { tanya: "Apakah harga di website sudah pasti?",
      jawab: "Harga di website adalah harga terbaru dari kami, tetapi bisa berubah sewaktu-waktu. Total akhir dipastikan saat kami membalas chat pesanan Anda." },
    { tanya: "Apa arti satuan pak dan pcs?",
      jawab: "Pak berarti harga untuk satu bungkus berisi banyak lembar atau buah. Pcs berarti harga per satu buah. Satuan tertulis di samping harga setiap produk." },
    { tanya: "Bagaimana kalau stok tertulis tinggal sedikit?",
      jawab: "Barang masih bisa dipesan, tetapi jumlahnya terbatas. Kirim pesanan lebih awal, dan kami kabari lewat WhatsApp kalau stok tidak mencukupi." },
    { tanya: "Bagaimana cara membayar?",
      jawab: "Website ini tidak menerima pembayaran online. Pembayaran dilakukan setelah pesanan dan total dikonfirmasi lewat WhatsApp." },
    { tanya: "Apakah bisa dikirim?",
      jawab: "Pesanan bisa diambil langsung di toko. Untuk pengiriman, tanyakan area dan ongkos kirimnya lewat WhatsApp." },
    { tanya: "Barang yang saya cari tidak ada di katalog.",
      jawab: "Tanyakan saja lewat WhatsApp. Belum semua barang di toko tercantum di website." }
  ]
};
