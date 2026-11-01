// Generated from perso.swf by npm run export:swf.
import type { FramePart, Symbol } from '../common';
import { Symbol502 } from './Symbol502';
import { Symbol503 } from './Symbol503';
import { Symbol511 } from './Symbol511';

const placement0: FramePart = {
  "name": "Symbol511",
  "partIdx": "_p7",
  "transform": {
    "tx": 5.2,
    "ty": 0.75
  }
};

const placement1: FramePart = {
  "name": "Symbol503",
  "colorIdx": "_col0",
  "transform": {
    "tx": 4.3,
    "ty": -0.3
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
  "name": "Symbol502",
  "partIdx": "_p7b",
  "transform": {
    "tx": 4.95,
    "ty": 17.85
  }
};

const frame0: FramePart[] = [
  placement0,
  placement1,
  placement2
];

export const Symbol512: Symbol = {
  "type": "symbol",
  "name": "Symbol512",
  "parts": [
    Symbol502,
    Symbol503,
    Symbol511
  ],
  "frames": [
    frame0,
    frame0,
    frame0,
    frame0,
    frame0
  ]
};
