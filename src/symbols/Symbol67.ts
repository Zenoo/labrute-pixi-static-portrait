// Generated from perso.swf by npm run export:swf.
import type { FramePart, Symbol } from '../common';
import { Symbol59 } from './Symbol59';
import { Symbol64 } from './Symbol64';
import { Symbol66 } from './Symbol66';

const placement0: FramePart = {
  "name": "Symbol64",
  "partIdx": "_p7",
  "transform": {
    "tx": 0.3,
    "ty": 3.3
  }
};

const placement1: FramePart = {
  "name": "Symbol59",
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

export const Symbol67: Symbol = {
  "type": "symbol",
  "name": "Symbol67",
  "parts": [
    Symbol59,
    Symbol64,
    Symbol66
  ],
  "frames": [
    [
      placement0,
      placement1
    ],
    [
      placement0,
      {
        "name": "Symbol66",
        "colorIdx": "_col4",
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
