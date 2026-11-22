// Keranjang pesanan, satu untuk setiap toko. Disimpan di browser pelanggan, lalu dikirim sebagai pesan WhatsApp.
// Semua barang disimpan bersama dengan tanda tokonya; yang tampil dan dihitung hanya barang toko yang sedang dipilih.
// Keranjang toko lain tidak dihapus saat pindah toko, hanya disimpan sampai pelanggan kembali.
var KatalogKeranjang = (function () {
  var KUNCI = "keranjang";
  var MAKS = 999;
  var item = [];
  var tokoAktif = KatalogData.tokoAktif().id;

  function simpan() {
    try { localStorage.setItem(KUNCI, JSON.stringify(item)); } catch (e) {}
  }
  function muat() {
    try { item = JSON.parse(localStorage.getItem(KUNCI)) || []; } catch (e) { item = []; }
    if (!Array.isArray(item)) item = [];
  }
  function cari(id) {
    for (var i = 0; i < item.length; i++) if (item[i].id === id) return item[i];
    return null;
  }

  // Barang tanpa toko (keranjang lama) atau dari toko yang sudah tidak ada di pengaturan dianggap milik toko utama.
  // Saat katalog toko utama dimuat, barang yang tidak ada di sana dikeluarkan, jadi tidak ada barang yang
  // terhitung di total tapi tidak tampil di keranjang.
  function tokoItem(x) {
    var dikenal = PENGATURAN.toko.some(function (t) { return t.id === x.toko; });
    return dikenal ? x.toko : PENGATURAN.toko[0].id;
  }
  function milik(tokoId) { return item.filter(function (x) { return tokoItem(x) === tokoId; }); }
  function isi() { return milik(tokoAktif); }

  // Keranjang yang tampil mengikuti toko yang sedang dipilih.
  function setToko(id) { tokoAktif = KatalogData.cariToko(id).id; }
  function toko() { return KatalogData.cariToko(tokoAktif); }

  function tambah(p) {
    var x = cari(p.id);
    if (x) { x.qty = Math.min(MAKS, x.qty + 1); x.harga = p.harga; x.nama = p.nama; x.sat = p.sat; }
    else item.push({ id: p.id, toko: p.toko, kode: p.kode, nama: p.nama, harga: p.harga, sat: p.sat, qty: 1 });
    simpan();
  }
  function ubah(id, selisih) {
    var x = cari(id);
    if (!x) return;
    x.qty = Math.max(1, Math.min(MAKS, x.qty + selisih));
    simpan();
  }

  // Menyamakan isi keranjang dengan katalog terbaru satu toko: harga, nama, dan satuan diperbarui,
  // barang yang sudah tidak ada di katalog toko itu dikeluarkan. Mengembalikan nama barang yang dikeluarkan.
  function sinkron(produk, tokoId) {
    var peta = {}, keluar = [];
    produk.forEach(function (p) { peta[p.id] = p; });
    item = item.filter(function (x) {
      if (tokoId && tokoItem(x) !== tokoId) return true;
      var p = peta[x.id];
      if (!p) { keluar.push(x.nama); return false; }
      x.harga = p.harga; x.nama = p.nama; x.sat = p.sat; x.toko = p.toko; x.kode = p.kode;
      return true;
    });
    simpan();
    return keluar;
  }
  function hapus(id) { item = item.filter(function (x) { return x.id !== id; }); simpan(); }
  // Hanya mengosongkan keranjang toko yang sedang dipilih.
  function kosongkan() { item = item.filter(function (x) { return tokoItem(x) !== tokoAktif; }); simpan(); }

  function daftar() { return isi(); }
  function qty(id) { var x = cari(id); return x ? x.qty : 0; }
  function jumlahDari(daftarItem) { return daftarItem.reduce(function (n, x) { return n + x.qty; }, 0); }
  function jumlah() { return jumlahDari(isi()); }
  function jumlahToko(tokoId) { return jumlahDari(milik(tokoId)); }
  // Toko lain yang keranjangnya masih berisi barang, [{ toko, jumlah }], untuk pengingat.
  function tokoLainBerisi() {
    return PENGATURAN.toko.filter(function (t) { return t.id !== tokoAktif; })
      .map(function (t) { return { toko: t, jumlah: jumlahToko(t.id) }; })
      .filter(function (x) { return x.jumlah > 0; });
  }
  function subtotal(x) { return x.harga > 0 ? x.harga * x.qty : 0; }
  function total() { return isi().reduce(function (n, x) { return n + subtotal(x); }, 0); }
  function adaTanpaHarga() { return isi().some(function (x) { return !(x.harga > 0); }); }

  function rp(n) { return "Rp " + n.toLocaleString("id-ID"); }

  // Teks chat pesanan untuk toko yang sedang dipilih. Dengan `daftarLain` dipakai untuk contoh chat di FAQ.
  function teksPesanan(namaToko, daftarLain) {
    var daftarIsi = daftarLain || isi();
    var totalIsi = daftarIsi.reduce(function (n, x) { return n + subtotal(x); }, 0);
    var tanpaHarga = daftarIsi.some(function (x) { return !(x.harga > 0); });
    var baris = daftarIsi.map(function (x, i) {
      var rincian = x.harga > 0 ? x.qty + " " + x.sat + " x " + rp(x.harga) + " = " + rp(subtotal(x)) : x.qty + " " + x.sat + " (harga ditanyakan)";
      return (i + 1) + ". " + x.nama + " - " + rincian;
    });
    // Nomor WhatsApp sama untuk semua toko, jadi baris pertama selalu menyebut toko tempat mengambil.
    var t = toko();
    var pembuka = daftarLain ? "saya mau pesan:" : "saya mau pesan untuk diambil di " + t.nama + " (" + t.alamat + "):";
    return "Halo " + namaToko + ", " + pembuka + "\n" + baris.join("\n") + "\n\nTotal perkiraan: " + rp(totalIsi) +
      (tanpaHarga ? " (belum termasuk barang yang harganya ditanyakan)" : "") +
      "\nMohon dicek stok dan totalnya.";
  }

  muat();
  return { setToko: setToko, toko: toko, tambah: tambah, ubah: ubah, sinkron: sinkron, hapus: hapus, kosongkan: kosongkan,
           daftar: daftar, qty: qty, jumlah: jumlah, jumlahToko: jumlahToko, tokoLainBerisi: tokoLainBerisi,
           subtotal: subtotal, total: total, adaTanpaHarga: adaTanpaHarga, teksPesanan: teksPesanan };
})();
