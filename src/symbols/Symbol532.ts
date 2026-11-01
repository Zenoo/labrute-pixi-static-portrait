// Generated from perso.swf by npm run export:swf.
import type { FramePart, Symbol } from '../common';
import { Symbol514 } from './Symbol514';
import { Symbol531 } from './Symbol531';

const placement0: FramePart = {
  "name": "Symbol531",
  "partIdx": "_p7",
  "transform": {
    "a": 0.9969329833984375,
    "b": -0.0749359130859375,
    "c": 0.0749359130859375,
    "d": 0.9969329833984375,
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

export const Symbol532: Symbol = {
  "type": "symbol",
  "name": "Symbol532",
  "parts": [
    Symbol514,
    Symbol531
  ],
  "frames": [
    frame0,
    frame0
  ]
};
