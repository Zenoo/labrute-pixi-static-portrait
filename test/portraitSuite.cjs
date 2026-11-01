const { test } = require('node:test');
const assert = require('node:assert/strict');
module.exports = (api, pixi) => {
  const keys = ['p1', 'p1a', 'p1b', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p7b', 'p8'];
  const colors = [
    'col0',
    'col0a',
    'col0c',
    'col1',
    'col1a',
    'col1b',
    'col1c',
    'col1d',
    'col2',
    'col2a',
    'col2b',
    'col3',
    'col3b',
    'col4',
    'col4a',
    'col4b',
  ];
  const appearance = (gender) => ({
    gender,
    scale: 3,
    parts: Object.fromEntries(keys.map((k) => [k, 0])),
    colors: Object.fromEntries(colors.map((k) => [k, '#dd8844'])),
  });
  const texture = () =>
    new pixi.Texture({ source: new pixi.TextureSource({ width: 24, height: 24 }) });
  const renderer = {
    resolution: 2,
    generateTexture: () => texture(),
    destroy() {
      throw new Error('Caller renderer destroyed');
    },
  };
  const load = pixi.Assets.load;
  pixi.DOMAdapter.set({
    ...pixi.DOMAdapter.get(),
    createCanvas: () => ({ getContext: () => null }),
  });
  test('selected gender, modulo selectors, transforms, masks, and shared texture ownership', async () => {
    let loads = 0;
    const requests = [];
    pixi.Assets.load = async (request) => {
      loads++;
      requests.push(request);
      return texture();
    };
    const a = new api.BruteDisplay({ renderer, ...appearance('male') });
    await a.ready;
    assert.ok(a.container instanceof pixi.Container);
    assert.ok(a.svgs.length > 10);
    assert.ok(
      requests.some((request) => request.data.resolution > 6),
      'Composed parent scale was omitted',
    );
    for (const request of requests) {
      const svg = decodeURIComponent(request.src.split(',')[1]);
      for (const match of svg.matchAll(/stroke-width="([\d.]+)"/g)) {
        assert.ok(Number(match[1]) + 1e-9 >= 1 / request.data.resolution);
      }
    }

    const initial = loads;
    const b = new api.BruteDisplay({ renderer, ...appearance('male') });
    await b.ready;
    assert.equal(loads, initial);
    assert.ok(a.svgs.some((s) => b.svgs.some((other) => other.texture === s.texture)));
    assert.ok(api.portraitCacheStats(renderer).borrowedVariants > 0);
    a.destroy();
    a.destroy();
    api.clearPortraitCache(renderer);
    assert.ok(b.svgs.every((s) => !s.texture.destroyed));
    b.destroy();
    api.clearPortraitCache(renderer);
    assert.equal(api.portraitCacheStats(renderer).variants, 0);
    const config = appearance('female');
    config.parts.p7 = 999;
    config.facing = 'right';
    const female = new api.BruteDisplay({ renderer, ...config });
    await female.ready;
    assert.equal(female.container.children[0].scale.x, -3);
    assert.ok(female.svgs.length > 10);
    female.destroy();
    pixi.Assets.load = load;
  });
  test('superseded loads and destruction reject promptly and never create late sprites', async () => {
    const pending = [];
    pixi.Assets.load = () => new Promise((resolve) => pending.push(() => resolve(texture())));
    const config = appearance('male');
    config.scale = 5.125;
    const d = new api.BruteDisplay({ renderer, ...config });
    const first = d.ready;
    const second = d.updateAppearance({ ...config, gender: 'female' });
    await assert.rejects(first, { name: 'AbortError' });
    d.destroy();
    await assert.rejects(second, { name: 'AbortError' });
    pending.forEach((resolve) => resolve());
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(d.svgs.length, 0);
    assert.ok(d.container.destroyed);
    assert.equal(api.portraitCacheStats(renderer).borrowedVariants, 0);
    pixi.Assets.load = load;
  });
  test('asset failures reject readiness, retry, and preserve a previously committed scene', async () => {
    pixi.Assets.load = async () => {
      throw new Error('SVG load failed');
    };
    const config = appearance('female');
    config.scale = 7.375;
    const d = new api.BruteDisplay({ renderer, ...config });
    await assert.rejects(d.ready, /SVG load failed/);
    assert.equal(d.container.children.length, 0);
    pixi.Assets.load = async () => texture();
    await d.updateAppearance(config);
    const sprites = [...d.svgs];
    const invalid = { ...config, colors: { ...config.colors, col0: 'red' } };
    await assert.rejects(d.updateAppearance(invalid), /Invalid color/);
    assert.deepEqual(d.svgs, sprites);
    d.destroy();
    pixi.Assets.load = load;
  });
  test('repeated color/highlight updates keep filter counts stable and release old variants', async () => {
    pixi.Assets.load = async () => texture();
    const config = appearance('female');
    config.highlightColorName = 'col3';
    const d = new api.BruteDisplay({ renderer, ...config });
    await d.ready;
    const filters = (node) =>
      (node.filters?.length || 0) + node.children.reduce((sum, c) => sum + filters(c), 0);
    const count = filters(d.container);
    const bounds = d.container.boundsArea.clone();
    d.container.position.set(200, 300);
    for (let i = 0; i < 4; i++) {
      await d.setColors({ ...config.colors, col3: i % 2 ? '#ff0000' : '#00ff00' }, 'col3');
    }

    assert.equal(filters(d.container), count);
    assert.deepEqual(
      d.container.boundsArea,
      bounds,
      'Caller position leaked into extraction bounds',
    );
    assert.ok(count > 1);
    d.destroy();
    api.clearPortraitCache(renderer);
    pixi.Assets.load = load;
  });
  test('source mask siblings preserve independent transforms and zero-alpha placements', async () => {
    // A synthetic display list exercises masking even when the authored portrait's stopped
    // initial state leaves Symbol45 without a visible target. Restore the shared source afterwards.
    const root = api.Symbol460;
    const original = { parts: root.parts, frames: root.frames };
    const svg = {
      type: 'svg',
      name: 'fixture-art',
      svg: '<svg width="4" height="4"/>',
      offset: { x: 0, y: 0 },
    };
    const leaf = (name) => ({
      type: 'symbol',
      name,
      parts: [svg],
      frames: [[{ name: svg.name }]],
    });
    try {
      root.parts = [leaf('Symbol998'), leaf('Symbol999')];
      root.frames = [
        [
          {
            name: 'Symbol998',
            transform: { tx: 10, ty: 20 },
            maskedBy: 999,
            colorTransform: { multiply: [1, 1, 1, 0] },
          },
          {
            name: 'Symbol999',
            transform: { tx: 3, ty: 4 },
            isMask: true,
          },
        ],
      ];
      pixi.Assets.load = async () => texture();
      const d = new api.BruteDisplay({
        renderer,
        ...appearance('male'),
        presentation: false,
      });
      await d.ready;
      const target = d.container.children[0].children.find((node) => node.label === 'Symbol998');
      assert.equal(target.mask.parent, target.parent);
      assert.equal(target.x, 10);
      assert.equal(target.mask.x, 3);
      assert.equal(target.mask.y, 4);
      assert.equal(target.filters[0].matrix[18], 0);
      d.destroy();
    } finally {
      root.parts = original.parts;
      root.frames = original.frames;
      pixi.Assets.load = load;
    }
  });
  test('an unset highlight produces only one presentation outline; a newer successful update wins', async () => {
    pixi.Assets.load = async () => texture();
    const config = appearance('male');
    const d = new api.BruteDisplay({ renderer, ...config });
    await d.ready;
    const active = (node) => (node.visible ? [node, ...node.children.flatMap(active)] : []);
    assert.equal(
      active(d.container).reduce((n, node) => n + (node.filters?.length || 0), 0),
      1,
    );
    const first = d.updateAppearance({ ...config, scale: 3.625 });
    const second = d.updateAppearance({ ...config, gender: 'female' });
    await assert.rejects(first, { name: 'AbortError' });
    await second;
    assert.equal(d.appearance.gender, 'female');
    assert.ok(d.svgs.length > 10);
    d.destroy();
    pixi.Assets.load = load;
  });
  test('variant eviction bounds repeated color edits without destroying active borrowers', async () => {
    pixi.Assets.load = async () => texture();
    const config = appearance('male');
    const d = new api.BruteDisplay({ renderer, ...config });
    try {
      await d.ready;
      for (let index = 0; index < 48; index++) {
        await d.setColors({
          ...config.colors,
          col3: `#${(index * 511).toString(16).padStart(6, '0')}`,
        });
      }

      assert.ok(api.portraitCacheStats(renderer).variants <= 128);
      assert.ok(d.svgs.every((sprite) => !sprite.texture.destroyed));
      assert.ok(api.portraitCacheStats(renderer).borrowedVariants > 0);
    } finally {
      d.destroy();
      api.clearPortraitCache(renderer);
      pixi.Assets.load = load;
    }

    assert.equal(api.portraitCacheStats(renderer).borrowedVariants, 0);
  });
};
