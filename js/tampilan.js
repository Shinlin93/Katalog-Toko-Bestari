// Menggambar halaman: kartu produk, kategori, saran pencarian, keranjang, dan footer.
var KatalogTampilan = (function () {
  var cfg = PENGATURAN, K = KatalogKeranjang;
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  // Maskot hanya muncul saat pengunjung butuh arahan (keranjang kosong, pencarian tanpa hasil). Lihat DESIGN.md.
  var MASKOT = '<img class="maskot" src="aset/logo-maskot.jpg" alt="" width="96" height="80">';
  function rupiah(n) { return "Rp " + n.toLocaleString("id-ID"); }
  // Logo untuk tautan WhatsApp dan Instagram di footer (hanya logo, nama lengkap ada di aria-label).
  var IKON_WA = '<svg class="ikon-sosmed" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>';
  var IKON_WA_TOMBOL = IKON_WA.replace('class="ikon-sosmed"', 'class="ikon-wa-tombol"');
  var IKON_IG = '<svg class="ikon-sosmed" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">' +
    '<rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.3"/>' +
    '<circle cx="17.6" cy="6.4" r="1.2" fill="currentColor" stroke="none"/></svg>';
  // Mengisi tautan footer: WhatsApp dan Instagram tampil sebagai logo.
  function isiSosmed(tanyaWA) {
    var wa = $("f-wa"), ig = $("f-ig");
    if (wa) {
      if (cfg.waNomor) {
        wa.innerHTML = IKON_WA;
        wa.href = tanyaWA;
        wa.setAttribute("aria-label", "WhatsApp " + cfg.waTampil);
        wa.title = "WhatsApp " + cfg.waTampil;
      } else wa.parentNode.hidden = true;
    }
    if (ig) {
      if (cfg.instagram) {
        ig.innerHTML = IKON_IG;
        ig.href = "https://www.instagram.com/" + cfg.instagram + "/";
        ig.setAttribute("aria-label", "Instagram @" + cfg.instagram);
        ig.title = "Instagram @" + cfg.instagram;
      } else ig.parentNode.hidden = true;
    }
  }

  // Mengosongkan keranjang tidak bisa dibatalkan, jadi selalu ditanyakan dulu.
  function konfirmasiKosongkan() {
    return window.confirm("Kosongkan keranjang? Semua barang di keranjang akan dihapus.");
  }

  function linkWA(teks) { return "https://wa.me/" + cfg.waNomor + "?text=" + encodeURIComponent(teks); }
  // Alamat halaman detail satu produk, dipakai untuk kartu dan tombol bagikan.
  function linkProduk(p) { return "produk.html?id=" + encodeURIComponent(p.id); }
  function linkMaps(alamat) { return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(alamat || cfg.alamat); }
  function daftarToko() { return (cfg.toko && cfg.toko.length) ? cfg.toko : [{ nama: "", alamat: cfg.alamat }]; }
  // Semua alamat toko, masing-masing dengan link Google Maps. Dipakai di footer halaman depan dan halaman produk.
  function htmlAlamat() {
    return daftarToko().map(function (t) {
      return "<li>" + (t.nama ? "<b>" + esc(t.nama) + "</b>" : "") + "<span>" + esc(t.alamat) + "</span>" +
        '<a href="' + esc(linkMaps(t.alamat)) + '" target="_blank" rel="noopener">Buka di Google Maps</a></li>';
    }).join("");
  }
  function namaLengkap() { return cfg.namaToko + (cfg.namaLain ? " (" + cfg.namaLain + ")" : ""); }

  var IKON_BULAN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>';
  var IKON_MATAHARI = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/>' +
    '<path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
  function setTema(t) {
    document.documentElement.setAttribute("data-theme", t);
    var label = t === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap";
    $("tombol-tema").innerHTML = t === "dark" ? IKON_MATAHARI : IKON_BULAN;
    $("tombol-tema").setAttribute("aria-label", label);
    $("tombol-tema").title = label;
    try { localStorage.setItem("tema", t); } catch (e) {}
  }
  function mulaiTema() {
    var t = null;
    try { t = localStorage.getItem("tema"); } catch (e) {}
    if (!t) t = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTema(t);
  }
  function gantiTema() {
    setTema(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
  }

  function pengumuman(teks) { $("pengumuman").textContent = teks; }

  function isiToko() {
    $("nama-toko").textContent = cfg.namaToko;
    if ($("subjudul")) $("subjudul").textContent = cfg.subjudul || "";
    document.title = cfg.namaToko + ": " + cfg.tagline;
    $("f-nama").textContent = namaLengkap();
    $("f-tagline").textContent = cfg.tagline;
    $("f-alamat").innerHTML = htmlAlamat();
    if (cfg.waNomor) {
      var tanya = linkWA("Halo, saya mau tanya produk di " + cfg.namaToko + ".");
      $("wa-melayang").href = tanya;
      $("wa-melayang").hidden = false;
      $("hero-wa").href = tanya;
      $("hero-wa").innerHTML = IKON_WA_TOMBOL + "Chat WhatsApp";
      $("hero-wa").hidden = false;
    }
    isiSosmed(cfg.waNomor ? linkWA("Halo, saya mau tanya produk di " + cfg.namaToko + ".") : "");
    isiHero();
  }

  function isiHero() {
    var h = cfg.hero || {};
    $("hero-judul").textContent = h.judul || cfg.namaToko;
    $("hero-sub").textContent = h.sub || cfg.tagline;
  }

  // Angka besar = jumlah produk di katalog, tanpa menyinggung stok.
  function isiJumlahProduk(produk, toko) {
    if (!$("hero-jumlah")) return;
    if (!produk.length) {
      $("hero-jumlah").textContent = "–";
      $("hero-jumlah-ket").textContent = toko ? "Katalog " + toko.nama + " belum bisa dimuat" : "Katalog belum bisa dimuat";
      return;
    }
    $("hero-jumlah").textContent = produk.length.toLocaleString("id-ID");
    $("hero-jumlah-ket").textContent = toko ? "produk di " + toko.nama : "produk di katalog";
  }

  // Tombol pilihan toko di atas katalog. `jumlah` berisi banyak produk per toko yang sudah dimuat.
  function gambarPilihToko(aktifId, jumlah) {
    var daftar = cfg.toko || [];
    var wadah = $("pilih-toko");
    if (!wadah) return;
    wadah.hidden = daftar.length < 2;
    wadah.innerHTML = daftar.map(function (t) {
      var n = jumlah && jumlah[t.id] != null ? jumlah[t.id].toLocaleString("id-ID") + " produk" : "Memuat...";
      var diKeranjang = K.jumlahToko(t.id);
      return '<button class="pilih-toko-item" type="button" data-aksi="pilih-toko" data-nilai="' + esc(t.id) + '" aria-pressed="' + (t.id === aktifId) + '">' +
        "<b>" + esc(t.nama) + "</b><small>" + n + "</small>" +
        (diKeranjang ? '<span class="pilih-toko-keranjang">' + diKeranjang + " di keranjang</span>" : "") + "</button>";
    }).join("");
    var heroToko = $("hero-toko");
    if (heroToko) {
      heroToko.hidden = daftar.length < 2;
      heroToko.innerHTML = daftar.map(function (t, i) {
        var n = jumlah && jumlah[t.id] != null ? jumlah[t.id].toLocaleString("id-ID") + " produk" : "Memuat katalog...";
        return '<button class="tile-toko tile-' + (i % 2 ? "merah" : "biru") + '" type="button" data-aksi="pilih-toko" data-nilai="' + esc(t.id) + '" aria-pressed="' + (t.id === aktifId) + '">' +
          "<b>" + esc(t.nama) + "</b><span>" + esc(t.alamat) + '</span><span class="tile-bawah">' + n + ' <span class="tile-aksi">Lihat katalog</span></span></button>';
      }).join("");
    }
    var aktif = daftar.filter(function (t) { return t.id === aktifId; })[0];
    if (aktif) {
      $("j-katalog").textContent = "Katalog " + aktif.nama;
      $("alamat-toko").innerHTML = "Diambil di " + esc(aktif.alamat) + ' · <a href="' + esc(linkMaps(aktif.alamat)) + '" target="_blank" rel="noopener">Lihat peta</a>';
    }
  }

  // Contoh chat di jawaban FAQ cara memesan, memakai dua produk asli yang berharga dan masih ada stok,
  // diformat persis seperti pesan yang dikirim dari keranjang.
  function isiContohPesan(produk) {
    var siap = produk.filter(function (p) { return p.harga > 0 && p.status !== "habis"; });
    var pilihan = siap.filter(function (p) { return p.sorot; }).concat(siap).slice(0, 2);
    if (pilihan.length < 2 || pilihan[0] === pilihan[1]) pilihan = siap.slice(0, 2);
    if (!pilihan.length) return;
    var isi = pilihan.map(function (p, i) { return { nama: p.nama, harga: p.harga, sat: p.sat, qty: i === 0 ? 2 : 1 }; });
    var teks = K.teksPesanan(cfg.namaToko, isi);
    [].forEach.call(document.querySelectorAll(".contoh-pesan"), function (el) { el.textContent = teks; });
  }

  var CONTOH_AWAL = "Halo " + cfg.namaToko + ", saya mau pesan:\n1. Kresek 257 UK 15 - 2 pak\n2. Plastik PE Hitam Tali Putih 9X20 Boyo - 1 pak\nMohon dicek stok dan totalnya.";
  // Semua pertanyaan di halaman faq.html.
  function isiFaq() {
    $("faq-daftar").innerHTML = (cfg.faq || []).map(function (f) {
      var contoh = f.contoh ? '<p class="contoh-label">Contoh chat WhatsApp</p><p class="contoh-pesan">' + esc(CONTOH_AWAL) + "</p>" : "";
      return '<details class="faq-item"><summary>' + esc(f.tanya) + '</summary><div class="faq-jawab"><p>' + esc(f.jawab) + "</p>" + contoh + "</div></details>";
    }).join("");
  }

  // ---- Panduan belanja (isi diatur di pengaturan.js) ----
  function daftarPanduan() { return cfg.panduan || []; }
  function ambilPanduan(id) {
    return daftarPanduan().filter(function (g) { return g.id === id; })[0] || null;
  }


  // Gambar tas sederhana; ukurannya hanya untuk perbandingan antar pilihan.
  function gambarTas(lebar) {
    return '<svg class="tas" viewBox="0 0 40 48" width="' + lebar + '" height="' + Math.round(lebar * 1.2) + '" aria-hidden="true">' +
      '<path d="M4 3h8v9q8 8 16 0V3h8v41a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/></svg>';
  }

  function gambarPanduan(id) {
    var g = ambilPanduan(id);
    if (!g) return false;
    $("judul-panduan").textContent = g.judul;
    var pilihan = g.pilihan || [], n = pilihan.length;
    var html = '<div class="panduan-pembuka"><img class="maskot" src="aset/logo-maskot.jpg" alt="" width="72" height="60">' +
      '<p class="gelembung">' + esc(g.pengantar || g.ringkas || "") + "</p></div>";
    if (n) {
      html += '<ol class="pilihan-panduan">' + pilihan.map(function (x, i) {
        var lebar = n > 1 ? Math.round(26 + (i * 30) / (n - 1)) : 40;
        return '<li class="pilihan-item"><div class="pilihan-gambar">' + gambarTas(lebar) + "</div>" +
          '<div class="pilihan-teks">' + (x.label ? '<span class="pilihan-label">' + esc(x.label) + "</span>" : "") +
          "<h3>" + esc(x.nama) + "</h3><p>" + esc(x.untuk || "") + "</p></div>" +
          (x.cari ? '<button class="tombol-sekunder pilihan-tombol" type="button" data-aksi="cari-panduan" data-nilai="' + esc(x.cari) +
            '">Lihat ' + esc(x.nama.toLowerCase()) + "</button>" : "") + "</li>";
      }).join("") + "</ol>";
      html += '<p class="catatan-kecil">Gambar tas hanya untuk membandingkan ukuran, bukan ukuran sebenarnya.</p>';
    }
    if ((g.warna || []).length) {
      html += '<h3 class="panduan-subjudul">' + esc(g.warnaJudul || "Pilihan warna") + '</h3><ul class="warna-daftar">' +
        g.warna.map(function (w) {
          return '<li><span class="warna-contoh" style="background:' + esc(w.contoh) + '"></span>' + esc(w.nama) + "</li>";
        }).join("") + "</ul>";
    }
    html += '<p class="catatan-kecil">Masih ragu? Tanyakan lewat WhatsApp, kami bantu pilihkan.</p>';
    $("isi-panduan").innerHTML = html;
    $("isi-panduan").scrollTop = 0;
    return true;
  }

  // Panduan yang cocok dengan kategori atau kata yang sedang dicari, untuk ditawarkan di atas hasil.
  function panduanCocok(S) {
    var kueri = (S.kueri || "").toLowerCase();
    return daftarPanduan().filter(function (g) {
      if (S.kategori && g.kategori && S.kategori.toLowerCase() === g.kategori.toLowerCase()) return true;
      return kueri && (g.kataKunci || []).some(function (k) { return kueri.indexOf(k.toLowerCase()) > -1; });
    })[0] || null;
  }

  function hitungKategori(produk) {
    var urut = [], hitung = {};
    produk.forEach(function (p) {
      if (hitung[p.kat] == null) { hitung[p.kat] = 0; urut.push(p.kat); }
      hitung[p.kat]++;
    });
    return { urut: urut, hitung: hitung };
  }

  function buatKategori(produk) {
    var k = hitungKategori(produk);
    var pil = function (nilai, label, aktif) {
      return '<button class="pil-item" type="button" data-kategori="' + esc(nilai) + '" aria-pressed="' + aktif + '">' + esc(label) + "</button>";
    };
    // Hanya kategori terbanyak yang jadi tombol; semua kategori tetap bisa dipilih lewat daftar pilih.
    var teratas = k.urut.slice().sort(function (a, b) { return k.hitung[b] - k.hitung[a]; }).slice(0, JUMLAH_TOMBOL_KATEGORI);
    $("kategori").innerHTML = pil("", "Semua " + produk.length, true) +
      teratas.map(function (n) { return pil(n, n + " " + k.hitung[n], false); }).join("");
    var abjad = k.urut.slice().sort(function (a, b) { return a.localeCompare(b, "id"); });
    $("kategori-lain").innerHTML = '<option value="">Semua kategori</option>' + abjad.map(function (n) {
      return '<option value="' + esc(n) + '">' + esc(n) + " (" + k.hitung[n] + ")</option>";
    }).join("");
  }
  var JUMLAH_TOMBOL_KATEGORI = 10;

  // Delapan kategori dengan produk terbanyak, sebagai jalan pintas di bagian atas.

  function buatKategoriBulat(produk) {
    var bagian = $("bagian-kategori");
    if (!bagian) return;
    var k = hitungKategori(produk);
    var teratas = k.urut.slice().sort(function (a, b) { return k.hitung[b] - k.hitung[a]; }).slice(0, 8);
    bagian.hidden = !teratas.length;
    $("kategori-bulat").innerHTML = teratas.map(function (n) {
      // Foto kategori: produk pertama di kategori itu yang punya foto dan masih ada stok.
      var contoh = produk.filter(function (p) { return p.kat === n && p.foto && p.status !== "habis"; })[0];
      var gambar = contoh ? '<img src="' + esc(cfg.folderFoto + contoh.foto) + '" alt="" loading="lazy" onerror="this.remove()">' : "";
      return '<li><button class="kategori-item" type="button" data-aksi="kategori" data-nilai="' + esc(n) + '">' +
        '<span class="kategori-foto" aria-hidden="true">' + gambar + "<span>" + esc(n.charAt(0)) + "</span></span>" +
        "<b>" + esc(n) + "</b><small>" + k.hitung[n] + " produk</small></button></li>";
    }).join("");
  }

  function tandaiKategori(nilai) {
    [].forEach.call($("kategori").children, function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-kategori") === nilai);
    });
    $("kategori-lain").value = nilai;
  }

  function teksDiKeranjang(n) { return n ? "Di keranjang: " + n : ""; }

  function kartu(p) {
    var habis = p.status === "habis", n = K.qty(p.id), diKeranjang = teksDiKeranjang(n);
    var foto = p.foto ? '<img src="' + esc(cfg.folderFoto + p.foto) + '" alt="' + esc(p.nama) + '" loading="lazy" onerror="this.remove()">' : "";
    var label = habis ? '<span class="label-stok habis">Stok habis</span>'
      : p.status === "sedikit" ? '<span class="label-stok sedikit">Stok sedikit</span>' : "";
    var harga = p.harga ? rupiah(p.harga) + " <small>per " + esc(p.sat) + "</small>" : "<small>Tanya harga lewat WhatsApp</small>";
    var tombol = habis ? '<button class="beli" type="button" disabled>Stok habis</button>'
      : '<button class="beli" type="button" data-aksi="tambah" data-id="' + esc(p.id) + '" aria-label="Tambah ke keranjang: ' + esc(p.nama) + '">+ Keranjang</button>';
    var link = esc(linkProduk(p));
    return '<li class="kartu" data-id="' + esc(p.id) + '"><a class="foto" href="' + link + '" tabindex="-1" aria-hidden="true">' + foto + esc(p.kat) + "<small>Foto menyusul</small>" + label + "</a>" +
      '<div class="isi"><p class="nama"><a href="' + link + '">' + esc(p.nama) + "</a></p>" + (label ? '<p class="sr">' + (habis ? "Stok habis" : "Stok sedikit") + "</p>" : "") + '<p class="harga">' + harga + "</p>" +
      '<p class="di-keranjang"' + (diKeranjang ? "" : " hidden") + ">" + esc(diKeranjang) + "</p>" + tombol + "</div></li>";
  }

  // Memperbarui tulisan "Di keranjang" tanpa menggambar ulang, supaya fokus keyboard tidak hilang.
  function perbaruiKartu() {
    [].forEach.call(document.querySelectorAll(".kartu"), function (el) {
      var baris = el.querySelector(".di-keranjang");
      if (!baris) return;
      var teks = teksDiKeranjang(K.qty(el.getAttribute("data-id")));
      baris.hidden = !teks;
      baris.textContent = teks;
    });
  }

  function gambarLencana() {
    var n = K.jumlah(), total = rupiah(K.total());
    $("lencana").textContent = n;
    $("lencana").hidden = !n;
    $("total-mini").textContent = total;
    $("tombol-keranjang").setAttribute("aria-label", "Buka keranjang, " + n + " barang, total " + total);
  }

  // Pengingat keranjang toko lain yang masih berisi barang. Di halaman depan tautan ini langsung memindah toko;
  // di halaman lain membuka halaman depan dengan toko dan keranjang tersebut.
  function htmlPengingatToko() {
    return K.tokoLainBerisi().map(function (l) {
      return '<p class="laci-lain">Keranjang <b>' + esc(l.toko.nama) + "</b> masih berisi " + l.jumlah + " barang. " +
        '<a href="index.html?toko=' + encodeURIComponent(l.toko.id) + '#keranjang" data-aksi="buka-keranjang-toko" data-nilai="' + esc(l.toko.id) + '">Buka</a></p>';
    }).join("");
  }

  function gambarLaci() {
    var aktif = document.activeElement, fokus = null;
    if (aktif && aktif.closest && aktif.closest("#laci") && aktif.getAttribute("data-aksi")) {
      fokus = { aksi: aktif.getAttribute("data-aksi"), id: aktif.getAttribute("data-id") };
    }
    var t = K.toko(), banyakToko = (cfg.toko || []).length > 1;
    $("judul-laci").textContent = banyakToko ? "Keranjang " + t.nama : "Keranjang";
    var info = banyakToko ? '<p class="laci-toko">Diambil di ' + esc(t.alamat) + "</p>" : "";
    var pengingat = htmlPengingatToko();
    var daftar = K.daftar();
    if (!daftar.length) {
      $("laci-daftar").innerHTML = info + '<div class="laci-kosong">' + MASKOT + "<b>Keranjang " + (banyakToko ? esc(t.nama) + " " : "") + "masih kosong</b>" +
        "<p>Pilih produk, lalu tekan + Keranjang.</p>" +
        '<button class="tombol-utama" type="button" data-aksi="tutup-laci">Lihat produk</button></div>' + pengingat;
      $("laci-kaki").innerHTML = "";
      return;
    }
    $("laci-daftar").innerHTML = info + "<ul>" + daftar.map(function (x) {
      var id = esc(x.id), nama = esc(x.nama);
      return '<li class="baris-keranjang"><div class="bk-nama">' + nama + "<small>" +
        (x.harga > 0 ? rupiah(x.harga) + " per " + esc(x.sat) : "Harga ditanyakan lewat WhatsApp") + "</small></div>" +
        '<div class="bk-sub">' + (x.harga > 0 ? rupiah(K.subtotal(x)) : "") + "</div>" +
        '<div class="pengatur"><button type="button" data-aksi="kurang" data-id="' + id + '" aria-label="Kurangi jumlah: ' + nama + '"' + (x.qty <= 1 ? " disabled" : "") + ">−</button>" +
        '<span><span class="sr">Jumlah: </span>' + x.qty + "</span>" +
        '<button type="button" data-aksi="lebih" data-id="' + id + '" aria-label="Tambah jumlah: ' + nama + '">+</button></div>' +
        '<button class="tombol-teks" style="justify-self:end" type="button" data-aksi="hapus-item" data-id="' + id + '" aria-label="Hapus dari keranjang: ' + nama + '">Hapus</button></li>';
    }).join("") + "</ul>" + pengingat;
    $("laci-kaki").innerHTML = '<div class="total"><span>Total perkiraan</span><b>' + rupiah(K.total()) + "</b></div>" +
      (K.adaTanpaHarga() ? '<p class="catatan-kecil">Barang tanpa harga belum dihitung.</p>' : "") +
      '<p class="catatan-kecil">Pesanan dikirim lewat WhatsApp, bukan pembayaran online. Kami memastikan harga dan stok saat membalas chat Anda.</p>' +
      (cfg.waNomor ? '<a class="tombol-utama tombol-wa tombol-kirim" href="' + linkWA(K.teksPesanan(cfg.namaToko)) + '" target="_blank" rel="noopener">' + IKON_WA_TOMBOL +
          "Kirim pesanan lewat WhatsApp</a>"
        : '<p class="catatan-kecil">Nomor WhatsApp toko belum diisi, jadi pesanan belum bisa dikirim.</p>') +
      '<button class="tombol-teks" type="button" data-aksi="kosongkan">Kosongkan keranjang</button>';
    if (fokus) kembalikanFokus(fokus);
  }

  function kembalikanFokus(f) {
    var cocok = null;
    [].forEach.call($("laci").querySelectorAll("[data-aksi]"), function (el) {
      if (el.getAttribute("data-aksi") === f.aksi && el.getAttribute("data-id") === f.id) cocok = el;
    });
    if (cocok && cocok.disabled) {
      [].forEach.call($("laci").querySelectorAll('[data-aksi="lebih"]'), function (el) {
        if (el.getAttribute("data-id") === f.id) cocok = el;
      });
    }
    if (!cocok) cocok = $("laci").querySelector('[data-aksi="tutup-laci"]');
    if (cocok) cocok.focus();
  }

  function gambarSaran(hasil, kueri) {
    var kotak = $("saran");
    if (!kueri) { kotak.hidden = true; kotak.innerHTML = ""; return; }
    if (!hasil.length) {
      kotak.innerHTML = '<p class="saran-kosong">Tidak ada produk yang cocok dengan “' + esc(kueri) + "”.</p>";
      kotak.hidden = false;
      return;
    }
    kotak.innerHTML = hasil.slice(0, 6).map(function (p) {
      return '<button type="button" class="saran-item" data-aksi="pilih-saran" data-nilai="' + esc(p.nama) + '"><span>' + esc(p.nama) +
        "</span><small>" + (p.harga ? rupiah(p.harga) : "Tanya harga") + "</small></button>";
    }).join("") + '<button type="button" class="saran-semua" data-aksi="lihat-hasil">Lihat semua ' + hasil.length + " hasil</button>";
    kotak.hidden = false;
  }

  // Tombol tanya stok lewat WhatsApp untuk barang yang belum ada di katalog website.
  function tombolTanyaWA(kueri) {
    if (!cfg.waNomor) return "";
    var teks = kueri ? "Halo " + cfg.namaToko + ", apakah ada " + kueri + "? Saya tidak menemukannya di website."
                     : "Halo " + cfg.namaToko + ", saya mau tanya harga dan stok barang.";
    return '<a class="tombol-utama tombol-wa" href="' + esc(linkWA(teks)) + '" target="_blank" rel="noopener">' + IKON_WA_TOMBOL +
      (kueri ? "Tanya stok “" + esc(kueri) + "” lewat WhatsApp" : "Tanya lewat WhatsApp") + "</a>";
  }

  function gambar(S, hasil) {
    var catatan = [];
    if (!cfg.waNomor) catatan.push('<div class="catatan" role="status"><p>Nomor WhatsApp toko belum diisi, jadi pesanan belum bisa dikirim.</p></div>');
    if (S.catatan) catatan.push('<div class="catatan" role="status"><p>' + esc(S.catatan) + '</p><button class="tombol-sekunder" type="button" data-aksi="ulang">Coba muat lagi</button></div>');
    var g = S.keadaan === "ok" && hasil.length ? panduanCocok(S) : null;
    if (g) catatan.push('<div class="petunjuk"><img src="aset/logo-maskot.jpg" alt="" width="48" height="40"><p>' + esc(g.petunjuk || g.judul) +
      '</p><button class="tombol-sekunder" type="button" data-aksi="buka-panduan" data-nilai="' + esc(g.id) + '">Lihat panduan</button></div>');
    // S.lain: toko lain yang juga punya hasil untuk kata yang dicari, [{ toko, jumlah }].
    var lain = S.keadaan === "ok" && S.kueri ? (S.lain || []) : [];
    $("catatan").innerHTML = catatan.join("");

    var sorot = S.keadaan === "ok" && !S.kueri && !S.kategori ? S.produk.filter(function (p) { return p.sorot; }).slice(0, 10) : [];
    $("pilihan").hidden = !sorot.length;
    $("baris-pilihan").innerHTML = sorot.map(kartu).join("");

    var daftar = $("daftar");
    $("lagi").hidden = true;
    if (S.keadaan === "memuat") {
      $("jumlah").textContent = "";
      daftar.innerHTML = '<li class="keadaan"><b>Memuat daftar produk</b>Sebentar, harga terbaru sedang diambil.</li>';
      return;
    }
    if (S.keadaan === "kosong") {
      $("jumlah").textContent = "";
      daftar.innerHTML = '<li class="keadaan"><b>Daftar produk belum bisa ditampilkan</b>Tanyakan harga dan stok langsung lewat WhatsApp.' +
        '<div class="keadaan-aksi">' + tombolTanyaWA("") + "</div></li>";
      return;
    }
    var ket = S.kueri ? " untuk “" + S.kueri + "”" : "";
    // Barang tidak ada di toko ini tapi ada di toko lain: beri tahu, dengan tombol langsung ke katalog toko itu.
    if (!hasil.length && lain.length) {
      $("jumlah").textContent = "0 produk" + ket;
      daftar.innerHTML = '<li class="keadaan">' + MASKOT + "<b>Tidak ada di " + esc(S.tokoNama) + "</b>Tapi barang ini ada di toko kami yang lain." +
        '<div class="keadaan-aksi">' + lain.map(function (l) {
          return '<button class="tombol-utama" type="button" data-aksi="pilih-toko" data-nilai="' + esc(l.toko.id) + '">Lihat di ' + esc(l.toko.nama) + " (" + l.jumlah + ")</button>";
        }).join("") + "</div>" +
        '<button class="tombol-sekunder" type="button" data-aksi="reset">Hapus pencarian dan filter</button></li>';
      return;
    }
    if (!hasil.length) {
      $("jumlah").textContent = "0 produk" + ket;
      daftar.innerHTML = '<li class="keadaan">' + MASKOT + '<b>Belum ada di katalog website</b>Belum semua barang di toko tercantum di sini. Tanyakan langsung, kami cek stoknya.' +
        '<div class="keadaan-aksi">' + tombolTanyaWA(S.kueri) + '</div><p class="keadaan-atau">Atau coba kata lain:</p>' +
        '<div class="saran-cepat">' + cfg.saranCari.map(function (k) {
          return '<button class="pil-item" type="button" data-aksi="saran-cepat" data-nilai="' + esc(k) + '">' + esc(k) + "</button>";
        }).join("") + '</div><button class="tombol-sekunder" type="button" data-aksi="reset">Hapus pencarian dan filter</button></li>';
      return;
    }
    var tampil = hasil.slice(0, S.batas);
    $("jumlah").textContent = tampil.length < hasil.length
      ? "Menampilkan " + tampil.length + " dari " + hasil.length + " produk" + ket
      : hasil.length + " produk" + ket;
    daftar.innerHTML = tampil.map(kartu).join("");
    if (tampil.length < hasil.length) {
      $("lagi").hidden = false;
      $("tombol-lagi").textContent = "Tampilkan " + Math.min(cfg.produkPerHalaman, hasil.length - tampil.length) +
        " produk lagi (sisa " + (hasil.length - tampil.length) + ")";
    }
  }

  return { mulaiTema: mulaiTema, gantiTema: gantiTema, isiToko: isiToko, buatKategori: buatKategori,
           tandaiKategori: tandaiKategori, perbaruiKartu: perbaruiKartu, gambarLencana: gambarLencana, gambarLaci: gambarLaci,
           gambarSaran: gambarSaran, gambar: gambar, pengumuman: pengumuman, isiJumlahProduk: isiJumlahProduk,
           isiContohPesan: isiContohPesan, gambarPilihToko: gambarPilihToko, buatKategoriBulat: buatKategoriBulat, teksDiKeranjang: teksDiKeranjang, gambarPanduan: gambarPanduan, isiFaq: isiFaq,
           kartu: kartu, esc: esc, rupiah: rupiah, linkWA: linkWA, linkMaps: linkMaps, linkProduk: linkProduk,
           htmlAlamat: htmlAlamat, isiSosmed: isiSosmed, ikonWA: IKON_WA_TOMBOL, konfirmasiKosongkan: konfirmasiKosongkan, namaLengkap: namaLengkap };
})();
