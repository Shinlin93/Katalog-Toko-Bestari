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
