// Generated from perso.swf by npm run export:swf.
import type { FramePart, Symbol } from '../common';
import { Symbol617 } from './Symbol617';
import { Symbol619 } from './Symbol619';
import { Symbol620 } from './Symbol620';
import { Symbol622 } from './Symbol622';

const placement0: FramePart = {
  "name": "Symbol619",
  "transform": {
    "tx": -32.85,
    "ty": -12.05
  },
  "colorTransform": {
    "add": [
      -87,
      -148,
      -159,
      0
    ]
  }
};

const placement1: FramePart = {
  "name": "Symbol617",
  "colorIdx": "_col2",
  "transform": {
    "tx": 2.75,
    "ty": 0.15
  }
};

export const Symbol623: Symbol = {
  "type": "symbol",
  "name": "Symbol623",
  "parts": [
    Symbol617,
    Symbol619,
    Symbol620,
    Symbol622
  ],
  "frames": [
    [
      {
        "name": "Symbol620"
      },
      placement0,
      placement1
    ],
    [
      {
        "name": "Symbol620"
      },
      placement0,
      {
        "name": "Symbol622",
        "transform": {
          "tx": -26.6,
          "ty": -18.7
        }
      },
      placement1
    ]
  ]
};
