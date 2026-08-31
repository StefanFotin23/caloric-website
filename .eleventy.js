const fs = require("fs");
const path = require("path");

module.exports = function (eleventyConfig) {
  // Everything under src/assets/ (images, compiled CSS, site.js) is copied
  // as-is into the final _site/assets/ output — nothing in there passes
  // through Eleventy's template engine.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Quiet build logs — one line per run instead of one per file.
  // (Custom 404: src/404.njk just needs permalink: "404.html" like any
  // other page — GitHub Pages auto-detects and serves that file for any
  // unmatched path, no Eleventy-side config needed for it.)
  eleventyConfig.setQuietMode(true);

  // webpSrc(jpgPath) — 2026-08-31 image-weight pass. Returns the WebP
  // sibling of a local assets/*.jpg path (e.g. "assets/foo.jpg" ->
  // "assets/foo.webp") IF that .webp file actually exists on disk, else
  // null. Templates use this to decide whether to wrap an <img> in a
  // <picture><source type="image/webp">...</picture> — so a JPG that has
  // no WebP sibling (either not yet converted, or deliberately skipped
  // because WebP didn't beat it at good quality — see
  // daikin-altherma-m-hw.jpg, whose photo content just doesn't compress
  // well in WebP) silently falls back to plain <img>, no template branch
  // needed per-file. Only siteassets are eligible (not the Unsplash-hosted
  // stock photos used for a few service cards — those are hotlinked, not
  // ours to convert).
  eleventyConfig.addFilter("webpSrc", function (src) {
    if (typeof src !== "string" || !src.startsWith("assets/") || !/\.jpe?g$/i.test(src)) {
      return null;
    }
    const webpRelative = src.replace(/\.jpe?g$/i, ".webp");
    const webpAbsolute = path.join(__dirname, "src", webpRelative);
    return fs.existsSync(webpAbsolute) ? webpRelative : null;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    // .njk for real templates, .html so a stray static HTML file (if we
    // ever need one) still gets copied through untouched.
    templateFormats: ["njk", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
