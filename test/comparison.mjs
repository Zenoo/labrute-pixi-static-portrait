import { Container, Rectangle } from 'pixi.js';
import { BruteDisplay } from 'labrute-pixi-static-portrait';
let player;
let loading;

async function ruffle() {
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      window.RufflePlayer = {
        config: {
          publicPath: '/ruffle/',
          autoplay: 'off',
          unmuteOverlay: 'hidden',
          wmode: 'transparent',
          preferredRenderer: 'wgpu-webgl',
          allowScriptAccess: false,
          contextMenu: 'off',
          letterbox: 'off',
        },
      };
      const script = document.createElement('script');
      script.src = '/ruffle/ruffle.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Local Ruffle failed to load'));
      document.head.appendChild(script);
    });
  }

  await loading;
  if (!player) {
    player = window.RufflePlayer.newest().createPlayer();
    Object.assign(player.style, {
      width: '640px',
      height: '800px',
      position: 'absolute',
      opacity: '0',
      pointerEvents: 'none',
    });
    document.body.appendChild(player);
  }

  return player;
}

const canvas = () => Object.assign(document.createElement('canvas'), { width: 640, height: 800 });

export async function compare(renderer, input) {
  const scale = input.scale ?? 3;
  const facing = input.facing === 'right' ? -1 : 1;
  const originX = 320 - 45 * scale * facing;
  const originY = 20;
  const display = new BruteDisplay({
    renderer,
    ...input,
    presentation: false,
    recolorIrises: false,
  });
  const stage = new Container();
  stage.addChild(display.container);
  display.container.position.set(originX, originY);
  let pixi;
  try {
    await display.ready;
    pixi = renderer.extract.canvas({ target: stage, frame: new Rectangle(0, 0, 640, 800) });
  } finally {
    display.destroy();
    stage.destroy();
  }

  const response = await fetch('/comparison/portrait.swf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symbolId: input.gender === 'male' ? 460 : 752,
      frame: 0,
      parts: input.parts,
      colors: input.colors,
      facing: input.facing,
      scale,
      width: 640,
      height: 800,
      originX,
      originY,
    }),
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }

  const p = await ruffle();
  await p.load({ data: new Uint8Array(await response.arrayBuffer()), autoplay: 'off' });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Frozen SWF did not initialize')), 15000);
    p.traceObserver = (message) => {
      if (message === `source-ready:${input.gender === 'male' ? 460 : 752}:0`) {
        clearTimeout(timer);
        resolve();
      }
    };
    p.play();
  });
  p.pause();
  p.traceObserver = null;
  // Let the stopped display list reach the browser canvas.
  await new Promise((resolve) => setTimeout(resolve, 100));
  const source = canvas();
  const actual = canvas();
  const difference = canvas();
  const overlay = canvas();
  source.getContext('2d').drawImage(p.shadowRoot.querySelector('canvas'), 0, 0, 640, 800);
  actual.getContext('2d').drawImage(pixi, 0, 0, 640, 800);
  const a = source.getContext('2d').getImageData(0, 0, 640, 800).data;
  const b = actual.getContext('2d').getImageData(0, 0, 640, 800).data;
  const diff = difference.getContext('2d').createImageData(640, 800);
  let occupied = 0;
  let changed = 0;
  let error = 0;
  for (let i = 0; i < a.length; i += 4) {
    let delta = Math.abs(a[i + 3] - b[i + 3]);
    for (let c = 0; c < 3; c++) {
      delta = Math.max(delta, Math.abs((a[i + c] * a[i + 3]) / 255 - (b[i + c] * b[i + 3]) / 255));
    }

    if (a[i + 3] || b[i + 3]) {
      occupied++;
    }

    if (delta > 24) {
      changed++;
    }

    error += delta;
    diff.data.set([255, 0, 100, Math.min(255, delta * 3)], i);
  }

  difference.getContext('2d').putImageData(diff, 0, 0);
  const ctx = overlay.getContext('2d');
  ctx.drawImage(source, 0, 0);
  ctx.globalAlpha = 0.5;
  ctx.drawImage(actual, 0, 0);
  return {
    source,
    actual,
    difference,
    overlay,
    report: {
      appearance: input,
      occupied,
      changed,
      changedRatio: changed / Math.max(1, occupied),
      meanError: error / (640 * 800),
      threshold: 24,
      reference:
        'Original SWF vector records; explicit decoded selectors/colors; ' +
        'no original ActionScript decoder; presentation and iris enhancement disabled',
    },
  };
}
