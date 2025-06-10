import { getPackageJson, getPackagePath, initBasePlugin } from './utils.js';
import generatePackageJsonFilePlugin from 'rollup-plugin-generate-package-json';

const packageJson = getPackageJson('react');
const baseInputPath = getPackagePath('react');
const baseOutputPath = getPackagePath('react', true);

export default [
	{
		input: baseInputPath + '/' + packageJson.module,
		output: {
			file: baseOutputPath + '/index.js',
			name: 'react',
			format: 'umd',
			sourcemap: true
		},
		plugins: [
			...initBasePlugin(),
			generatePackageJsonFilePlugin({
				inputFolder: baseInputPath,
				baseContents: (pkg) => ({
					name: pkg.name,
					version: pkg.version,
					description: pkg.description,
					main: 'index.js'
				})
			})
		]
	},
	{
		input: baseInputPath + '/src/jsx.ts',
		output: [
			{
				file: baseOutputPath + '/jsx-dev-runtime.js',
				name: 'jsx-dev-runtime.js',
				format: 'umd',
				sourcemap: true
			},
			{
				file: baseOutputPath + '/jsx-runtime.js',
				name: 'jsx-runtime.js',
				format: 'umd',
				sourcemap: true
			}
		],
		plugins: [...initBasePlugin()]
	}
];
