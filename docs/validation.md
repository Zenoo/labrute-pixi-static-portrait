# Validation and measurements

Measured on 2026-11-01 on Windows, Node 24.13.0, headless Chromium with WebGL/SwiftShader, renderer resolution 1, antialiasing enabled, and production portrait scale 3. Software rendering makes the absolute times machine-specific.

Final local status: clean lockfile installation and build passed; **24 automated tests** passed; browser PNG checks, twelve Ruffle cases, playground smoke test, deterministic generation, and the client patch applicability/syntax checks passed. The actual tarball was also installed into an isolated consumer: native CJS/ESM Container identity and Assets borrowing passed, and both NodeNext declaration consumers compiled.

The portrait playground now follows the fighter playground's light panel layout and collapsible sidebar. Its browser check covers dropdown variations, live colors, preserving facing/scale across gender changes, reset synchronization, responsive canvas sizing, and mobile overflow. Desktop and mobile screenshots are generated at `.validation/playground/desktop.png` and `.validation/playground/mobile.png`.

Appearance imports use the fighter playground's 11-digit hexadecimal body strings and 32-digit decimal palette color strings. Adapter tests cover slot ordering, gender palettes, black/white special indexes, and incomplete input validation. Browser checks verify imports update the rendered appearance, dropdowns update the body string, and incomplete edits preserve the last valid appearance.

## Method

Before editing, the production `BruteDisplay.ts` was copied into an ignored baseline harness and run against this package's original generated data. Only imports, application decoding adapters, and browser bundling were adapted. The fixtures were male `01013100611` and female `00100100610`; the baseline used the existing palette decoder with zero-valued color indexes. The new path uses decoded skin/hair/clothing colors from the same palette family. There is no animation workload.

Each run creates a display, waits for readiness, extracts a transparent PNG, and destroys the display while retaining the renderer. There are 26 alternating portraits: two cold gender cases followed by 24 warm repeated portraits. Timings include destruction. The initial and final browser processes start with empty Assets caches. The baseline files were captured before implementation; the old implementation is not maintained as a second package renderer.

Raw records: [baseline](baseline.json), [current benchmark](benchmark-results.json), [browser checks](browser-results.json), [source comparisons](comparison-results.json), [package contents](pack-results.json).

## Scale-3 results

The table below records the completed comparison run; subsequent browser runs can vary. The JSON reports are the authoritative samples.

| Measurement | Original production path | New package |
| --- | ---: | ---: |
| Cold male ready | 38.5 ms | 169.9 ms |
| Cold male PNG extraction | 273.1 ms | 163.9 ms |
| Cold male total | 316.1 ms | 335.0 ms |
| First female total | 99.7 ms | 131.9 ms |
| Warm median ready | 1.2 ms | 0.8 ms |
| Warm median PNG extraction | 19.5 ms | 13.6 ms |
| Warm median total | 20.9 ms | 15.3 ms |
| 26-portrait batch | 920.4 ms | 836.0 ms |
| Assets.load calls over that batch | 884 | 75 |
| Owned/shared portrait texture estimate | 3,182,572 bytes | 5,905,852 bytes |
| Renderer-managed RGBA estimate, including transient targets | 4,709,176 bytes | 10,264,000 bytes |
| Browser JS heap snapshot, without forced GC | 31,376,913 bytes | 33,714,160 bytes |

The new path shifts shader/raster work into readiness to cache Flash additive colors. That makes readiness alone slower on a cold renderer; compare total readiness plus extraction. The first female remains materially slower, while repeated generation improves. Source-derived selector behavior, restored strokes, composed raster resolution, iris layers, and conservative extraction padding also mean the output is not byte-equivalent to the old renderer. Male extraction bounds changed from approximately 252×607 to 295×638, and female from 290×605 to 306×620.

