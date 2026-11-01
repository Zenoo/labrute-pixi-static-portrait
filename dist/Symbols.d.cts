import * as pixi_js from 'pixi.js';
import { Renderer, Container, Sprite } from 'pixi.js';

type Svg = Readonly<{
    type: 'svg';
    name: string;
    svg: string;
    offset: Readonly<{
        x: number;
        y: number;
    }>;
}>;
type ColorOffset = Readonly<{
    r: number;
    g: number;
    b: number;
}>;
type FramePart = Readonly<{
    name: string;
    partIdx?: string;
    colorIdx?: string;
    transform?: Readonly<{
        tx?: number;
        ty?: number;
        a?: number;
        d?: number;
        b?: number;
        c?: number;
    }>;
    maskedBy?: number;
    isMask?: boolean;
    colorTransform?: Readonly<{
        multiply?: readonly number[];
        add?: readonly number[];
    }>;
    filters?: readonly FlashFilter[];
    blendMode?: 'add';
}>;
type FlashFilter = Readonly<{
    type: 'blur' | 'glow' | 'colorMatrix';
    blurX?: number;
    blurY?: number;
    flags?: number;
    color?: readonly number[];
    strength?: number;
    matrix?: readonly number[];
}>;
type Symbol = Readonly<{
    /** Unmodified artwork used when intentional iris recoloring is disabled. */
    original?: Svg;
    type: 'symbol';
    name: string;
    parts?: readonly (Symbol | Svg)[];
    frames?: readonly (readonly FramePart[])[];
    labels?: Readonly<Record<string, number>>;
    /** Last played frame before a source gotoAndPlay('loop'), without truncating data. */
    loopEnd?: number;
}>;

declare const Symbol1: Symbol;

declare const Symbol3: Symbol;

declare const Symbol4: Symbol;

declare const Symbol5: Symbol;

declare const Symbol6: Symbol;

declare const Symbol7: Symbol;

declare const Symbol8: Symbol;

declare const Symbol9: Symbol;

declare const Symbol10: Symbol;

declare const Symbol11: Symbol;

declare const Symbol12: Symbol;

declare const Symbol13: Symbol;

declare const Symbol14: Symbol;

declare const Symbol15: Symbol;

declare const Symbol16: Symbol;

declare const Symbol17: Symbol;

declare const Symbol18: Symbol;

declare const Symbol19: Symbol;

declare const Symbol20: Symbol;

declare const Symbol21: Symbol;

declare const Symbol22: Symbol;

declare const Symbol23: Symbol;

declare const Symbol24: Symbol;

declare const Symbol25: Symbol;

declare const Symbol26: Symbol;

declare const Symbol27: Symbol;

declare const Symbol28: Symbol;

declare const Symbol29: Symbol;

declare const Symbol30: Symbol;

declare const Symbol31: Symbol;

declare const Symbol32: Symbol;

declare const Symbol33: Symbol;

declare const Symbol34: Symbol;

declare const Symbol35: Symbol;

declare const Symbol36: Symbol;

declare const Symbol37: Symbol;

declare const Symbol38: Symbol;

declare const Symbol39: Symbol;

declare const Symbol40: Symbol;

declare const Symbol41: Symbol;

declare const Symbol42: Symbol;

declare const Symbol43: Symbol;

declare const Symbol44: Symbol;

declare const Symbol45: Symbol;

declare const Symbol46: Symbol;

declare const Symbol47: Symbol;

declare const Symbol48: Symbol;

declare const Symbol49: Symbol;

declare const Symbol50: Symbol;

declare const Symbol51: Symbol;

declare const Symbol52: Symbol;

declare const Symbol53: Symbol;

declare const Symbol54: Symbol;

declare const Symbol55: Symbol;

declare const Symbol56: Symbol;

declare const Symbol57: Symbol;

declare const Symbol58: Symbol;

declare const Symbol59: Symbol;

declare const Symbol60: Symbol;

declare const Symbol61: Symbol;

declare const Symbol62: Symbol;

declare const Symbol63: Symbol;

declare const Symbol64: Symbol;

declare const Symbol65: Symbol;

declare const Symbol66: Symbol;

declare const Symbol67: Symbol;

declare const Symbol68: Symbol;

declare const Symbol69: Symbol;

declare const Symbol70: Symbol;

declare const Symbol71: Symbol;

declare const Symbol72: Symbol;

declare const Symbol73: Symbol;

declare const Symbol74: Symbol;

declare const Symbol75: Symbol;

declare const Symbol76: Symbol;

declare const Symbol77: Symbol;

declare const Symbol78: Symbol;

declare const Symbol79: Symbol;

declare const Symbol80: Symbol;

declare const Symbol81: Symbol;

declare const Symbol82: Symbol;

declare const Symbol83: Symbol;

declare const Symbol84: Symbol;

declare const Symbol85: Symbol;

declare const Symbol86: Symbol;

declare const Symbol87: Symbol;

declare const Symbol88: Symbol;

declare const Symbol89: Symbol;

declare const Symbol90: Symbol;

declare const Symbol91: Symbol;

declare const Symbol92: Symbol;

declare const Symbol93: Symbol;

declare const Symbol94: Symbol;

declare const Symbol95: Symbol;

declare const Symbol96: Symbol;

declare const Symbol97: Symbol;

declare const Symbol98: Symbol;

declare const Symbol99: Symbol;

declare const Symbol100: Symbol;

declare const Symbol101: Symbol;

declare const Symbol102: Symbol;

