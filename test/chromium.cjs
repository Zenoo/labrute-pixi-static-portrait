const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

/** Minimal Chrome DevTools client; the comparison tests need no browser driver. */
module.exports = async function launchChromium(output) {
  const executable =
    process.env.BROWSER_BIN ||
    [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      '/usr/bin/chromium',
      '/usr/bin/google-chrome',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ].find((candidate) => fs.existsSync(candidate));

  if (!executable) {
    throw new Error('Set BROWSER_BIN to an installed Chromium browser');
  }

  fs.mkdirSync(output, { recursive: true });
  const profile = fs.mkdtempSync(path.join(output, 'chrome-'));
  const child = spawn(
    executable,
    [
      '--headless=new',
      '--disable-gpu-sandbox',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-extensions',
      '--disable-component-update',
      '--enable-unsafe-swiftshader',
      '--use-angle=swiftshader',
      '--remote-debugging-port=0',
      // Automated frames have no trusted click; let Ruffle finish its silent
      // AudioContext resume before its next movie replaces that context.
      '--autoplay-policy=no-user-gesture-required',
      ...(process.env.BROWSER_NO_SANDBOX === '1' ? ['--no-sandbox'] : []),
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { windowsHide: true },
  );
  let socket;
  const pending = new Map();
  let sequence = 0;

  async function close() {
    socket?.close();
    child.kill();
    for (const { reject, timer } of pending.values()) {
      clearTimeout(timer);
      reject(new Error('Chromium closed'));
    }

    pending.clear();
    if (child.exitCode === null) {
      await Promise.race([
        new Promise((resolve) => child.once('exit', resolve)),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
    }

    if (!path.resolve(profile).startsWith(path.resolve(output) + path.sep)) {
      throw new Error('Invalid browser profile path');
    }

    try {
      fs.rmSync(profile, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 200,
      });
    } catch (error) {
      if (child.exitCode !== null) {
        throw error;
      }
    }
  }

  try {
    const endpoint = await new Promise((resolve, reject) => {
      let stderr = '';
      const timer = setTimeout(
        () => reject(new Error(`Chrome startup timed out: ${stderr}`)),
        15000,
      );
      child.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
      child.stderr.on('data', (chunk) => {
        stderr += chunk;
        const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);

        if (match) {
          clearTimeout(timer);
          resolve(match[1]);
        }
      });
    });
    const port = new URL(endpoint).port;
    const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    socket = new WebSocket(pages.find((page) => page.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });

    const errors = [];
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      const callback = pending.get(message.id);

      if (callback) {
        pending.delete(message.id);
        clearTimeout(callback.timer);
        if (message.error) {
          callback.reject(new Error(JSON.stringify(message.error)));
        } else {
          callback.resolve(message.result);
        }
      } else if (message.method === 'Runtime.exceptionThrown') {
        const details = message.params.exceptionDetails;
        errors.push({ message: details.exception?.description ?? details.text, url: details.url });
      } else if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
        errors.push(message.params.args.map((argument) => argument.value ?? argument.description));
      }
    });

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++sequence;
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`Chrome command timed out: ${method}`));
        }, 180000);
        pending.set(id, {
          resolve,
          reject,
          timer,
        });
        socket.send(
          JSON.stringify({
            id,
            method,
            params,
          }),
        );
      });
    }

    await send('Runtime.enable');

    return {
      send,
      errors,
      close,
      async evaluate(expression) {
        const result = await send('Runtime.evaluate', {
          expression,
          awaitPromise: true,
          returnByValue: true,
        });

        if (result.exceptionDetails) {
          throw new Error(JSON.stringify(result.exceptionDetails));
        }

        return result.result.value;
      },
    };
  } catch (error) {
    await close();
    throw error;
  }
};
