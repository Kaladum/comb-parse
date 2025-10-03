// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig(
	{
		plugins: {
			"@stylistic": stylistic,
		},
	},
	{
		ignores: [
			"js/*",
		],
	},
	eslint.configs.recommended,
	tseslint.configs.recommended,
	tseslint.configs.strict,
	tseslint.configs.stylistic,
	{
		rules: {
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-unused-vars": ["warn", { "varsIgnorePattern": "^_", "argsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
			"@typescript-eslint/no-empty-function": ["warn", { allow: ["methods"] }],
			"@stylistic/indent": ["warn", "tab"],
			"@stylistic/comma-dangle": ["warn", "always-multiline"],
			"@stylistic/semi": ["warn", "always"],
			"@stylistic/quotes": ["warn", "double"],
			"@stylistic/member-delimiter-style": ["warn", {
				"multiline": {
					"delimiter": "comma",
					"requireLast": true,
				},
				"singleline": {
					"delimiter": "comma",
					"requireLast": false,
				},
			}],
			"eqeqeq": ["warn", "always"],
		},
	},
);