declare const Symbol103: Symbol;

declare const Symbol104: Symbol;

declare const Symbol105: Symbol;

declare const Symbol106: Symbol;

declare const Symbol107: Symbol;

declare const Symbol108: Symbol;

declare const Symbol109: Symbol;

declare const Symbol110: Symbol;

declare const Symbol111: Symbol;

declare const Symbol112: Symbol;

declare const Symbol113: Symbol;

declare const Symbol114: Symbol;

declare const Symbol115: Symbol;

declare const Symbol116: Symbol;

declare const Symbol117: Symbol;

declare const Symbol118: Symbol;

declare const Symbol119: Symbol;

declare const Symbol120: Symbol;

declare const Symbol121: Symbol;

declare const Symbol122: Symbol;

declare const Symbol123: Symbol;

declare const Symbol124: Symbol;

declare const Symbol125: Symbol;

declare const Symbol126: Symbol;

declare const Symbol127: Symbol;

declare const Symbol128: Symbol;

declare const Symbol129: Symbol;

declare const Symbol130: Symbol;

declare const Symbol131: Symbol;

declare const Symbol132: Symbol;

declare const Symbol133: Symbol;

declare const Symbol134: Symbol;

declare const Symbol135: Symbol;

declare const Symbol136: Symbol;

declare const Symbol137: Symbol;

declare const Symbol138: Symbol;

declare const Symbol139: Symbol;

declare const Symbol140: Symbol;

declare const Symbol141: Symbol;

declare const Symbol142: Symbol;

declare const Symbol143: Symbol;

declare const Symbol144: Symbol;

declare const Symbol145: Symbol;

declare const Symbol146: Symbol;

declare const Symbol147: Symbol;

declare const Symbol148: Symbol;

declare const Symbol149: Symbol;

declare const Symbol150: Symbol;

declare const Symbol151: Symbol;

declare const Symbol152: Symbol;

declare const Symbol153: Symbol;

declare const Symbol154: Symbol;

declare const Symbol155: Symbol;

declare const Symbol156: Symbol;

declare const Symbol157: Symbol;

declare const Symbol158: Symbol;

declare const Symbol159: Symbol;

declare const Symbol160: Symbol;

declare const Symbol161: Symbol;

declare const Symbol162: Symbol;

declare const Symbol163: Symbol;

declare const Symbol164: Symbol;

declare const Symbol165: Symbol;

declare const Symbol166: Symbol;

declare const Symbol167: Symbol;

declare const Symbol168: Symbol;

declare const Symbol169: Symbol;

declare const Symbol170: Symbol;

declare const Symbol171: Symbol;

declare const Symbol172: Symbol;

declare const Symbol173: Symbol;

declare const Symbol174: Symbol;

declare const Symbol175: Symbol;

declare const Symbol176: Symbol;

declare const Symbol177: Symbol;

declare const Symbol178: Symbol;

declare const Symbol179: Symbol;

declare const Symbol180: Symbol;

declare const Symbol181: Symbol;

declare const Symbol182: Symbol;

declare const Symbol183: Symbol;

declare const Symbol184: Symbol;

declare const Symbol185: Symbol;

declare const Symbol186: Symbol;

declare const Symbol187: Symbol;

declare const Symbol188: Symbol;

declare const Symbol189: Symbol;

declare const Symbol190: Symbol;

declare const Symbol191: Symbol;

declare const Symbol192: Symbol;

declare const Symbol193: Symbol;

declare const Symbol194: Symbol;

declare const Symbol195: Symbol;

declare const Symbol196: Symbol;

declare const Symbol197: Symbol;

declare const Symbol198: Symbol;

declare const Symbol199: Symbol;

declare const Symbol200: Symbol;

declare const Symbol201: Symbol;

declare const Symbol202: Symbol;

declare const Symbol203: Symbol;

declare const Symbol204: Symbol;

declare const Symbol205: Symbol;

declare const Symbol206: Symbol;

declare const Symbol207: Symbol;

declare const Symbol208: Symbol;

declare const Symbol209: Symbol;

declare const Symbol210: Symbol;

declare const Symbol211: Symbol;

declare const Symbol212: Symbol;

declare const Symbol213: Symbol;

declare const Symbol214: Symbol;

declare const Symbol215: Symbol;

declare const Symbol216: Symbol;

declare const Symbol217: Symbol;

declare const Symbol218: Symbol;

declare const Symbol219: Symbol;

declare const Symbol220: Symbol;

declare const Symbol221: Symbol;

declare const Symbol222: Symbol;

declare const Symbol223: Symbol;

declare const Symbol224: Symbol;

declare const Symbol225: Symbol;

declare const Symbol226: Symbol;

declare const Symbol227: Symbol;

declare const Symbol228: Symbol;

declare const Symbol229: Symbol;

declare const Symbol230: Symbol;

declare const Symbol231: Symbol;

declare const Symbol232: Symbol;

declare const Symbol233: Symbol;

declare const Symbol234: Symbol;

declare const Symbol235: Symbol;

declare const Symbol236: Symbol;

declare const Symbol237: Symbol;

declare const Symbol238: Symbol;

declare const Symbol239: Symbol;

declare const Symbol240: Symbol;

declare const Symbol241: Symbol;

declare const Symbol242: Symbol;

declare const Symbol243: Symbol;

declare const Symbol244: Symbol;

declare const Symbol245: Symbol;

declare const Symbol246: Symbol;

declare const Symbol247: Symbol;

declare const Symbol248: Symbol;

