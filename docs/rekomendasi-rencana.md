# Rencana mesin rekomendasi produk (Fase 1 sampai 3, menunggu persetujuan)

Tanggal: 24 November 2026. Belum ada kode website yang diubah.

## 1. Audit arsitektur yang ada

| Hal | Temuan |
|---|---|
| Framework | Tidak ada. HTML, CSS, dan JavaScript biasa tanpa build, di-deploy statis ke Vercel. Tidak ada React. |
| Halaman | `index.html` (katalog), `produk.html?id=KODE` (detail), `faq.html`. Tidak ada router; alamat produk tetap `produk.html?id=KODE`. |
| Sumber data | Google Sheets yang diterbitkan sebagai CSV, satu tab per toko (`js/pengaturan.js` → `toko[].sheetUrl`). Kolom: KODE, NAMA, KATEGORI, SATUAN, HARGA, STATUS, TAMPIL, FOTO (TAG dan SOROT opsional). |
| Pembacaan data | `js/data.js` (`KatalogData.muat`): ambil CSV, ubah ke objek produk `{id, kode, nama, kat, sat, harga, status, tampil, foto, tag}`. |
| ID produk | Toko utama: `id = KODE`. Toko lain: `id = "citra:" + KODE`. Link produk memakai `id`. |
| Cache | CSV terakhir disimpan di `localStorage`; dipakai bila Google Sheets gagal dimuat. Cadangan statis `js/data-cadangan.js` untuk toko utama. |
| Halaman produk | `js/produk.js`: `gambarProduk`, `gambarSerupa` (sekarang: 12 produk satu kategori, stok habis di belakang, urutan spreadsheet), `gambarTokoLain`. |
| Kartu produk | `KatalogTampilan.kartu(p)` di `js/tampilan.js`, dipakai katalog dan deretan "Produk lain di kategori ini". |
| Tes | Belum ada. Node 24 tersedia, jadi bisa memakai `node --test` bawaan tanpa paket tambahan. |

## 2. Analisis data

Dua sumber dibandingkan:

- **File POS `141126.xlsx`, sheet "Satu Harga"**: 1.416 barang, 24 kolom.
- **Google Sheets katalog website (Toko Gedangan)**: 1.427 baris, 1.411 tampil.

| Kolom POS | Kondisi | Dipakai? |
|---|---|---|
| KODEITEM | 1.416 unik, tidak ada duplikat. 1.343 dari 1.427 KODE website cocok. | Ya, sebagai kunci (sama dengan KODE di website) |
| NAMAITEM | 1.412 unik; 4 nama kembar (misalnya "SENDOK BEBEK WARNA") | Ya (NAMA di website) |
| JENIS | 126 nilai. Sama dengan KATEGORI website (ALT dipetakan menjadi "Perabot Plastik"). **ALT = 152 barang campuran** (seal cup, tisu, sumpit, plastik cetik). | Ya, lewat KATEGORI website; "Perabot Plastik" diberi bobot setengah |
| MEREK | 318 kosong, **"OTR" 231** (tersebar di ATK, toples, cetakan, kipas angin: nilai pengisi), **"LAIN LAIN" 131**. Merek asli hanya di sekitar 696 barang. **Tidak ada di Google Sheets website.** | Ya bila ditambahkan ke Google Sheets; OTR dan LAIN LAIN dianggap kosong |
| SATUAN | Hanya PCS (1.069), PAK (345), BOX (1), GLS (1) | Ya, bobot kecil (5%) |
| HARGAJUAL | 1 kosong, Rp 200 sampai Rp 1.750.000 | Ya (HARGA di website), dibandingkan secara rasio |
| STOK | 522 bernilai 0 | Tidak langsung; website sudah punya STATUS (tersedia 588, sedikit 326, habis 513) |
| TIPE, DEPT, SERIAL, POIN, KOMISISALES | Satu nilai untuk semua barang | Tidak (tidak membedakan apa pun) |
| HARGAPOKOK, SUPPLIER1 | Harga modal dan pemasok | **Tidak, dan tidak boleh masuk website atau repo** (data sensitif terhadap pesaing) |
| KODEBARCODE, RAK, KETERANGAN, JENISPAJAK, OPT, KODEREFERENSI | Sebagian besar kosong | Tidak |

