# DESIGN.md: Toko Bestari (Bestari Plastik)

Catatan arah desain website katalog. Isinya disalin dari arahan pemilik toko dan dari warna yang sudah dipakai di `css/tema.css`. Kalau ada yang berubah, ubah di sini dan di `tema.css` bersamaan.

## Identitas

- Nama di website: **Toko Bestari**. Nama di spanduk: **Bestari Plastik**. Keduanya ditampilkan bersama, misalnya "Toko Bestari (Bestari Plastik)".
- Dua toko: Toko Wirabumi (Jl. Wirabumi No. 97, Gedangan, Sidoarjo) dan Toko Citra City (Ruko Citra City R-19). Data toko diatur di `js/pengaturan.js` (`toko`).
- Maskot: kelinci bercelemek merah (`aset/logo-maskot.jpg`). Dipakai sebagai logo dan pemandu di panduan belanja.
- Barang: plastik, kemasan, dan perabot rumah tangga. Harga diambil dari Google Sheets.

## Kepribadian

- **Rapi dan terpercaya.** Tampilan tenang, tidak ramai, dan informasinya jujur.
- **Mudah dipahami.** Bahasa Indonesia sehari-hari, kalimat pendek, dan tanpa istilah teknis.
- **HP lebih dulu.** Sebagian besar pembeli membuka website dari HP. Yang terpenting, informasinya tersampaikan: barang, harga, cara pesan, dan alamat.

## Warna

| Peran | Terang | Gelap | Catatan |
|---|---|---|---|
| Latar | #F4F6FA | #0F1623 | |
| Kartu | #FFFFFF | #172033 | |
| Teks | #1B2433 | #E6EBF3 | |
| Teks pelan | #566174 | #A3AEC0 | Kontras lolos 4,5:1 |
| Biru utama (tombol) | #1D5FD8 | #5B93F5 | Biru dikurangi: hanya untuk tombol aksi, hero, dan menu aktif |
| Merah aksen | #C8102E | #FF8A80 | Diambil dari celemek maskot. Untuk harga, garis bawah judul bagian, dan jumlah di keranjang |
| Hijau WhatsApp | #168F46 (ikon), #137A3C (tombol bertulisan) | sama | |
| Garis kartu | #BAC4D3 | #3A4766 | |

Aturan: satu warna utama (biru), satu aksen (merah), dan hijau khusus untuk WhatsApp. Tidak memakai gradien dekoratif.

## Huruf

Memakai font bawaan perangkat (system-ui). Website jadi tampil tanpa mengunduh font, dan tetap cepat di HP dengan sinyal lemah.

## Bentuk

- Sudut tombol dan kolom: 10 px. Sudut kartu: 14 px.
- Bentuk kapsul hanya untuk filter kategori dan lencana, supaya mudah dibedakan dari tombol aksi.
- Bayangan hanya untuk elemen yang melayang (tombol WhatsApp, saran pencarian).

## Tata letak

- HP (sampai 699 px):
  - Satu kolom, produk dua kolom.
  - Hero diringkas, dan contoh chat dilipat.
  - Strip kategori dan kartu panduan disembunyikan karena isinya sudah ada di tempat lain.
- Tablet (700 sampai 1039 px): hero dua kolom, produk tiga atau empat kolom.
- Desktop (1040 px ke atas): header satu baris, produk empat sampai enam kolom.
- Semua tombol dan link minimal 44 x 44 px.

## Teks

- Ajakan yang jelas: "Tambah ke Keranjang", "Chat WhatsApp", "Tanya stok lewat WhatsApp".
- Tidak memakai tanda pisah panjang (em dash).
- Tidak menampilkan angka penjualan atau barang terlaris, karena itu data yang sensitif terhadap pesaing.
- Selalu ingatkan bahwa harga bisa berubah dan dipastikan lewat WhatsApp.

## Tingkat kemeriahan

ENERGI 2 / RITME 2 / GERAK 1: tenang dengan sedikit variasi. Gerakan hanya ada di slider hero, dan berhenti bila perangkat meminta animasi dikurangi.
