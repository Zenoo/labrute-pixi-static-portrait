// Generated from perso.swf by npm run export:swf.
import type { FramePart, Symbol } from '../common';
import { Symbol200 } from './Symbol200';
import { Symbol204 } from './Symbol204';

const placement0: FramePart = {
  "name": "Symbol204",
  "partIdx": "_p7",
  "transform": {
    "tx": 2.35,
    "ty": 2.4
  }
};

const placement1: FramePart = {
  "name": "Symbol200",
  "colorIdx": "_col3",
  "transform": {
    "tx": 2.65,
    "ty": -5.9
  }
};

const frame0: FramePart[] = [
  placement0,
  placement1
];

export const Symbol205: Symbol = {
  "type": "symbol",
  "name": "Symbol205",
  "parts": [
    Symbol200,
    Symbol204
  ],
  "frames": [
    frame0,
    frame0
  ]
};