Lain-lain: 115 kategori tampil, 18 kategori hanya berisi 1 produk, 46 kategori berisi 3 produk atau kurang.

## 3. Pohon biner atau indeks lain?

**Usulan: tidak memakai pohon biner. Pakai indeks peta (Map) per kategori dan per kata nama.**

- Pohon keputusan biner membelah data dengan pertanyaan ya/tidak. Atribut utama di sini (KATEGORI, 115 nilai; MEREK, sekitar 125 nilai) adalah kategori tanpa urutan. Pohon biner untuk atribut seperti ini menjadi rantai panjang "kategori = A? tidak → kategori = B? …", lebih lambat dan lebih rumit daripada satu `Map` yang langsung menjawab "produk di kategori A".
- Data hanya sekitar 1.400 produk. Prototipe Python membangun indeks dalam 6 ms dan menghitung rekomendasi untuk **semua** produk dalam 0,9 detik (0,64 ms per produk). Di browser cukup dihitung untuk satu produk yang sedang dibuka.
- Indeks peta mudah dibangun ulang setiap kali data spreadsheet berubah, tanpa menyeimbangkan pohon.
- Bila nanti ada atribut berurutan (ukuran, volume ml) dan data ribuan kali lebih besar, pohon pencarian bisa ditambahkan untuk atribut itu saja. Strukturnya disiapkan agar bisa ditambah, tapi tidak dibuat sekarang.

Indeks yang dibangun:

1. `perKategori`: kategori → daftar produk.
2. `perKata`: kata di nama (tanpa angka ukuran) → daftar produk, untuk menangkap barang serupa beda kategori (misalnya "Seal cup" di kategori campuran).
3. Frekuensi kata, supaya kata umum ("plastik") bernilai kecil dan kata khas ("thinwall") bernilai besar.

Kandidat = semua produk satu kategori + produk yang berbagi kata khas (kata yang muncul di 60 produk atau kurang).

## 4. Skor kemiripan

Bobot awal (bisa diubah di `pengaturan.js`):

| Atribut | Bobot | Cara menghitung (0 sampai 1) |
|---|---:|---|
| KATEGORI (JENIS) | 40% | 1 bila sama; 0,5 bila sama-sama "Perabot Plastik" (kategori campuran); 0 bila beda |
| NAMA | 25% | Kemiripan kata berbobot kekhasan (kata khas bernilai lebih), ditambah 0,1 bila ukurannya sama |
| MEREK | 15% | 1 bila sama, 0 bila beda. **Dilewati** bila salah satu kosong, OTR, atau LAIN LAIN |
| HARGA | 15% | Berdasarkan rasio harga: harga sama = 1, beda 5 kali lipat atau lebih = 0 |
| SATUAN | 5% | 1 bila sama, 0 bila beda |

**Bobot dinormalkan:** bila satu atribut tidak bisa dibandingkan (misalnya merek kosong), atribut itu dilewati dan skor dibagi jumlah bobot yang tersisa. Produk tanpa merek tidak dihukum.

## 5. Peringkat

1. Buang produk yang sedang dibuka dan produk bernama sama persis (nama kembar).
2. Buang skor di bawah ambang (awal 0,35) supaya tidak mengisi daftar dengan barang yang tidak nyambung.
3. Urutkan: produk berstok (tersedia atau sedikit) lebih dulu, lalu skor tertinggi. Produk habis **tetap tampil** di belakang (bisa diubah menjadi disembunyikan lewat pengaturan).
4. Ambil maksimal 8. Bila kandidat kurang dari 8, tampilkan seadanya; bila nol, bagian disembunyikan.

## 6. Contoh hasil prototipe (data asli)

**Plastik PE Hitam Tali Putih 9X20 Boyo**: 8 rekomendasi, semuanya Plastik PE Boyo. Teratas ukuran lain dari seri yang sama (11X22, 12X25, 14X33) dan versi tali merah. Sangat relevan.

**Paper Tray UK S (Converpack)**: Paper Tray M dan L (skor 0,87), lalu tiga kardus Converpack (skor 0,35 sampai 0,38, lolos tipis karena merek dan harga sama).

