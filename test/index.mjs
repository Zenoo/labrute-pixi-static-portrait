import { autoDetectRenderer, Container } from 'pixi.js';
import { BruteDisplay, clearPortraitCache } from 'labrute-pixi-static-portrait';
import { appearance, partKeys, colorKeys, partCounts, clothingPresets } from './appearance.mjs';
import { compare } from './comparison.mjs';
import {
  defaultColorString,
  isBodyString,
  isColorString,
  readBodyString,
  readColorString,
  writeBodyString,
} from './appearanceStrings.mjs';

const $ = (id) => document.getElementById(id);

// The playground owns the renderer; BruteDisplay only owns its portrait tree.
const renderer = await autoDetectRenderer({
  width: 640,
  height: 520,
  backgroundAlpha: 0,
  antialias: true,
  resolution: 1,
  preference: 'webgl',
});
renderer.canvas.setAttribute('aria-label', 'Static LaBrute character portrait');
$('preview').appendChild(renderer.canvas);

const stage = new Container();
// Encoded strings belong to the playground adapter, not the package renderer.
let colorString = defaultColorString('male');
let state = defaultState();
let display;
let serial = Promise.resolve();
let reportUrl;
let renderTimer;
let operation = false;

function defaultState(gender = 'male') {
  return {
    ...appearance(gender),
    colors: readColorString(gender, defaultColorString(gender)),
  };
}

const status = (message, error = false) => {
  $('status').textContent = message;
  $('status').dataset.state = error ? 'error' : 'ready';
};

// Rendering and Ruffle captures share a renderer, so run them in order.
const enqueue = (work) => {
  serial = serial.then(work).catch((error) => {
    status(error.message || String(error), true);
    console.error(error);
  });
  return serial;
};

function positionPortrait() {
  if (!display || display.container.destroyed || !display.svgs.length) {
    return;
  }

  // Fit the stage rather than the portrait, preserving the selected PNG scale.
  const bounds = display.container.getLocalBounds();
  const fit = Math.max(
    0.01,
    Math.min(1, (renderer.width - 48) / bounds.width, (renderer.height - 48) / bounds.height),
  );
  stage.scale.set(fit);
  display.container.position.set(
    renderer.width / (2 * fit) - bounds.x - bounds.width / 2,
    renderer.height / (2 * fit) - bounds.y - bounds.height / 2,
  );
  renderer.render(stage);
}

const resize = new ResizeObserver(() => {
  renderer.resize($('preview').clientWidth, $('preview').clientHeight);
  positionPortrait();
});
resize.observe($('preview'));

function labelForColor(key) {
  const group = key.startsWith('col0') ? 'Skin' : key.startsWith('col1') ? 'Hair' : 'Clothing';
  return group + ' ' + key.slice(3).toUpperCase();
}

function syncForm() {
  $('gender').value = state.gender;
  $('facing').value = state.facing;
  // Imported appearances may use a scale outside the preset dropdown choices.
  if (![...$('scale').options].some((option) => Number(option.value) === state.scale)) {
    $('scale').add(new Option(state.scale + '×', String(state.scale)));
  }

  $('scale').value = String(state.scale);
  $('highlight').value = state.highlightColorName || '';
  $('body-string').value = writeBodyString(state.parts);
  $('body-string').setCustomValidity('');
  $('color-string').value = colorString;
  $('color-string').setCustomValidity('');
  const counts = partCounts(state.gender);

  // Show the effective source variation while retaining the raw encoded selector values.
  for (const key of partKeys) {
    $('part-' + key).value = String(state.parts[key] % counts[key]);
  }

  for (const key of colorKeys) {
    $('color-' + key).value = state.colors[key];
    $('value-' + key).textContent = state.colors[key];
  }

  const presets = clothingPresets(state.gender);
  $('clothing').value = String(
    presets.findIndex((preset) =>
      Object.entries(preset.parts).every(
        ([key, value]) => state.parts[key] % counts[key] === value,
      ),
    ),
  );
}

