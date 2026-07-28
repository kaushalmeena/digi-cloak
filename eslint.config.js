// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const prettier = require("eslint-plugin-prettier/recommended");
const betterTailwind = require("eslint-plugin-better-tailwindcss");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
      prettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
      prettier,
    ],
    rules: {},
  },
  {
    // Tailwind class linting. `entryPoint` points the plugin at the real
    // stylesheet so the theme and any custom component classes defined there
    // are recognised instead of being reported as unknown.
    files: ["**/*.html", "**/*.ts"],
    plugins: { "better-tailwindcss": betterTailwind },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/styles.css",
        detectComponentClasses: true,
        // Only the plain `class` attribute. Angular's `[class.foo]="expr"`
        // bindings would otherwise be matched too, and the plugin would read
        // the string literals inside `expr` as if they were class names.
        attributes: ["class"],
      },
    },
    rules: {
      ...betterTailwind.configs["recommended-warn"].rules,

      // Class ordering used to be handled by prettier-plugin-tailwindcss.
      // It lives here now, so keep it an error to preserve that guarantee.
      "better-tailwindcss/enforce-consistent-class-order": "error",

      // Correctness rather than style, so these fail the build.
      // `no-conflicting-classes` catches two utilities fighting over the same
      // property, where stylesheet order silently decides the winner.
      "better-tailwindcss/no-conflicting-classes": "error",
      "better-tailwindcss/no-unknown-classes": "error",

      // Prettier owns formatting — letting this rule wrap class lists too
      // would give two tools authority over the same bytes.
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
    },
  },
]);