declare const Symbol249: Symbol;

declare const Symbol250: Symbol;

declare const Symbol251: Symbol;

declare const Symbol252: Symbol;

declare const Symbol253: Symbol;

declare const Symbol254: Symbol;

declare const Symbol255: Symbol;

declare const Symbol256: Symbol;

declare const Symbol257: Symbol;

declare const Symbol258: Symbol;

declare const Symbol259: Symbol;

declare const Symbol260: Symbol;

declare const Symbol261: Symbol;

declare const Symbol262: Symbol;

declare const Symbol263: Symbol;

declare const Symbol264: Symbol;

declare const Symbol265: Symbol;

declare const Symbol266: Symbol;

declare const Symbol267: Symbol;

declare const Symbol268: Symbol;

declare const Symbol269: Symbol;

declare const Symbol270: Symbol;

declare const Symbol271: Symbol;

declare const Symbol272: Symbol;

declare const Symbol273: Symbol;

declare const Symbol274: Symbol;

declare const Symbol275: Symbol;

declare const Symbol276: Symbol;

declare const Symbol277: Symbol;

declare const Symbol278: Symbol;

declare const Symbol279: Symbol;

declare const Symbol280: Symbol;

declare const Symbol281: Symbol;

declare const Symbol282: Symbol;

declare const Symbol283: Symbol;

declare const Symbol284: Symbol;

declare const Symbol285: Symbol;

declare const Symbol286: Symbol;

declare const Symbol287: Symbol;

declare const Symbol288: Symbol;

declare const Symbol289: Symbol;

declare const Symbol290: Symbol;

declare const Symbol291: Symbol;

declare const Symbol292: Symbol;

declare const Symbol293: Symbol;

declare const Symbol294: Symbol;

declare const Symbol295: Symbol;

declare const Symbol296: Symbol;

declare const Symbol297: Symbol;

declare const Symbol298: Symbol;

declare const Symbol299: Symbol;

declare const Symbol300: Symbol;

declare const Symbol301: Symbol;

declare const Symbol302: Symbol;

declare const Symbol303: Symbol;

declare const Symbol304: Symbol;

declare const Symbol305: Symbol;

declare const Symbol306: Symbol;

declare const Symbol307: Symbol;

declare const Symbol308: Symbol;

declare const Symbol309: Symbol;

declare const Symbol310: Symbol;

declare const Symbol311: Symbol;

declare const Symbol312: Symbol;

declare const Symbol313: Symbol;

declare const Symbol314: Symbol;

declare const Symbol315: Symbol;

declare const Symbol316: Symbol;

declare const Symbol317: Symbol;

declare const Symbol318: Symbol;

declare const Symbol319: Symbol;

declare const Symbol320: Symbol;

declare const Symbol321: Symbol;

declare const Symbol322: Symbol;

declare const Symbol323: Symbol;

declare const Symbol324: Symbol;

declare const Symbol325: Symbol;

declare const Symbol326: Symbol;

declare const Symbol327: Symbol;

declare const Symbol328: Symbol;

declare const Symbol329: Symbol;

declare const Symbol330: Symbol;

declare const Symbol331: Symbol;

declare const Symbol332: Symbol;

declare const Symbol333: Symbol;

declare const Symbol334: Symbol;

declare const Symbol335: Symbol;

declare const Symbol336: Symbol;

declare const Symbol337: Symbol;

declare const Symbol338: Symbol;

declare const Symbol339: Symbol;

declare const Symbol340: Symbol;

declare const Symbol341: Symbol;

declare const Symbol342: Symbol;

declare const Symbol343: Symbol;

declare const Symbol344: Symbol;

declare const Symbol345: Symbol;

declare const Symbol346: Symbol;

declare const Symbol347: Symbol;

declare const Symbol348: Symbol;

declare const Symbol349: Symbol;

declare const Symbol350: Symbol;

declare const Symbol351: Symbol;

declare const Symbol352: Symbol;

declare const Symbol353: Symbol;

declare const Symbol354: Symbol;

declare const Symbol355: Symbol;

declare const Symbol356: Symbol;

declare const Symbol357: Symbol;

declare const Symbol358: Symbol;

declare const Symbol359: Symbol;

declare const Symbol360: Symbol;

declare const Symbol361: Symbol;

declare const Symbol362: Symbol;

declare const Symbol363: Symbol;

declare const Symbol364: Symbol;

declare const Symbol365: Symbol;

declare const Symbol366: Symbol;

declare const Symbol367: Symbol;

declare const Symbol368: Symbol;

declare const Symbol369: Symbol;

declare const Symbol370: Symbol;

declare const Symbol371: Symbol;

declare const Symbol372: Symbol;

declare const Symbol373: Symbol;

declare const Symbol374: Symbol;

declare const Symbol375: Symbol;

declare const Symbol376: Symbol;

declare const Symbol377: Symbol;

declare const Symbol378: Symbol;

declare const Symbol379: Symbol;

declare const Symbol380: Symbol;

declare const Symbol381: Symbol;

declare const Symbol382: Symbol;

declare const Symbol383: Symbol;

declare const Symbol384: Symbol;

declare const Symbol385: Symbol;

declare const Symbol386: Symbol;

declare const Symbol387: Symbol;

declare const Symbol388: Symbol;

declare const Symbol389: Symbol;

declare const Symbol390: Symbol;

declare const Symbol391: Symbol;

declare const Symbol392: Symbol;

declare const Symbol393: Symbol;

declare const Symbol394: Symbol;