**Kresek 257 UK 15**: 8 kresek lain dengan harga terdekat. Ukuran 15 yang sama (Penari Bali UK 15) naik ke atas.

**Tutup Cembung Polos Sukawa**: tutup lain naik ke atas, **tapi gelas cup HOK juga masuk** (skor 0,75) karena kategori, merek, dan harganya sama walau namanya tidak mirip sama sekali. Gelas cup bagi tutup sebenarnya **pelengkap**, bukan barang serupa. Ini tanda bobot NAMA 25% terlalu kecil untuk kategori seperti Gelas Cup. Usulan penyesuaian setelah tes: NAMA 35%, KATEGORI 30%.

Statistik: 231 produk mendapat kurang dari 8 rekomendasi (kategori kecil), dan 15 produk tidak mendapat rekomendasi sama sekali (bagian disembunyikan).

## 7. Produk Pelengkap

Data hubungan antarbarang (misalnya gelas cup ↔ tutup ↔ sedotan ↔ seal cup) **tidak ada** di spreadsheet, dan riwayat pembelian juga belum ada. Dua pilihan:

- **A. Dimatikan dulu** (sesuai permintaan bila data tidak ada). Bagian "Produk Pelengkap" tidak tampil.
- **B. Aturan pasangan yang ditulis pemilik toko**, misalnya di `pengaturan.js`: `{ dari: "Gelas Cup", ke: ["Seal Cup", "Sedotan"] }`. Dihitung terpisah dari skor kemiripan, dan hanya tampil untuk kategori yang punya aturan.

Rekomendasi: mulai dengan A, lalu B setelah Anda menyusun daftar pasangan.

## 8. Rencana file

| File | Perubahan |
|---|---|
| `js/rekomendasi.js` (baru) | Mesin rekomendasi murni tanpa tampilan: normalisasi produk, indeks, skor, dan peringkat. Bisa dipakai browser dan Node (untuk tes). |
| `js/pengaturan.js` | Tambah blok `rekomendasi`: bobot, ambang, jumlah maksimal, nilai merek pengisi (OTR, LAIN LAIN), kategori campuran, aturan stok habis, dan aturan pelengkap (kosong). |
| `js/data.js` | Membaca kolom MEREK bila ada (opsional; tanpa kolom ini semua tetap jalan). Tidak ada perubahan lain. |
| `js/produk.js` | `gambarSerupa` memakai mesin rekomendasi; tambah bagian pelengkap (tersembunyi bila tidak ada aturan). Kartu tetap `KatalogTampilan.kartu`. |
| `produk.html` | Judul "Produk lain di kategori ini" menjadi "Produk Serupa"; tambah bagian "Produk Pelengkap" yang tersembunyi; tambah satu `<script>`. |
| `tests/rekomendasi.test.js` (baru) | Tes dengan `node --test` memakai salinan CSV katalog website (data publik, tanpa harga modal). |
| `tests/data/katalog-gedangan.csv` (baru) | Salinan data uji. |
| `docs/rekomendasi.md` (baru) | Dokumentasi teknis. |

Yang tidak berubah: tampilan, CSS, katalog, pencarian, filter, keranjang, alamat halaman, dan cara membaca Google Sheets.

**Tentang komponen React:** website tidak memakai React. Menambah React berarti menambah framework dan proses build untuk satu bagian. Usulan: tampilan rekomendasi memakai kartu produk yang sudah ada (`KatalogTampilan.kartu`), sesuai larangan mengganti aplikasi.

**Cache:** indeks dibangun sekali setiap data dimuat (di memori), lalu hasil per produk disimpan di memori. Saat data baru dari Google Sheets masuk (`muat` mengembalikan `terbaru`), indeks dibangun ulang.

## 9. Keputusan yang dibutuhkan

1. Setuju memakai indeks peta, bukan pohon biner?
2. Kolom MEREK: tambahkan kolom MEREK ke Google Sheets katalog (disalin dari POS berdasarkan KODE), atau jalan dulu tanpa merek (bobot merek dilewati otomatis)?
3. Produk Pelengkap: A (dimatikan) atau B (aturan pasangan dari pemilik toko)?
4. Bobot: pakai bobot awal dulu (40/25/15/15/5), atau langsung NAMA 35% dan KATEGORI 30%?
