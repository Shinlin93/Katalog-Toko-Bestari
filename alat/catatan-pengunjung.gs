/**
 * Penerima "Catatan Pengunjung" Toko Bestari (Google Apps Script).
 *
 * Ditempel di Google Sheets PRIVAT milik toko (bukan sheet katalog yang diterbitkan).
 * Website mengirim catatan tanpa data pribadi; skrip ini hanya MENAMBAH baris ke tab "Catatan".
 * Tab "Ringkasan" berisi rumus yang merangkum 7, 30, atau 90 hari terakhir.
 *
 * Cara memasang (langkah lengkap di docs/catatan-pengunjung.md). Sheet sudah dibuat di Google Drive:
 * folder "Toko Bestari" → "Catatan Pengunjung Toko Bestari" (tab Ringkasan dan Catatan sudah lengkap).
 *   1. Buka sheet itu, Ekstensi → Apps Script, tempel seluruh isi file ini, simpan.
 *   2. Pilih fungsi "pasangPemicu" lalu Jalankan (izinkan akses; pembersihan otomatis tiap Senin).
 *   3. Terapkan → Penerapan baru → Aplikasi web: Jalankan sebagai "Saya", Akses "Siapa saja".
 *   4. Salin URL aplikasi web (berakhiran /exec) ke js/pengaturan.js → catatan.url.
 * Fungsi "siapkan" hanya perlu bila memasang di Google Sheets baru yang masih kosong.
 */

var TAB_CATATAN = "Catatan";
var TAB_RINGKASAN = "Ringkasan";
var SIMPAN_HARI = 90; // catatan lebih tua dari ini dihapus oleh pembersihan mingguan
var KEJADIAN = ["kunjungan", "cari_kosong", "lihat", "keranjang", "kirim_wa"];
var KOLOM = ["Waktu", "Kejadian", "Isi", "Kode", "Toko", "Asal", "Sesi", "Nilai"];

// ---------- Penerima ----------
function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (galat) {
    return teks("format salah");
  }
  var daftar = (Array.isArray(data) ? data : [data]).slice(0, 30); // maksimal 30 catatan per kiriman
  var sekarang = new Date();
  var baris = [];
  daftar.forEach(function (d) {
    if (!d || KEJADIAN.indexOf(d.k) < 0) return; // hanya jenis kejadian yang dikenal
    baris.push([sekarang, d.k, bersih(d.isi, 80), bersih(d.kode, 60), bersih(d.toko, 20), bersih(d.asal, 30), bersih(d.sesi, 12), angka(d.nilai)]);
  });
  if (!baris.length) return teks("kosong");

  var kunci = LockService.getScriptLock();
  kunci.waitLock(10000);
  try {
    var sh = lembar(TAB_CATATAN);
    sh.getRange(sh.getLastRow() + 1, 1, baris.length, KOLOM.length).setValues(baris);
  } finally {
    kunci.releaseLock();
  }
  return teks("ok");
}

// Membuka URL /exec di browser hanya menampilkan pesan ini (untuk mengecek penerima aktif).
function doGet() {
  return teks("Penerima catatan pengunjung Toko Bestari aktif.");
}

function teks(s) {
  return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT);
}

// Teks dipotong, baris baru dibuang, dan teks yang diawali = + - @ dijadikan teks biasa
// supaya kiriman dari luar tidak bisa menjadi rumus di sheet.
function bersih(v, maks) {
  var s = String(v == null ? "" : v).replace(/[\r\n\t]+/g, " ").trim().slice(0, maks);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function angka(v) {
  var n = Number(v);
  return isFinite(n) && v !== "" && v !== null ? Math.max(0, Math.min(1e9, Math.round(n))) : "";
}

function lembar(nama) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(nama);
  if (!sh) {
    sh = ss.insertSheet(nama);
    if (nama === TAB_CATATAN) {
      sh.getRange(1, 1, 1, KOLOM.length).setValues([KOLOM]).setFontWeight("bold");
      sh.setFrozenRows(1);
      sh.getRange("A:A").setNumberFormat("dd/mm/yyyy hh:mm");
    }
  }
  return sh;
}

