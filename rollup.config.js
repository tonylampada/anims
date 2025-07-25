import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/main.js',
  output: {
    file: 'js/bundle.js',
    format: 'iife',
    name: 'AnimationGallery'
  },
  plugins: [nodeResolve()]
};