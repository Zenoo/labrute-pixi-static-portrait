// Generated from perso.swf by npm run export:swf.
import type { FramePart, Symbol } from '../common';
import { Symbol514 } from './Symbol514';
import { Symbol585 } from './Symbol585';

const placement0: FramePart = {
  "name": "Symbol585",
  "partIdx": "_p7",
  "transform": {
    "tx": 0.55,
    "ty": 1.55
  }
};

const placement1: FramePart = {
  "name": "Symbol514",
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

export const Symbol586: Symbol = {
  "type": "symbol",
  "name": "Symbol586",
  "parts": [
    Symbol514,
    Symbol585
  ],
  "frames": [
    frame0,
    frame0
  ]
};
