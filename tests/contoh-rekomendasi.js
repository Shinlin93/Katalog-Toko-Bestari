// Mencetak contoh rekomendasi dari data asli beserta rincian skornya.
// Pakai: node tests/contoh-rekomendasi.js [merek] KODE1 KODE2 ...
//   tanpa "merek" = data website sekarang (tanpa kolom MEREK); dengan "merek" = salinan uji yang diberi kolom MEREK.
const { muatKatalog, Rekomendasi: R } = require("./muat-katalog.js");

(async () => {
  const args = process.argv.slice(2);
  const pakaiMerek = args[0] === "merek";
  const kode = pakaiMerek ? args.slice(1) : args;
  const produk = await muatKatalog(pakaiMerek ? "katalog-gedangan-merek.csv" : "katalog-gedangan.csv");
  const t0 = process.hrtime.bigint();
  const ix = R.buatIndeks(produk, {});
  const tIndeks = Number(process.hrtime.bigint() - t0) / 1e6;
  const t1 = process.hrtime.bigint();
  let kurang = 0, nol = 0;
  for (const p of produk) { const n = R.serupa(ix, p.id).length; if (n < 8) kurang++; if (!n) nol++; }
  const tSemua = Number(process.hrtime.bigint() - t1) / 1e6;
  console.log(`Data: ${produk.length} produk${pakaiMerek ? " (dengan MEREK)" : ""}. Bangun indeks ${tIndeks.toFixed(1)} ms. ` +
    `Rekomendasi untuk semua produk ${tSemua.toFixed(0)} ms (${(tSemua / produk.length).toFixed(2)} ms per produk). ` +
    `Kurang dari 8: ${kurang} produk, tanpa rekomendasi: ${nol} produk.`);
  for (const k of kode) {
    const a = produk.find((p) => p.id === k);
    if (!a) { console.log(`\n${k}: tidak ditemukan`); continue; }
    console.log(`\n${a.nama} [${a.id}] · ${a.kat} · Rp ${a.harga}/${a.sat}${a.merek ? " · " + a.merek : ""} · kandidat ${R.kandidat(ix, a.id).length}`);
    for (const h of R.serupa(ix, a.id)) {
      const r = h.rincian, f = (v) => (v === null ? "-" : v.toFixed(2));
      console.log(`  ${h.skor.toFixed(2)}  ${h.produk.nama.padEnd(44).slice(0, 44)} kat ${f(r.kategori)} nama ${f(r.nama)} merek ${f(r.merek)} harga ${f(r.harga)} sat ${f(r.satuan)}  ${h.produk.status}`);
    }
  }
})();
