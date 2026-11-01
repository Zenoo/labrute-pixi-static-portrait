import { dts } from 'rollup-plugin-dts';

// NodeNext consumers need declarations matching each runtime module format.
export default {
  input: 'src/Symbols.ts',
  output: ['dist/Symbols.d.ts', 'dist/Symbols.d.cts', 'dist/Symbols.d.mts'].map((file) => ({
    file,
    format: 'es',
  })),
  external: ['pixi.js'],
  plugins: [dts({ compilerOptions: { skipLibCheck: true, moduleResolution: 2 } })],
};
