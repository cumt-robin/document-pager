import globals from "globals";
import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tsEslint from "typescript-eslint";

export default tsEslint.config(
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  tsEslint.configs.recommended,
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  {
    rules: {
      "prettier/prettier": "error",
      "no-unused-vars": "warn",
      "no-undef": "warn",
    },
  },
  {
    ignores: ["node_modules", "esm", "dist"],
  },
);
