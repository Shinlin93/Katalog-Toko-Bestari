// sitemap.xml untuk Google Search Console: halaman depan, FAQ, dan semua produk yang tampil di katalog.
// Dibuat otomatis dari Google Sheets setiap kali diminta (disimpan sementara 1 jam), jadi produk baru ikut masuk.
const { alamatSitus, ambilPengaturan, idProdukToko } = require("./_situs");

const xml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));

module.exports = async (req, res) => {
  const situs = alamatSitus(req);
  const url = [situs + "/", situs + "/faq.html"];
  try {
    const cfg = await ambilPengaturan(situs);
    // Toko yang datanya masih contoh (contoh: true di pengaturan.js) tidak dimasukkan.
    const daftar = await Promise.all((cfg.toko || []).map((t, i) =>
      t.contoh ? [] : idProdukToko(t, i === 0, situs).catch(() => [])));
    const sudah = new Set();
    daftar.flat().forEach((id) => {
      if (sudah.has(id)) return;
      sudah.add(id);
      url.push(situs + "/produk.html?id=" + encodeURIComponent(id));
    });
  } catch (e) {
    // Bila pengaturan atau spreadsheet tidak bisa dibaca, sitemap tetap berisi halaman utama.
  }
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    url.map((u) => "  <url><loc>" + xml(u) + "</loc></url>").join("\n") + "\n</urlset>\n");
};