declare const Symbol395: Symbol;

declare const Symbol396: Symbol;

declare const Symbol397: Symbol;

declare const Symbol398: Symbol;

declare const Symbol399: Symbol;

declare const Symbol400: Symbol;

declare const Symbol401: Symbol;

declare const Symbol402: Symbol;

declare const Symbol403: Symbol;

declare const Symbol404: Symbol;

declare const Symbol405: Symbol;

declare const Symbol406: Symbol;

declare const Symbol407: Symbol;

declare const Symbol408: Symbol;

declare const Symbol409: Symbol;

declare const Symbol410: Symbol;

declare const Symbol411: Symbol;

declare const Symbol412: Symbol;

declare const Symbol413: Symbol;

declare const Symbol414: Symbol;

declare const Symbol415: Symbol;

declare const Symbol416: Symbol;

declare const Symbol417: Symbol;

declare const Symbol418: Symbol;

declare const Symbol419: Symbol;

declare const Symbol420: Symbol;

declare const Symbol421: Symbol;

declare const Symbol422: Symbol;

declare const Symbol423: Symbol;

declare const Symbol424: Symbol;

declare const Symbol425: Symbol;

declare const Symbol426: Symbol;

declare const Symbol427: Symbol;

declare const Symbol428: Symbol;

declare const Symbol429: Symbol;

declare const Symbol430: Symbol;

declare const Symbol431: Symbol;

declare const Symbol432: Symbol;

declare const Symbol433: Symbol;

declare const Symbol434: Symbol;

declare const Symbol435: Symbol;

declare const Symbol436: Symbol;

declare const Symbol437: Symbol;

declare const Symbol438: Symbol;

declare const Symbol439: Symbol;

declare const Symbol440: Symbol;

declare const Symbol441: Symbol;

declare const Symbol442: Symbol;

declare const Symbol443: Symbol;

declare const Symbol444: Symbol;

declare const Symbol445: Symbol;

declare const Symbol446: Symbol;

declare const Symbol447: Symbol;

declare const Symbol448: Symbol;

declare const Symbol449: Symbol;

declare const Symbol450: Symbol;

declare const Symbol451: Symbol;

declare const Symbol452: Symbol;

declare const Symbol453: Symbol;

declare const Symbol454: Symbol;

declare const Symbol455: Symbol;

declare const Symbol456: Symbol;

declare const Symbol457: Symbol;

declare const Symbol458: Symbol;

declare const Symbol459: Symbol;

declare const Symbol460: Symbol;

declare const Symbol461: Symbol;

declare const Symbol462: Symbol;

declare const Symbol463: Symbol;

declare const Symbol464: Symbol;

declare const Symbol465: Symbol;

declare const Symbol466: Symbol;

declare const Symbol467: Symbol;

declare const Symbol468: Symbol;

declare const Symbol469: Symbol;

declare const Symbol470: Symbol;

declare const Symbol471: Symbol;

declare const Symbol472: Symbol;

declare const Symbol473: Symbol;

declare const Symbol474: Symbol;

declare const Symbol475: Symbol;

declare const Symbol476: Symbol;

declare const Symbol477: Symbol;

declare const Symbol478: Symbol;

declare const Symbol479: Symbol;

declare const Symbol480: Symbol;

declare const Symbol481: Symbol;

declare const Symbol482: Symbol;

declare const Symbol483: Symbol;

declare const Symbol484: Symbol;

declare const Symbol485: Symbol;

declare const Symbol486: Symbol;

declare const Symbol487: Symbol;

declare const Symbol488: Symbol;

declare const Symbol489: Symbol;

declare const Symbol490: Symbol;

declare const Symbol491: Symbol;

declare const Symbol492: Symbol;

declare const Symbol493: Symbol;

declare const Symbol494: Symbol;

declare const Symbol495: Symbol;

declare const Symbol496: Symbol;

declare const Symbol497: Symbol;

declare const Symbol498: Symbol;

declare const Symbol499: Symbol;

declare const Symbol500: Symbol;

declare const Symbol501: Symbol;

declare const Symbol502: Symbol;

declare const Symbol503: Symbol;

declare const Symbol504: Symbol;

declare const Symbol505: Symbol;

declare const Symbol506: Symbol;

declare const Symbol507: Symbol;

declare const Symbol508: Symbol;

declare const Symbol509: Symbol;

declare const Symbol510: Symbol;

declare const Symbol511: Symbol;

declare const Symbol512: Symbol;

declare const Symbol513: Symbol;

declare const Symbol514: Symbol;

declare const Symbol515: Symbol;

declare const Symbol516: Symbol;

declare const Symbol517: Symbol;

declare const Symbol518: Symbol;

declare const Symbol519: Symbol;

declare const Symbol520: Symbol;

declare const Symbol521: Symbol;

declare const Symbol522: Symbol;

declare const Symbol523: Symbol;

declare const Symbol524: Symbol;

declare const Symbol525: Symbol;

declare const Symbol526: Symbol;

declare const Symbol527: Symbol;

declare const Symbol528: Symbol;

declare const Symbol529: Symbol;

declare const Symbol530: Symbol;

declare const Symbol531: Symbol;

declare const Symbol532: Symbol;

declare const Symbol533: Symbol;

declare const Symbol534: Symbol;

declare const Symbol535: Symbol;

declare const Symbol536: Symbol;

declare const Symbol537: Symbol;

declare const Symbol538: Symbol;

declare const Symbol539: Symbol;

declare const Symbol540: Symbol;

