// Halaman FAQ (faq.html): semua pertanyaan, keranjang, dan footer yang sama dengan halaman lain.
(function () {
  var cfg = PENGATURAN, D = KatalogData, T = KatalogTampilan, K = KatalogKeranjang;
  var $ = function (id) { return document.getElementById(id); };
  var laci = $("laci");

  function isiToko() {
    $("nama-toko").textContent = cfg.namaToko;
    if ($("subjudul")) $("subjudul").textContent = cfg.subjudul || "";
    $("f-nama").textContent = T.namaLengkap();
    $("f-alamat").innerHTML = T.htmlAlamat();
    var tanya = cfg.waNomor ? T.linkWA("Halo " + cfg.namaToko + ", saya mau bertanya.") : "";
    T.isiSosmed(tanya);
    if (tanya && $("wa-bawah")) $("wa-bawah").href = tanya;
    if (tanya && $("f-wa-teks")) $("f-wa-teks").href = tanya;
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

  T.mulaiTema();
  K.setToko(D.tokoAktif().id);
  isiToko();
  T.isiFaq();
  // Data terstruktur FAQ untuk Google, dari daftar pertanyaan yang sama di pengaturan.js.
  var faqData = document.createElement("script");
  faqData.type = "application/ld+json";
  faqData.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: (cfg.faq || []).map(function (f) {
      return { "@type": "Question", name: f.tanya, acceptedAnswer: { "@type": "Answer", text: f.jawab } };
    }) });
  document.head.appendChild(faqData);
  T.gambarLencana();

  // Daftar produk dimuat supaya harga di keranjang ikut terbaru dan contoh chat memakai produk asli.
  D.daftarToko().forEach(function (t, i) {
    D.muat(t).then(function (r) {
      if (r.terbaru) { K.sinkron(r.produk, t.id); T.gambarLencana(); }
      if (i === 0) T.isiContohPesan(r.produk);
    });
  });
})();
