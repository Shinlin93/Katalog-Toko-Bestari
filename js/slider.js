// Slider di hero: slide pertama adalah judul toko, slide berikutnya diatur di pengaturan.js (slideHero).
// Berganti otomatis, tapi berhenti saat disentuh, diarahkan kursor, atau difokus keyboard, dan bisa dijeda.
// Di perangkat yang meminta animasi dikurangi, slide tidak berganti sendiri.
var HeroSlider = (function () {
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // Slide foto produk: beberapa kategori utama dengan foto barang asli, tanpa harga (harga plastik naik turun).
  // Mengetuk satu foto langsung mencari barang itu di katalog.
  function htmlSlideProduk(s) {
    var isi = (s.produk || []).map(function (p) {
      return '<li><button class="slide-produk-item" type="button" data-aksi="pilih-saran" data-nilai="' + esc(p.cari || p.label) + '">' +
        '<span class="slide-produk-foto"><img src="' + esc(PENGATURAN.folderFoto + p.foto) + '" alt="" loading="lazy" decoding="async"></span>' +
        "<b>" + esc(p.label) + "</b></button></li>";
    }).join("");
    return '<figure class="slide slide-produk"><figcaption><b>' + esc(s.judul || "") + "</b>" + (s.ket ? "<span>" + esc(s.ket) + "</span>" : "") +
      '</figcaption><ul class="slide-produk-daftar">' + isi + "</ul></figure>";
  }

  // Slide banner promo (gaya spanduk): judul besar dengan sapuan merah seperti slogan, dan kartu barang dengan foto bebas hak cipta.
  // Tanpa harga dan tanpa harga coret, karena harga plastik naik turun. Kartu membuka pencarian barang itu.
  function htmlSlidePromo(s) {
    var isi = (s.produk || []).map(function (p) {
      return '<li><button class="promo-item" type="button" data-aksi="pilih-saran" data-nilai="' + esc(p.cari || p.label) + '">' +
        '<span class="promo-foto"><img src="' + esc(p.foto) + '" alt="" loading="lazy" decoding="async"></span>' +
        '<b>' + esc(p.label) + '</b><span class="promo-pil">Lihat harga</span></button></li>';
    }).join("");
    var ig = PENGATURAN.instagram
      ? '<a class="promo-kaki-pil" href="https://www.instagram.com/' + esc(PENGATURAN.instagram) + '/" target="_blank" rel="noopener">@' + esc(PENGATURAN.instagram) + "</a>"
      : "";
    // Kata sorotan di judul diberi sapuan merah, sama seperti slogan di slide pertama.
    var judul = esc(s.judul || "");
    if (s.sorot) judul = judul.replace(esc(s.sorot), '<span class="sorot">' + esc(s.sorot) + "</span>");
    return '<figure class="slide slide-promo">' +
      '<figcaption class="promo-kepala"><span class="promo-atas">' + esc(s.atas || "") + "</span>" +
      '<b class="promo-judul hero-judul">' + judul + "</b>" +
      (s.ket ? '<span class="promo-ket">' + esc(s.ket) + "</span>" : "") + "</figcaption>" +
      '<ul class="promo-daftar">' + isi + "</ul>" +
      '<div class="promo-kaki">' + ig + (s.kaki ? '<span class="promo-kaki-pil">' + esc(s.kaki) + "</span>" : "") + "</div></figure>";
  }

  function htmlSlide(s) {
    if (s.tipe === "produk") return htmlSlideProduk(s);
    if (s.tipe === "promo") return htmlSlidePromo(s);
    var gambar = '<img src="' + esc(s.gambar) + '" alt="' + esc(s.alt || s.judul || "") + '" decoding="async">';
    // Gambar tegak khusus HP (opsional) supaya tulisannya tetap terbaca di layar sempit.
    if (s.gambarHP) gambar = '<picture><source media="(max-width: 699px)" srcset="' + esc(s.gambarHP) + '">' + gambar + "</picture>";
    var isi = s.panduan
      ? '<button class="slide-gambar-tombol" type="button" data-aksi="buka-panduan" data-nilai="' + esc(s.panduan) + '">' + gambar + "</button>"
      : gambar;
    var ket = s.judul ? '<figcaption><b>' + esc(s.judul) + "</b>" + (s.panduan ? "<span>Ketuk gambar untuk membuka panduan lengkap</span>" : "") + "</figcaption>" : "";
    return '<figure class="slide slide-gambar">' + isi + ket + "</figure>";
  }

  function mulai() {
    var cfg = PENGATURAN, data = cfg.slideHero || [];
    if (!data.length) return;

    var wadah = $("slide-daftar"), kontrol = $("slide-kontrol"), slider = $("hero-slider");
    wadah.insertAdjacentHTML("beforeend", data.map(htmlSlide).join(""));
    var slides = [].slice.call(wadah.querySelectorAll(".slide")), n = slides.length;

    slider.setAttribute("role", "region");
    slider.setAttribute("aria-roledescription", "carousel");
    slider.setAttribute("aria-label", "Sorotan toko");
    slides.forEach(function (el, i) {
      el.setAttribute("role", "group");
      el.setAttribute("aria-roledescription", "slide");
      el.setAttribute("aria-label", (i + 1) + " dari " + n);
    });

    kontrol.innerHTML = '<button class="slide-panah" type="button" data-arah="-1" aria-label="Slide sebelumnya"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>' +
      '<button class="slide-panah" type="button" data-arah="1" aria-label="Slide berikutnya"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>' +
      '<button class="slide-jeda" type="button"></button>' +
      '<div class="slide-titik-daftar">' + slides.map(function (_, i) {
        return '<button class="slide-titik" type="button" data-ke="' + i + '" aria-label="Tampilkan slide ' + (i + 1) + '"></button>';
      }).join("") + "</div>";
    kontrol.hidden = false;
    var tombolJeda = kontrol.querySelector(".slide-jeda");
    var titik = [].slice.call(kontrol.querySelectorAll(".slide-titik"));

    var kurangiGerak = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var diputar = !kurangiGerak;   // pilihan pengunjung lewat tombol jeda
    var ditahan = false;           // sementara berhenti karena disentuh atau difokus
    var aktif = 0, timer = null;
    var detik = Math.max(3, Number(cfg.slideDetik) || 6);

    function tampilkan(i) {
      aktif = (i + n) % n;
      slides.forEach(function (el, j) {
        var ini = j === aktif;
        el.setAttribute("aria-hidden", ini ? "false" : "true");
        el.inert = !ini;
      });
      titik.forEach(function (t, j) {
        if (j === aktif) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current");
      });
    }

    function atur() {
      clearInterval(timer);
      timer = null;
      if (diputar && !ditahan && !document.hidden) timer = setInterval(function () { tampilkan(aktif + 1); }, detik * 1000);
      tombolJeda.textContent = diputar ? "Jeda" : "Putar";
      tombolJeda.setAttribute("aria-label", diputar ? "Hentikan pergantian slide otomatis" : "Putar slide otomatis");
      wadah.setAttribute("aria-live", diputar ? "off" : "polite");
    }

    tombolJeda.addEventListener("click", function () { diputar = !diputar; atur(); });
    [].forEach.call(kontrol.querySelectorAll(".slide-panah"), function (b) {
      b.addEventListener("click", function () { tampilkan(aktif + Number(b.getAttribute("data-arah"))); atur(); });
    });
    titik.forEach(function (t) {
      t.addEventListener("click", function () { tampilkan(Number(t.getAttribute("data-ke"))); atur(); });
    });

    slider.addEventListener("mouseenter", function () { ditahan = true; atur(); });
    slider.addEventListener("mouseleave", function () { ditahan = false; atur(); });
    slider.addEventListener("focusin", function () { ditahan = true; atur(); });
    slider.addEventListener("focusout", function (e) {
      if (!slider.contains(e.relatedTarget)) { ditahan = false; atur(); }
    });
    document.addEventListener("visibilitychange", atur);

    // Geser dengan jari ke kiri atau kanan untuk pindah slide.
    var awalX = null, awalY = null, digeser = false;
    wadah.addEventListener("pointerdown", function (e) { awalX = e.clientX; awalY = e.clientY; digeser = false; });
    wadah.addEventListener("pointerup", function (e) {
      if (awalX === null) return;
      var dx = e.clientX - awalX, dy = e.clientY - awalY;
      awalX = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        digeser = true;
        tampilkan(aktif + (dx < 0 ? 1 : -1));
        atur();
      }
    });
    // Ketukan yang sebenarnya geseran tidak ikut membuka panduan.
    wadah.addEventListener("click", function (e) {
      if (digeser) { e.stopPropagation(); e.preventDefault(); digeser = false; }
    }, true);

    tampilkan(0);
    atur();
  }

  return { mulai: mulai };
})();
