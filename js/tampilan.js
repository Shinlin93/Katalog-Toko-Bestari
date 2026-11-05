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
  function linkWA(teks) { return "https://wa.me/" + cfg.waNomor + "?text=" + encodeURIComponent(teks); }
  function linkMaps() { return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(cfg.alamat); }

  function setTema(t) {
    document.documentElement.setAttribute("data-theme", t);
    $("tombol-tema").textContent = t === "dark" ? "Terang" : "Gelap";
    $("tombol-tema").setAttribute("aria-label", t === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap");
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
    $("tagline").textContent = cfg.tagline;
    document.title = cfg.namaToko + ": " + cfg.tagline;
    $("info-lokasi-teks").textContent = cfg.lokasiSingkat;
    $("info-lokasi").href = linkMaps();
    $("f-nama").textContent = cfg.namaToko;
    $("f-tagline").textContent = cfg.tagline;
    $("f-alamat").textContent = cfg.alamat;
    $("f-maps").href = linkMaps();
    $("f-ig").textContent = "Instagram @" + cfg.instagram;
    $("f-ig").href = "https://www.instagram.com/" + cfg.instagram + "/";
    if (cfg.waNomor) {
      var tanya = linkWA("Halo, saya mau tanya produk di " + cfg.namaToko + ".");
      $("info-wa-nomor").textContent = cfg.waTampil;
      $("info-wa").href = tanya;
      $("f-wa").textContent = "WhatsApp " + cfg.waTampil;
      $("f-wa").href = tanya;
      $("wa-melayang").href = tanya;
      $("wa-melayang").hidden = false;
      $("hero-wa").href = tanya;
      $("hero-wa").hidden = false;
    } else {
      $("info-wa").hidden = true;
      $("f-wa").parentNode.hidden = true;
    }
    isiHero();
    isiFaq();
  }

  function isiHero() {
    var h = cfg.hero || {};
    $("hero-label").textContent = h.label || cfg.lokasiSingkat;
    $("hero-judul").textContent = h.judul || cfg.namaToko;
    $("hero-sub").textContent = h.sub || cfg.tagline;
    $("hero-cepat").innerHTML = (cfg.saranCari || []).length
      ? '<span>Coba cari:</span>' + cfg.saranCari.map(function (k) {
          return '<button type="button" data-aksi="pilih-saran" data-nilai="' + esc(k) + '">' + esc(k) + "</button>";
        }).join("")
      : "";
  }

  // Angka besar = jumlah produk di katalog, tanpa menyinggung stok.
  function isiJumlahProduk(produk) {
    if (!produk.length) return;
    $("hero-jumlah").textContent = produk.length.toLocaleString("id-ID");
    $("hero-jumlah-ket").textContent = "produk di katalog";
  }

  // Contoh chat di halaman depan, memakai dua produk asli yang berharga dan masih ada stok,
  // diformat persis seperti pesan yang dikirim dari keranjang.
  function isiContohPesan(produk) {
    var siap = produk.filter(function (p) { return p.harga > 0 && p.status !== "habis"; });
    var pilihan = siap.filter(function (p) { return p.sorot; }).concat(siap).slice(0, 2);
    if (pilihan.length < 2 || pilihan[0] === pilihan[1]) pilihan = siap.slice(0, 2);
    if (!pilihan.length) return;
    var isi = pilihan.map(function (p, i) { return { nama: p.nama, harga: p.harga, sat: p.sat, qty: i === 0 ? 2 : 1 }; });
    $("contoh-pesan").textContent = K.teksPesanan(cfg.namaToko, isi);
  }

  function isiFaq() {
    var daftar = cfg.faq || [];
    $("faq").hidden = !daftar.length;
    $("faq-daftar").innerHTML = daftar.map(function (f) {
      return '<details class="faq-item"><summary>' + esc(f.tanya) + "</summary><p>" + esc(f.jawab) + "</p></details>";
    }).join("");
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
  function buatStrip(produk) {
    var k = hitungKategori(produk);
    var teratas = k.urut.slice().sort(function (a, b) { return k.hitung[b] - k.hitung[a]; }).slice(0, 8);
    $("strip").innerHTML = teratas.map(function (n) {
      return '<li><button class="strip-item" type="button" data-aksi="kategori" data-nilai="' + esc(n) + '"><b>' + esc(n) + "</b><small>" + k.hitung[n] + " produk</small></button></li>";
    }).join("");
  }

  function tandaiKategori(nilai) {
    [].forEach.call($("kategori").children, function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-kategori") === nilai);
    });
    $("kategori-lain").value = nilai;
  }

  function kartu(p) {
    var habis = p.status === "habis", n = K.qty(p.id);
    var foto = p.foto ? '<img src="' + esc(cfg.folderFoto + p.foto) + '" alt="' + esc(p.nama) + '" loading="lazy" onerror="this.remove()">' : "";
    var stok = habis ? '<p class="stok habis">Stok habis</p>'
      : p.status === "sedikit" ? '<p class="stok sedikit">Stok tinggal sedikit</p>'
      : '<p class="stok"><span class="centang" aria-hidden="true">✓</span> Tersedia</p>';
    var harga = p.harga ? rupiah(p.harga) + " <small>per " + esc(p.sat) + "</small>" : "<small>Tanya harga lewat WhatsApp</small>";
    var tombol = habis ? '<button class="beli" type="button" disabled>Stok habis</button>'
      : '<button class="beli" type="button" data-aksi="tambah" data-id="' + esc(p.id) + '" aria-label="Tambah ke keranjang: ' + esc(p.nama) + '">Tambah ke Keranjang</button>';
    return '<li class="kartu" data-id="' + esc(p.id) + '"><div class="foto">' + foto + esc(p.kat) + "<small>Foto menyusul</small></div>" +
      '<div class="isi"><p class="nama">' + esc(p.nama) + "</p>" + stok + '<p class="harga">' + harga + "</p>" +
      '<p class="di-keranjang"' + (n ? "" : " hidden") + ">Di keranjang: " + n + "</p>" + tombol + "</div></li>";
  }

  // Memperbarui tulisan "Di keranjang" tanpa menggambar ulang, supaya fokus keyboard tidak hilang.
  function perbaruiKartu(id) {
    [].forEach.call(document.querySelectorAll(".kartu"), function (el) {
      if (id != null && el.getAttribute("data-id") !== id) return;
      var n = K.qty(el.getAttribute("data-id")), baris = el.querySelector(".di-keranjang");
      baris.hidden = !n;
      baris.textContent = "Di keranjang: " + n;
    });
  }

  function gambarLencana() {
    var n = K.jumlah(), total = rupiah(K.total());
    $("lencana").textContent = n;
    $("lencana").hidden = !n;
    $("total-mini").textContent = total;
    $("tombol-keranjang").setAttribute("aria-label", "Buka keranjang, " + n + " barang, total " + total);
  }

  function gambarLaci() {
    var aktif = document.activeElement, fokus = null;
    if (aktif && aktif.closest && aktif.closest("#laci") && aktif.getAttribute("data-aksi")) {
      fokus = { aksi: aktif.getAttribute("data-aksi"), id: aktif.getAttribute("data-id") };
    }
    var daftar = K.daftar();
    if (!daftar.length) {
      $("laci-daftar").innerHTML = '<div class="laci-kosong">' + MASKOT + '<b>Keranjang masih kosong</b><p>Pilih produk, lalu tekan Tambah ke Keranjang.</p>' +
        '<button class="tombol-utama" type="button" data-aksi="tutup-laci">Lihat produk</button></div>';
      $("laci-kaki").innerHTML = "";
      return;
    }
    $("laci-daftar").innerHTML = "<ul>" + daftar.map(function (x) {
      var id = esc(x.id), nama = esc(x.nama);
      return '<li class="baris-keranjang"><div class="bk-nama">' + nama + "<small>" +
        (x.harga > 0 ? rupiah(x.harga) + " per " + esc(x.sat) : "Harga ditanyakan lewat WhatsApp") + "</small></div>" +
        '<div class="bk-sub">' + (x.harga > 0 ? rupiah(K.subtotal(x)) : "") + "</div>" +
        '<div class="pengatur"><button type="button" data-aksi="kurang" data-id="' + id + '" aria-label="Kurangi jumlah: ' + nama + '"' + (x.qty <= 1 ? " disabled" : "") + ">−</button>" +
        '<span><span class="sr">Jumlah: </span>' + x.qty + "</span>" +
        '<button type="button" data-aksi="lebih" data-id="' + id + '" aria-label="Tambah jumlah: ' + nama + '">+</button></div>' +
        '<button class="tombol-teks" style="justify-self:end" type="button" data-aksi="hapus-item" data-id="' + id + '" aria-label="Hapus dari keranjang: ' + nama + '">Hapus</button></li>';
    }).join("") + "</ul>";
    $("laci-kaki").innerHTML = '<div class="total"><span>Total perkiraan</span><b>' + rupiah(K.total()) + "</b></div>" +
      (K.adaTanpaHarga() ? '<p class="catatan-kecil">Barang tanpa harga belum dihitung.</p>' : "") +
      '<p class="catatan-kecil">Pesanan dikirim lewat WhatsApp, bukan pembayaran online. Kami memastikan harga dan stok saat membalas chat Anda.</p>' +
      (cfg.waNomor ? '<a class="tombol-utama" href="' + linkWA(K.teksPesanan(cfg.namaToko)) + '" target="_blank" rel="noopener">Kirim pesanan lewat WhatsApp</a>'
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

  function gambar(S, hasil) {
    var catatan = [];
    if (!cfg.waNomor) catatan.push('<div class="catatan" role="status"><p>Nomor WhatsApp toko belum diisi, jadi pesanan belum bisa dikirim.</p></div>');
    if (S.catatan) catatan.push('<div class="catatan" role="status"><p>' + esc(S.catatan) + '</p><button class="tombol-sekunder" type="button" data-aksi="ulang">Coba muat lagi</button></div>');
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
      daftar.innerHTML = '<li class="keadaan"><b>Daftar produk belum bisa ditampilkan</b>Tanyakan harga dan stok langsung lewat WhatsApp.</li>';
      return;
    }
    var ket = S.kueri ? " untuk “" + S.kueri + "”" : "";
    if (!hasil.length) {
      $("jumlah").textContent = "0 produk" + ket;
      daftar.innerHTML = '<li class="keadaan">' + MASKOT + '<b>Tidak ada produk yang cocok</b>Coba kata lain, atau lihat semua kategori.' +
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

  return { mulaiTema: mulaiTema, gantiTema: gantiTema, isiToko: isiToko, buatKategori: buatKategori, buatStrip: buatStrip,
           tandaiKategori: tandaiKategori, perbaruiKartu: perbaruiKartu, gambarLencana: gambarLencana, gambarLaci: gambarLaci,
           gambarSaran: gambarSaran, gambar: gambar, pengumuman: pengumuman, isiJumlahProduk: isiJumlahProduk,
           isiContohPesan: isiContohPesan };
})();