async function render() {
  // Snapshot the form so edits during loading belong to the next render.
  const input = structuredClone(state);
  status('Updating preview…');
  if (!display) {
    display = new BruteDisplay({ renderer, ...input });
    await display.ready;
    stage.addChild(display.container);
  } else {
    await display.updateAppearance(input);
  }

  positionPortrait();
  status('Preview up to date');
  $('download').disabled = false;
}

function scheduleRender() {
  // Coalesce rapid color-picker input instead of queuing every intermediate color.
  clearTimeout(renderTimer);
  status('Updating preview…');
  renderTimer = setTimeout(() => enqueue(render), 60);
}

function controls() {
  const counts = partCounts(state.gender);
  const bodyLabels = {
    p1: 'Clothing details (1)',
    p7: 'Clothing set (7)',
    p7b: 'Legwear set (7B)',
  };
  $('parts').replaceChildren();
  for (const key of partKeys) {
    const label = document.createElement('label');
    label.textContent = bodyLabels[key] || 'Part ' + key.slice(1).toUpperCase();
    const select = document.createElement('select');
    select.id = 'part-' + key;
    select.disabled = counts[key] <= 1;
    for (let i = 0; i < counts[key]; i++) {
      select.add(new Option('Variation ' + i, String(i)));
    }

    select.onchange = () => {
      state.parts[key] = Number(select.value);
      syncForm();
      scheduleRender();
    };
    label.append(select);
    if (counts[key] <= 1) {
      const note = document.createElement('small');
      note.textContent = 'One source variation';
      label.append(note);
    }

    $('parts').append(label);
  }

  $('colors').replaceChildren();
  for (const key of colorKeys) {
    const label = document.createElement('label');
    label.className = 'color-field';
    const caption = document.createElement('span');
    caption.className = 'color-label';
    caption.textContent = labelForColor(key);
    const value = document.createElement('output');
    value.id = 'value-' + key;
    caption.append(value);
    const input = document.createElement('input');
    input.type = 'color';
    input.id = 'color-' + key;
    input.oninput = () => {
      state.colors[key] = input.value;
      syncForm();
      scheduleRender();
    };
    label.append(caption, input);
    $('colors').append(label);
  }

  const presets = clothingPresets(state.gender);
  $('clothing').replaceChildren(
    new Option('Custom combination', '-1'),
    ...presets.map((preset, i) => new Option(preset.label, String(i))),
  );
  $('clothing').onchange = () => {
    const preset = presets[Number($('clothing').value)];
    if (!preset) {
      return;
    }

    state.parts = { ...state.parts, ...preset.parts };
    syncForm();
    scheduleRender();
  };
  syncForm();
}

// Appearance edits update the form immediately and schedule one preview refresh.
$('highlight').append(...colorKeys.map((key) => new Option(labelForColor(key), key)));
$('gender').onchange = () => {
  colorString = defaultColorString($('gender').value);
  state = {
    ...defaultState($('gender').value),
    facing: state.facing,
    scale: state.scale,
    highlightColorName: state.highlightColorName,
  };
  controls();
  scheduleRender();
};
for (const [id, key] of [
  ['facing', 'facing'],
  ['scale', 'scale'],
  ['highlight', 'highlightColorName'],
]) {
  $(id).onchange = () => {
    state[key] = id === 'scale' ? Number($(id).value) : $(id).value || undefined;
    syncForm();
    scheduleRender();
  };
}

function background() {
  // Background and grid are CSS-only; exported PNGs remain transparent.
  $('preview').classList.toggle('transparent', $('transparent').checked);
  $('preview').classList.toggle('grid', $('grid').checked);
  $('preview').style.backgroundColor = $('transparent').checked ? '' : $('background').value;
  $('background').disabled = $('transparent').checked;
}

