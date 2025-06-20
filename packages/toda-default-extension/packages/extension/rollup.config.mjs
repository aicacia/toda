import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import esmImportToUrl from 'rollup-plugin-esm-import-to-url';

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				file: 'build/index.js',
				format: 'es',
				sourcemap: false,
				plugins: [terser()]
			}
		],
		plugins: [
			esmImportToUrl({
				imports: {
					tslib: 'https://unpkg.com/tslib@2/tslib.es6.js'
				}
			}),
			resolve({ browser: true }),
			commonjs({
				transformMixedEsModules: true
			}),
			typescript({
				compilerOptions: {
					outDir: 'build'
				}
			})
		]
	}
];
