// Generated from perso.swf by npm run export:swf.
import type { FramePart, Symbol } from '../common';
import { Symbol274 } from './Symbol274';
import { Symbol276 } from './Symbol276';
import { Symbol328 } from './Symbol328';
import { Symbol320 } from './Symbol320';

const placement0: FramePart = {
  "name": "Symbol328",
  "partIdx": "_p7",
  "transform": {
    "tx": 16.6,
    "ty": 15.15
  }
};

const placement1: FramePart = {
  "name": "Symbol276",
  "colorIdx": "_col0",
  "transform": {
    "a": 0.9076690673828125,
    "d": 0.9076690673828125,
    "tx": 18,
    "ty": 15.9
  },
  "colorTransform": {
    "add": [
      -16,
      -50,
      -80,
      0
    ]
  }
};

const placement2: FramePart = {
  "name": "Symbol274",
  "partIdx": "_p7b",
  "transform": {
    "tx": 16.6,
    "ty": 15.15
  }
};

export const Symbol329: Symbol = {
  "type": "symbol",
  "name": "Symbol329",
  "parts": [
    Symbol274,
    Symbol276,
    Symbol328,
    Symbol320
  ],
  "frames": [
    [
      placement0,
      placement1,
      placement2
    ],
    [
      placement0,
      {
        "name": "Symbol320",
        "colorIdx": "_col4",
        "transform": {
          "a": 0.9076690673828125,
          "d": 0.9076690673828125,
          "tx": 18,
          "ty": 15.9
        },
        "colorTransform": {
          "add": [
            -110,
            -90,
            -80,
            0
          ]
        }
      },
      placement1,
      placement2
    ]
  ]
};
