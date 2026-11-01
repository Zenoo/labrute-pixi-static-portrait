// Generated from perso.swf by npm run export:swf.
import type { FramePart, Symbol } from '../common';
import { Symbol21 } from './Symbol21';
import { Symbol33 } from './Symbol33';
import { Symbol32 } from './Symbol32';

const placement0: FramePart = {
  "name": "Symbol33",
  "partIdx": "_p1",
  "transform": {
    "tx": 0.1,
    "ty": 5
  }
};

const placement1: FramePart = {
  "name": "Symbol21",
  "colorIdx": "_col2",
  "transform": {
    "a": 1.0095672607421875,
    "b": 0.124298095703125,
    "c": -0.1227569580078125,
    "d": 0.9970703125,
    "tx": 1.4,
    "ty": -12.5
  },
  "colorTransform": {
    "add": [
      -110,
      -90,
      -80,
      0
    ]
  }
};

export const Symbol429: Symbol = {
  "type": "symbol",
  "name": "Symbol429",
  "parts": [
    Symbol21,
    Symbol33,
    Symbol32
  ],
  "frames": [
    [
      placement0,
      placement1
    ],
    [
      {
        "name": "Symbol32",
        "colorIdx": "_col3",
        "transform": {
          "tx": 7.15,
          "ty": -5.6
        }
      },
      placement0,
      placement1
    ]
  ]
};
