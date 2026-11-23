// Mengganti alamat situs lama dengan domain baru di semua file yang menyimpannya.
// Pakai: node alat/ganti-domain.mjs https://domainbaru.com
// Yang diubah: tag canonical, og:url, og:image, dan data terstruktur di index.html, faq.html, dan produk.html.
// sitemap.xml, robots.txt, dan alamat kanonik tiap produk sudah otomatis mengikuti domain, jadi tidak perlu diubah.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const akar = join(dirname(fileURLToPath(import.meta.url)), "..");
// Yang diganti hanya "https://domain" yang diikuti path situs sendiri (aset/, faq.html, #organisasi, ?toko=, atau "/").
// Link ke situs lain (Instagram, schema.org, Google Fonts) tidak tersentuh.
const LAMA = /https:\/\/[a-z0-9.-]+(?=\/(?:aset\/|faq\.html|#organisasi|#situs|\?toko=|"))/gi;
const BUKAN = /^https:\/\/(www\.instagram\.com|schema\.org|fonts\.googleapis\.com|fonts\.gstatic\.com)/i;

const baru = (process.argv[2] || "").replace(/\/+$/, "");
if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(baru)) {
  console.error("Tulis domain lengkap dengan https://, misalnya: node alat/ganti-domain.mjs https://tokobestari.com");
  process.exit(1);
}
for (const f of ["index.html", "faq.html", "produk.html"]) {
  const p = join(akar, f);
  let n = 0;
  const isi = readFileSync(p, "utf8").replace(LAMA, (m) => (BUKAN.test(m) ? m : (n++, baru)));
  writeFileSync(p, isi);
  console.log(f + ": " + n + " alamat diganti");
}
console.log("Selesai. Commit dan push, lalu daftarkan " + baru + "/sitemap.xml di Google Search Console.");