declare const Symbol541: Symbol;

declare const Symbol542: Symbol;

declare const Symbol543: Symbol;

declare const Symbol544: Symbol;

declare const Symbol545: Symbol;

declare const Symbol546: Symbol;

declare const Symbol547: Symbol;

declare const Symbol548: Symbol;

declare const Symbol549: Symbol;

declare const Symbol550: Symbol;

declare const Symbol551: Symbol;

declare const Symbol552: Symbol;

declare const Symbol553: Symbol;

declare const Symbol554: Symbol;

declare const Symbol555: Symbol;

declare const Symbol556: Symbol;

declare const Symbol557: Symbol;

declare const Symbol558: Symbol;

declare const Symbol559: Symbol;

declare const Symbol560: Symbol;

declare const Symbol561: Symbol;

declare const Symbol562: Symbol;

declare const Symbol563: Symbol;

declare const Symbol564: Symbol;

declare const Symbol565: Symbol;

declare const Symbol566: Symbol;

declare const Symbol567: Symbol;

declare const Symbol568: Symbol;

declare const Symbol569: Symbol;

declare const Symbol570: Symbol;

declare const Symbol571: Symbol;

declare const Symbol572: Symbol;

declare const Symbol573: Symbol;

declare const Symbol574: Symbol;

declare const Symbol575: Symbol;

declare const Symbol576: Symbol;

declare const Symbol577: Symbol;

declare const Symbol578: Symbol;

declare const Symbol579: Symbol;

declare const Symbol580: Symbol;

declare const Symbol581: Symbol;

declare const Symbol582: Symbol;

declare const Symbol583: Symbol;

declare const Symbol584: Symbol;

declare const Symbol585: Symbol;

declare const Symbol586: Symbol;

declare const Symbol587: Symbol;

declare const Symbol588: Symbol;

declare const Symbol589: Symbol;

declare const Symbol590: Symbol;

declare const Symbol591: Symbol;

declare const Symbol592: Symbol;

declare const Symbol593: Symbol;

declare const Symbol594: Symbol;

declare const Symbol595: Symbol;

declare const Symbol596: Symbol;

declare const Symbol597: Symbol;

declare const Symbol598: Symbol;

declare const Symbol599: Symbol;

declare const Symbol600: Symbol;

declare const Symbol601: Symbol;

declare const Symbol602: Symbol;

declare const Symbol603: Symbol;

declare const Symbol604: Symbol;

declare const Symbol605: Symbol;

declare const Symbol606: Symbol;

declare const Symbol607: Symbol;

declare const Symbol608: Symbol;

declare const Symbol609: Symbol;

declare const Symbol610: Symbol;

declare const Symbol611: Symbol;

declare const Symbol612: Symbol;

declare const Symbol613: Symbol;

declare const Symbol614: Symbol;

declare const Symbol615: Symbol;

declare const Symbol616: Symbol;

declare const Symbol617: Symbol;

declare const Symbol618: Symbol;

declare const Symbol619: Symbol;

declare const Symbol620: Symbol;

declare const Symbol621: Symbol;

declare const Symbol622: Symbol;

declare const Symbol623: Symbol;

declare const Symbol624: Symbol;

declare const Symbol625: Symbol;

declare const Symbol626: Symbol;

declare const Symbol627: Symbol;

declare const Symbol628: Symbol;

declare const Symbol629: Symbol;

declare const Symbol630: Symbol;

declare const Symbol631: Symbol;

declare const Symbol632: Symbol;

declare const Symbol633: Symbol;

declare const Symbol634: Symbol;

declare const Symbol635: Symbol;

declare const Symbol636: Symbol;

declare const Symbol637: Symbol;

declare const Symbol638: Symbol;

declare const Symbol639: Symbol;

declare const Symbol640: Symbol;

declare const Symbol641: Symbol;

declare const Symbol642: Symbol;

declare const Symbol643: Symbol;

declare const Symbol644: Symbol;

declare const Symbol645: Symbol;

declare const Symbol646: Symbol;

declare const Symbol647: Symbol;

declare const Symbol648: Symbol;

declare const Symbol649: Symbol;

declare const Symbol650: Symbol;

declare const Symbol651: Symbol;

declare const Symbol652: Symbol;

declare const Symbol653: Symbol;

declare const Symbol654: Symbol;

declare const Symbol655: Symbol;

declare const Symbol656: Symbol;

declare const Symbol657: Symbol;

declare const Symbol658: Symbol;

declare const Symbol659: Symbol;

declare const Symbol660: Symbol;

declare const Symbol661: Symbol;

declare const Symbol662: Symbol;

declare const Symbol663: Symbol;

declare const Symbol664: Symbol;

declare const Symbol665: Symbol;

declare const Symbol666: Symbol;

declare const Symbol667: Symbol;

declare const Symbol668: Symbol;

declare const Symbol669: Symbol;

declare const Symbol670: Symbol;

declare const Symbol671: Symbol;

declare const Symbol672: Symbol;

declare const Symbol673: Symbol;

declare const Symbol674: Symbol;

declare const Symbol675: Symbol;

declare const Symbol676: Symbol;

declare const Symbol677: Symbol;

declare const Symbol678: Symbol;

declare const Symbol679: Symbol;

declare const Symbol680: Symbol;

declare const Symbol681: Symbol;

declare const Symbol682: Symbol;

declare const Symbol683: Symbol;

declare const Symbol684: Symbol;

declare const Symbol685: Symbol;

declare const Symbol686: Symbol;

