module.exports = function (eleventyConfig) {
  // Everything under src/assets/ (images, compiled CSS, site.js) is copied
  // as-is into the final _site/assets/ output — nothing in there passes
  // through Eleventy's template engine.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Custom 404 page (see src/404.njk) needs this so GitHub Pages serves it
  // correctly — Eleventy would otherwise treat 404.html like any other page.
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
