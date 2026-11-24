// Memuat salinan CSV katalog lewat js/data.js yang asli (jalur yang sama dengan website),
// supaya tes memakai produk hasil normalisasi website, bukan versi buatan tes.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const AKAR = path.join(__dirname, "..");

async function muatKatalog(fileCsv) {
  const csv = fs.readFileSync(path.join(__dirname, "data", fileCsv), "utf8");
  const simpanan = {};
  const konteks = {
    PENGATURAN: { toko: [{ id: "gedangan", nama: "Toko Gedangan", alamat: "", sheetUrl: "uji.csv" }] },
    localStorage: { getItem: (k) => simpanan[k] || null, setItem: (k, v) => { simpanan[k] = String(v); }, removeItem: (k) => { delete simpanan[k]; } },
    fetch: async () => ({ ok: true, status: 200, text: async () => csv }),
    AbortController, setTimeout, clearTimeout, console, document: undefined
  };
  vm.createContext(konteks);
  vm.runInContext(fs.readFileSync(path.join(AKAR, "js", "data.js"), "utf8") + "\n;this.KatalogData = KatalogData;", konteks);
  const hasil = await konteks.KatalogData.muat(konteks.PENGATURAN.toko[0]);
  return hasil.produk;
}

module.exports = { muatKatalog, Rekomendasi: require(path.join(AKAR, "js", "rekomendasi.js")) };
