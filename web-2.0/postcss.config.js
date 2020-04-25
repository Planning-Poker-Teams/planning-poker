const isProduction = process.env.NODE_ENV === "production";
const purgeCss = require("@fullhuman/postcss-purgecss");

module.exports = {
  plugins: [
    require("tailwindcss")("tailwind.js"),
    require("autoprefixer")(),
    isProduction
      ? purgeCss({
          content: ["./src/**/*.html", "./src/**/*.vue"],
          // The following config part is from https://purgecss.com/guides/vue.html#use-the-vue-cli-plugin
          defaultExtractor(content) {
            const contentWithoutStyleBlocks = content.replace(
              /<style[^]+?<\/style>/gi,
              ""
            );
            return (
              contentWithoutStyleBlocks.match(
                /[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g
              ) || []
            );
          },
          whitelist: [],
          whitelistPatterns: [
            /-(leave|enter|appear)(|-(to|from|active))$/,
            /^(?!(|.*?:)cursor-move).+-move$/,
            /^router-link(|-exact)-active$/,
            /data-v-.*/,
          ],
        })
      : undefined,
  ],
};
