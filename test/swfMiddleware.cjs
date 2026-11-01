const fs = require('node:fs');
const path = require('node:path');
const { makeReference } = require('../scripts/swf/reference.cjs');
const source = fs.readFileSync(path.resolve(__dirname, '../src/swf/perso.swf'));
module.exports = (app) => {
  app.post('/comparison/portrait.swf', (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 16384) {
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        const options = JSON.parse(body);
        if (
          ![460, 752].includes(options.symbolId) ||
          options.frame !== 0 ||
          options.width !== 640 ||
          options.height !== 800 ||
          !Number.isFinite(options.scale) ||
          options.scale < 0.25 ||
          options.scale > 4
        ) {
          throw new Error('Invalid portrait reference');
        }

        res.type('application/x-shockwave-flash').send(makeReference(source, options));
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
  });
};
