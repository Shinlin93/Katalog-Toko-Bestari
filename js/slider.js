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

  function htmlSlide(s) {
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

    kontrol.innerHTML = '<button class="slide-jeda" type="button"></button>' +
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
