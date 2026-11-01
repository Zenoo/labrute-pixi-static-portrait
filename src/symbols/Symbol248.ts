// Generated from perso.swf by npm run export:swf.
import type { FramePart, Symbol } from '../common';
import { Symbol242 } from './Symbol242';
import { Symbol243 } from './Symbol243';
import { Symbol245 } from './Symbol245';
import { Symbol247 } from './Symbol247';

const placement0: FramePart = {
  "name": "Symbol245",
  "partIdx": "_p1a",
  "transform": {
    "b": 0.1340179443359375,
    "tx": -1.25,
    "ty": -6.65
  }
};

const placement1: FramePart = {
  "name": "Symbol242",
  "colorIdx": "_col2",
  "transform": {
    "a": 0.99102783203125,
    "b": 0.2448577880859375,
    "c": -0.0366363525390625,
    "tx": 1.1,
    "ty": -0.65
  }
};

export const Symbol248: Symbol = {
  "type": "symbol",
  "name": "Symbol248",
  "parts": [
    Symbol242,
    Symbol243,
    Symbol245,
    Symbol247
  ],
  "frames": [
    [
      placement0,
      {
        "name": "Symbol243"
      },
      placement1
    ],
    [
      placement0,
      {
        "name": "Symbol247",
        "partIdx": "_p1b",
        "transform": {
          "b": 0.2081298828125,
          "tx": 0.2,
          "ty": 3.7
        }
      },
      {
        "name": "Symbol243"
      },
      placement1
    ]
  ]
};
