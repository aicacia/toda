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
				file: 'browser/index.js',
				format: 'es',
				sourcemap: true,
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
				tsconfig: './tsconfig.esm.json',
				compilerOptions: {
					outDir: 'browser'
				}
			})
		]
	}
];