declare const Symbol687: Symbol;

declare const Symbol688: Symbol;

declare const Symbol689: Symbol;

declare const Symbol690: Symbol;

declare const Symbol691: Symbol;

declare const Symbol692: Symbol;

declare const Symbol693: Symbol;

declare const Symbol694: Symbol;

declare const Symbol695: Symbol;

declare const Symbol696: Symbol;

declare const Symbol697: Symbol;

declare const Symbol698: Symbol;

declare const Symbol699: Symbol;

declare const Symbol700: Symbol;

declare const Symbol701: Symbol;

declare const Symbol702: Symbol;

declare const Symbol703: Symbol;

declare const Symbol704: Symbol;

declare const Symbol705: Symbol;

declare const Symbol706: Symbol;

declare const Symbol707: Symbol;

declare const Symbol708: Symbol;

declare const Symbol709: Symbol;

declare const Symbol710: Symbol;

declare const Symbol711: Symbol;

declare const Symbol712: Symbol;

declare const Symbol713: Symbol;

declare const Symbol714: Symbol;

declare const Symbol715: Symbol;

declare const Symbol716: Symbol;

declare const Symbol717: Symbol;

declare const Symbol718: Symbol;

declare const Symbol719: Symbol;

declare const Symbol720: Symbol;

declare const Symbol721: Symbol;

declare const Symbol722: Symbol;

declare const Symbol723: Symbol;

declare const Symbol724: Symbol;

declare const Symbol725: Symbol;

declare const Symbol726: Symbol;

declare const Symbol727: Symbol;

declare const Symbol728: Symbol;

declare const Symbol729: Symbol;

declare const Symbol730: Symbol;

declare const Symbol731: Symbol;

declare const Symbol732: Symbol;

declare const Symbol733: Symbol;

declare const Symbol734: Symbol;

declare const Symbol735: Symbol;

declare const Symbol736: Symbol;

declare const Symbol737: Symbol;

declare const Symbol738: Symbol;

declare const Symbol739: Symbol;

declare const Symbol740: Symbol;

declare const Symbol741: Symbol;

declare const Symbol742: Symbol;

declare const Symbol743: Symbol;

declare const Symbol744: Symbol;

declare const Symbol745: Symbol;

declare const Symbol746: Symbol;

declare const Symbol747: Symbol;

declare const Symbol748: Symbol;

declare const Symbol749: Symbol;

declare const Symbol750: Symbol;

declare const Symbol751: Symbol;

declare const Symbol752: Symbol;

declare const Symbol753: Symbol;

type Gender = 'male' | 'female';
type Facing = 'left' | 'right';
type BodyPart = 'p1' | 'p1a' | 'p1b' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p7b' | 'p8';
type ColorSlot = 'col0' | 'col0a' | 'col0c' | 'col1' | 'col1a' | 'col1b' | 'col1c' | 'col1d' | 'col2' | 'col2a' | 'col2b' | 'col3' | 'col3b' | 'col4' | 'col4a' | 'col4b';
type BodyParts = Readonly<Record<BodyPart, number>>;
type PortraitColors = Readonly<Record<ColorSlot, string>>;
interface PortraitAppearance {
    gender: Gender;
    parts: BodyParts;
    colors: PortraitColors;
    facing?: Facing;
    scale?: number;
    highlightColorName?: ColorSlot;
    /** Disable the stroke minimum, black outline, and selection highlight for source comparisons. */
    presentation?: boolean;
    /** Disable the intentional turquoise iris enhancement for source comparisons. */
    recolorIrises?: boolean;
}
interface BruteDisplayOptions extends PortraitAppearance {
    renderer: Renderer;
}

/** A static display tree. The caller owns rendering, extraction, and renderer lifetime. */
declare class BruteDisplay {
    #private;
    readonly container: Container<pixi_js.ContainerChild>;
    readonly renderer: Renderer;
    ready: Promise<void>;
    svgs: Sprite[];
    constructor({ renderer, ...appearance }: BruteDisplayOptions);
    get appearance(): Readonly<PortraitAppearance>;
    get destroyed(): boolean;
    /** Atomic replacement. Superseded updates reject with AbortError; the old scene remains on failure. */
    updateAppearance(input: PortraitAppearance): Promise<void>;
    /** Update decoded colors while preserving the remaining appearance choices. */
    setColors(colors: PortraitColors, highlightColorName?: ColorSlot): Promise<void>;
    /** Release staged and committed trees without taking ownership of the caller's renderer. */
    destroy(): void;
}

declare function portraitCacheStats(renderer: Renderer): {
    basePromises: number;
    variants: number;
    baseBytes: number;
    borrowedBases: number;
    borrowedVariants: number;
    variantBytes: number;
};
/** Clear idle renderer-owned variants before retiring a pooled renderer. Active borrowers survive. */
declare function clearPortraitCache(renderer: Renderer): void;

