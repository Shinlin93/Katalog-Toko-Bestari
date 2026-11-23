// robots.txt: semua halaman boleh dibaca mesin pencari, dan menunjuk ke sitemap di domain yang sedang dipakai.
const { alamatSitus } = require("./_situs");

module.exports = (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=86400");
  res.status(200).send("User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: " + alamatSitus(req) + "/sitemap.xml\n");
};
