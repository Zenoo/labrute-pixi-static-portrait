const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const webpack = require('webpack');
const DevServer = require('webpack-dev-server');
const launch = require('./chromium.cjs');

// These functions are serialized into Chromium. Keep their dependencies local:
// document and window refer to the page, not this Node process.
async function checkPlayground() {
  const deadline = Date.now() + 60000;

  while (!window.portraitPlayground?.display?.svgs.length) {
    if (Date.now() > deadline) {
      throw new Error('Playground failed to load');
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  const gender = document.getElementById('gender');
  gender.value = 'female';
  gender.dispatchEvent(new Event('change'));

  while (window.portraitPlayground.display.appearance.gender !== 'female') {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  await window.portraitPlayground.display.ready;

  const change = (id, value, event = 'change') => {
    const input = document.getElementById(id);
    input.value = value;
    input.dispatchEvent(new Event(event, { bubbles: true }));
  };

  const waitReady = async () => {
    // Allow the form's debounce timer to enqueue work before awaiting the queue.
    await new Promise((resolve) => setTimeout(resolve, 100));
    await window.portraitPlayground.settled;
  };

  if (document.getElementById('part-p7').tagName !== 'SELECT') {
    throw new Error('Body variations are not dropdowns');
  }

  change('facing', 'right');
  change('scale', '2');
  await waitReady();

  change('gender', 'male');
  await waitReady();

  if (
    document.getElementById('facing').value !== 'right' ||
    document.getElementById('scale').value !== '2'
  ) {
    throw new Error('Gender change reset framing');
  }

  change('color-col3', '#bb1111', 'input');
  await waitReady();

  if (window.portraitPlayground.display.appearance.colors.col3 !== '#bb1111') {
    throw new Error('Live color edit did not render');
  }

  document.getElementById('reset').click();
  await waitReady();

  if (
    document.getElementById('scale').value !== '3' ||
    document.getElementById('facing').value !== 'left'
  ) {
    throw new Error('Reset left stale controls');
  }

  // Imports use the same encoded formats as the fighter playground, not JSON.
  change('body-string', '11111111111', 'input');
  await waitReady();

  if (window.portraitPlayground.display.appearance.parts.p3 !== 1) {
    throw new Error('Body string did not update the decoded appearance');
  }

  change('part-p7', '2');
  await waitReady();

  if (document.getElementById('body-string').value[8] !== '2') {
    throw new Error('Body dropdown did not update its encoded string');
  }

  change('color-string', '99'.repeat(16), 'input');
  await waitReady();

  if (window.portraitPlayground.display.appearance.colors.col3 !== '#000000') {
    throw new Error('Color string did not decode the palette selection');
  }

  change('body-string', 'invalid', 'input');
  change('color-string', '123', 'input');
  await waitReady();

  if (window.portraitPlayground.display.appearance.colors.col3 !== '#000000') {
    throw new Error('Incomplete color input replaced the valid appearance');
  }

  if (document.getElementById('body-string').validity.valid) {
    throw new Error('Incomplete body input was accepted');
  }

  document.getElementById('reset').click();
  await waitReady();

  return {
    gender: window.portraitPlayground.display.appearance.gender,
    sprites: window.portraitPlayground.display.svgs.length,
    clothingChoices: document.getElementById('clothing').options.length,
    status: document.getElementById('status').textContent,
  };
}

async function runBrowserFixture(mode) {
  const deadline = Date.now() + 60000;

  while (!window.runPortraitTests) {
    if (Date.now() > deadline) {
      throw new Error('Browser bundle failed to load');
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return window.runPortraitTests(mode);
}

async function measureMobileLayout() {
  // ResizeObserver updates the canvas after the emulated viewport changes.
  await new Promise((resolve) => setTimeout(resolve, 150));

  const preview = document.getElementById('preview').getBoundingClientRect();
  const sidebar = document.querySelector('aside').getBoundingClientRect();
  const canvas = document.querySelector('#preview canvas').getBoundingClientRect();

  return {
    overflow: document.documentElement.scrollWidth > innerWidth,
    previewFirst: preview.top < sidebar.top,
    previewWidth: preview.width,
    canvasWidth: canvas.width,
  };
}

async function main() {
  const mode = process.argv[2] || 'browser';
  const output = path.resolve('.validation', mode);
  fs.mkdirSync(output, { recursive: true });
  const config = require('../webpack.config.js')();
  if (mode !== 'playground') {
    config.entry = path.resolve(__dirname, 'fixtures/browser.mjs');
    config.plugins = [];
  }

  config.output = { path: output, filename: 'browser.js' };
  config.devtool = false;
  const compiler = webpack(config);
  let moduleNames = [];
  compiler.hooks.done.tap('portrait-module-identity', (stats) => {
    const walk = (modules) =>
      (modules || []).flatMap((module) => [module.name || '', ...walk(module.modules)]);
    moduleNames = walk(
      stats.toJson({
        all: false,
        modules: true,
        nestedModules: true,
      }).modules,
    );
  });
  const server = new DevServer(
    {
      ...config.devServer,
      port: 0,
      liveReload: false,
      devMiddleware: { stats: 'errors-only' },
      setupMiddlewares(middlewares, s) {
        config.devServer.setupMiddlewares(middlewares, s);
        if (mode !== 'playground') {
          s.app.get('/', (_req, res) =>
            res.send('<!doctype html><script src="/browser.js"></script>'),
          );
        }

        return middlewares;
      },
    },
    compiler,
  );
  let browser;
  try {
    await server.start();
    browser = await launch(output);
    if (mode === 'playground') {
      await browser.send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 1100,
        deviceScaleFactor: 1,
        mobile: false,
      });
    }

    await browser.send('Page.navigate', {
      url: `http://127.0.0.1:${server.server.address().port}`,
    });
    // Send readable, self-contained functions through the DevTools protocol.
    const expression =
      mode === 'playground'
        ? `(${checkPlayground.toString()})()`
        : `(${runBrowserFixture.toString()})(${JSON.stringify(mode)})`;
    const result = await browser.evaluate(expression);
    assert.ok(
      moduleNames.some((name) => name.replaceAll('\\', '/').includes('/pixi.js/lib/index.mjs')),
      'Missing peer ESM runtime',
    );
    assert.ok(
      !moduleNames.some((name) => /\/pixi\.js\/lib\/.*\.js$/.test(name.replaceAll('\\', '/'))),
      'CommonJS Pixi entered the browser graph',
    );
    const errors = browser.errors.filter(
      (error) => !JSON.stringify(error).includes('AudioContext'),
    );
    assert.deepEqual(errors, [], 'Browser errors');

    // Keep visual evidence alongside the responsive layout assertions.
    if (mode === 'playground') {
      const screenshot = await browser.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
      });
      fs.writeFileSync(path.join(output, 'desktop.png'), Buffer.from(screenshot.data, 'base64'));
      await browser.send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 1,
        mobile: true,
      });
      const mobile = await browser.evaluate(`(${measureMobileLayout.toString()})()`);
      assert.equal(mobile.overflow, false, 'Mobile page overflows horizontally');
      assert.equal(mobile.previewFirst, true, 'Mobile preview should precede settings');
      assert.ok(
        Math.abs(mobile.previewWidth - mobile.canvasWidth) < 2,
        'Preview canvas did not resize',
      );
      const screenshotMobile = await browser.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
      });
      fs.writeFileSync(
        path.join(output, 'mobile.png'),
        Buffer.from(screenshotMobile.data, 'base64'),
      );
      result.mobile = mobile;
    }
    // Store large image payloads as PNG files before writing the compact report.
    for (const [index, entry] of (result.results || []).entries()) {
      for (const name of ['source', 'actual', 'difference', 'overlay']) {
        fs.writeFileSync(
          path.join(output, `${index}-${name}.png`),
          Buffer.from(entry[name].split(',')[1], 'base64'),
        );
        delete entry[name];
      }
    }

    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(result, null, 2) + '\n');
    fs.writeFileSync(
      path.resolve('docs', `${mode}-results.json`),
      JSON.stringify(result, null, 2) + '\n',
    );
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser?.close();
    await server.stop();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
