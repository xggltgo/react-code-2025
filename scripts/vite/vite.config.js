import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import replacePlugin from '@rollup/plugin-replace';
import { getPackagePath } from '../rollup/utils';
import { fileURLToPath } from 'node:url';


console.log(getPackagePath('react-dom') + '/src/hostConfig.ts');

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		replacePlugin({
			__DEV__: true
		})
	],
	resolve: {
		alias: {
			react: getPackagePath('react'),
			'react-dom': getPackagePath('react-dom'),
			hostConfig: fileURLToPath(
				new URL('../../packages/react-dom/src/hostConfig.ts', import.meta.url)
			)
		}
	}
});
