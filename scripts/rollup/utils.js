import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import tsPlugin from 'rollup-plugin-typescript2';
import replacePlugin from '@rollup/plugin-replace';

export const getPackagePath = (packageName, isDist) => {
	return fileURLToPath(
		new URL(
			`${isDist ? '../../dist/node_modules' : '../../packages'}/${packageName}`,
			import.meta.url
		)
	);
};

export const getPackageJson = (packageName) => {
	return JSON.parse(readFileSync(getPackagePath(packageName) + '/package.json', 'utf-8'));
};

export const initBasePlugin = (options = {}) => {
	return  [replacePlugin(options.replace || {
		__DEV__: true,
	}), tsPlugin(options.typescript || {})];
};