export { type BodyPart, type BodyParts, BruteDisplay, type BruteDisplayOptions, type ColorOffset, type ColorSlot, type Facing, type FlashFilter, type FramePart, type Gender, type PortraitAppearance, type PortraitColors, type Svg, type Symbol, Symbol1, Symbol10, Symbol100, Symbol101, Symbol102, Symbol103, Symbol104, Symbol105, Symbol106, Symbol107, Symbol108, Symbol109, Symbol11, Symbol110, Symbol111, Symbol112, Symbol113, Symbol114, Symbol115, Symbol116, Symbol117, Symbol118, Symbol119, Symbol12, Symbol120, Symbol121, Symbol122, Symbol123, Symbol124, Symbol125, Symbol126, Symbol127, Symbol128, Symbol129, Symbol13, Symbol130, Symbol131, Symbol132, Symbol133, Symbol134, Symbol135, Symbol136, Symbol137, Symbol138, Symbol139, Symbol14, Symbol140, Symbol141, Symbol142, Symbol143, Symbol144, Symbol145, Symbol146, Symbol147, Symbol148, Symbol149, Symbol15, Symbol150, Symbol151, Symbol152, Symbol153, Symbol154, Symbol155, Symbol156, Symbol157, Symbol158, Symbol159, Symbol16, Symbol160, Symbol161, Symbol162, Symbol163, Symbol164, Symbol165, Symbol166, Symbol167, Symbol168, Symbol169, Symbol17, Symbol170, Symbol171, Symbol172, Symbol173, Symbol174, Symbol175, Symbol176, Symbol177, Symbol178, Symbol179, Symbol18, Symbol180, Symbol181, Symbol182, Symbol183, Symbol184, Symbol185, Symbol186, Symbol187, Symbol188, Symbol189, Symbol19, Symbol190, Symbol191, Symbol192, Symbol193, Symbol194, Symbol195, Symbol196, Symbol197, Symbol198, Symbol199, Symbol20, Symbol200, Symbol201, Symbol202, Symbol203, Symbol204, Symbol205, Symbol206, Symbol207, Symbol208, Symbol209, Symbol21, Symbol210, Symbol211, Symbol212, Symbol213, Symbol214, Symbol215, Symbol216, Symbol217, Symbol218, Symbol219, Symbol22, Symbol220, Symbol221, Symbol222, Symbol223, Symbol224, Symbol225, Symbol226, Symbol227, Symbol228, Symbol229, Symbol23, Symbol230, Symbol231, Symbol232, Symbol233, Symbol234, Symbol235, Symbol236, Symbol237, Symbol238, Symbol239, Symbol24, Symbol240, Symbol241, Symbol242, Symbol243, Symbol244, Symbol245, Symbol246, Symbol247, Symbol248, Symbol249, Symbol25, Symbol250, Symbol251, Symbol252, Symbol253, Symbol254, Symbol255, Symbol256, Symbol257, Symbol258, Symbol259, Symbol26, Symbol260, Symbol261, Symbol262, Symbol263, Symbol264, Symbol265, Symbol266, Symbol267, Symbol268, Symbol269, Symbol27, Symbol270, Symbol271, Symbol272, Symbol273, Symbol274, Symbol275, Symbol276, Symbol277, Symbol278, Symbol279, Symbol28, Symbol280, Symbol281, Symbol282, Symbol283, Symbol284, Symbol285, Symbol286, Symbol287, Symbol288, Symbol289, Symbol29, Symbol290, Symbol291, Symbol292, Symbol293, Symbol294, Symbol295, Symbol296, Symbol297, Symbol298, Symbol299, Symbol3, Symbol30, Symbol300, Symbol301, Symbol302, Symbol303, Symbol304, Symbol305, Symbol306, Symbol307, Symbol308, Symbol309, Symbol31, Symbol310, Symbol311, Symbol312, Symbol313, Symbol314, Symbol315, Symbol316, Symbol317, Symbol318, Symbol319, Symbol32, Symbol320, Symbol321, Symbol322, Symbol323, Symbol324, Symbol325, Symbol326, Symbol327, Symbol328, Symbol329, Symbol33, Symbol330, Symbol331, Symbol332, Symbol333, Symbol334, Symbol335, Symbol336, Symbol337, Symbol338, Symbol339, Symbol34, Symbol340, Symbol341, Symbol342, Symbol343, Symbol344, Symbol345, Symbol346, Symbol347, Symbol348, Symbol349, Symbol35, Symbol350, Symbol351, Symbol352, Symbol353, Symbol354, Symbol355, Symbol356, Symbol357, Symbol358, Symbol359, Symbol36, Symbol360, Symbol361, Symbol362, Symbol363, Symbol364, Symbol365, Symbol366, Symbol367, Symbol368, Symbol369, Symbol37, Symbol370, Symbol371, Symbol372, Symbol373, Symbol374, Symbol375, Symbol376, Symbol377, Symbol378, Symbol379, Symbol38, Symbol380, Symbol381, Symbol382, Symbol383, Symbol384, Symbol385, Symbol386, Symbol387, Symbol388, Symbol389, Symbol39, Symbol390, Symbol391, Symbol392, Symbol393, Symbol394, Symbol395, Symbol396, Symbol397, Symbol398, Symbol399, Symbol4, Symbol40, Symbol400, Symbol401, Symbol402, Symbol403, Symbol404, Symbol405, Symbol406, Symbol407, Symbol408, Symbol409, Symbol41, Symbol410, Symbol411, Symbol412, Symbol413, Symbol414, Symbol415, Symbol416, Symbol417, Symbol418, Symbol419, Symbol42, Symbol420, Symbol421, Symbol422, Symbol423, Symbol424, Symbol425, Symbol426, Symbol427, Symbol428, Symbol429, Symbol43, Symbol430, Symbol431, Symbol432, Symbol433, Symbol434, Symbol435, Symbol436, Symbol437, Symbol438, Symbol439, Symbol44, Symbol440, Symbol441, Symbol442, Symbol443, Symbol444, Symbol445, Symbol446, Symbol447, Symbol448, Symbol449, Symbol45, Symbol450, Symbol451, Symbol452, Symbol453, Symbol454, Symbol455, Symbol456, Symbol457, Symbol458, Symbol459, Symbol46, Symbol460, Symbol461, Symbol462, Symbol463, Symbol464, Symbol465, Symbol466, Symbol467, Symbol468, Symbol469, Symbol47, Symbol470, Symbol471, Symbol472, Symbol473, Symbol474, Symbol475, Symbol476, Symbol477, Symbol478, Symbol479, Symbol48, Symbol480, Symbol481, Symbol482, Symbol483, Symbol484, Symbol485, Symbol486, Symbol487, Symbol488, Symbol489, Symbol49, Symbol490, Symbol491, Symbol492, Symbol493, Symbol494, Symbol495, Symbol496, Symbol497, Symbol498, Symbol499, Symbol5, Symbol50, Symbol500, Symbol501, Symbol502, Symbol503, Symbol504, Symbol505, Symbol506, Symbol507, Symbol508, Symbol509, Symbol51, Symbol510, Symbol511, Symbol512, Symbol513, Symbol514, Symbol515, Symbol516, Symbol517, Symbol518, Symbol519, Symbol52, Symbol520, Symbol521, Symbol522, Symbol523, Symbol524, Symbol525, Symbol526, Symbol527, Symbol528, Symbol529, Symbol53, Symbol530, Symbol531, Symbol532, Symbol533, Symbol534, Symbol535, Symbol536, Symbol537, Symbol538, Symbol539, Symbol54, Symbol540, Symbol541, Symbol542, Symbol543, Symbol544, Symbol545, Symbol546, Symbol547, Symbol548, Symbol549, Symbol55, Symbol550, Symbol551, Symbol552, Symbol553, Symbol554, Symbol555, Symbol556, Symbol557, Symbol558, Symbol559, Symbol56, Symbol560, Symbol561, Symbol562, Symbol563, Symbol564, Symbol565, Symbol566, Symbol567, Symbol568, Symbol569, Symbol57, Symbol570, Symbol571, Symbol572, Symbol573, Symbol574, Symbol575, Symbol576, Symbol577, Symbol578, Symbol579, Symbol58, Symbol580, Symbol581, Symbol582, Symbol583, Symbol584, Symbol585, Symbol586, Symbol587, Symbol588, Symbol589, Symbol59, Symbol590, Symbol591, Symbol592, Symbol593, Symbol594, Symbol595, Symbol596, Symbol597, Symbol598, Symbol599, Symbol6, Symbol60, Symbol600, Symbol601, Symbol602, Symbol603, Symbol604, Symbol605, Symbol606, Symbol607, Symbol608, Symbol609, Symbol61, Symbol610, Symbol611, Symbol612, Symbol613, Symbol614, Symbol615, Symbol616, Symbol617, Symbol618, Symbol619, Symbol62, Symbol620, Symbol621, Symbol622, Symbol623, Symbol624, Symbol625, Symbol626, Symbol627, Symbol628, Symbol629, Symbol63, Symbol630, Symbol631, Symbol632, Symbol633, Symbol634, Symbol635, Symbol636, Symbol637, Symbol638, Symbol639, Symbol64, Symbol640, Symbol641, Symbol642, Symbol643, Symbol644, Symbol645, Symbol646, Symbol647, Symbol648, Symbol649, Symbol65, Symbol650, Symbol651, Symbol652, Symbol653, Symbol654, Symbol655, Symbol656, Symbol657, Symbol658, Symbol659, Symbol66, Symbol660, Symbol661, Symbol662, Symbol663, Symbol664, Symbol665, Symbol666, Symbol667, Symbol668, Symbol669, Symbol67, Symbol670, Symbol671, Symbol672, Symbol673, Symbol674, Symbol675, Symbol676, Symbol677, Symbol678, Symbol679, Symbol68, Symbol680, Symbol681, Symbol682, Symbol683, Symbol684, Symbol685, Symbol686, Symbol687, Symbol688, Symbol689, Symbol69, Symbol690, Symbol691, Symbol692, Symbol693, Symbol694, Symbol695, Symbol696, Symbol697, Symbol698, Symbol699, Symbol7, Symbol70, Symbol700, Symbol701, Symbol702, Symbol703, Symbol704, Symbol705, Symbol706, Symbol707, Symbol708, Symbol709, Symbol71, Symbol710, Symbol711, Symbol712, Symbol713, Symbol714, Symbol715, Symbol716, Symbol717, Symbol718, Symbol719, Symbol72, Symbol720, Symbol721, Symbol722, Symbol723, Symbol724, Symbol725, Symbol726, Symbol727, Symbol728, Symbol729, Symbol73, Symbol730, Symbol731, Symbol732, Symbol733, Symbol734, Symbol735, Symbol736, Symbol737, Symbol738, Symbol739, Symbol74, Symbol740, Symbol741, Symbol742, Symbol743, Symbol744, Symbol745, Symbol746, Symbol747, Symbol748, Symbol749, Symbol75, Symbol750, Symbol751, Symbol752, Symbol753, Symbol76, Symbol77, Symbol78, Symbol79, Symbol8, Symbol80, Symbol81, Symbol82, Symbol83, Symbol84, Symbol85, Symbol86, Symbol87, Symbol88, Symbol89, Symbol9, Symbol90, Symbol91, Symbol92, Symbol93, Symbol94, Symbol95, Symbol96, Symbol97, Symbol98, Symbol99, clearPortraitCache, portraitCacheStats };
