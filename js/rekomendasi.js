// Mesin rekomendasi produk: "Produk Serupa" dan "Produk Pelengkap" di halaman detail produk.
// Murni perhitungan, tanpa tampilan dan tanpa akses jaringan, jadi bisa dipakai di browser dan diuji di Node.
//
// Alur: produk dari spreadsheet → normalisasi → indeks (per kategori dan per kata nama) → kandidat →
// skor kemiripan berbobot → peringkat → maksimal 8 produk. Penjelasan lengkap: docs/rekomendasi.md.
(function (akar, buat) {
  if (typeof module === "object" && module.exports) module.exports = buat();
  else akar.Rekomendasi = buat();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Pengaturan bawaan. Nilai di pengaturan.js (PENGATURAN.rekomendasi) menimpa nilai ini.
  var BAWAAN = {
    jumlah: 8,               // maksimal produk yang ditampilkan per bagian
    ambang: 0.35,            // skor minimal; di bawahnya produk dianggap tidak serupa
    bobot: { kategori: 0.30, nama: 0.35, merek: 0.15, harga: 0.15, satuan: 0.05 },
    // Merek pengisi di data POS yang bukan merek sebenarnya; dianggap kosong.
    merekKosong: ["OTR", "LAIN LAIN", "LAIN-LAIN", "-"],
    // Kategori campuran (berisi barang berbeda-beda); kecocokan kategori di sini hanya bernilai setengah.
    kategoriCampuran: ["Perabot Plastik"],
    // Kata nama yang muncul di lebih dari sekian produk terlalu umum untuk mencari kandidat lintas kategori.
    batasKataKhas: 60,
    // Selisih harga yang dianggap sama sekali berbeda (kelipatan). 5 = harga 5 kali lipat bernilai 0.
    rasioHargaMaks: 5,
    // Barang serupa wajib berbagi minimal satu kata nama (misalnya "tutup" dengan "tutup"), supaya barang
    // satu kategori yang fungsinya lain (gelas cup untuk tutup gelas) tidak dianggap serupa. Itu tugas Pelengkap.
    wajibKataSama: true,
    // Produk stok habis: "belakang" (tetap tampil di urutan akhir) atau "sembunyikan".
    stokHabis: "belakang",
    // Aturan pelengkap dari pemilik toko: [{ dari: "Gelas Cup", ke: ["Seal Cup", "Sedotan"] }].
    // Kosong = bagian "Produk Pelengkap" tidak tampil.
    pelengkap: []
  };

  var KATA_ABAIKAN = { uk: 1, ukuran: 1, isi: 1, per: 1, dan: 1, untuk: 1, pak: 1, pcs: 1 };

  function gabung(pengaturan) {
    var c = {}, k;
    pengaturan = pengaturan || {};
    for (k in BAWAAN) c[k] = pengaturan[k] !== undefined ? pengaturan[k] : BAWAAN[k];
    c.bobot = {};
    for (k in BAWAAN.bobot) c.bobot[k] = (pengaturan.bobot && pengaturan.bobot[k] !== undefined) ? pengaturan.bobot[k] : BAWAAN.bobot[k];
    return c;
  }

  function huruf(s) { return String(s == null ? "" : s).trim().toLowerCase(); }

  // Kata nama: huruf kecil, "9 x 20" menjadi "9x20". Kata berangka (ukuran) dipisah dari kata biasa.
  function kataNama(nama) {
    var t = huruf(nama).replace(/(\d)\s*[x×]\s*(\d)/g, "$1x$2").replace(/(\d)\s*[x×]\s*(\d)/g, "$1x$2");
    var kata = {}, ukuran = {};
    t.split(/[^a-z0-9x]+/).forEach(function (w) {
      if (!w || KATA_ABAIKAN[w]) return;
      if (/\d/.test(w)) ukuran[w] = 1; else kata[w] = 1;
    });
    return { kata: Object.keys(kata), ukuran: Object.keys(ukuran) };
  }

  // ---------- Normalisasi ----------
  // Produk dari KatalogData: { id, kode, nama, kat, sat, harga, status, merek?, urutan }.
  // ID asli (KODE) tidak diubah; hasil normalisasi disimpan terpisah dan menunjuk produk aslinya.
  function normalisasi(p, c) {
    var merek = String(p.merek == null ? "" : p.merek).trim().toUpperCase();
    var kosong = c.merekKosong.map(function (m) { return m.toUpperCase(); });
    var k = kataNama(p.nama);
    return {
      asli: p,
      id: p.id,
      namaKunci: huruf(p.nama).replace(/\s+/g, " "),
      kategori: huruf(p.kat),
      merek: merek && kosong.indexOf(merek) < 0 ? merek : "",
      satuan: huruf(p.sat),
      harga: p.harga > 0 ? p.harga : 0,
      habis: huruf(p.status) === "habis",
      kata: k.kata,
      ukuran: k.ukuran
    };
  }

  // ---------- Indeks ----------
  // Peta kategori → produk dan kata nama → produk. Dibangun ulang setiap data spreadsheet berubah.
  function buatIndeks(daftar, pengaturan) {
    var c = gabung(pengaturan);
    var semua = [], perId = {}, perKategori = {}, perKata = {}, frekuensi = {};
    (daftar || []).forEach(function (p) {
      if (!p || p.id == null || perId[p.id] !== undefined) return; // ID kembar: yang pertama dipakai
      var n = normalisasi(p, c), i = semua.length;
      semua.push(n);
      perId[p.id] = i;
      (perKategori[n.kategori] = perKategori[n.kategori] || []).push(i);
      n.kata.forEach(function (w) {
        (perKata[w] = perKata[w] || []).push(i);
        frekuensi[w] = (frekuensi[w] || 0) + 1;
      });
    });
    var campuran = c.kategoriCampuran.map(huruf);
    return { c: c, semua: semua, perId: perId, perKategori: perKategori, perKata: perKata, frekuensi: frekuensi, campuran: campuran, cache: {} };
  }

  function bobotKata(ix, w) { return Math.log(1 + ix.semua.length / (ix.frekuensi[w] || 1)); }

  // ---------- Skor kemiripan ----------
  // Setiap atribut menghasilkan nilai 0 sampai 1, atau null bila tidak bisa dibandingkan (data kosong).
  // Atribut null dilewati dan bobotnya tidak dihitung, jadi produk tanpa merek tidak dihukum.
  function bagianSkor(ix, a, b) {
    var c = ix.c, r = {};
    if (a.kategori && b.kategori) {
      r.kategori = a.kategori !== b.kategori ? 0 : (ix.campuran.indexOf(a.kategori) >= 0 ? 0.5 : 1);
    } else r.kategori = null;

    if (a.kata.length && b.kata.length) {
      var bersama = 0, gabungan = 0, ada = {};
      a.kata.forEach(function (w) { ada[w] = 1; gabungan += bobotKata(ix, w); });
      b.kata.forEach(function (w) {
        if (ada[w]) bersama += bobotKata(ix, w); else gabungan += bobotKata(ix, w);
      });
      var nama = gabungan ? bersama / gabungan : 0;
      // Ukuran yang sama (misalnya "15" atau "9x20") menambah sedikit kemiripan.
      var ukuranSama = a.ukuran.some(function (u) { return b.ukuran.indexOf(u) >= 0; });
      r.nama = Math.min(1, nama + (ukuranSama ? 0.1 : 0));
    } else r.nama = null;

    r.merek = a.merek && b.merek ? (a.merek === b.merek ? 1 : 0) : null;
    r.harga = a.harga && b.harga ? Math.max(0, 1 - Math.abs(Math.log(a.harga / b.harga)) / Math.log(c.rasioHargaMaks)) : null;
    r.satuan = a.satuan && b.satuan ? (a.satuan === b.satuan ? 1 : 0) : null;
    return r;
  }

  function skor(ix, a, b) {
    var r = bagianSkor(ix, a, b), jumlah = 0, bobot = 0;
    for (var k in r) {
      if (r[k] === null || !ix.c.bobot[k]) continue;
      jumlah += ix.c.bobot[k] * r[k];
      bobot += ix.c.bobot[k];
    }
    return { skor: bobot ? jumlah / bobot : 0, rincian: r };
  }

  // ---------- Kandidat ----------
  // Semua produk satu kategori, ditambah produk lintas kategori yang berbagi kata nama yang khas.
  function kandidat(ix, i) {
    var a = ix.semua[i], set = {};
    (ix.perKategori[a.kategori] || []).forEach(function (j) { set[j] = 1; });
    a.kata.forEach(function (w) {
      if ((ix.frekuensi[w] || 0) <= ix.c.batasKataKhas) (ix.perKata[w] || []).forEach(function (j) { set[j] = 1; });
    });
    delete set[i];
    return Object.keys(set).map(Number);
  }

  // ---------- Peringkat ----------
  // Urutan: produk berstok dulu, lalu skor tertinggi, lalu urutan di spreadsheet.
  // Produk yang sedang dibuka, nama kembar, dan skor di bawah ambang dibuang.
  function urutkan(ix, a, daftar) {
    var c = ix.c, hasil = [], namaSudah = {};
    namaSudah[a.namaKunci] = 1;
    daftar.sort(function (x, y) {
      return (x.b.habis - y.b.habis) || (y.skor - x.skor) || ((x.b.asli.urutan || 0) - (y.b.asli.urutan || 0));
    });
    for (var k = 0; k < daftar.length && hasil.length < c.jumlah; k++) {
      var d = daftar[k];
      if (d.b.id === a.id || namaSudah[d.b.namaKunci]) continue;
      if (d.b.habis && c.stokHabis === "sembunyikan") continue;
      namaSudah[d.b.namaKunci] = 1;
      hasil.push({ produk: d.b.asli, skor: Math.round(d.skor * 1000) / 1000, rincian: d.rincian });
    }
    return hasil;
  }

  // Produk Serupa untuk produk dengan ID tertentu. Hasil disimpan di cache indeks.
  function serupa(ix, id) {
    var i = ix.perId[id];
    if (i === undefined) return [];
    var kunci = "s:" + id;
    if (ix.cache[kunci]) return ix.cache[kunci];
    var a = ix.semua[i], lolos = [];
    kandidat(ix, i).forEach(function (j) {
      var b = ix.semua[j], s = skor(ix, a, b);
      if (ix.c.wajibKataSama && s.rincian.nama === 0) return;
      if (s.skor >= ix.c.ambang) lolos.push({ b: b, skor: s.skor, rincian: s.rincian });
    });
    return (ix.cache[kunci] = urutkan(ix, a, lolos));
  }

  // Produk Pelengkap: hanya dari aturan pasangan kategori yang ditulis pemilik toko, terpisah dari skor kemiripan.
  // Di dalam kategori pasangan, produk berstok dan berharga paling dekat didahulukan.
  function pelengkap(ix, id) {
    var i = ix.perId[id];
    if (i === undefined || !ix.c.pelengkap.length) return [];
    var kunci = "p:" + id;
    if (ix.cache[kunci]) return ix.cache[kunci];
    var a = ix.semua[i], tujuan = [];
    ix.c.pelengkap.forEach(function (aturan) {
      if (huruf(aturan.dari) === a.kategori) (aturan.ke || []).forEach(function (k) { tujuan.push(huruf(k)); });
    });
    var lolos = [];
    tujuan.forEach(function (kat) {
      if (kat === a.kategori) return;
      (ix.perKategori[kat] || []).forEach(function (j) {
        var b = ix.semua[j];
        var dekat = a.harga && b.harga ? 1 / (1 + Math.abs(Math.log(a.harga / b.harga))) : 0;
        lolos.push({ b: b, skor: dekat, rincian: { kategoriPasangan: kat } });
      });
    });
    return (ix.cache[kunci] = urutkan(ix, a, lolos));
  }

  // Indeks dibangun sekali per daftar produk (daftar baru dari spreadsheet = indeks baru).
  var simpanan = typeof WeakMap === "function" ? new WeakMap() : null;
  function indeksUntuk(daftar, pengaturan) {
    if (!simpanan) return buatIndeks(daftar, pengaturan);
    var ix = simpanan.get(daftar);
    if (!ix) { ix = buatIndeks(daftar, pengaturan); simpanan.set(daftar, ix); }
    return ix;
  }

  return {
    BAWAAN: BAWAAN,
    normalisasi: function (p, pengaturan) { return normalisasi(p, gabung(pengaturan)); },
    buatIndeks: buatIndeks,
    indeksUntuk: indeksUntuk,
    skor: function (ix, idA, idB) {
      var a = ix.semua[ix.perId[idA]], b = ix.semua[ix.perId[idB]];
      return a && b ? skor(ix, a, b) : null;
    },
    kandidat: function (ix, id) {
      var i = ix.perId[id];
      return i === undefined ? [] : kandidat(ix, i).map(function (j) { return ix.semua[j].id; });
    },
    serupa: serupa,
    pelengkap: pelengkap
  };
});
