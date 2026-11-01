import { readFileSync } from 'node:fs';
import typescript from 'rollup-plugin-typescript2';
import { minify } from 'terser';

const symbolExports = [
  ...readFileSync('src/symbols/index.ts', 'utf8').matchAll(/export \{ (\w+) \}/g),
].map((match) => match[1]);

const compile = (declaration) =>
  typescript({
    include: /\.ts$/,
    exclude: [/\.d\.ts$/, /[\\/](test|examples|node_modules)[\\/]/],
    tsconfigDefaults: {
      compilerOptions: {
        target: 'ES2020',
        lib: ['ES2020', 'DOM'],
        skipLibCheck: true,
        moduleResolution: 'node',
        resolveJsonModule: true,
        allowSyntheticDefaultImports: true,
        declaration,
      },
    },
  });

export default [
  // Bundle the object graph once, preserving references between symbols.
  {
    input: 'src/symbols/index.ts',
    output: { file: 'dist/symbol-data.cjs', format: 'cjs' },
    plugins: [
      compile(false),
      {
        name: 'compact-published-symbols',
        async renderChunk(code) {
          // Source files stay readable. Published data needs neither whitespace
          // nor long local identifiers; public export/property names stay intact.
          const result = await minify(code, {
            compress: false,
            mangle: { toplevel: true },
            format: { comments: false },
          });
          return { code: result.code, map: null };
        },
      },
    ],
  },
  {
    input: 'src/Symbols.ts',
    external: ['pixi.js', 'pixi-filters'],
    output: [
      { file: 'dist/Symbols.js', format: 'cjs' },
      { file: 'dist/Symbols.mjs', format: 'es' },
    ],
    plugins: [
      {
        name: 'shared-symbol-data',
        resolveId(source) {
          if (source === './symbols/index') {
            return { id: './symbol-data.cjs', external: true };
          }
        },
        transform(code, id) {
          if (id.replaceAll('\\', '/').endsWith('/src/Symbols.ts')) {
            // Explicit names support native Node ESM's CJS export detection.
            return code.replace(
              "export * from './symbols/index'",
              `export { ${symbolExports.join(', ')} } from './symbols/index'`,
            );
          }
        },
      },
      compile(false),
    ],
  },
];
