// Tes mesin rekomendasi dengan data katalog asli (salinan Google Sheets Toko Gedangan).
// Jalankan dari folder proyek: node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const { muatKatalog, Rekomendasi: R } = require("./muat-katalog.js");

const ATURAN = { bobot: { kategori: 0.30, nama: 0.35, merek: 0.15, harga: 0.15, satuan: 0.05 } };
let tanpaMerek, denganMerek, ixTanpa, ixMerek;

test.before(async () => {
  tanpaMerek = await muatKatalog("katalog-gedangan.csv");
  denganMerek = await muatKatalog("katalog-gedangan-merek.csv");
  ixTanpa = R.buatIndeks(tanpaMerek, ATURAN);
  ixMerek = R.buatIndeks(denganMerek, ATURAN);
});

const cari = (daftar, id) => daftar.find((p) => p.id === id);
const id = (h) => h.produk.id;

test("produk yang dibuka tidak pernah merekomendasikan dirinya sendiri", () => {
  for (const ix of [ixTanpa, ixMerek]) {
    for (const p of ix.semua) assert.ok(!R.serupa(ix, p.id).some((h) => id(h) === p.id), p.id);
  }
});

test("tidak ada rekomendasi ganda (ID maupun nama), dan maksimal 8", () => {
  for (const p of ixMerek.semua) {
    const h = R.serupa(ixMerek, p.id);
    assert.ok(h.length <= 8);
    assert.equal(new Set(h.map(id)).size, h.length, "ID ganda di " + p.id);
    assert.equal(new Set(h.map((x) => x.produk.nama.toLowerCase().trim())).size, h.length, "nama ganda di " + p.id);
    assert.ok(!h.some((x) => x.produk.nama.toLowerCase().trim() === p.asli.nama.toLowerCase().trim()), "nama sama dengan produk dibuka di " + p.id);
  }
});

test("KODE asli dipertahankan: hasil menunjuk objek produk website yang sama", () => {
  const h = R.serupa(ixMerek, "PE24");
  for (const x of h) assert.equal(x.produk, cari(denganMerek, x.produk.id));
});

test("produk satu kategori dan nama mirip berada di atas (Plastik PE Boyo)", () => {
  const h = R.serupa(ixMerek, "PE24");
  assert.equal(h.length, 8);
  for (const x of h) assert.equal(x.produk.kat, "Plastik PE");
  const tiga = h.slice(0, 3).map((x) => x.produk.nama);
  assert.ok(tiga.some((n) => /Tali Putih 11X22/i.test(n)), tiga.join(" | "));
  assert.ok(h[0].skor >= h[h.length - 1].skor);
});

test("barang lintas kategori dengan nama khas yang sama ikut jadi kandidat", () => {
  // Cari di data asli satu kata nama yang khas (dipakai 60 produk atau kurang) dan muncul di lebih dari satu kategori.
  let a = null, lain = null, kataDipakai = null;
  for (const w of Object.keys(ixTanpa.perKata)) {
    const daftar = ixTanpa.perKata[w].map((i) => ixTanpa.semua[i]);
    if (daftar.length > 60) continue;
    const beda = daftar.find((p) => p.kategori !== daftar[0].kategori);
    if (beda) { a = daftar[0]; lain = beda; kataDipakai = w; break; }
  }
  assert.ok(a, "data uji harus punya kata khas yang muncul di dua kategori");
  assert.ok(R.kandidat(ixTanpa, a.id).includes(lain.id), `kata "${kataDipakai}": ${a.asli.nama} → ${lain.asli.nama}`);
});

test("kemiripan harga: sama = 1, makin jauh makin kecil, 5 kali lipat = 0", () => {
  const dasar = { kat: "Uji", sat: "pcs", status: "tersedia" };
  const daftar = [
    { ...dasar, id: "A", nama: "Gelas Uji A", harga: 1000 },
    { ...dasar, id: "B", nama: "Gelas Uji B", harga: 1000 },
    { ...dasar, id: "C", nama: "Gelas Uji C", harga: 2000 },
    { ...dasar, id: "D", nama: "Gelas Uji D", harga: 5000 },
    { ...dasar, id: "E", nama: "Gelas Uji E", harga: 9000 }
  ];
  const ix = R.buatIndeks(daftar, ATURAN);
  const h = (x) => R.skor(ix, "A", x).rincian.harga;
  assert.equal(h("B"), 1);
  assert.ok(h("C") < 1 && h("C") > h("D"));
  assert.equal(h("D"), 0);
  assert.equal(h("E"), 0);
});

