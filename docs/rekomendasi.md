# Mesin rekomendasi produk

Dipakai di halaman produk (`produk.html?id=KODE`) untuk bagian **Produk Serupa** dan **Produk Pelengkap**.
Dibuat 24 November 2026. Rencana dan analisis data awal: `docs/rekomendasi-rencana.md`.

## Ringkasan

```
Google Sheets (CSV) ─► js/data.js (baca dan normalisasi, sudah ada)
                         │  produk: { id = KODE, nama, kat, sat, harga, status, merek? }
                         ▼
                   js/rekomendasi.js
                     1. normalisasi   kata nama, ukuran, merek bersih, kategori huruf kecil
                     2. indeks        peta kategori → produk, peta kata nama → produk
                     3. kandidat      satu kategori + produk berbagi kata khas
                     4. skor          rata-rata berbobot 5 atribut (atribut kosong dilewati)
                     5. peringkat     berstok dulu, skor, urutan sheet; buang diri sendiri dan nama kembar; maks 8
                         │
                         ▼
                   js/produk.js → KatalogTampilan.kartu() → #baris-serupa / #baris-pelengkap
```

- Tidak memakai layanan AI luar, server, atau paket tambahan. Semua dihitung di browser.
- ID produk (KODE) tidak diubah. Hasil rekomendasi menunjuk objek produk website yang sama.
- Kartu produk, CSS, dan alamat halaman tidak berubah.

## Kenapa indeks peta, bukan pohon biner

Atribut utama (kategori sekitar 115 nilai, merek sekitar 125 nilai) adalah kategori tanpa urutan. Pohon keputusan biner untuk atribut seperti ini menjadi rantai pertanyaan "kategori = A? tidak → kategori = B? …", lebih lambat dan lebih rumit daripada satu peta yang langsung menjawab "produk di kategori A". Dengan sekitar 1.400 produk:

| Ukuran (data asli, Node) | Hasil |
|---|---|
| Bangun indeks | sekitar 26 ms, sekali per pemuatan data |
| Rekomendasi satu produk | sekitar 0,2 ms |
| Rekomendasi semua 1.411 produk | sekitar 0,3 detik |

Bila nanti ada atribut berurutan (ukuran, volume ml) dan datanya jauh lebih besar, struktur pohon bisa ditambahkan untuk atribut itu saja di bagian `kandidat`.

## Skor kemiripan

Setiap atribut menghasilkan nilai 0 sampai 1, atau **kosong** bila tidak bisa dibandingkan.

| Atribut | Bobot bawaan | Nilai |
|---|---:|---|
| kategori | 0,30 | 1 bila sama; 0,5 bila sama-sama kategori campuran ("Perabot Plastik"); 0 bila beda |
| nama | 0,35 | Kemiripan kata nama berbobot kekhasan: kata yang jarang (misalnya "thinwall") bernilai lebih dari kata umum ("plastik"). Ditambah 0,1 bila ada ukuran yang sama ("15", "9x20"). |
| merek | 0,15 | 1 bila sama, 0 bila beda. Kosong bila salah satu tidak punya merek, atau mereknya OTR / LAIN LAIN (nilai pengisi di data POS) |
| harga | 0,15 | 1 − \|ln(harga A ÷ harga B)\| ÷ ln 5. Harga sama = 1, beda 5 kali lipat atau lebih = 0 |
| satuan | 0,05 | 1 bila sama (pcs/pak), 0 bila beda |

**Skor = Σ (bobot × nilai) ÷ Σ bobot atribut yang tidak kosong.** Produk tanpa merek tidak dihukum; bobot merek hanya tidak ikut dihitung.

Aturan tambahan (`wajibKataSama`, bawaan aktif): barang serupa harus berbagi minimal satu kata nama. Tanpa aturan ini, gelas cup muncul sebagai "serupa" untuk tutup gelas karena kategori, merek, dan harganya sama, padahal itu barang pelengkap.

## Kandidat

1. Semua produk di kategori yang sama.
2. Produk dari kategori lain yang berbagi kata nama yang khas (kata yang dipakai 60 produk atau kurang). Contoh: "Kresek 222 UK 15" berada di kategori lain tapi tetap muncul untuk "Kresek 257 UK 15".

## Peringkat

1. Buang produk yang sedang dibuka, nama kembar, dan skor di bawah ambang (0,35).
2. Urutkan: produk berstok (tersedia, sedikit) lebih dulu, lalu skor tertinggi, lalu urutan di spreadsheet.
3. Stok habis tetap tampil di belakang (`stokHabis: "belakang"`), atau disembunyikan (`"sembunyikan"`).
4. Ambil maksimal 8. Kurang dari 8 ditampilkan seadanya; nol berarti bagian disembunyikan, tidak diisi barang yang tidak nyambung.

## Produk Pelengkap

Terpisah dari skor kemiripan. Hanya memakai aturan pasangan kategori yang ditulis pemilik toko di `js/pengaturan.js`:

```js
pelengkap: [
  { dari: "Gelas Cup", ke: ["Seal Cup", "Sedotan"] },
  { dari: "Thinwall", ke: ["Sendok dan Garpu"] }
]
```

Nama kategori harus sama persis dengan kolom KATEGORI di spreadsheet. Di dalam kategori pasangan, produk berstok dan berharga paling dekat didahulukan. **Sekarang aturan kosong, jadi bagian ini tidak tampil.**

