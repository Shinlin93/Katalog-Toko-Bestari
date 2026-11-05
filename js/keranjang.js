// Keranjang pesanan. Disimpan di browser pelanggan, lalu dikirim sebagai pesan WhatsApp.
var KatalogKeranjang = (function () {
  var KUNCI = "keranjang";
  var MAKS = 999;
  var item = [];

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

  function tambah(p) {
    var x = cari(p.id);
    if (x) { x.qty = Math.min(MAKS, x.qty + 1); x.harga = p.harga; x.nama = p.nama; x.sat = p.sat; }
    else item.push({ id: p.id, nama: p.nama, harga: p.harga, sat: p.sat, qty: 1 });
    simpan();
  }
  function ubah(id, selisih) {
    var x = cari(id);
    if (!x) return;
    x.qty = Math.max(1, Math.min(MAKS, x.qty + selisih));
    simpan();
  }
  // Menyamakan isi keranjang dengan katalog terbaru: harga, nama, dan satuan diperbarui,
  // barang yang sudah tidak ada di katalog dikeluarkan. Mengembalikan nama barang yang dikeluarkan.
  function sinkron(produk) {
    var peta = {}, keluar = [];
    produk.forEach(function (p) { peta[p.id] = p; });
    item = item.filter(function (x) {
      var p = peta[x.id];
      if (!p) { keluar.push(x.nama); return false; }
      x.harga = p.harga; x.nama = p.nama; x.sat = p.sat;
      return true;
    });
    simpan();
    return keluar;
  }
  function hapus(id) { item = item.filter(function (x) { return x.id !== id; }); simpan(); }
  function kosongkan() { item = []; simpan(); }

  function daftar() { return item.slice(); }
  function qty(id) { var x = cari(id); return x ? x.qty : 0; }
  function jumlah() { return item.reduce(function (n, x) { return n + x.qty; }, 0); }
  function subtotal(x) { return x.harga > 0 ? x.harga * x.qty : 0; }
  function total() { return item.reduce(function (n, x) { return n + subtotal(x); }, 0); }
  function adaTanpaHarga() { return item.some(function (x) { return !(x.harga > 0); }); }

  function rp(n) { return "Rp " + n.toLocaleString("id-ID"); }

  // Teks chat pesanan. Tanpa `daftarLain` memakai isi keranjang; dengan `daftarLain` dipakai untuk contoh di halaman depan.
  function teksPesanan(namaToko, daftarLain) {
    var isi = daftarLain || item;
    var totalIsi = isi.reduce(function (n, x) { return n + subtotal(x); }, 0);
    var tanpaHarga = isi.some(function (x) { return !(x.harga > 0); });
    var baris = isi.map(function (x, i) {
      var rincian = x.harga > 0 ? x.qty + " " + x.sat + " x " + rp(x.harga) + " = " + rp(subtotal(x)) : x.qty + " " + x.sat + " (harga ditanyakan)";
      return (i + 1) + ". " + x.nama + " - " + rincian;
    });
    return "Halo " + namaToko + ", saya mau pesan:\n" + baris.join("\n") + "\n\nTotal perkiraan: " + rp(totalIsi) +
      (tanpaHarga ? " (belum termasuk barang yang harganya ditanyakan)" : "") +
      "\nMohon dicek stok dan totalnya.";
  }

  muat();
  return { tambah: tambah, ubah: ubah, sinkron: sinkron, hapus: hapus, kosongkan: kosongkan, daftar: daftar, qty: qty,
           jumlah: jumlah, subtotal: subtotal, total: total, adaTanpaHarga: adaTanpaHarga, teksPesanan: teksPesanan };
})();
