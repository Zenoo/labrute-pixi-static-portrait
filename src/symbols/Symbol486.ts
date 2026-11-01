// Generated from perso.swf by npm run export:swf.
import type { FramePart, Symbol } from '../common';
import { Symbol483 } from './Symbol483';
import { Symbol484 } from './Symbol484';
import { Symbol485 } from './Symbol485';

const placement0: FramePart = {
  "name": "Symbol484",
  "partIdx": "_p7",
  "transform": {
    "tx": 0.3,
    "ty": 3.3
  }
};

const placement1: FramePart = {
  "name": "Symbol483",
  "colorIdx": "_col0",
  "transform": {
    "a": 0.955169677734375,
    "b": -0.2927398681640625,
    "c": 0.2927398681640625,
    "d": 0.955169677734375,
    "tx": -4.2,
    "ty": -13.7
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

export const Symbol486: Symbol = {
  "type": "symbol",
  "name": "Symbol486",
  "parts": [
    Symbol483,
    Symbol484,
    Symbol485
  ],
  "frames": [
    [
      placement0,
      placement1
    ],
    [
      placement0,
      {
        "name": "Symbol485",
        "colorIdx": "_col2",
        "transform": {
          "a": 0.955169677734375,
          "b": -0.2927398681640625,
          "c": 0.2927398681640625,
          "d": 0.955169677734375,
          "tx": -4.2,
          "ty": -13.7
        },
        "colorTransform": {
          "add": [
            -16,
            -50,
            -80,
            0
          ]
        }
      },
      placement1
    ]
  ]
};
