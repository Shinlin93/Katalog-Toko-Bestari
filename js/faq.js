// Halaman FAQ (faq.html): semua pertanyaan, keranjang, dan footer yang sama dengan halaman lain.
(function () {
  var cfg = PENGATURAN, D = KatalogData, T = KatalogTampilan, K = KatalogKeranjang;
  var $ = function (id) { return document.getElementById(id); };
  var laci = $("laci");

  function isiToko() {
    $("nama-toko").textContent = cfg.namaToko;
    $("tagline").textContent = cfg.tagline;
    $("f-nama").textContent = T.namaLengkap();
    $("f-alamat").innerHTML = T.htmlAlamat();
    var tanya = cfg.waNomor ? T.linkWA("Halo " + cfg.namaToko + ", saya mau bertanya.") : "";
    T.isiSosmed(tanya);
    if (tanya) {
      $("faq-wa").href = tanya;
      $("faq-wa").innerHTML = T.ikonWA + "Tanya lewat WhatsApp";
      $("faq-tanya").hidden = false;
    }
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

  function perbarui() {
    T.gambarLencana();
    if (laci.open) T.gambarLaci();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-aksi]");
    if (!b) return;
    var aksi = b.getAttribute("data-aksi"), id = b.getAttribute("data-id");
    if (aksi === "buka-laci") bukaLaci();
    else if (aksi === "tutup-laci") tutupLaci();
    else if (aksi === "lebih" || aksi === "kurang") { K.ubah(id, aksi === "lebih" ? 1 : -1); perbarui(); }
    else if (aksi === "hapus-item") { K.hapus(id); perbarui(); }
    else if (aksi === "kosongkan") { if (T.konfirmasiKosongkan()) { K.kosongkan(); perbarui(); } }
  });
  $("tombol-tema").addEventListener("click", T.gantiTema);

  T.mulaiTema();
  isiToko();
  T.isiFaq();
  T.gambarLencana();

  // Daftar produk dimuat supaya harga di keranjang ikut terbaru dan contoh chat memakai produk asli.
  D.daftarToko().forEach(function (t, i) {
    D.muat(t).then(function (r) {
      if (r.terbaru) { K.sinkron(r.produk, t.id); T.gambarLencana(); }
      if (i === 0) T.isiContohPesan(r.produk);
    });
  });
})();
