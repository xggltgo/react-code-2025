import { getPackageJson, getPackagePath, initBasePlugin } from './utils.js';

const packageJson = getPackageJson('react');
const baseInputPath = getPackagePath('react');
const baseOutputPath = getPackagePath('react', true);

export default [
	{
		input: baseInputPath + '/' + packageJson.module,
		output: {
			file: baseOutputPath + '/react.js',
			name: 'react.js',
			format: 'umd'
		},
		plugins: [...initBasePlugin()]
	},
	{
		input: baseInputPath + '/src/jsx.ts',
		output: [
			{
				file: baseOutputPath + '/jsx-dev-runtime.js',
				name: 'jsx-dev-runtime.js',
				format: 'umd'
			},
			{
				file: baseOutputPath + '/jsx-runtime.js',
				name: 'jsx-runtime.js',
				format: 'umd'
			}
		],
		plugins: [...initBasePlugin()]
	}
];
