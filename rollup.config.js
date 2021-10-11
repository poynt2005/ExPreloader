import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from "rollup-plugin-terser";


export default {
    input: 'src/index.js',
    output: {
      name: 'ExPreloader',
      file: 'dist/expreloader.min.js',
      format: 'umd',
    },
    plugins: [
        commonjs(),
		    resolve(),
        babel({
            babelrc: false,
            presets: [['@babel/preset-env', { modules: false, targets: { browsers: "> 0.5%, ie >= 9" } }]]
        }),
		
        terser()
    ]
  };