# Catatan pengunjung (tanpa data pribadi)

Mencatat perilaku pengunjung website ke Google Sheets **privat** milik toko, untuk bahan keputusan kulakan, harga, dan promosi. Dibuat 26 November 2026.

## Yang dicatat

| Kejadian | Kapan | Isi | Kode | Nilai |
|---|---|---|---|---|
| `kunjungan` | sekali per kunjungan (per tab) | halaman pertama yang dibuka | | |
| `cari` | kata dicari dan ada hasilnya, setelah berhenti mengetik 1,5 detik (ketikan setengah jadi tidak ikut); kata yang sama hanya sekali per kunjungan | kata yang dicari | | jumlah hasil di semua toko |
| `cari_kosong` | sama seperti `cari`, tapi 0 hasil di semua toko | kata yang dicari | | |
| `lihat` | halaman detail produk dibuka | nama produk | KODE | |
| `keranjang` | tombol + Keranjang / Tambah ke Keranjang | nama produk | KODE | jumlah |
| `kirim_wa` | tombol Kirim pesanan lewat WhatsApp | jumlah barang | | total Rp |

Setiap catatan juga membawa: toko (gedangan/citra), asal kunjungan, dan kode kunjungan acak 8 huruf.

**Tidak dicatat:** nama, nomor WhatsApp, alamat IP, lokasi, isi chat, atau apa pun yang bisa menunjuk ke orangnya. Kode kunjungan dibuat acak dan hilang saat tab ditutup.

**Asal kunjungan:** penanda `?dari=…` di link promosi (misalnya `?dari=ig-bio`, `?dari=status-wa`, `?dari=spanduk`), atau nama situs sebelumnya (google, instagram, facebook, whatsapp, tiktok), atau `langsung`.

**Tidak mencatat bila:** alamat penerima kosong, browser meminta Do Not Track, browser dijalankan robot, dibuka di localhost, atau perangkat dikecualikan dengan membuka website sekali memakai `?catat=mati` (kembalikan dengan `?catat=nyala`). Kecualikan HP dan komputer toko supaya kunjungan sendiri tidak ikut terhitung.

## Alur

```
Website (js/catatan.js) ── kumpulkan 4 detik / saat halaman ditutup ──► Google Apps Script (doPost)
                                                                            │ tambah baris
                                                                            ▼
                                                     Google Sheets privat: tab Catatan → tab Ringkasan (rumus)
```

- `js/catatan.js`: pencatat. Dipanggil dari `js/app.js` (pencarian kosong, tambah keranjang), `js/produk.js` (lihat, tambah keranjang), dan menangkap sendiri tombol kirim WhatsApp di semua halaman.
- `alat/catatan-pengunjung.gs`: penerima dan pembuat ringkasan (Google Apps Script), ditempel di Google Sheets privat.
- `js/pengaturan.js` → `catatan.url`: alamat penerima. **Kosong = pencatatan mati.**

## Memasang (sekali, sekitar 3 menit)

Sheet sudah dibuat di Google Drive toko: folder **Toko Bestari** → **Catatan Pengunjung Toko Bestari** (privat, zona waktu WIB, tab Ringkasan dengan rumus dan tab Catatan dengan judul kolom sudah lengkap dan sudah diuji).

1. ~~Buat Google Sheets baru~~ (sudah). Buka sheet itu dari Google Drive.
2. Menu **Ekstensi → Apps Script**. Hapus isi editor, tempel seluruh isi `alat/catatan-pengunjung.gs`, tekan **Simpan**.
3. ~~Jalankan `siapkan`~~ (tidak perlu; tab sudah ada).
4. Pilih fungsi **`pasangPemicu`**, tekan **Jalankan**. Google meminta izin: pilih akun toko → Lanjutan → Buka (tidak aman) → Izinkan. Ini normal untuk skrip buatan sendiri.
5. **Terapkan → Penerapan baru** → jenis **Aplikasi web**. Jalankan sebagai: **Saya**. Yang memiliki akses: **Siapa saja**. Tekan **Terapkan**, lalu salin **URL aplikasi web** (berakhiran `/exec`).
6. Tempel URL itu ke `js/pengaturan.js` → `catatan: { url: "https://script.google.com/macros/s/…/exec" }`, lalu push.
7. Cek: buka URL `/exec` di browser; harus tampil "Penerima catatan pengunjung Toko Bestari aktif." Lalu buka website, cari kata asal (misalnya "zzqq"), tunggu beberapa detik, dan lihat tab Catatan.

