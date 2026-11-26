// Catatan pengunjung TANPA data pribadi, dikirim ke Google Sheets privat milik toko (lewat Google Apps Script).
// Yang dicatat: kunjungan dan asalnya, kata yang dicari (beserta jumlah hasilnya, termasuk yang tidak ketemu),
// produk yang dilihat, produk yang masuk keranjang, dan pesanan yang dikirim ke WhatsApp. TIDAK dicatat: nama, nomor WA, alamat IP, lokasi, atau isi chat.
// Penjelasan dan cara memasang penerima: docs/catatan-pengunjung.md.
//
// Mati otomatis bila: alamat penerima di pengaturan.js kosong, browser meminta "jangan dilacak" (Do Not Track),
// browser dijalankan robot, atau perangkat ini dikecualikan lewat ?catat=mati (untuk HP dan komputer toko).
var Catatan = (function () {
  var cfg = (typeof PENGATURAN !== "undefined" && PENGATURAN.catatan) || {};
  var URL_PENERIMA = cfg.url || "";
  var antrean = [], timer = null;

  function simpanan(jenis) {
    try { return window[jenis]; } catch (e) { return null; }
  }
  var lokal = simpanan("localStorage"), sesiStore = simpanan("sessionStorage");
  function baca(store, k) { try { return store ? store.getItem(k) : null; } catch (e) { return null; } }
  function tulis(store, k, v) { try { if (store) { if (v === null) store.removeItem(k); else store.setItem(k, v); } } catch (e) {} }

  // Perangkat toko bisa dikecualikan: buka website sekali dengan ?catat=mati (kembalikan dengan ?catat=nyala).
  var param = new URLSearchParams(location.search);
  if (param.get("catat") === "mati") tulis(lokal, "tanpa-catat", "1");
  if (param.get("catat") === "nyala") tulis(lokal, "tanpa-catat", null);

  var dnt = navigator.doNotTrack === "1" || window.doNotTrack === "1";
  var lokalHost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && !cfg.ujiLokal;
  var aktif = !!URL_PENERIMA && !dnt && !navigator.webdriver && baca(lokal, "tanpa-catat") !== "1" && !lokalHost;

  // Kode kunjungan acak, hanya selama tab terbuka. Tidak bisa ditelusuri ke orangnya.
  var sesi = baca(sesiStore, "catat-sesi");
  if (!sesi) { sesi = Math.random().toString(36).slice(2, 10); tulis(sesiStore, "catat-sesi", sesi); }

  // Asal kunjungan: penanda ?dari=… pada link promosi, atau nama situs sebelumnya (Google, Instagram, dan lainnya).
  function hitungAsal() {
    var dari = (param.get("dari") || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30);
    if (dari) return dari;
    var ref = "";
    try { ref = document.referrer ? new URL(document.referrer).hostname : ""; } catch (e) {}
    if (!ref || ref === location.hostname) return "langsung";
    var peta = [["google", "google"], ["instagram", "instagram"], ["facebook", "facebook"], ["fb.", "facebook"],
      ["whatsapp", "whatsapp"], ["wa.me", "whatsapp"], ["tiktok", "tiktok"], ["bing", "bing"], ["yahoo", "yahoo"]];
    for (var i = 0; i < peta.length; i++) if (ref.indexOf(peta[i][0]) >= 0) return peta[i][1];
    return "situs-lain";
  }
  var asal = baca(sesiStore, "catat-asal");
  if (!asal) { asal = hitungAsal(); tulis(sesiStore, "catat-asal", asal); }

  function kirimSekarang(pakaiBeacon) {
    if (!antrean.length) return;
    var isi = JSON.stringify(antrean.splice(0, 30));
    // text/plain supaya browser tidak perlu izin tambahan (CORS) ke Google.
    if (pakaiBeacon && navigator.sendBeacon) {
      try { if (navigator.sendBeacon(URL_PENERIMA, new Blob([isi], { type: "text/plain" }))) return; } catch (e) {}
    }
    try {
      fetch(URL_PENERIMA, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain" }, body: isi })
        .catch(function () {});
    } catch (e) {}
  }

  // Catatan dikumpulkan sebentar lalu dikirim bersama, supaya tidak membebani koneksi HP.
  function kirim(kejadian, data) {
    if (!aktif) return;
    data = data || {};
    antrean.push({
      k: kejadian,
      isi: String(data.isi == null ? "" : data.isi).slice(0, 80),
      kode: String(data.kode == null ? "" : data.kode).slice(0, 60),
      toko: String(data.toko || "").slice(0, 20),
      nilai: typeof data.nilai === "number" && isFinite(data.nilai) ? Math.round(data.nilai) : "",
      asal: asal,
      sesi: sesi
    });
    clearTimeout(timer);
    timer = setTimeout(function () { kirimSekarang(false); }, 4000);
  }

  // Pencarian: dicatat setelah pengunjung berhenti mengetik 1,5 detik (ketikan setengah jadi tidak ikut),
  // dan kata yang sama hanya sekali per kunjungan. Ada hasilnya = "cari" dengan jumlah hasil; tidak ada = "cari_kosong".
  var tundaCari = null, sudahDicari = {};
  function cari(kata, toko, jumlah) {
    clearTimeout(tundaCari);
    kata = String(kata || "").toLowerCase().replace(/\s+/g, " ").trim();
    if (kata.length < 2) return;
    tundaCari = setTimeout(function () {
      if (sudahDicari[kata]) return;
      sudahDicari[kata] = 1;
      if (jumlah > 0) kirim("cari", { isi: kata, toko: toko, nilai: jumlah });
      else kirim("cari_kosong", { isi: kata, toko: toko });
    }, 1500);
  }
  function cariKosong(kata, toko) { cari(kata, toko, 0); }
  function batalCari() { clearTimeout(tundaCari); }

  // Pesanan dikirim: tombol "Kirim pesanan lewat WhatsApp" di keranjang (semua halaman).
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest(".tombol-kirim");
    if (!a || typeof KatalogKeranjang === "undefined") return;
    var K = KatalogKeranjang, toko = typeof KatalogData !== "undefined" ? KatalogData.tokoAktif().id : "";
    kirim("kirim_wa", { isi: K.jumlah() + " barang", toko: toko, nilai: K.total() });
    kirimSekarang(true);
  }, true);

  // Sisa antrean dikirim saat halaman ditutup atau berpindah.
  window.addEventListener("pagehide", function () { kirimSekarang(true); });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") kirimSekarang(true); });

  // Satu catatan kunjungan per sesi.
  if (aktif && !baca(sesiStore, "catat-kunjungan")) {
    tulis(sesiStore, "catat-kunjungan", "1");
    kirim("kunjungan", { isi: location.pathname.replace(/^\//, "") || "index.html" });
  }

  return { kirim: kirim, cari: cari, cariKosong: cariKosong, batalCari: batalCari, aktif: function () { return aktif; } };
})();
