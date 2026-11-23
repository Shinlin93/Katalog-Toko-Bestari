# DESIGN.md: Toko Bestari (Bestari Plastik)

Catatan arah desain website katalog. Isinya disalin dari arahan pemilik toko dan dari warna yang sudah dipakai di `css/tema.css`. Kalau ada yang berubah, ubah di sini dan di `tema.css` bersamaan.

## Identitas

- Nama di website: **Toko Bestari**. Nama di spanduk: **Bestari Plastik**. Keduanya ditampilkan bersama, misalnya "Toko Bestari (Bestari Plastik)".
- Dua toko: Toko Gedangan (Jl. Wirabumi No. 97, Gedangan, Sidoarjo) dan Toko Sarirogo (Ruko Citra City R-19, Sarirogo, Sidoarjo). Data toko diatur di `js/pengaturan.js` (`toko`).
- Maskot: kelinci bercelemek merah (`aset/logo-maskot.jpg`). Dipakai sebagai logo dan pemandu di panduan belanja.
- Barang: plastik, kemasan, dan perabot rumah tangga. Harga diambil dari Google Sheets.

## Kepribadian

- **Rapi dan terpercaya.** Tampilan tenang, tidak ramai, dan informasinya jujur.
- **Mudah dipahami.** Bahasa Indonesia sehari-hari, kalimat pendek, dan tanpa istilah teknis.
- **HP lebih dulu.** Sebagian besar pembeli membuka website dari HP. Yang terpenting, informasinya tersampaikan: barang, harga, cara pesan, dan alamat.

## Warna

| Peran | Terang | Gelap | Catatan |
|---|---|---|---|
| Latar area produk | #ECEFF5 | #0F1623 | Abu terang supaya kartu putih menonjol |
| Footer (bingkai) | #12264D | #1F3561 | Biru tua dengan garis merah di atasnya, teks putih |
| Kartu | #FFFFFF | #172033 | |
| Teks | #1B2433 | #E6EBF3 | |
| Teks pelan | #566174 | #A3AEC0 | Kontras lolos 4,5:1 |
| Biru utama (tombol) | #1D5FD8 | #5B93F5 | Biru dikurangi: hanya untuk tombol aksi, hero, dan menu aktif |
| Merah aksen | #C8102E | #FF8A80 | Diambil dari celemek maskot. Untuk harga, garis bawah judul bagian, dan jumlah di keranjang |
| Hijau WhatsApp | #168F46 (ikon), #137A3C (tombol bertulisan) | sama | |
| Garis kartu | #BAC4D3 | #3A4766 | |

Halaman dibagi menjadi empat area dengan warna berbeda supaya pembeli tidak bingung:
1. Atas (header dan menu): putih. Menu yang aktif ditandai teks merah dan garis bawah merah.
2. Hero: biru terang.
3. Area produk: latar abu terang dengan kartu putih.
4. Footer: biru tua dengan garis merah.

Aturan: satu warna utama (biru), satu aksen (merah), dan hijau khusus untuk WhatsApp. Tidak memakai gradien dekoratif.

## Huruf

Teks memakai font bawaan perangkat (system-ui), jadi tampil tanpa mengunduh font dan tetap cepat di HP dengan sinyal lemah. Khusus nama "Toko Bestari" di header memakai Plus Jakarta Sans ExtraBold (pilihan pemilik toko), dan hanya huruf nama toko yang diunduh dari Google Fonts.

## Bentuk

- Sudut tombol dan kolom: 10 px. Sudut kartu: 14 px.
- Bentuk kapsul hanya untuk filter kategori dan lencana, supaya mudah dibedakan dari tombol aksi.
- Bayangan hanya untuk elemen yang melayang (tombol WhatsApp, saran pencarian).

## Tata letak

- Urutan halaman depan: header dan menu, hero, katalog, footer. Tiap informasi hanya muncul di satu tempat utama.
- Hero cukup berisi judul, satu kalimat, dua tombol, dan panel berisi jumlah produk serta 3 langkah cara pesan. Contoh chat pesanan ada di FAQ.
- FAQ punya halaman sendiri (faq.html), dibuka dari menu atas dan dari link di footer. Footer di setiap halaman berisi alamat, logo WhatsApp dan Instagram, dan link FAQ.
- HP (sampai 699 px): satu kolom, produk dua kolom, dan langkah cara pesan hanya menampilkan judulnya.
- Dua toko, dua katalog, dua keranjang: tombol Toko Gedangan dan Toko Sarirogo di atas katalog, dengan alamat toko terpilih di bawahnya. Pilihan diingat, dan link ?toko=citra langsung membuka katalog Toko Sarirogo. Satu pesanan untuk satu toko: keranjang mengikuti toko yang dipilih, keranjang toko lain tetap tersimpan, tombol pilihan toko menampilkan "N di keranjang", dan di dalam keranjang ada pengingat "Keranjang Toko ... masih berisi N barang". Pesan WhatsApp selalu menyebut toko dan alamat tempat mengambil di baris pertama. Barang yang dijual di kedua toko memakai KODE yang sama di kedua spreadsheet, untuk "Juga tersedia di" di halaman produk. Bila barang yang dicari tidak ada di toko yang dipilih tapi ada di toko lain, hasil pencarian menampilkan "Tidak ada di Toko …, tapi barang ini ada di toko kami yang lain" dengan tombol "Lihat di Toko … (jumlah)" yang langsung membuka katalog toko itu. Kotak saran saat mengetik hanya berisi barang toko yang dipilih.
- Tablet (700 sampai 1039 px): hero dua kolom, produk tiga atau empat kolom.
- Desktop (1040 px ke atas): header satu baris, produk empat sampai enam kolom.
- Semua tombol dan link minimal 44 x 44 px.

## Tombol

- Hijau WhatsApp penuh dengan logo untuk tombol yang mengirim pesan, yaitu Kirim pesanan di keranjang dan tombol melayang. Ini aksi paling penting.
- Biru penuh untuk aksi utama di halaman detail produk (Tambah ke Keranjang), tombol cari, dan tombol keranjang.
- Biru muda dengan tulisan biru untuk tombol + Keranjang di kartu katalog, supaya puluhan kartu tidak dipenuhi blok biru.
- Bergaris untuk aksi kedua. Tombol WhatsApp yang bergaris tetap diberi logo.
- Aksi yang tidak bisa dibatalkan, seperti mengosongkan keranjang, selalu ditanyakan dulu.
- Pengaturan jarang dipakai (tema) cukup berupa ikon 44 x 44 px.

## Teks

- Ajakan yang jelas: "Tambah ke Keranjang", "Chat WhatsApp", "Tanya stok lewat WhatsApp".
- Tidak memakai tanda pisah panjang (em dash).
- Tidak menampilkan angka penjualan atau barang terlaris, karena itu data yang sensitif terhadap pesaing.
- Selalu ingatkan bahwa harga bisa berubah dan dipastikan lewat WhatsApp.

## Tingkat kemeriahan

ENERGI 2 / RITME 2 / GERAK 1: tenang dengan sedikit variasi. Gerakan hanya ada di slider hero, dan berhenti bila perangkat meminta animasi dikurangi.
