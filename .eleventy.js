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
