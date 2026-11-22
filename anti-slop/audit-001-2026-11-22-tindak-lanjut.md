# Tindak lanjut audit 001, 22 November 2026

Pemilik toko meminta: "Perbaiki semua". Diuji di HP 375 px, tablet 768 px, desktop 1000 dan 1280 px, serta tema gelap.

| No | Temuan | Hasil |
|---|---|---|
| 1 | Produk pertama baru terlihat setelah 2,4 layar HP | **Diperbaiki.** Sekarang di 1,42 layar (1.152 px, sebelumnya 1.939 px). Di HP, hero diringkas, contoh chat dilipat, dan strip kategori serta kartu panduan yang isinya dobel disembunyikan. |
| 2 | Link nama produk terlalu kecil | **Diperbaiki.** Semua link nama produk kini tingginya 44 px. |
| 3 | Tombol mengambang menutupi tombol beli | **Diperbaiki.** Di HP, tombol WhatsApp dan tombol ke atas minggir selama daftar produk ada di bagian bawah layar, lalu muncul lagi di hero dan footer. Keranjang tetap ada di menu atas. |
| 4 | Menu HP terpotong, FAQ tersembunyi | **Diperbaiki.** Di HP, "Beranda" disembunyikan, jadi Katalog, Alamat, Kontak, dan FAQ muat tanpa digeser. |
| 5 | Foto dengan label atau watermark pihak lain | **Belum, butuh foto dari toko.** Foto hanya bisa diganti dengan foto milik toko sendiri (rencana pemilik). Caranya: simpan foto baru dengan nama file yang sama di folder `foto/`. |
| 6 | Tidak ada DESIGN.md | **Diperbaiki.** `DESIGN.md` dibuat di repo, berisi arahan pemilik dan warna yang dipakai. |
| 7 | Identitas dan alamat belum sama dengan spanduk | **Diperbaiki.** Footer halaman depan dan halaman produk kini menampilkan Toko Wirabumi dan Toko Citra City, masing-masing dengan link Google Maps. Header menampilkan "2 toko". Hero dan footer menyebut "Toko Bestari (Bestari Plastik)". |
| 8 | Teks hero hanya menyebut satu toko | **Diperbaiki.** Teks menjadi "...lalu ambil di salah satu toko kami atau minta dikirim." Jawaban FAQ soal pengiriman juga menyebut kedua toko. |
| 9 | Pencarian kosong tanpa ajakan WhatsApp | **Diperbaiki.** Muncul tombol hijau "Tanya stok “kata yang dicari” lewat WhatsApp" dengan pesan yang sudah terisi. Keadaan gagal memuat juga punya tombol WhatsApp. |
| 10 | Slider sempat menumpuk teks | **Diperbaiki.** Slide lama menghilang dulu (0,18 detik), baru slide baru muncul. |
| 11 | Hero tablet melebar satu kolom | **Diperbaiki.** Hero sudah dua kolom mulai 700 px. Header satu baris baru dipakai mulai 1.040 px supaya tidak sesak. |
| 12 | Garis kartu hampir tidak terlihat | **Diperbaiki sebagian.** Garis kartu digelapkan ke #BAC4D3 (gelap: #3A4766). Ini masih di bawah 3:1, karena garis setebal itu akan terlihat kasar. Garis ini juga tidak wajib menurut WCAG. |

Tambahan: tombol WhatsApp bertulisan memakai hijau #137A3C (kontras 5,42:1). Hijau lama #168F46 hanya 4,16:1 untuk teks putih.

File yang berubah:
- `index.html`, `produk.html`
- `css/tema.css`, `css/tata-letak.css`, `css/komponen.css`
- `js/pengaturan.js`, `js/tampilan.js`, `js/app.js`, `js/produk.js`
- `DESIGN.md` (baru)
