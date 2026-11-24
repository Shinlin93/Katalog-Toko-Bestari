// Membaca produk tiap toko (Google Sheets atau cadangan), lalu mencari dan mengurutkannya.
var KatalogData = (function () {
  // MEREK opsional: dipakai mesin rekomendasi bila kolomnya ada di spreadsheet.
  var KOLOM = ["KODE", "NAMA", "KATEGORI", "SATUAN", "HARGA", "STATUS", "TAMPIL", "FOTO", "TAG", "SOROT", "MEREK"];

  function bacaCSV(teks) {
    var baris = [], sel = [], isi = "", kutip = false;
    for (var i = 0; i < teks.length; i++) {
      var c = teks[i];
      if (kutip) {
        if (c === '"') { if (teks[i + 1] === '"') { isi += '"'; i++; } else kutip = false; }
        else isi += c;
      } else if (c === '"') kutip = true;
      else if (c === ",") { sel.push(isi); isi = ""; }
      else if (c === "\n") { sel.push(isi); baris.push(sel); sel = []; isi = ""; }
      else if (c !== "\r") isi += c;
    }
    if (isi !== "" || sel.length) { sel.push(isi); baris.push(sel); }
    return baris;
  }

  // Huruf kecil, tanda baca dibuang, dan "9 x 20" disamakan menjadi "9x20" agar ukuran mudah dicari.
  function normalisasi(s) {
    var t = String(s).toLowerCase();
    t = t.replace(/(\d)\s*[x×]\s*(\d)/g, "$1x$2").replace(/(\d)\s*[x×]\s*(\d)/g, "$1x$2");
    return t.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  }

  function tanpaSpasi(s) { return s.replace(/ /g, ""); }

  // Kategori yang sama tapi beda huruf besar di Sheets digabung, memakai ejaan yang paling sering.
  function samakanKategori(daftar) {
    var ejaan = {};
    daftar.forEach(function (p) {
      var kunci = p.kat.toLowerCase();
      ejaan[kunci] = ejaan[kunci] || {};
      ejaan[kunci][p.kat] = (ejaan[kunci][p.kat] || 0) + 1;
    });
    daftar.forEach(function (p) {
      var pilihan = ejaan[p.kat.toLowerCase()], terbaik = p.kat;
      for (var nama in pilihan) if (pilihan[nama] > pilihan[terbaik]) terbaik = nama;
      p.kat = terbaik;
    });
  }

  function isiIndeks(p) {
    p.namaN = normalisasi(p.nama);
    p.namaRapat = tanpaSpasi(p.namaN);
    p.katN = normalisasi(p.kat);
    p.cari = normalisasi([p.nama, p.kat, p.kode, p.tag.join(" ")].join(" "));
    p.cariRapat = tanpaSpasi(p.cari);
  }

  // ---- Toko ----
  // Toko pertama adalah toko utama: kode produknya dipakai apa adanya, supaya link produk dan isi keranjang lama
  // tetap berlaku. Produk toko lain diberi awalan "id-toko:" supaya kodenya tidak bentrok antar toko.
  function daftarToko() { return PENGATURAN.toko || []; }
  function tokoUtama() { return daftarToko()[0]; }
  function cariToko(id) {
    var t = daftarToko().filter(function (x) { return x.id === id; })[0];
    return t || tokoUtama();
  }
  function tokoDariIdProduk(id) {
    var i = String(id).indexOf(":");
    if (i > 0) {
      var awalan = id.slice(0, i);
      if (daftarToko().some(function (t) { return t.id === awalan; })) return cariToko(awalan);
    }
    return tokoUtama();
  }
  // Urutan: ?toko= di link, lalu pilihan terakhir pengunjung, lalu toko utama.
  function tokoAktif() {
    var dariLink = new URLSearchParams(location.search).get("toko");
    if (dariLink && daftarToko().some(function (t) { return t.id === dariLink; })) return cariToko(dariLink);
    var simpanan = null;
    try { simpanan = localStorage.getItem("toko"); } catch (e) {}
    return cariToko(simpanan);
  }
  function setTokoAktif(id) {
    try { localStorage.setItem("toko", id); } catch (e) {}
  }

  function ubahKeProduk(baris, toko) {
    toko = toko || tokoUtama();
    var utama = toko === tokoUtama();
    var kepala = baris[0].map(function (h) { return h.trim().toUpperCase(); });
    var kolom = {};
    KOLOM.forEach(function (n) { kolom[n] = kepala.indexOf(n); });
    if (kolom.NAMA < 0 || kolom.HARGA < 0) throw new Error("Kolom NAMA atau HARGA tidak ditemukan");
    var ambil = function (r, n) {
      var i = kolom[n];
      return i >= 0 && r[i] != null ? String(r[i]).trim() : "";
    };
    var daftar = baris.slice(1).map(function (r, urutan) {
      var harga = ambil(r, "HARGA").replace(/[.,]\d{1,2}$/, "").replace(/\D/g, "");
      var kode = ambil(r, "KODE"), nama = ambil(r, "NAMA");
      return {
        urutan: urutan,
        toko: toko.id,
        id: (utama ? "" : toko.id + ":") + (kode || nama),
        kode: kode,
        nama: nama,
        kat: ambil(r, "KATEGORI") || "Lainnya",
        sat: ambil(r, "SATUAN") || "pcs",
        harga: harga ? parseInt(harga, 10) : 0,
        status: ambil(r, "STATUS").toLowerCase(),
        tampil: ambil(r, "TAMPIL").toUpperCase(),
        foto: ambil(r, "FOTO"),
        sorot: ambil(r, "SOROT").toUpperCase() === "YA",
        merek: ambil(r, "MEREK"),
        tag: ambil(r, "TAG").split(/[,;]/).map(function (t) { return t.trim().toLowerCase(); }).filter(Boolean)
      };
    }).filter(function (p) { return p.nama && p.tampil !== "TIDAK"; });
    samakanKategori(daftar);
    daftar.forEach(isiIndeks);
    return daftar;
  }

  function memuat(teks, rapat, kata) { return teks.indexOf(kata) > -1 || rapat.indexOf(kata) > -1; }

  // Semua kata pencarian harus cocok. Cocok di nama bernilai paling tinggi, lalu kategori, lalu tag.
  function cari(daftar, opsi) {
    var kata = normalisasi(opsi.kueri || "").split(" ").filter(Boolean);
    var hasil = [];
    daftar.forEach(function (p) {
      if (opsi.kategori && p.kat !== opsi.kategori) return;
      var skor = 0;
      for (var i = 0; i < kata.length; i++) {
        if (memuat(p.namaN, p.namaRapat, kata[i])) skor += 3;
        else if (p.katN.indexOf(kata[i]) > -1) skor += 2;
        else if (memuat(p.cari, p.cariRapat, kata[i])) skor += 1;
        else return;
      }
      hasil.push({ p: p, skor: skor });
    });
    hasil.sort(function (a, b) {
      // Produk yang stoknya habis selalu di akhir daftar.
      var habisA = a.p.status === "habis", habisB = b.p.status === "habis";
      if (habisA !== habisB) return habisA ? 1 : -1;
      if (opsi.urut === "murah") return (a.p.harga || Infinity) - (b.p.harga || Infinity) || a.p.urutan - b.p.urutan;
      if (opsi.urut === "mahal") return b.p.harga - a.p.harga || a.p.urutan - b.p.urutan;
      if (opsi.urut === "az") return a.p.nama.localeCompare(b.p.nama, "id");
      if (kata.length && b.skor !== a.skor) return b.skor - a.skor;
      return a.p.urutan - b.p.urutan;
    });
    return hasil.map(function (h) { return h.p; });
  }

  // data-cadangan.js cukup besar, jadi baru diunduh ketika Google Sheets gagal dimuat.
  function muatSkripCadangan() {
    if (typeof DATA_CADANGAN !== "undefined") return Promise.resolve();
    return new Promise(function (berhasil, gagal) {
      var s = document.createElement("script");
      s.src = "js/data-cadangan.js";
      s.onload = berhasil;
      s.onerror = gagal;
      document.head.appendChild(s);
    });
  }

  function dariCadangan(catatan) {
    return muatSkripCadangan().then(function () {
      return { produk: ubahKeProduk([KOLOM].concat(DATA_CADANGAN), tokoUtama()), catatan: catatan };
    }, function () {
      return { produk: [], catatan: "Daftar produk belum bisa dimuat. Periksa koneksi internet, atau tanyakan harga dan stok langsung lewat WhatsApp." };
    });
  }

  // Memuat katalog satu toko. Salinan cadangan (data-cadangan.js) hanya ada untuk toko utama.
  function muat(toko) {
    toko = toko || tokoAktif();
    var utama = toko === tokoUtama();
    var kunciSimpan = utama ? "katalog" : "katalog-" + toko.id;
    var gagal = function (catatan) {
      if (utama) return dariCadangan(catatan);
      return Promise.resolve({ produk: [], catatan: "Katalog " + toko.nama + " belum bisa dimuat. Periksa koneksi internet, atau tanyakan harga dan stok lewat WhatsApp." });
    };
    if (!toko.sheetUrl) return gagal("");
    var kontrol = new AbortController();
    var timer = setTimeout(function () { kontrol.abort(); }, 10000);
    return fetch(toko.sheetUrl, { signal: kontrol.signal, cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (teks) {
        clearTimeout(timer);
        var produk = ubahKeProduk(bacaCSV(teks), toko);
        try { localStorage.setItem(kunciSimpan, teks); } catch (e) {}
        return { produk: produk, catatan: "", terbaru: true };
      })
      .catch(function () {
        clearTimeout(timer);
        var simpanan = null;
        try { simpanan = localStorage.getItem(kunciSimpan); } catch (e) {}
        if (simpanan) {
          try {
            return { produk: ubahKeProduk(bacaCSV(simpanan), toko), catatan: "Daftar harga terbaru belum bisa dimuat. Yang tampil adalah daftar dari kunjungan terakhir Anda, jadi harga bisa berbeda." };
          } catch (e) {}
        }
        return gagal("Daftar harga terbaru belum bisa dimuat. Yang tampil adalah salinan lama, jadi harga bisa berbeda. Tanyakan harga dan stok langsung lewat WhatsApp.");
      });
  }

  return { muat: muat, cari: cari, normalisasi: normalisasi, daftarToko: daftarToko, tokoUtama: tokoUtama, cariToko: cariToko,
           tokoAktif: tokoAktif, setTokoAktif: setTokoAktif, tokoDariIdProduk: tokoDariIdProduk };
})();
