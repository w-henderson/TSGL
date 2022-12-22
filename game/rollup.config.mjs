import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'dist/index.js',
  output: {
    file: 'dist/bundle.mjs',
    format: 'esm'
  },
  plugins: [nodeResolve()]
};