Memory is a measured tradeoff: the new path holds both uncolored SVG bases and reusable colored variants instead of tinting one base texture in place. There were 75 bases and 62 idle variants in the matching-portrait run, with no remaining borrowers after destruction. Base textures are shared across renderers at the Assets level, but each WebGL context can upload its own copy. The pool's GPU estimates must therefore be considered per context.

Additional new-path batches used three retained renderers: twelve matching portraits took 392.9 ms with **zero** additional SVG loads; twelve varied outfits/colors took 459.7 ms and loaded 103 additional selected SVG/resolution combinations. This includes warming the extra renderers. Idle cache limits and reference counting bound reuse; explicit cache trimming is tested while another live portrait continues extracting successfully.

The GPU figures estimate four bytes per pixel from live Pixi texture sources, including pooled render targets. They are not driver VRAM measurements and exclude multisample attachments, mipmaps, and allocation overhead. Heap snapshots are observational, not leak proofs. No requestAnimationFrame loop, ticker, or continuous rendering is installed by the package.

## Package size

The original tracked 1.0.6 package snapshot packed to **1,037,362 compressed / 11,004,601 unpacked bytes**. After the readability pass, the new package packs to **247,964 compressed / 1,338,113 unpacked bytes**, recorded in [pack-results.json](pack-results.json). Its nine files contain one shared data artifact and both genuine renderer formats with format-specific declarations. The old package included source/XML and development files; the new allowlist excludes tooling, SWFs, fixtures, and dependencies. The original release history remains in CHANGELOG.md.

## Checks

- CJS and ESM run the same lifecycle suite: selected appearance, selectors, composed resolution, stroke minimum, mask coordinates, zero alpha, shared borrowers, overlapping updates, failed loads, retries, destruction before readiness, stable filters, and caller-position-independent extraction bounds.
- Every generated timeline is compared with the original SWF reader, including all empty frames and source depth order. Source mask 45 and iris shapes 337/344 have explicit assertions.
- NodeNext `.cts` and `.mts` consumers compile against conditional declarations. Native imports share the data graph; CJS/ESM use the matching consumer Container and Assets identity. The browser graph rejects a CommonJS Pixi runtime.
- Real WebGL PNG extraction covers both genders, facing, transparency, scale-3 bounds, highlight pixels, unclipped filter borders, iris-only color changes, and shared texture survival after destruction and cache trimming.
- Local Ruffle compares twelve decoded appearances: both genders, both directions, and the reported fixtures plus all-one and all-zero body configurations. It renders original SWF vector records with the same placement transforms and selected frames. Source geometry and intentional enhancements are tested separately.
- Export is run twice and checked for byte-identical SVG/JSON/TypeScript/manifest output. Archive and JAR checksums pin FFDec 26.4.0. The source SWF SHA-256 is `d51c64b18809293458e6f607d5411c6733e20aab8369fa3314ccc2fc1880db0e`.
- `npm pack` contents are asserted, and `git apply --check` succeeds for the concrete client migration patch.

## Limits and remaining work outside this workspace

The twelve source captures differ in 9.49-12.92% of occupied pixels above a 24/255 premultiplied-channel threshold. Inspected overlays align geometry; most residuals follow antialiased edges and fine strokes. The regression threshold is 15%, so these checks detect gross changes rather than prove pixel-exact fidelity. PNGs and overlays are written to `.validation/comparison/` by `npm run test:comparison`.

Frozen references explicitly apply decoded appearance and frame choices. They do not run the original ActionScript palette/body decoder. No missing source assets were encountered. WebGPU/Canvas behavior and hardware-GPU performance remain unverified. The static SWF's relevant source effects are blur records; the generic glow helper remains an approximation for any future source that uses it.

Only this package workspace was writable. The production client patch is supplied and checked, but has not been applied; its dependency lockfile and full application build must be updated in the consumer checkout. The GitHub workflows are prepared but have not run remotely. The renamed npm package needs account-side registration/trusted-publisher setup before release. Nothing was published.
