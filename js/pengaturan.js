// Satu-satunya file yang perlu Anda edit untuk data toko.
var PENGATURAN = {
  namaToko: "Toko Bestari",
  tagline: "Plastik dan Peralatan Rumah Tangga",

  // Nomor WhatsApp diawali 62, tanpa + atau spasi. Kosong berarti tombol pesan nonaktif.
  waNomor: "6285136879923",
  waTampil: "0851-3687-9923",

  // Nama yang tertulis di spanduk toko, ditampilkan di samping nama toko supaya pembeli tahu ini toko yang sama.
  namaLain: "Bestari Plastik",

  // Daftar toko. Tiap toko punya katalog sendiri dari link CSV Google Sheets masing-masing
  // (File > Bagikan > Publikasikan ke web, pilih tab-nya, format .csv).
  //   id       = nama pendek untuk link, misalnya katalog-toko-bestari.vercel.app/?toko=citra
  //   nama     = nama yang tampil di tombol pilihan toko, keranjang, dan pesan WhatsApp
  //   alamat   = tampil di bawah tombol pilihan toko dan di footer, dengan link Google Maps
  //   sheetUrl = link CSV katalog toko ini
  // Toko pertama adalah toko utama: tampil lebih dulu untuk pengunjung baru, dan link produk lamanya tetap berlaku.
  // PENTING: barang yang dijual di lebih dari satu toko harus memakai KODE yang sama persis di setiap spreadsheet.
  // Dari KODE itu website tahu barangnya sama, untuk "Juga tersedia di" di halaman produk.
  toko: [
    { id: "gedangan", nama: "Toko Gedangan", alamat: "Jl. Wirabumi No. 97, Gedangan, Sidoarjo",
      sheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIaFMLVXEA2sKENSW79x0tmdpKx8VtiieeaWeAwAipPTmCOeclfSbyjrhwyoqs0C3jaanlj45MBgNN/pub?gid=791871072&single=true&output=csv" },
    // CONTOH: belum ada spreadsheet Toko Sarirogo, jadi sementara memakai file contoh di folder data/.
    // Ganti dengan link CSV tab Toko Sarirogo setelah tab-nya dibuat dan diterbitkan.
    { id: "citra", nama: "Toko Sarirogo", alamat: "Ruko Citra City R-19, Sarirogo, Sidoarjo",
      sheetUrl: "data/contoh-citra.csv" }
  ],
  // Alamat utama, dipakai bila daftar toko di atas kosong.
  alamat: "Jl. Wirabumi No. 97, Gedangan, Sidoarjo",
  instagram: "bestari.store2",

  folderFoto: "foto/",
  produkPerHalaman: 40,

  // Kata yang disarankan saat pencarian tidak menemukan hasil.
  saranCari: ["kresek", "mika", "gelas", "toples", "sedotan"],

  // Teks bagian besar di atas halaman.
  hero: {
    judul: "Cari kebutuhan plastik dan perabot rumah tangga dengan mudah",
    sub: "Kresek, mika, gelas cup, sampai perabot rumah tangga. Pesan lewat WhatsApp, ambil di toko kami."
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

  // Pertanyaan di halaman faq.html. Tambah, hapus, atau ubah sesuai kebijakan toko.
  // contoh: true menampilkan contoh chat pesanan di bawah jawaban.
  faq: [
    { tanya: "Bagaimana cara memesan?",
      jawab: "Pilih barang, tekan + Keranjang, lalu buka keranjang dan tekan Kirim pesanan lewat WhatsApp. Daftar pesanan Anda terkirim otomatis sebagai chat, lalu kami balas dengan konfirmasi stok dan total.",
      contoh: true },
    { tanya: "Apakah harga di website sudah pasti?",
      jawab: "Harga di website adalah harga terbaru dari kami, tetapi bisa berubah sewaktu-waktu. Total akhir dipastikan saat kami membalas chat pesanan Anda." },
    { tanya: "Apa arti satuan pak dan pcs?",
      jawab: "Pak berarti harga untuk satu bungkus berisi banyak lembar atau buah. Pcs berarti harga per satu buah. Satuan tertulis di samping harga setiap produk." },
    { tanya: "Bagaimana kalau stok tertulis tinggal sedikit?",
      jawab: "Barang masih bisa dipesan, tetapi jumlahnya terbatas. Kirim pesanan lebih awal, dan kami kabari lewat WhatsApp kalau stok tidak mencukupi." },
    { tanya: "Bagaimana cara membayar?",
      jawab: "Website ini tidak menerima pembayaran online. Pembayaran dilakukan setelah pesanan dan total dikonfirmasi lewat WhatsApp." },
    { tanya: "Apakah bisa dikirim?",
      jawab: "Pesanan bisa diambil langsung di Toko Gedangan atau Toko Sarirogo. Untuk pengiriman, tanyakan area dan ongkos kirimnya lewat WhatsApp." },
    { tanya: "Bisakah memesan dari dua toko sekaligus?",
      jawab: "Keranjang dipisah per toko, karena pesanan disiapkan di toko masing-masing. Pilih toko pertama, kirim pesanannya, lalu pindah ke toko kedua dan kirim pesanan berikutnya. Isi keranjang tiap toko tetap tersimpan saat Anda pindah toko." },
    { tanya: "Barang yang saya cari tidak ada di katalog.",
      jawab: "Tanyakan saja lewat WhatsApp. Belum semua barang di toko tercantum di website." }
  ]
};