// ---------- Ringkasan ----------
// Dijalankan sekali (aman dijalankan ulang): membuat tab Catatan dan Ringkasan beserta rumusnya.
// Sheet "Catatan Pengunjung Toko Bestari" di folder Toko Bestari sudah dibuat lengkap dengan rumusnya,
// jadi fungsi ini hanya untuk membuat ulang di sheet baru. Tab Ringkasan yang sudah ada tidak ditimpa.
function siapkan() {
  lembar(TAB_CATATAN);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss.getSheetByName(TAB_RINGKASAN)) {
    ss.toast("Tab Ringkasan sudah ada, tidak diubah.");
    return;
  }
  var r = ss.insertSheet(TAB_RINGKASAN, 0);

  // Pilihan periode: 7, 30, atau 90 hari terakhir.
  r.getRange("A1").setValue("Ringkasan catatan pengunjung").setFontWeight("bold").setFontSize(14);
  r.getRange("A2").setValue("Periode (hari terakhir)");
  r.getRange("B2").setValue(7).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(["7", "30", "90"], true).build());
  r.getRange("A3").setValue("Mulai tanggal");
  r.getRange("B3").setFormula("=TODAY()-B2").setNumberFormat("dd/mm/yyyy");
  var mulai = "datetime '\"&TEXT($B$3,\"yyyy-mm-dd hh:mm:ss\")&\"'";

  // 1. Pencarian yang tidak ketemu.
  judul(r, "A5", "1. Pencarian yang tidak ketemu");
  r.getRange("A6").setFormula('=IFERROR(QUERY(Catatan!A:H,"select C, count(C) where B = \'cari_kosong\' and A >= ' + mulai +
    ' group by C order by count(C) desc limit 40 label C \'Kata yang dicari\', count(C) \'Jumlah\'",1),"Belum ada data")');

  // 2. Produk dilihat dan masuk keranjang.
  judul(r, "D5", "2. Produk dilihat dan masuk keranjang");
  r.getRange("D6").setFormula('=IFERROR(QUERY(Catatan!A:H,"select D, C, count(D) where B = \'lihat\' and A >= ' + mulai +
    ' group by D, C order by count(D) desc limit 60 label D \'Kode\', C \'Nama produk\', count(D) \'Dilihat\'",1),"Belum ada data")');
  r.getRange("G6").setValue("Masuk keranjang").setFontWeight("bold");
  r.getRange("G7").setFormula('=ARRAYFORMULA(IF(D7:D66="","",COUNTIFS(Catatan!D:D,D7:D66,Catatan!B:B,"keranjang",Catatan!A:A,">="&$B$3)))');
  r.getRange("H6").setValue("Rasio keranjang").setFontWeight("bold");
  r.getRange("H7").setFormula('=ARRAYFORMULA(IF(D7:D66="","",IFERROR(G7:G66/F7:F66,0)))');
  r.getRange("H7:H66").setNumberFormat("0%");

  // 3. Keranjang dan pesanan.
  judul(r, "J5", "3. Keranjang dan pesanan");
  var baris3 = [
    ["Kunjungan", '=COUNTUNIQUEIFS(Catatan!G:G,Catatan!B:B,"kunjungan",Catatan!A:A,">="&$B$3)'],
    ["Kunjungan yang menambah ke keranjang", '=COUNTUNIQUEIFS(Catatan!G:G,Catatan!B:B,"keranjang",Catatan!A:A,">="&$B$3)'],
    ["Kunjungan yang mengirim pesanan WA", '=COUNTUNIQUEIFS(Catatan!G:G,Catatan!B:B,"kirim_wa",Catatan!A:A,">="&$B$3)'],
    ["Keranjang ditinggal", "=MAX(0,K7-K8)"],
    ["Persentase keranjang dikirim", "=IFERROR(K8/K7,0)"],
    ["Rata-rata nilai pesanan dikirim (Rp)", '=IFERROR(AVERAGEIFS(Catatan!H:H,Catatan!B:B,"kirim_wa",Catatan!A:A,">="&$B$3),0)']
  ];
  baris3.forEach(function (b, i) {
    r.getRange(6 + i, 10).setValue(b[0]);
    r.getRange(6 + i, 11).setFormula(b[1]);
  });
  r.getRange("K10").setNumberFormat("0%");
  r.getRange("K11").setNumberFormat("#,##0");

  // 4. Asal pengunjung.
  judul(r, "J14", "4. Asal pengunjung");
  r.getRange("J15").setFormula('=IFERROR(QUERY(Catatan!A:H,"select F, count(F) where B = \'kunjungan\' and A >= ' + mulai +
    ' group by F order by count(F) desc limit 30 label F \'Asal\', count(F) \'Kunjungan\'",1),"Belum ada data")');
  r.getRange("L15").setValue("Pesanan WA").setFontWeight("bold");
  r.getRange("L16").setFormula('=ARRAYFORMULA(IF(J16:J45="","",COUNTIFS(Catatan!F:F,J16:J45,Catatan!B:B,"kirim_wa",Catatan!A:A,">="&$B$3)))');

  r.setFrozenRows(3);
  r.setColumnWidth(1, 220); r.setColumnWidth(5, 260); r.setColumnWidth(10, 260);
  SpreadsheetApp.getUi && SpreadsheetApp.getActive().toast("Tab Catatan dan Ringkasan siap.");
}

function judul(r, sel, teksJudul) {
  r.getRange(sel).setValue(teksJudul).setFontWeight("bold").setBackground("#EAF0FB");
}

// ---------- Pembersihan ----------
// Menghapus catatan lebih tua dari SIMPAN_HARI hari. Dijalankan otomatis tiap Senin oleh pemicu.
function bersihkan() {
  var sh = lembar(TAB_CATATAN);
  var n = sh.getLastRow() - 1;
  if (n < 1) return;
  var batas = new Date(Date.now() - SIMPAN_HARI * 24 * 3600 * 1000);
  var waktu = sh.getRange(2, 1, n, 1).getValues();
  var lama = 0;
  while (lama < waktu.length && waktu[lama][0] instanceof Date && waktu[lama][0] < batas) lama++;
  if (lama > 0) sh.deleteRows(2, lama);
}

// Dijalankan sekali: memasang pembersihan otomatis tiap Senin pukul 03.00.
function pasangPemicu() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "bersihkan") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("bersihkan").timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(3).create();
}
