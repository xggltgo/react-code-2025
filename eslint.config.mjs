// 导入 ESLint 核心配置和插件
import js from '@eslint/js'; // ESLint 内置的 JavaScript 核心规则
import globals from 'globals'; // 用于定义全局变量（如 Node.js、浏览器环境变量）
import tseslint from 'typescript-eslint'; // TypeScript 支持插件
import json from '@eslint/json'; // JSON 文件检查插件
import css from '@eslint/css'; // CSS 文件检查插件
import { defineConfig } from 'eslint/config'; // ESLint 的新配置定义方式

export default defineConfig([
  // 配置组 1：基础 JavaScript/TypeScript 配置
  {
    files: ['**/*.{js,mjs,cjs,ts}'], // 匹配所有 JS 和 TS 文件
    plugins: {
      js, // 启用 ESLint 内置的 JavaScript 插件
    },
    extends: ['js/recommended'], // 继承 ESLint 推荐规则
  },

  // 配置组 2：定义全局变量（Node.js 环境）
  {
    files: ['**/*.{js,mjs,cjs,ts}'], // 同样应用于 JS/TS 文件
    languageOptions: {
      globals: {
        ...globals.node, // 注入 Node.js 全局变量（如 require, module, __dirname 等）
      },
    },
  },

  // 配置组 3：TypeScript 专属配置
  tseslint.configs.recommended, // 直接应用 TypeScript 插件的推荐配置

  // 配置组 4：JSON with Comments 文件配置
  {
    files: ['**/*.jsonc'], // 匹配所有 .jsonc 文件
    plugins: {
      json, // 启用 JSON 插件
    },
    language: 'json/jsonc', // 指定文件语言类型
    extends: ['json/recommended'], // 继承 JSON 插件推荐规则
  },

  // 配置组 5：CSS 文件配置
  {
    files: ['**/*.css'], // 匹配所有 .css 文件
    plugins: {
      css, // 启用 CSS 插件
    },
    language: 'css/css', // 指定文件语言类型
    extends: ['css/recommended'], // 继承 CSS 插件推荐规则
  },
]);