"Siapa saja" hanya berarti website boleh **mengirim** catatan. Isi sheet tetap privat: skrip hanya bisa menambah baris, tidak bisa membaca atau mengirim isi sheet ke luar.

## Ringkasan (tab Ringkasan)

Pilih periode di sel **B2**: 7, 30, atau 90 hari terakhir. Semua angka dihitung ulang otomatis.

1. **Pencarian yang tidak ketemu**: kata dan jumlahnya, terbanyak di atas.
2. **Produk dilihat dan masuk keranjang**: kode, nama, berapa kali dilihat, berapa kali masuk keranjang, dan rasio keranjang.
3. **Keranjang dan pesanan**: jumlah kunjungan, kunjungan yang menambah ke keranjang, yang mengirim pesanan WA, keranjang ditinggal, persentase dikirim, dan rata-rata nilai pesanan.
4. **Asal pengunjung**: jumlah kunjungan dan pesanan WA per asal.
5. **Kata yang paling sering dicari** (yang ada hasilnya): kata, berapa kali dicari, dan rata-rata jumlah hasilnya.

## Ritme membaca

- **Mingguan (periode 7):** pencarian yang tidak ketemu. Kata yang muncul 3 kali atau lebih layak ditindaklanjuti: tambah kata kunci di kolom TAG, atau catat untuk kulakan.
- **Bulanan (periode 30):** produk dengan rasio keranjang rendah (nilai produk setelah dilihat minimal 20 kali), keranjang ditinggal, dan asal pengunjung.

**Catatan lokal Indonesia:** sheet memakai format Indonesia, jadi rumus di sheet memakai titik koma (`;`) sebagai pemisah argumen, misalnya `=IFERROR(K8/K7;0)`. Rumus yang ditulis dengan koma akan menjadi `#ERROR!`.

## Penyimpanan dan keamanan

- Catatan lebih tua dari 90 hari dihapus otomatis tiap Senin pukul 03.00 (`bersihkan`), supaya sheet tetap ringan.
- `@OnlyCurrentDoc`: izin skrip hanya untuk spreadsheet tempat skrip menempel, bukan semua spreadsheet di Drive.
- Penerima hanya menerima 6 jenis kejadian dan maksimal 30 catatan per kiriman.
- Batas kiriman: 300 catatan per menit dan 3.000 per jam untuk semua pengunjung, 200 per kode kunjungan per 6 jam, dan tab Catatan maksimal 200.000 baris. Kelebihannya diabaikan, supaya kiriman palsu tidak membengkakkan sheet atau menghabiskan kuota.
- Teks bebas: karakter kendali dan karakter tak terlihat dibuang, panjang dipotong, dan teks yang diawali `= + - @` diberi awalan `_`, sehingga tidak pernah menjadi rumus di Google Sheets maupun saat diunduh sebagai CSV. Kode toko, asal, dan kode kunjungan hanya boleh berisi huruf kecil, angka, `_`, dan `-`.
- Bila ada kiriman palsu: hapus barisnya, atau arsipkan deployment lalu buat deployment baru (alamat lama mati, alamat baru dipasang di `js/pengaturan.js`).
- Data perilaku ini hanya untuk pemilik toko dan **tidak** ditampilkan di website (sejalan dengan aturan tidak menampilkan data terlaris).
- Sebaiknya tambahkan kalimat di Kebijakan Privasi atau FAQ: website mencatat pencarian dan produk yang dilihat tanpa data pribadi, untuk memperbaiki katalog.

## Batasan

- Kunjungan dihitung per tab/perangkat, bukan per orang.
- Pengunjung yang memakai pemblokir iklan atau Do Not Track tidak tercatat.
- `kirim_wa` berarti tombol kirim ditekan; website tidak tahu apakah chat benar-benar terkirim.
- Barang apa yang ada di keranjang yang ditinggal belum dirangkum (bisa ditambahkan nanti dari tab Catatan).
- Alamat `/exec` terlihat di kode website, jadi orang yang paham teknis bisa mengirim catatan palsu. Batas kiriman membatasi dampaknya, tapi tidak bisa mencegahnya sepenuhnya.

## Memperbarui kode Apps Script

Tempel kode baru di editor, simpan, lalu **Terapkan → Kelola deployment → ikon pensil → Versi: Versi baru → Terapkan**. Jangan memilih "Deployment baru" karena alamatnya akan berganti.
