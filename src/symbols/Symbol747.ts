// Generated from perso.swf by npm run export:swf.
import type { FramePart, Symbol } from '../common';
import { Symbol741 } from './Symbol741';
import { Symbol743 } from './Symbol743';
import { Symbol745 } from './Symbol745';
import { Symbol746 } from './Symbol746';

const placement0: FramePart = {
  "name": "Symbol743",
  "colorIdx": "_col3",
  "transform": {
    "a": 0.961578369140625,
    "b": -0.1221160888671875,
    "c": 0.2364501953125,
    "d": 1.0099334716796875
  }
};

const placement1: FramePart = {
  "name": "Symbol741",
  "colorIdx": "_col2",
  "transform": {
    "a": 0.961578369140625,
    "b": -0.1221160888671875,
    "c": 0.2364501953125,
    "d": 1.0099334716796875,
    "tx": -1.25,
    "ty": -3.7
  }
};

export const Symbol747: Symbol = {
  "type": "symbol",
  "name": "Symbol747",
  "parts": [
    Symbol741,
    Symbol743,
    Symbol745,
    Symbol746
  ],
  "frames": [
    [
      placement0,
      placement1
    ],
    [
      placement0,
      placement1,
      {
        "name": "Symbol746"
      },
      {
        "name": "Symbol745",
        "colorIdx": "_col4",
        "transform": {
          "tx": -1.15,
          "ty": 7.1
        }
      }
    ]
  ]
};
