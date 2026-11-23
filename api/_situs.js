// Bantuan bersama untuk sitemap.xml dan robots.txt (fungsi Vercel).
// Alamat situs diambil dari domain yang sedang dibuka, jadi tidak perlu diubah saat ganti domain.
const vm = require("vm");

function alamatSitus(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0];
  return proto + "://" + host;
}

// Membaca js/pengaturan.js dari situs sendiri, supaya daftar toko dan link spreadsheet hanya ditulis di satu tempat.
async function ambilPengaturan(situs) {
  const r = await fetch(situs + "/js/pengaturan.js");
  if (!r.ok) throw new Error("pengaturan.js " + r.status);
  return vm.runInNewContext((await r.text()) + "\n;PENGATURAN", {}, { timeout: 1000 });
}

// Sama dengan bacaCSV di js/data.js.
function bacaCSV(teks) {
  const baris = [];
  let sel = [], isi = "", kutip = false;
  for (let i = 0; i < teks.length; i++) {
    const c = teks[i];
    if (kutip) {
      if (c === '"') { if (teks[i + 1] === '"') { isi += '"'; i++; } else kutip = false; }
      else isi += c;
    } else if (c === '"') kutip = true;
    else if (c === ",") { sel.push(isi); isi = ""; }
    else if (c === "\n") { sel.push(isi); baris.push(sel); sel = []; isi = ""; }
    else if (c !== "\r") isi += c;
  }
  if (isi !== "" || sel.length) { sel.push(isi); baris.push(sel); }
  return baris;
}

// Kode produk yang tampil di katalog, dengan aturan id yang sama seperti js/data.js.
async function idProdukToko(toko, utama, situs) {
  const r = await fetch(new URL(toko.sheetUrl, situs + "/").href);
  if (!r.ok) return [];
  const baris = bacaCSV(await r.text());
  if (!baris.length) return [];
  const kepala = baris[0].map((h) => h.trim().toUpperCase());
  const ambil = (row, n) => {
    const i = kepala.indexOf(n);
    return i >= 0 && row[i] != null ? String(row[i]).trim() : "";
  };
  return baris.slice(1)
    .filter((row) => ambil(row, "NAMA") && ambil(row, "TAMPIL").toUpperCase() !== "TIDAK")
    .map((row) => (utama ? "" : toko.id + ":") + (ambil(row, "KODE") || ambil(row, "NAMA")));
}

module.exports = { alamatSitus, ambilPengaturan, idProdukToko };
