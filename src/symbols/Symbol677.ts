// Generated from perso.swf by npm run export:swf.
import type { FramePart, Symbol } from '../common';
import { Symbol640 } from './Symbol640';
import { Symbol642 } from './Symbol642';
import { Symbol676 } from './Symbol676';

const placement0: FramePart = {
  "name": "Symbol676",
  "partIdx": "_p7",
  "transform": {
    "tx": 16.6,
    "ty": 15.15
  }
};

const placement1: FramePart = {
  "name": "Symbol642",
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
  "name": "Symbol640",
  "partIdx": "_p7b",
  "transform": {
    "tx": 13.35,
    "ty": 15.15
  }
};

const frame0: FramePart[] = [
  placement0,
  placement1,
  placement2
];

export const Symbol677: Symbol = {
  "type": "symbol",
  "name": "Symbol677",
  "parts": [
    Symbol640,
    Symbol642,
    Symbol676
  ],
  "frames": [
    frame0,
    frame0
  ]
};
