// Generated from perso.swf by npm run export:swf.
import type { FramePart, Symbol } from '../common';
import { Symbol536 } from './Symbol536';
import { Symbol538 } from './Symbol538';
import { Symbol604 } from './Symbol604';

const placement0: FramePart = {
  "name": "Symbol604",
  "partIdx": "_p7",
  "transform": {
    "tx": -0.05,
    "ty": 12.75
  }
};

const placement1: FramePart = {
  "name": "Symbol536",
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

export const Symbol605: Symbol = {
  "type": "symbol",
  "name": "Symbol605",
  "parts": [
    Symbol536,
    Symbol538,
    Symbol604
  ],
  "frames": [
    [
      placement0,
      {
        "name": "Symbol538",
        "colorIdx": "_col3",
        "transform": {
          "tx": 0.1,
          "ty": -0.3
        }
      },
      placement1
    ],
    [
      placement0,
      placement1
    ]
  ]
};
