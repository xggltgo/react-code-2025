import { getPackageJson, getPackagePath, initBasePlugin } from './utils.js';
import generatePackageJsonFilePlugin from 'rollup-plugin-generate-package-json';
import alias from '@rollup/plugin-alias';

const packageJson = getPackageJson('react-dom');
const baseInputPath = getPackagePath('react-dom');
const baseOutputPath = getPackagePath('react-dom', true);

export default [
	{
		input: baseInputPath + '/' + packageJson.module,
		output: [
			{
				file: baseOutputPath + '/index.js',
				name: 'index.js',
				format: 'umd'
			},
			{
				file: baseOutputPath + '/client.js',
				name: 'client.js',
				format: 'umd'
			}
		],
		plugins: [
			...initBasePlugin(),
			alias({
				entries: {
					hostConfig: baseInputPath + '/src/hostConfig.js'
				}
			}),
			generatePackageJsonFilePlugin({
				inputFolder: baseInputPath,
				baseContents: (pkg) => ({
					name: pkg.name,
					version: pkg.version,
					description: pkg.description,
					main: 'index.js',
					peerDependencies: {
						react: pkg.version
					}
				})
			})
		]
	}
];
