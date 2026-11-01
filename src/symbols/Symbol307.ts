// Generated from perso.swf by npm run export:swf.
import type { FramePart, Symbol } from '../common';
import { Symbol303 } from './Symbol303';
import { Symbol305 } from './Symbol305';
import { Symbol306 } from './Symbol306';

const placement0: FramePart = {
  "name": "Symbol305",
  "colorIdx": "_col2",
  "transform": {
    "tx": -3.45,
    "ty": 1.65
  }
};

const placement1: FramePart = {
  "name": "Symbol303",
  "colorIdx": "_col3",
  "transform": {
    "tx": 0.3,
    "ty": -1.8
  }
};

const frame0: FramePart[] = [
  {
    "name": "Symbol306"
  },
  placement0,
  placement1
];

export const Symbol307: Symbol = {
  "type": "symbol",
  "name": "Symbol307",
  "parts": [
    Symbol303,
    Symbol305,
    Symbol306
  ],
  "frames": [
    frame0,
    frame0
  ]
};
