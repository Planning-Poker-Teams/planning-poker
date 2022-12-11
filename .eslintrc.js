module.exports = {
  "root": true,
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:prettier/recommended"
  ],
  "env": {
    "node": true,
    "browser": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": ["./tsconfig.json", "packages/*/tsconfig.json"]
  },
  "plugins": ["@typescript-eslint"],
}
