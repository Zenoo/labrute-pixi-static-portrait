// Generated from perso.swf by npm run export:swf.
import type { FramePart, Symbol } from '../common';
import { Symbol320 } from './Symbol320';
import { Symbol322 } from './Symbol322';
import { Symbol324 } from './Symbol324';
import { Symbol326 } from './Symbol326';

const placement0: FramePart = {
  "name": "Symbol322",
  "colorIdx": "_col4",
  "transform": {
    "a": 0.998138427734375,
    "b": 0.0577392578125,
    "c": -0.0577392578125,
    "d": 0.998138427734375,
    "tx": -4.8,
    "ty": 16.45
  }
};

const placement1: FramePart = {
  "name": "Symbol320",
  "colorIdx": "_col2",
  "transform": {
    "a": 0.9076690673828125,
    "d": 0.9076690673828125,
    "tx": 0.9,
    "ty": -0.8
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

export const Symbol327: Symbol = {
  "type": "symbol",
  "name": "Symbol327",
  "parts": [
    Symbol320,
    Symbol322,
    Symbol324,
    Symbol326
  ],
  "frames": [
    [
      placement0,
      placement1
    ],
    [
      {
        "name": "Symbol326",
        "transform": {
          "a": 0.955596923828125,
          "b": 0.0972900390625,
          "c": -0.0378570556640625,
          "d": 1.0347747802734375,
          "tx": -1.4,
          "ty": -0.75
        },
        "colorTransform": {
          "add": [
            -108,
            -113,
            -108,
            0
          ]
        }
      },
      {
        "name": "Symbol324",
        "colorIdx": "_col3b",
        "transform": {
          "a": 0.955596923828125,
          "b": 0.0972900390625,
          "c": -0.0378570556640625,
          "d": 1.0347747802734375,
          "tx": -0.05,
          "ty": 1
        }
      },
      placement0,
      placement1
    ]
  ]
};
