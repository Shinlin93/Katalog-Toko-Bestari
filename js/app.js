// Menyambungkan data, tampilan, dan keranjang, lalu memasang semua tombol.
(function () {
  var cfg = PENGATURAN, D = KatalogData, T = KatalogTampilan, K = KatalogKeranjang;
  var S = { produk: [], kategori: "", kueri: "", urut: "", batas: cfg.produkPerHalaman, keadaan: "memuat", catatan: "" };
  var $ = function (id) { return document.getElementById(id); };
  var laci = $("laci");

  function hasil() {
    return D.cari(S.produk, { kueri: S.kueri, kategori: S.kategori, urut: S.urut });
  }
  function gambar() { T.gambar(S, S.keadaan === "ok" ? hasil() : []); }

  function mulai() {
    S.keadaan = "memuat";
    S.catatan = "";
    gambar();
    D.muat().then(function (r) {
      S.produk = r.produk;
      S.catatan = r.catatan;
      // Hanya disamakan bila daftar terbaru berhasil dimuat; salinan lama bisa berisi harga usang.
      if (r.terbaru) {
        var keluar = K.sinkron(r.produk);
        T.gambarLencana();
        if (keluar.length) T.pengumuman("Dikeluarkan dari keranjang karena tidak ada lagi di katalog: " + keluar.join(", ") + ".");
      }
      S.keadaan = r.produk.length ? "ok" : "kosong";
      S.kategori = "";
      S.batas = cfg.produkPerHalaman;
      T.buatKategori(S.produk);
      T.buatStrip(S.produk);
      T.isiJumlahProduk(S.produk);
      T.isiContohPesan(S.produk);
      gambar();
    });
  }

  function ubah(bagian) {
    for (var k in bagian) S[k] = bagian[k];
    S.batas = cfg.produkPerHalaman;
    gambar();
  }

  function setKueri(nilai) {
    $("cari").value = nilai;
    ubah({ kueri: nilai.trim() });
  }

  function keKatalog() { $("katalog").scrollIntoView({ block: "start" }); }
  function tutupSaran() { T.gambarSaran([], ""); }

  function reset() {
    $("urut").value = "";
    T.tandaiKategori("");
    setKueri("");
    ubah({ kategori: "", urut: "" });
  }

  function cariProduk(id) {
    for (var i = 0; i < S.produk.length; i++) if (S.produk[i].id === id) return S.produk[i];
    return null;
  }

  function bukaLaci() {
    T.gambarLaci();
    if (laci.showModal) laci.showModal(); else laci.setAttribute("open", "");
    document.body.classList.add("laci-buka");
  }
  function tutupLaci() {
    if (laci.close) laci.close(); else { laci.removeAttribute("open"); sesudahLaci(); }
  }
  function sesudahLaci() {
    document.body.classList.remove("laci-buka");
    $("tombol-keranjang").focus();
  }
  laci.addEventListener("close", sesudahLaci);
  laci.addEventListener("click", function (e) { if (e.target === laci) tutupLaci(); });

  function perbaruiKeranjang(id) {
    T.gambarLencana();
    T.perbaruiKartu(id);
    if (laci.open) T.gambarLaci();
  }

  function tambahKeKeranjang(tombol, id) {
    var p = cariProduk(id);
    if (!p) return;
    K.tambah(p);
    perbaruiKeranjang(id);
    T.pengumuman(p.nama + " ditambahkan ke keranjang. Jumlah di keranjang: " + K.qty(id) + ".");
    var awal = tombol.textContent;
    tombol.textContent = "Ditambahkan";
    setTimeout(function () { tombol.textContent = awal; }, 1200);
  }

  $("form-cari").addEventListener("submit", function (e) {
    e.preventDefault();
    tutupSaran();
    $("cari").blur();
    keKatalog();
  });
  $("cari").addEventListener("input", function (e) {
    var kueri = e.target.value.trim();
    ubah({ kueri: kueri });
    T.gambarSaran(kueri ? D.cari(S.produk, { kueri: kueri }) : [], kueri);
  });
  $("cari").addEventListener("focus", function () {
    if (S.kueri && S.keadaan === "ok") T.gambarSaran(D.cari(S.produk, { kueri: S.kueri }), S.kueri);
  });
  $("form-cari").addEventListener("keydown", function (e) {
    if (e.key === "Escape") { tutupSaran(); $("cari").focus(); }
  });
  $("form-cari").addEventListener("focusout", function (e) {
    if (!e.relatedTarget || !$("form-cari").contains(e.relatedTarget)) tutupSaran();
  });

  $("urut").addEventListener("change", function (e) { ubah({ urut: e.target.value }); });
  $("kategori").addEventListener("click", function (e) {
    var b = e.target.closest("[data-kategori]");
    if (!b) return;
    T.tandaiKategori(b.getAttribute("data-kategori"));
    ubah({ kategori: b.getAttribute("data-kategori") });
  });
  $("kategori-lain").addEventListener("change", function (e) {
    T.tandaiKategori(e.target.value);
    ubah({ kategori: e.target.value });
  });
  $("tombol-lagi").addEventListener("click", function () { S.batas += cfg.produkPerHalaman; gambar(); });
  $("tombol-tema").addEventListener("click", T.gantiTema);

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-aksi]");
    if (!b) return;
    var aksi = b.getAttribute("data-aksi"), nilai = b.getAttribute("data-nilai"), id = b.getAttribute("data-id");
    if (aksi === "tambah") tambahKeKeranjang(b, id);
    else if (aksi === "buka-laci") bukaLaci();
    else if (aksi === "tutup-laci") tutupLaci();
    else if (aksi === "lebih" || aksi === "kurang") { K.ubah(id, aksi === "lebih" ? 1 : -1); perbaruiKeranjang(id); }
    else if (aksi === "hapus-item") { K.hapus(id); perbaruiKeranjang(id); }
    else if (aksi === "kosongkan") { K.kosongkan(); perbaruiKeranjang(null); }
    else if (aksi === "pilih-saran") { tutupSaran(); setKueri(nilai); keKatalog(); }
    else if (aksi === "lihat-hasil") { tutupSaran(); keKatalog(); }
    else if (aksi === "saran-cepat") setKueri(nilai);
    else if (aksi === "reset") reset();
    else if (aksi === "ulang") mulai();
    else if (aksi === "kategori") { T.tandaiKategori(nilai); ubah({ kategori: nilai }); keKatalog(); }
    else if (aksi === "ke-atas") window.scrollTo({ top: 0 });
  });

  // Menandai menu yang sesuai dengan bagian halaman dan menampilkan tombol ke atas.
  var BAGIAN = ["beranda", "katalog", "lokasi", "kontak", "faq"], menunggu = false;
  function sesuaikanMenu() {
    menunggu = false;
    var aktif = BAGIAN[0];
    BAGIAN.forEach(function (id) { if ($(id).getBoundingClientRect().top <= 140) aktif = id; });
    [].forEach.call(document.querySelectorAll(".nav-daftar a"), function (a) {
      if (a.getAttribute("data-bagian") === aktif) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    $("ke-atas").hidden = window.scrollY < 400;
  }
  window.addEventListener("scroll", function () {
    if (!menunggu) { menunggu = true; requestAnimationFrame(sesuaikanMenu); }
  }, { passive: true });

  var navDaftar = document.querySelector(".nav-daftar");
  function tandaiSisaMenu() {
    navDaftar.classList.toggle("ada-sisa", navDaftar.scrollLeft + navDaftar.clientWidth < navDaftar.scrollWidth - 2);
  }
  navDaftar.addEventListener("scroll", tandaiSisaMenu, { passive: true });
  window.addEventListener("resize", tandaiSisaMenu);
  tandaiSisaMenu();

  T.mulaiTema();
  T.isiToko();
  T.gambarLencana();
  sesuaikanMenu();
  mulai();
})();
