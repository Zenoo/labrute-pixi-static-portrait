// Generated from perso.swf by npm run export:swf.
import type { FramePart, Symbol } from '../common';
import { Symbol490 } from './Symbol490';
import { Symbol748 } from './Symbol748';

const placement0: FramePart = {
  "name": "Symbol748",
  "partIdx": "_p7",
  "transform": {
    "tx": 1.9,
    "ty": -0.5
  }
};

const placement1: FramePart = {
  "name": "Symbol490",
  "colorIdx": "_col0",
  "colorTransform": {
    "add": [
      -16,
      -50,
      -80,
      0
    ]
  }
};

const frame0: FramePart[] = [
  placement0,
  placement1
];

export const Symbol749: Symbol = {
  "type": "symbol",
  "name": "Symbol749",
  "parts": [
    Symbol490,
    Symbol748
  ],
  "frames": [
    frame0,
    frame0
  ]
};
