module.exports = {
root: true,
parser: "@typescript-eslint/parser",
parserOptions: { ecmaVersion: 2023, sourceType: "module", project: false },
env: { node: true, es2022: true },
plugins: ["@typescript-eslint", "import"],
extends: [
"eslint:recommended",
"plugin:@typescript-eslint/recommended",
"plugin:import/recommended",
"plugin:import/typescript",
"prettier"
],
rules: {
"import/order": ["warn", { "alphabetize": { order: "asc", caseInsensitive: true }, "newlines-between": "always" }],
"@typescript-eslint/consistent-type-imports": "warn"
},
ignorePatterns: ["dist", "node_modules"]
};