$('transparent').onchange = background;
$('grid').onchange = background;
$('background').oninput = background;
$('reset').onclick = () => {
  colorString = defaultColorString('male');
  state = defaultState();
  controls();
  scheduleRender();
};
// Incomplete edits stay in their fields without changing the visible portrait.
$('body-string').oninput = () => {
  const value = $('body-string').value.trim();
  const valid = isBodyString(value);
  $('body-string').setCustomValidity(valid ? '' : 'Use 11 hexadecimal digits.');

  if (!valid) {
    status('Use a complete body string of 11 hexadecimal digits.', true);
    return;
  }

  state.parts = readBodyString(value);
  controls();
  scheduleRender();
};

$('color-string').oninput = () => {
  const value = $('color-string').value.trim();
  const valid = isColorString(value);
  $('color-string').setCustomValidity(valid ? '' : 'Use exactly 32 digits.');

  if (!valid) {
    status('Color string must contain 32 digits.', true);
    return;
  }

  colorString = value;
  state.colors = readColorString(state.gender, value);
  syncForm();
  scheduleRender();
};
$('download').onclick = () =>
  enqueue(async () => {
    clearTimeout(renderTimer);
    await render();
    const image = await renderer.extract.image({ target: display.container, format: 'png' });
    const link = document.createElement('a');
    link.href = image.src;
    link.download = state.gender + '-portrait.png';
    link.click();
  });

function saveReport(reports) {
  if (reportUrl) {
    URL.revokeObjectURL(reportUrl);
  }

  reportUrl = URL.createObjectURL(
    new Blob([JSON.stringify(reports, null, 2)], { type: 'application/json' }),
  );
  $('report').href = reportUrl;
  $('report').download = 'portrait-comparison.json';
  $('report').hidden = false;
}

async function capture(input) {
  const result = await compare(renderer, input);
  const titles = {
    source: 'SWF / Ruffle',
    actual: 'Pixi',
    overlay: 'Source overlay',
    difference: 'Pixel difference',
  };
  $('captures').replaceChildren(
    ...Object.keys(titles).map((key) => {
      const box = document.createElement('figure');
      box.className = 'capture';
      const title = document.createElement('figcaption');
      title.textContent = titles[key];
      box.append(title, result[key]);
      return box;
    }),
  );
  $('comparison-empty').hidden = true;
  $('comparison-status').textContent =
    (result.report.changedRatio * 100).toFixed(2) +
    '% of occupied pixels differ · tolerance ' +
    result.report.threshold +
    '/255';
  $('comparison-status').dataset.state = 'ready';
  return result.report;
}

async function compareCases(cases) {
  if (operation) {
    return;
  }

  operation = true;
  $('compare').disabled = true;
  $('cases').disabled = true;
  try {
    const reports = [];
    for (let i = 0; i < cases.length; i++) {
      $('comparison-status').textContent =
        'Comparing appearance ' + (i + 1) + ' of ' + cases.length + '…';
      reports.push(await capture(cases[i]));
    }

    saveReport(reports);
  } catch (error) {
    $('comparison-status').textContent = error.message;
    $('comparison-status').dataset.state = 'error';
  } finally {
    // Extraction renders a separate tree; repaint the live preview afterward.
    operation = false;
    $('compare').disabled = false;
    $('cases').disabled = false;
    positionPortrait();
  }
}

$('compare').onclick = () => {
  const input = structuredClone(state);
  enqueue(() => compareCases([input]));
};
$('cases').onclick = () =>
  enqueue(() =>
    compareCases(
      ['male', 'female'].flatMap((gender) =>
        ['left', 'right'].map((facing) => ({ ...appearance(gender), facing })),
      ),
    ),
  );
$('actual-size').onchange = () =>
  $('captures').classList.toggle('actual-size', $('actual-size').checked);

// Expose the current state and queue to browser checks without adding a render loop.
window.portraitPlayground = {
  renderer,
  capture,
  get display() {
    return display;
  },
  get state() {
    return state;
  },
  get settled() {
    return serial;
  },
};

window.addEventListener('beforeunload', () => {
  clearTimeout(renderTimer);
  resize.disconnect();
  display?.destroy();
  clearPortraitCache(renderer);
  renderer.destroy();
  if (reportUrl) {
    URL.revokeObjectURL(reportUrl);
  }
});

controls();
background();
await render();