test("merek kosong, OTR, dan LAIN LAIN tidak merusak skor: bobot merek dilewati", () => {
  const otr = denganMerek.find((p) => (p.merek || "").toUpperCase() === "OTR");
  const lainLain = denganMerek.find((p) => (p.merek || "").toUpperCase() === "LAIN LAIN");
  const kosong = denganMerek.find((p) => !p.merek);
  for (const p of [otr, lainLain, kosong]) {
    assert.ok(p, "data uji harus punya contoh merek pengisi");
    for (const x of R.serupa(ixMerek, p.id)) {
      assert.ok(Number.isFinite(x.skor) && x.skor >= 0 && x.skor <= 1);
      assert.equal(x.rincian.merek, null);
    }
  }
  // Normalisasi bobot: tanpa merek, skor = rata-rata berbobot atribut yang ada saja.
  const a = ixMerek.semua.find((p) => !p.merek && p.kata.length && p.harga);
  const b = R.serupa(ixMerek, a.id)[0];
  if (b) {
    const r = b.rincian, w = ATURAN.bobot;
    let atas = 0, bawah = 0;
    for (const k of Object.keys(r)) if (r[k] !== null) { atas += w[k] * r[k]; bawah += w[k]; }
    assert.ok(Math.abs(b.skor - atas / bawah) < 0.001);
  }
});

test("merek yang sama menaikkan skor bila kolom MEREK tersedia", () => {
  // Dua produk berbeda dengan merek asli yang sama (bukan pengisi), diambil dari data.
  const bermerek = ixMerek.semua.filter((p) => p.merek);
  const a = bermerek[0], b = bermerek.find((p) => p !== a && p.merek === a.merek);
  const c = bermerek.find((p) => p.merek !== a.merek);
  assert.equal(R.skor(ixMerek, a.id, b.id).rincian.merek, 1);
  assert.equal(R.skor(ixMerek, a.id, c.id).rincian.merek, 0);
  // Tanpa kolom MEREK, atribut merek dilewati (null), bukan dianggap berbeda.
  assert.equal(R.skor(ixTanpa, a.id, b.id).rincian.merek, null);
});

test("stok habis: tampil di belakang secara bawaan, hilang bila diatur 'sembunyikan'", () => {
  let diuji = 0;
  for (const p of ixMerek.semua) {
    const h = R.serupa(ixMerek, p.id);
    const pertamaHabis = h.findIndex((x) => x.produk.status === "habis");
    if (pertamaHabis < 0) continue;
    diuji++;
    assert.ok(h.slice(pertamaHabis).every((x) => x.produk.status === "habis"), "produk berstok setelah produk habis di " + p.id);
  }
  assert.ok(diuji > 0);
  const ixSembunyi = R.buatIndeks(denganMerek, { ...ATURAN, stokHabis: "sembunyikan" });
  for (const p of ixSembunyi.semua) assert.ok(!R.serupa(ixSembunyi, p.id).some((x) => x.produk.status === "habis"));
});

test("kategori kecil dan ID yang tidak ada ditangani tanpa galat", () => {
  assert.deepEqual(R.serupa(ixMerek, "TIDAK-ADA-KODE-INI"), []);
  assert.deepEqual(R.pelengkap(ixMerek, "TIDAK-ADA-KODE-INI"), []);
  const perKat = {};
  denganMerek.forEach((p) => { perKat[p.kat] = (perKat[p.kat] || 0) + 1; });
  const sendiri = denganMerek.find((p) => perKat[p.kat] === 1);
  assert.ok(sendiri, "data uji harus punya kategori berisi satu produk");
  const h = R.serupa(ixMerek, sendiri.id);
  assert.ok(Array.isArray(h) && h.length <= 8);
  assert.deepEqual(R.serupa(R.buatIndeks([], ATURAN), "PE24"), []);
});

test("Produk Pelengkap mati bila aturan kosong, dan terpisah dari skor kemiripan", () => {
  assert.deepEqual(R.pelengkap(ixMerek, "PE24"), []);
  const cup = denganMerek.find((p) => p.kat === "Gelas Cup");
  const tujuan = [...new Set(denganMerek.map((p) => p.kat))].filter((k) => /seal|sedotan/i.test(k));
  assert.ok(tujuan.length, "data uji harus punya kategori seal cup atau sedotan");
  const ix = R.buatIndeks(denganMerek, { ...ATURAN, pelengkap: [{ dari: "Gelas Cup", ke: tujuan }] });
  const pel = R.pelengkap(ix, cup.id);
  assert.ok(pel.length > 0 && pel.length <= 8);
  for (const x of pel) assert.ok(tujuan.includes(x.produk.kat));
  // Aturan pelengkap tidak mengubah daftar Produk Serupa.
  assert.deepEqual(R.serupa(ix, cup.id).map(id), R.serupa(R.buatIndeks(denganMerek, ATURAN), cup.id).map(id));
});

test("tutup gelas cup lebih mirip dengan tutup lain daripada dengan gelasnya", () => {
  const h = R.serupa(ixMerek, "PP08");
  assert.ok(/tutup/i.test(h[0].produk.nama), h.map((x) => x.produk.nama).join(" | "));
});

test("indeks dibangun ulang untuk daftar produk baru, dan dipakai ulang untuk daftar yang sama", () => {
  const a = R.indeksUntuk(denganMerek, ATURAN);
  assert.equal(R.indeksUntuk(denganMerek, ATURAN), a);
  const baru = denganMerek.slice();
  assert.notEqual(R.indeksUntuk(baru, ATURAN), a);
});