## Pengaturan (`js/pengaturan.js` → `rekomendasi`)

| Kunci | Bawaan | Arti |
|---|---|---|
| `jumlah` | 8 | Maksimal produk per bagian |
| `ambang` | 0,35 | Skor minimal |
| `bobot` | kategori 0,30, nama 0,35, merek 0,15, harga 0,15, satuan 0,05 | Bobot atribut (otomatis dinormalkan) |
| `merekKosong` | OTR, LAIN LAIN, LAIN-LAIN, - | Nilai merek yang dianggap kosong |
| `kategoriCampuran` | Perabot Plastik | Kategori yang kecocokannya hanya bernilai setengah |
| `wajibKataSama` | true | Barang serupa wajib berbagi kata nama |
| `stokHabis` | "belakang" | "belakang" atau "sembunyikan" |
| `pelengkap` | [] | Aturan pasangan kategori |

Atribut baru (bahan, ukuran, warna) cukup ditambahkan di tiga tempat: kolom di `KOLOM` pada `js/data.js`, nilai di `normalisasi`, dan perbandingan di `bagianSkor` pada `js/rekomendasi.js`, lalu beri bobot di pengaturan.

## Kolom MEREK

Website membaca kolom MEREK **bila ada** di Google Sheets. Sekarang kolom itu belum ada, jadi merek dilewati otomatis. Untuk mengaktifkannya, tambahkan kolom berjudul `MEREK` di tab katalog dan salin dari kolom MEREK di file POS berdasarkan KODE. **Jangan salin HARGAPOKOK, SUPPLIER1, atau kolom POS lain**: Google Sheets katalog diterbitkan untuk umum.

## Cache dan pembaruan data

- Indeks dibangun sekali untuk setiap daftar produk (`Rekomendasi.indeksUntuk`) dan disimpan selama halaman terbuka.
- Hasil per produk disimpan di cache indeks.
- Data baru dari Google Sheets menghasilkan daftar produk baru, sehingga indeks otomatis dibangun ulang. Tidak ada cache lintas kunjungan untuk rekomendasi (cukup cepat dihitung ulang).

## Tes

```powershell
node --test tests/rekomendasi.test.js
```

Tes memakai salinan katalog website asli (`tests/data/katalog-gedangan.csv`) yang dimuat lewat `js/data.js` yang sama dengan website, ditambah salinan berkolom MEREK dari data POS (`katalog-gedangan-merek.csv`, hanya merek). Yang diuji: produk tidak merekomendasikan dirinya sendiri, tidak ada hasil ganda, maksimal 8, KODE tetap, kategori dan nama mirip di atas, kandidat lintas kategori, rumus harga, merek kosong/OTR/LAIN LAIN, merek sama, stok habis (belakang dan sembunyikan), ID tidak ada dan kategori berisi satu produk, pelengkap mati dan terpisah, tutup lebih mirip tutup, serta indeks dibangun ulang.

Contoh hasil dengan rincian skor:

```powershell
node tests/contoh-rekomendasi.js PE24 PP08 25715
```

Perbarui salinan data uji bila katalog banyak berubah (unduh ulang CSV Google Sheets ke `tests/data/katalog-gedangan.csv`).

## Contoh hasil (data 24 November 2026, tanpa kolom MEREK)

**Plastik PE Hitam Tali Putih 9X20 Boyo (PE24)**: Tali Putih 11X22 (0,97), 12X25 (0,94), Tali Merah 9X20 (0,92), Tali Putih 14X33 (0,90), Tali Merah 12X24 (0,87), lalu ATP dan PE Boyo lain (0,59 sampai 0,63). Semua satu kategori; seri yang sama di atas karena namanya hampir identik.

**Tutup Cembung Polos Sukawa (PP08)**: delapan tutup lain (Tutup Datar Bening Sukawa 0,66, Oripack 0,62, Tutup 60/90 ml, 120 ml, …). Gelas cup tidak masuk karena tidak berbagi kata nama.

**Kresek 257 UK 15 (25715)**: Kresek Otter UK 24 (0,65), Kresek Penari Bali UK 15 (0,63, ukuran sama), Kresek 222 UK 15 (0,58, kategori lain tapi nama dan ukuran sama), lalu kresek lain dengan harga terdekat.

Statistik: 693 dari 1.411 produk mendapat kurang dari 8 rekomendasi dan 76 produk tidak mendapat rekomendasi (bagian disembunyikan), terutama barang di kategori kecil dengan nama unik (misalnya jas hujan, lampu emergency).

## File

| File | Status |
|---|---|
| `js/rekomendasi.js` | Baru: mesin rekomendasi |
| `js/pengaturan.js` | Ditambah blok `rekomendasi` |
| `js/data.js` | Membaca kolom MEREK bila ada |
| `js/produk.js` | `gambarSerupa` diganti `gambarRekomendasi` |
| `produk.html` | Judul "Produk Serupa", bagian "Produk Pelengkap" tersembunyi, script `rekomendasi.js` |
| `css/komponen.css` | `.kartu { position: relative }`: perbaikan bug lama (teks pembaca layar di kartu ujung deretan membuat halaman melebar) |
| `tests/` | Baru: tes, pemuat data, contoh, dan salinan data uji |
| `.vercelignore` | Baru: folder `tests/`, `docs/`, dan `anti-slop/` tidak ikut diterbitkan ke website (tetap ada di repo) |
