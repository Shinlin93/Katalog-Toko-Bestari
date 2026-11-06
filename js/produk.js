// Halaman detail satu produk (produk.html?id=KODE), lengkap dengan tombol bagikan.
(function () {
  var cfg = PENGATURAN, D = KatalogData, T = KatalogTampilan, K = KatalogKeranjang;
  var $ = function (id) { return document.getElementById(id); };
  var esc = T.esc, rupiah = T.rupiah;
  var laci = $("laci"), produk = [], ini = null;
  var id = new URLSearchParams(location.search).get("id") || "";

  // Alamat yang dibagikan: selalu bentuk bersih tanpa tanda # atau parameter lain.
  function linkBagikan() {
    return location.origin + location.pathname + "?id=" + encodeURIComponent(id);
  }
  function teksBagikan(p) {
    return p.nama + (p.harga ? " - " + rupiah(p.harga) + " per " + p.sat : "") + " di " + cfg.namaToko;
  }

  function setMeta(nama, isi) {
    var el = document.querySelector('meta[' + (nama.indexOf("og:") === 0 ? "property" : "name") + '="' + nama + '"]');
    if (el) el.setAttribute("content", isi);
  }

  function isiToko() {
    $("nama-toko").textContent = cfg.namaToko;
    $("tagline").textContent = cfg.tagline;
    $("f-alamat").textContent = cfg.alamat;
    $("f-maps").href = T.linkMaps();
    if (cfg.waNomor) {
      $("f-wa").textContent = "WhatsApp " + cfg.waTampil;
      $("f-wa").href = T.linkWA("Halo, saya mau tanya produk di " + cfg.namaToko + ".");
    } else $("f-wa").parentNode.hidden = true;
  }

  function gambarProduk(p) {
    var habis = p.status === "habis", n = K.qty(p.id);
    var foto = p.foto ? '<img src="' + esc(cfg.folderFoto + p.foto) + '" alt="' + esc(p.nama) + '" onerror="this.remove()">' : "";
    var stok = habis ? '<p class="stok habis">Stok habis</p>'
      : p.status === "sedikit" ? '<p class="stok sedikit">Stok tinggal sedikit</p>'
      : '<p class="stok"><span class="centang" aria-hidden="true">✓</span> Tersedia</p>';
    var harga = p.harga ? rupiah(p.harga) + " <small>per " + esc(p.sat) + "</small>" : "<small>Tanya harga lewat WhatsApp</small>";
    var beli = habis ? '<button class="beli" type="button" disabled>Stok habis</button>'
      : '<button class="beli" type="button" data-aksi="tambah" data-id="' + esc(p.id) + '">Tambah ke Keranjang</button>';
    var tanya = cfg.waNomor ? '<a class="tombol-sekunder tombol-wa-produk" target="_blank" rel="noopener" href="' +
      esc(T.linkWA("Halo " + cfg.namaToko + ", saya mau tanya produk ini:\n" + p.nama + "\n" + linkBagikan())) + '">Tanya lewat WhatsApp</a>' : "";

    $("produk").innerHTML =
      '<div class="detail kartu" data-id="' + esc(p.id) + '">' +
        '<div class="foto detail-foto">' + foto + esc(p.kat) + "<small>Foto menyusul</small></div>" +
        '<div class="detail-isi">' +
          '<p class="detail-kat"><a href="index.html?kategori=' + encodeURIComponent(p.kat) + '#katalog">' + esc(p.kat) + "</a></p>" +
          '<h1 class="detail-nama">' + esc(p.nama) + "</h1>" +
          (p.kode ? '<p class="detail-kode">Kode barang: ' + esc(p.kode) + "</p>" : "") +
          stok +
          '<p class="harga detail-harga">' + harga + "</p>" +
          '<p class="di-keranjang"' + (n ? "" : " hidden") + ">Di keranjang: " + n + "</p>" +
          '<div class="detail-aksi">' + beli + tanya + "</div>" +
          '<div class="bagikan" role="group" aria-labelledby="j-bagikan">' +
            '<p class="bagikan-judul" id="j-bagikan">Bagikan produk ini</p>' +
            '<div class="bagikan-tombol">' +
              (navigator.share ? '<button class="tombol-sekunder" type="button" data-aksi="bagikan">Bagikan</button>' : "") +
              '<button class="tombol-sekunder" type="button" data-aksi="salin-link">Salin link</button>' +
              '<a class="tombol-sekunder" target="_blank" rel="noopener" href="https://wa.me/?text=' +
                encodeURIComponent(teksBagikan(p) + "\n" + linkBagikan()) + '">Kirim ke WhatsApp</a>' +
            "</div>" +
            '<p class="bagikan-link"><span class="sr">Link produk: </span><span id="link-produk">' + esc(linkBagikan()) + "</span></p>" +
          "</div>" +
          '<p class="catatan-kecil">Pesanan dikirim lewat WhatsApp. Kami memastikan harga dan stok saat membalas chat Anda.</p>' +
        "</div>" +
      "</div>";
  }

  function gambarSerupa(p) {
    var lain = produk.filter(function (x) { return x.kat === p.kat && x.id !== p.id; });
    lain.sort(function (a, b) { return (a.status === "habis") - (b.status === "habis") || a.urutan - b.urutan; });
    lain = lain.slice(0, 12);
    $("serupa").hidden = !lain.length;
    $("baris-serupa").innerHTML = lain.map(T.kartu).join("");
  }

  function tidakDitemukan() {
    document.title = "Produk tidak ditemukan · " + cfg.namaToko;
    $("produk").innerHTML = '<div class="keadaan"><img class="maskot" src="aset/logo-maskot.jpg" alt="" width="96" height="80">' +
      "<b>Produk tidak ditemukan</b>Mungkin produk ini sudah tidak ada di katalog, atau linknya terpotong saat dikirim." +
      '<p class="keadaan-aksi"><a class="tombol-sekunder" href="index.html#katalog">Lihat semua produk</a></p></div>';
  }

  // Daftar produk gagal dimuat sama sekali: penyebabnya koneksi, bukan linknya.
  function gagalMuat() {
    document.title = "Produk belum bisa dimuat · " + cfg.namaToko;
    $("catatan").innerHTML = "";
    $("produk").innerHTML = '<div class="keadaan"><b>Produk belum bisa dimuat</b>Periksa koneksi internet, lalu coba lagi. ' +
      "Anda juga bisa menanyakan produk ini langsung lewat WhatsApp." +
      '<p class="keadaan-aksi"><button class="tombol-sekunder" type="button" data-aksi="ulang">Coba muat lagi</button>' +
      (cfg.waNomor ? '<a class="tombol-sekunder" target="_blank" rel="noopener" href="' +
        esc(T.linkWA("Halo " + cfg.namaToko + ", saya mau tanya produk ini:\n" + linkBagikan())) + '">Tanya lewat WhatsApp</a>' : "") +
      "</p></div>";
  }

  function mulai() {
    $("produk").innerHTML = '<p class="keadaan"><b>Memuat produk</b>Sebentar, harga terbaru sedang diambil.</p>';
    D.muat().then(function (r) {
      produk = r.produk;
      if (r.catatan) $("catatan").innerHTML = '<div class="catatan" role="status"><p>' + esc(r.catatan) + "</p></div>";
      if (r.terbaru) { K.sinkron(r.produk); T.gambarLencana(); }
      if (!produk.length) return gagalMuat();
      for (var i = 0; i < produk.length; i++) if (produk[i].id === id) { ini = produk[i]; break; }
      if (!ini) return tidakDitemukan();
      var judul = ini.nama + " · " + cfg.namaToko;
      document.title = judul;
      setMeta("og:title", judul);
      setMeta("description", teksBagikan(ini) + ". Pesan lewat WhatsApp, lalu ambil di toko kami di " + cfg.lokasiSingkat + ".");
      setMeta("og:description", teksBagikan(ini));
      gambarProduk(ini);
      gambarSerupa(ini);
    });
  }

  // Coba cara modern dulu; bila ditolak browser, pakai cara lama yang masih didukung luas.
  function salin(teks) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(teks).catch(function () { return salinLama(teks); });
    }
    return salinLama(teks);
  }
  function salinLama(teks) {
    return new Promise(function (ok, gagal) {
      var t = document.createElement("textarea");
      t.value = teks;
      t.setAttribute("readonly", "");
      t.style.position = "fixed";
      t.style.opacity = "0";
      document.body.appendChild(t);
      t.select();
      try { document.execCommand("copy") ? ok() : gagal(); } catch (e) { gagal(); }
      document.body.removeChild(t);
    });
  }

  function beriTanda(tombol, teks) {
    var awal = tombol.textContent;
    tombol.textContent = teks;
    T.pengumuman(teks);
    setTimeout(function () { tombol.textContent = awal; }, 1600);
  }

  function bukaLaci() {
    T.gambarLaci();
    if (laci.showModal) laci.showModal(); else laci.setAttribute("open", "");
    document.body.classList.add("laci-buka");
  }
  function tutupLaci() {
    if (laci.close) laci.close(); else laci.removeAttribute("open");
    sesudahLaci();
  }
  function sesudahLaci() {
    if (!document.body.classList.contains("laci-buka")) return;
    document.body.classList.remove("laci-buka");
    $("tombol-keranjang").focus();
  }
  laci.addEventListener("close", sesudahLaci);
  laci.addEventListener("click", function (e) { if (e.target === laci) tutupLaci(); });

  function perbarui(idItem) {
    T.gambarLencana();
    T.perbaruiKartu(idItem);
    if (laci.open) T.gambarLaci();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-aksi]");
    if (!b) return;
    var aksi = b.getAttribute("data-aksi"), idItem = b.getAttribute("data-id");
    if (aksi === "tambah") {
      var p = null;
      if (!produk.length) return gagalMuat();
      for (var i = 0; i < produk.length; i++) if (produk[i].id === idItem) p = produk[i];
      if (!p) return;
      K.tambah(p);
      perbarui(idItem);
      beriTanda(b, "Ditambahkan");
      T.pengumuman(p.nama + " ditambahkan ke keranjang. Jumlah di keranjang: " + K.qty(idItem) + ".");
    }
    else if (aksi === "buka-laci") bukaLaci();
    else if (aksi === "tutup-laci") tutupLaci();
    else if (aksi === "lebih" || aksi === "kurang") { K.ubah(idItem, aksi === "lebih" ? 1 : -1); perbarui(idItem); }
    else if (aksi === "hapus-item") { K.hapus(idItem); perbarui(idItem); }
    else if (aksi === "kosongkan") { K.kosongkan(); perbarui(null); }
    else if (aksi === "ulang") mulai();
    else if (aksi === "salin-link") {
      salin(linkBagikan()).then(function () { beriTanda(b, "Link disalin"); },
        function () { beriTanda(b, "Gagal menyalin, salin link di bawah"); });
    }
    else if (aksi === "bagikan" && ini) {
      navigator.share({ title: ini.nama, text: teksBagikan(ini), url: linkBagikan() }).catch(function () {});
    }
  });

  // Kembali ke katalog memakai riwayat browser bila datang dari katalog, supaya posisi gulir tetap.
  $("kembali").addEventListener("click", function (e) {
    var dariKatalog = document.referrer && document.referrer.indexOf(location.origin) === 0 && !/produk\.html/.test(document.referrer);
    if (dariKatalog && history.length > 1) { e.preventDefault(); history.back(); }
  });
  $("tombol-tema").addEventListener("click", T.gantiTema);

  T.mulaiTema();
  isiToko();
  T.gambarLencana();
  mulai();
})();
