import js from '@eslint/js'; // ESLint 内置的 JavaScript 核心规则
import globals from 'globals'; // 用于定义全局变量（如 Node.js、浏览器环境变量）
import tseslint from 'typescript-eslint'; // TypeScript 支持插件
import json from '@eslint/json'; // JSON 文件检查插件
import css from '@eslint/css'; // CSS 文件检查插件
import { defineConfig } from 'eslint/config'; // ESLint 的新配置定义方式

export default defineConfig([
	{
		files: ['**/*.{js,mjs,cjs,ts}'],
		plugins: {
			js
		},
		extends: ['js/recommended']
	},

	{
		files: ['**/*.{js,mjs,cjs,ts}'],
		languageOptions: {
			globals: {
				...globals.node
			}
		}
	},
	tseslint.configs.recommended,
	{
		files: ['**/*.ts', '**/*.tsx'],
		plugins: {
			'@typescript-eslint': tseslint.plugin
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off' // 暂时关闭对 any 的检查
		}
	},
	{
		files: ['**/*.jsonc'],
		plugins: {
			json
		},
		language: 'json/jsonc',
		extends: ['json/recommended']
	},
	{
		files: ['**/*.css'],
		plugins: {
			css
		},
		language: 'css/css',
		extends: ['css/recommended']
	}
]);
