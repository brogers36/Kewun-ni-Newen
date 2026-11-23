"""The wekufü of the Santiago act, built with the same method as tools/kin_paint.py (per-part masks with
their own colour ramps, height-field light from the upper left, ordered dithering, selective outlines).
Two street wekufü (wirarün, dewü) and the three wardens of the city: ngoyngoyün (noise),
ngamleftripael (dispersion) and mapudungukenoael fillantü (no everyday use).
Output: tools/waria.json (battle sprite + half-size sprite, two frames each)."""
import json, math, os
import numpy as np
import yewen_paint as yp
from yewen_paint import Canvas, taper, hx

R = {
    'tin':    ['#101418', '#1e252c', '#2e3842', '#44525e', '#5e6e7c', '#82929e', '#aebcc6'],
    'bell':   ['#200606', '#3e0c0c', '#641414', '#8c2018', '#b4382a', '#d85c40'],
    'violet': ['#0e0814', '#1e1028', '#30183e', '#442458', '#5c3474', '#7a4a94'],
    'rat':    ['#0e0c0a', '#1e1a16', '#302a22', '#443c32', '#5a5044', '#746858', '#908472'],
    'pink':   ['#3a1a20', '#6a3038', '#9a4e56', '#c27478', '#e4a2a2'],
    'screen': ['#0a1a20', '#16323c', '#2a5866', '#4a8a96', '#7ac0c6', '#c2eef0', '#ffffff'],
    'case':   ['#0c0a0a', '#1a1614', '#2a2420', '#3c342e', '#524840', '#6c6054'],
    'coat':   ['#0a0c10', '#161a22', '#242a36', '#343c4c', '#465064', '#5c687e', '#7a869a'],
    'grey':   ['#14141a', '#24242c', '#363640', '#4a4a56', '#62626e', '#7e7e8a', '#a0a0aa'],
    'paper':  ['#5a5650', '#8a847a', '#b4ae9e', '#d8d2c0', '#f2ecdc'],
    'zip':    ['#3a3020', '#6a5830', '#a08848', '#d0b870', '#f4e0a0'],
}
R = {k: [hx(c) for c in v] for k, v in R.items()}
LINES = [(220, 50, 50), (240, 200, 40), (60, 170, 80), (60, 120, 220), (160, 80, 200)]   # metro-map colours

def setsize(w, h): yp.W, yp.H = w, h

# ---- a crisper shading model for the city wekufü: hard-surface parts get flat faces with a sharp bevel,
#      organic parts a firm rounded form; light is banded with only a whisper of dither, and contrast is pushed
HARD = ('stack', 'thigh', 'shin', 'foot', 'horn', 'hrim', 'mand', 'claw', 'leg', 'fang', 'tooth', 'cam', 'motor', 'clock', 'pull', 'page', 'armL', 'armR', 'cable', 'box', 'socket', 'piston')
from scipy.ndimage import distance_transform_edt as _edt, gaussian_filter as _gf
def _shade2(s, m, ramp, bulge=1.0, lift=0.0, flat=0.0, name=''):
    """hard parts: flat faces with a sharp bevel; round parts: a firm form cut into a few hard bands with a sharp terminator
    and a band of reflected light along the shadow-side rim. Almost no dither: edges stay crisp."""
    if not m.any(): return
    H_, W_ = yp.H, yp.W
    d = _edt(m)
    hard = name in HARD or name.startswith('line') or name.startswith('coat')
    if hard:
        h = _gf(np.minimum(d, 2.6 * bulge) * 1.2, .5)
    else:
        Rr = max(2.0, d.max()); h = _gf((np.clip(d / Rr, 0, 1) ** .55) * Rr * bulge, 1.1)
    gy, gx = np.gradient(h)
    n = np.dstack([-gx, -gy, np.ones_like(h) * (0.9 if hard else 0.75)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    lum = (n @ yp.LIGHT - 0.15) / 0.85
    ys, xs = np.nonzero(m); cy, cx = ys.mean(), xs.mean(); sy, sx = max(4, ys.std()), max(4, xs.std())
    yy, xx = np.mgrid[0:H_, 0:W_]
    lum = lum - ((yy - cy) / sy) * .06 - ((xx - cx) / sx) * .05
    lum = (lum - .45) * 1.45 + .45 + lift - yy / H_ * .05
    k = len(ramp)
    if hard:
        t = np.clip(lum, 0, .999) * (k - 1); bay = yp.BAYER[yy % 4, xx % 4]
        idx = np.clip(np.floor(t + (bay - .5) * .18).astype(int), 0, k - 1)
    else:
        bands = min(k, 6); t = np.clip(lum, 0, .999) * bands
        b_ = np.floor(t).astype(int)                              # hard bands, no dither
        idx = np.clip(np.round(b_ * (k - 1) / max(1, bands - 1)).astype(int), 0, k - 1)
        rim = (d <= 2.2) & (b_ <= 1) & ((gx > .05) | (gy > .05))  # reflected light on the shadow side
        idx[rim] = np.minimum(k - 1, idx[rim] + 2)
    cols = np.array(ramp)[idx]
    s.rgb[m] = cols[m]; s.a[m] = True; s.part[m] = name
yp.Canvas.shade = _shade2
def blob(c, ramp, fn, bulge=1.0, lift=0.0, name=''):
    m = c.mask(fn); c.shade(m, ramp, bulge=bulge, lift=lift, name=name); return m
def finish(c, seams, rim=None, rimparts=()):
    c.inner_lines(set(seams)); c.outline()
    if rim:
        for y in range(yp.H):
            for x in range(2, yp.W - 2):
                if c.a[y, x] and c.a[y, x + 1] and not c.a[y, x + 2] and c.part[y, x] in rimparts:
                    v = c.rgb[y, x].astype(float); c.rgb[y, x] = (v * 0.55 + np.array(rim) * 0.45).astype(np.uint8)
    img = np.zeros((yp.H, yp.W, 4), np.uint8); img[..., :3] = c.rgb; img[..., 3] = c.a * 255
    return img
def arcs(c, cx, cy, radii, a0, a1, col, step=0.12):
    for r in radii:
        a = a0
        while a <= a1:
            c.px(int(round(cx + math.cos(a) * r)), int(round(cy + math.sin(a) * r)), col); a += step / max(1, r / 8)

# ------------------------------------------------------------------ wirarün: a shouting horn on legs
def wirarun(f):
    setsize(56, 60); c = Canvas()
    blob(c, R['violet'], lambda d: [d.rectangle([24, 44, 28, 54], fill=1), d.rectangle([33, 44, 37, 54], fill=1)], bulge=1.0, lift=0.0, name='legs')
    blob(c, R['case'], lambda d: [d.polygon([(20, 53), (29, 53), (29, 57), (18, 57)], fill=1), d.polygon([(32, 53), (40, 53), (41, 57), (32, 57)], fill=1)], bulge=0.8, lift=0.05, name='feet')
    blob(c, R['violet'], lambda d: d.ellipse([20, 26, 44, 48], fill=1), bulge=1.1, lift=0.10, name='body')
    # cable tail with a plug, swinging
    pts = [(42, 40), (49, 44 + f), (52, 36 - f), (48, 30)]
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        for t in np.linspace(0, 1, 12): c.px(int(x0 + (x1 - x0) * t), int(y0 + (y1 - y0) * t), R['case'][1])
    c.rect(46, 26, 4, 4, R['tin'][4]); c.px(47, 24, R['tin'][5]); c.px(49, 24, R['tin'][5])
    # the horn: a funnel opening toward the hero (left)
    blob(c, R['tin'], lambda d: d.polygon([(40, 18), (40, 30), (24, 36), (6, 40), (4, 8), (24, 12)], fill=1), bulge=1.0, lift=0.15, name='horn')
    for k in range(4):
        x = 36 - k * 8
        for y in range(15 - k, 33 + k):
            if c.part[y, x] == 'horn': c.px(x, y, R['tin'][1]); c.px(x + 1, y, R['tin'][5])
    blob(c, R['bell'], lambda d: d.ellipse([3, 9, 13, 39], fill=1), bulge=0.6, lift=-0.1, name='mouth')
    for y in range(12, 37, 3): c.px(5, y, (240, 230, 210)); c.px(6, y + 1, (200, 190, 170))   # teeth
    for y in (18, 30): c.px(12, y, (255, 220, 120))                                          # two hot eyes deep inside
    blob(c, R['tin'], lambda d: d.ellipse([36, 16, 46, 32], fill=1), bulge=1.2, lift=0.1, name='cap')
    arcs(c, 2, 24, [4 + 3 * f, 9 + 3 * f], math.pi * .62, math.pi * 1.38, (250, 220, 120))     # sound pouring out
    return finish(c, [('horn', 'mouth'), ('cap', 'horn'), ('body', 'legs'), ('horn', 'body')], rim=(255, 210, 120), rimparts=('horn', 'body', 'cap'))

# ------------------------------------------------------------------ dewü: the metro rat
def dewu(f):
    setsize(64, 48); c = Canvas()
    pts = [(44, 36), (54, 38), (60, 30 - 2 * f), (58, 22), (52, 20 + f)]                       # long tail
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        for t in np.linspace(0, 1, 14):
            x, y = int(x0 + (x1 - x0) * t), int(y0 + (y1 - y0) * t); c.px(x, y, R['pink'][2]); c.px(x, y + 1, R['pink'][1])
    blob(c, R['rat'], lambda d: d.ellipse([16, 20, 50, 42], fill=1), bulge=1.1, lift=0.12, name='body')
    blob(c, R['rat'], lambda d: d.polygon([(22, 22), (4, 32), (6, 36), (24, 38)], fill=1), bulge=1.1, lift=0.2, name='head')
    blob(c, R['rat'], lambda d: d.ellipse([18, 14, 28, 26], fill=1), bulge=1.0, lift=0.15, name='ear')
    blob(c, R['pink'], lambda d: d.ellipse([20, 16, 26, 23], fill=1), bulge=0.6, lift=0.0, name='earin')
    c.rect(3, 32, 3, 3, R['pink'][3]); c.px(3, 32, R['pink'][4])                                 # nose
    for k, y in enumerate((31, 34)):
        for x in range(0, 6): c.px(x - k, y + (x % 2), R['rat'][6])                             # whiskers
    c.rect(13, 28, 3, 3, (30, 6, 6)); c.px(13, 28, (240, 60, 50)); c.px(14, 28, (255, 150, 120))  # red eye
    for x in (10, 12): c.px(x, 37, (240, 236, 220))                                             # teeth
    for (x, y) in [(20, 41), (28, 42), (38, 42), (46, 41)]:
        blob(c, R['pink'], lambda d, x=x, y=y: d.ellipse([x - 2, y, x + 3 + f, y + 3], fill=1), bulge=0.8, lift=0.1, name='foot')
    for k in range(10): c.px(24 + k * 2, 22 + (k % 3), R['rat'][2])                             # fur ridge
    return finish(c, [('head', 'body'), ('ear', 'head'), ('earin', 'ear'), ('foot', 'body')], rim=(200, 190, 170), rimparts=('body', 'head', 'ear'))

# ------------------------------------------------------------------ shared curve helpers
def cr(pts, n=8):
    """Catmull-Rom through pts: smooth polylines for cables, streamers and silhouettes."""
    out = []; P = [pts[0]] + list(pts) + [pts[-1]]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(n):
            t = k / n; t2 = t * t; t3 = t2 * t
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    out.append(pts[-1]); return out
def smooth_poly(pts, n=6): return cr(list(pts) + [pts[0], pts[1]], n)[:-n]
R.update({k: [hx(c) for c in v] for k, v in {
    'brass': ['#1e1206', '#3a240c', '#5a3a14', '#7c5420', '#a07230', '#c49448', '#e2b868', '#f6dc9c'],
    'smoke': ['#07060c', '#100e1a', '#1a1628', '#262038', '#342c4c', '#463c62', '#5c507c'],
    'rubber': ['#060608', '#101014', '#1c1c22', '#2a2a32', '#3c3c46'],
    'throat': ['#100204', '#280608', '#460c0e', '#6a1612', '#90241a', '#b83a26'],
    'navy2': ['#05070e', '#0b1020', '#131b33', '#1d2848', '#29375e', '#384a78', '#4c6094'],
    'mask2': ['#5a5e6a', '#7a7f8c', '#9ca1ae', '#bec2cc', '#dcdfe6', '#f2f4f8'],
    'chair': ['#1a0e08', '#2e1a10', '#462818', '#603a22', '#7c4e2e', '#9a663c'],
    'blanket': ['#141820', '#20262f', '#2e3540', '#3e4653', '#505a68', '#66717f', '#808b98'],
    'skin2': ['#2a1a16', '#463026', '#664638', '#86604c', '#a67c64', '#c69a80'],
    'drone': ['#08090c', '#121419', '#1e2128', '#2c3039', '#3e434e', '#565c68', '#767d8a']}.items()})

# ------------------------------------------------------------------ helpers for the big wardens
R.update({k: [hx(c) for c in v] for k, v in {
    'steel': ['#0a0f0e', '#142020', '#1f3130', '#2c4442', '#3c5a56', '#527670', '#6e948c', '#94b6ac'],
    'rust':  ['#1a0a04', '#36160a', '#562610', '#783a18', '#9a5224', '#bc6e36'],
    'glow':  ['#3a0604', '#7a1008', '#c42410', '#f45a20', '#ffa050', '#ffe0a0', '#ffffff'],
    'yglow': ['#3a2a04', '#7a5a08', '#c49410', '#f4c820', '#ffe870', '#fff8d0', '#ffffff'],
    'bone':  ['#2a2620', '#4a443a', '#6c6456', '#8e8674', '#b0a892', '#d2cab2', '#eee8d4'],
    'carap': ['#160406', '#30080c', '#4e1014', '#701a1c', '#922826', '#b23a30', '#d0583e'],
    'flesh': ['#140818', '#24102c', '#381a42', '#4e265a', '#683474', '#844690', '#a462ac'],
    'gum':   ['#2a0408', '#4e0a10', '#781818', '#a02a26', '#c8483a'],
    'tongue':['#4a0c18', '#7a1a2a', '#a8303e', '#cc5058', '#e47a78'],
    'eyeg':  ['#0e2a06', '#1e4a0c', '#327014', '#4c9a20', '#72c430', '#a6e454', '#e2ffa0']}.items()})

def glow(c, x, y, r, ramp):
    """a hot light: concentric rings from the core outwards, softly dithered at the rim"""
    for yy in range(int(y - r - 2), int(y + r + 3)):
        for xx in range(int(x - r - 2), int(x + r + 3)):
            d = math.hypot(xx - x, yy - y) / r
            if d < 1: c.px(xx, yy, ramp[min(len(ramp) - 1, int((1 - d) * len(ramp)))])
            elif d < 1.35 and (xx + yy) % 2 == 0 and c.a[min(yp.H - 1, max(0, yy)), min(yp.W - 1, max(0, xx))]:
                v = c.rgb[yy, xx].astype(float); c.rgb[yy, xx] = np.minimum(255, v * .6 + np.array(ramp[2]) * .5).astype(np.uint8)

def ribbed(c, path, w0, w1, ramp, name, lift=.1, every=5):
    """a segmented hose: a tapered tube with a dark seam and a lit ridge at every segment"""
    taper(c, path, w0, w1, ramp, lift=lift, name=name, bulge=1.2)
    acc = 0
    for (x0, y0), (x1, y1) in zip(path, path[1:]):
        seg = math.hypot(x1 - x0, y1 - y0); acc += seg
        if acc >= every:
            acc = 0; nx, ny = -(y1 - y0) / max(seg, .01), (x1 - x0) / max(seg, .01)
            t = path.index((x1, y1)) / len(path); w = (w0 + (w1 - w0) * t) / 2
            for k in np.linspace(-w, w, int(w * 2 + 2)):
                X, Y = int(round(x1 + nx * k)), int(round(y1 + ny * k))
                if 0 <= X < yp.W and 0 <= Y < yp.H and c.part[Y, X] == name:
                    c.rgb[Y, X] = (c.rgb[Y, X] * .45).astype(np.uint8)
                    X2, Y2 = int(round(x1 + nx * k - (x1 - x0) / max(seg, .01))), int(round(y1 + ny * k - (y1 - y0) / max(seg, .01)))
                    if 0 <= X2 < yp.W and 0 <= Y2 < yp.H and c.part[Y2, X2] == name:
                        c.rgb[Y2, X2] = np.minimum(255, c.rgb[Y2, X2].astype(int) + 40).astype(np.uint8)

def facet(c, poly, col, name=None):
    """one flat plane of a form, filled with a single tone: the hand-cut planes that make a face read as solid"""
    m = c.mask(lambda d: d.polygon(poly, fill=1)); c.rgb[m] = col; c.a[m] = True
    if name: c.part[m] = name
    return m
def tooth3(c, x, y0, y1, ramp, name='fang'):
    """a three-tone fang: lit left edge, mid face, shadowed right edge, a sharp tip"""
    for y in range(y0, y1):
        w = max(1, int(round(3 * (1 - (y - y0) / max(1, y1 - y0)))))
        for k in range(w):
            col = ramp[-1] if k == 0 else ramp[-3] if k == w - 1 and w > 1 else ramp[-2]
            c.px(x + k, y, col); c.part[min(yp.H - 1, y), min(yp.W - 1, x + k)] = name
    c.px(x, y1, ramp[2])

def rivets(c, pts, ramp):
    for (x, y) in pts:
        c.px(x, y, ramp[-1]); c.px(x + 1, y + 1, ramp[1]); c.px(x + 1, y, ramp[-3])

def plate_lines(c, part, lines, k=.5):
    for (x0, y0), (x1, y1) in lines:
        n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
        for t in np.linspace(0, 1, n):
            X, Y = int(round(x0 + (x1 - x0) * t)), int(round(y0 + (y1 - y0) * t))
            if 0 <= X < yp.W and 0 <= Y < yp.H and c.part[Y, X] == part:
                c.rgb[Y, X] = (c.rgb[Y, X] * k).astype(np.uint8)
                if Y > 0 and c.part[Y - 1, X] == part: c.rgb[Y - 1, X] = np.minimum(255, c.rgb[Y - 1, X].astype(int) + 30).astype(np.uint8)

# ------------------------------------------------------------------ ngoyngoyün: a walking war-machine of loudspeakers
def ngoyngoyun(f):
    setsize(156, 144); c = Canvas()
    bob = f
    # four mechanical legs: thigh plates, piston shins, clawed feet
    for (hx_, hy_, kx, ky, fx_, fy_, lift) in [(52, 92, 30, 108, 18, 138, .15), (104, 92, 128, 108, 140, 138, -.05), (66, 96, 56, 118, 50, 140, .05), (92, 96, 104, 118, 110, 140, -.08)]:
        taper(c, [(hx_, hy_ + bob), (kx, ky)], 11, 9, R['steel'], lift=lift, name='thigh', bulge=1.2)
        taper(c, [(kx, ky), (fx_, fy_ - 4)], 6, 5, R['steel'], lift=lift - .05, name='shin', bulge=1.1)
        taper(c, [(kx + 2, ky + 2), ((kx + fx_) // 2 + 2, (ky + fy_) // 2)], 3, 3, R['bone'], lift=.2, name='piston', bulge=1.0)
        glow(c, kx, ky, 3, R['glow'][1:5])
        blob(c, R['steel'], lambda d, fx_=fx_, fy_=fy_: d.polygon([(fx_ - 10, fy_), (fx_ + 10, fy_), (fx_ + 6, fy_ - 7), (fx_ - 6, fy_ - 7)], fill=1), bulge=1.0, lift=lift, name='foot')
        for k in (-8, 0, 8): c.px(fx_ + k, fy_ - 1, R['steel'][7]); c.px(fx_ + k, fy_, R['bone'][5])
    # the hull: an armoured dome, riveted, rusting at the seams
    hull = smooth_poly([(78, 34 + bob), (110, 42 + bob), (124, 66 + bob), (116, 94 + bob), (78, 104 + bob), (40, 94 + bob), (32, 66 + bob), (46, 42 + bob)], 6)
    blob(c, R['steel'], lambda d: d.polygon(hull, fill=1), bulge=1.15, lift=.12, name='hull')
    plate_lines(c, 'hull', [((40, 62 + bob), (118, 62 + bob)), ((44, 82 + bob), (114, 82 + bob)), ((78, 36 + bob), (78, 62 + bob)), ((60, 62 + bob), (56, 100 + bob)), ((98, 62 + bob), (102, 100 + bob))])
    rivets(c, [(x, 60 + bob) for x in range(44, 116, 7)] + [(x, 80 + bob) for x in range(48, 112, 7)], R['steel'])
    rs = np.random.RandomState(3)
    for _ in range(70):                                   # rust streaks running down from the seams
        x = rs.randint(40, 118); y0 = rs.choice([63, 83]) + bob
        for k in range(rs.randint(2, 6)):
            if c.part[y0 + k, x] == 'hull': c.px(x, y0 + k, R['rust'][rs.randint(1, 4)])
    # the face: a great speaker-eye in a visor, and a grille of teeth below
    blob(c, R['steel'], lambda d: d.ellipse([52, 42 + bob, 104, 76 + bob], fill=1), bulge=1.2, lift=.0, name='visor')
    blob(c, R['rubber'], lambda d: d.ellipse([58, 46 + bob, 98, 72 + bob], fill=1), bulge=.8, lift=-.1, name='cone')
    for r_ in (17, 12, 7):
        for a in np.linspace(0, 2 * math.pi, 80):
            X, Y = int(78 + math.cos(a) * r_), int(59 + bob + math.sin(a) * r_ * .62)
            if c.part[Y, X] == 'cone': c.px(X, Y, R['rubber'][3] if a < math.pi else R['rubber'][1])
    for r_ in (19, 14, 9):                                # each ring of the cone: a lit upper-left lip, a dark lower-right lip
        for a in np.linspace(0, 2 * math.pi, 140):
            X, Y = int(round(78 + math.cos(a) * r_)), int(round(59 + bob + math.sin(a) * r_ * .62))
            lit = math.cos(a - 3.93) > .2
            if c.part[Y, X] in ('cone', 'visor'): c.px(X, Y, R['rubber'][4] if lit else R['rubber'][0])
    glow(c, 78, 59 + bob, 6, R['glow'])
    c.px(75, 56 + bob, (255, 255, 255)); c.px(76, 56 + bob, (255, 244, 220)); c.px(75, 57 + bob, (255, 244, 220))
    blob(c, R['glow'][:4], lambda d: d.rectangle([60, 80 + bob, 97, 84 + bob], fill=1), bulge=.4, lift=.2, name='maw')
    for k, x in enumerate(range(60, 97, 3)): tooth3(c, x, 84 + bob, 91 + bob + (2 if (k + f) % 2 else 0), R['bone'], 'tooth')
    for x in range(60, 98): c.px(x, 79 + bob, R['steel'][7]); c.px(x, 92 + bob, R['steel'][0]) if c.part[92 + bob, x] == 'hull' else None
    # stacks on the back, venting noise
    for (x, h) in [(58, 18), (98, 22)]:
        blob(c, R['steel'], lambda d, x=x, h=h: d.rounded_rectangle([x - 7, 40 - h + bob, x + 7, 46 + bob], 3, fill=1), bulge=1.2, lift=.18, name='stack')
        for y in range(40 - h + bob + 2, 46 + bob, 4): c.px(x - 6, y, R['steel'][1]); c.px(x + 6, y, R['steel'][1])
        arcs(c, x, 40 - h + bob, [4 + 3 * f, 9 + 3 * f], -math.pi * .85, -math.pi * .15, (252, 214, 120), step=.08)
    # two ribbed arms: the near one swings a huge megaphone at the hero
    ribbed(c, cr([(44, 58 + bob), (24, 46), (14, 62), (22, 82), (40, 90)], 7), 14, 11, R['steel'], 'armL', lift=.18)
    ribbed(c, cr([(112, 58 + bob), (134, 44), (146, 58), (140, 80)], 7), 13, 10, R['steel'], 'armR', lift=-.05)
    blob(c, R['brass'], lambda d: d.polygon([(46, 86), (42, 98), (10, 122 - 3 * f), (8, 96 + 3 * f), (36, 82)], fill=1), bulge=1.1, lift=.2, name='horn')
    for x in (34, 24, 16):
        for y in range(80, 124):
            if c.part[y, x] == 'horn': c.px(x, y, R['brass'][2]); c.px(x + 1, y, R['brass'][6])
    blob(c, R['brass'], lambda d: d.ellipse([4, 94 + 3 * f, 14, 124 - 3 * f], fill=1), bulge=1.0, lift=.3, name='hrim')
    blob(c, R['throat'], lambda d: d.ellipse([5, 97 + 3 * f, 12, 121 - 3 * f], fill=1), bulge=.6, lift=-.1, name='mouth')
    for y in range(100, 118, 3): c.px(7, y, (236, 226, 204))
    blob(c, R['brass'], lambda d: d.polygon([(138, 76), (146, 78), (154, 104), (134, 100)], fill=1), bulge=1.1, lift=.0, name='horn')
    blob(c, R['brass'], lambda d: d.ellipse([132, 96, 155, 106], fill=1), bulge=1.0, lift=.15, name='hrim')
    blob(c, R['throat'], lambda d: d.ellipse([135, 98, 152, 104], fill=1), bulge=.6, lift=-.1, name='mouth')
    arcs(c, 4, 109, [6 + 4 * f, 13 + 4 * f, 20 + 4 * f], math.pi * .62, math.pi * 1.38, (252, 214, 120), step=.06)
    arcs(c, 143, 104, [4 + 3 * f, 9 + 3 * f], math.pi * .2, math.pi * .8, (252, 214, 120), step=.08)
    texture(c, ['hull', 'thigh', 'shin', 'foot', 'stack', 'armL', 'armR', 'visor'], amt=.09, seed=2)
    texture(c, ['horn', 'hrim'], amt=.05, seed=3)
    occlude(c, ['armL', 'horn', 'visor', 'tooth'], ['hull', 'thigh'], r=4, k=.55)
    occlude(c, ['hull'], ['thigh', 'shin', 'piston'], r=5, k=.5)
    speculars(c, ['horn', 'hrim', 'hull', 'stack', 'armL', 'armR', 'visor'], thr=.84)
    return finish(c, [('visor', 'hull'), ('cone', 'visor'), ('tooth', 'maw'), ('armL', 'hull'), ('armR', 'hull'), ('horn', 'armL'), ('horn', 'armR'), ('mouth', 'hrim'), ('hrim', 'horn'), ('stack', 'hull'),
                      ('thigh', 'hull'), ('shin', 'thigh'), ('foot', 'shin'), ('piston', 'shin')],
                  rim=(255, 170, 90), rimparts=('hull', 'armR', 'thigh', 'shin', 'stack', 'visor'))

# ------------------------------------------------------------------ ngamleftripael: a carapaced spider of the lines, every leg pulling away
def ngamlef(f):
    setsize(156, 132); c = Canvas()
    LC = [(214, 52, 46), (236, 190, 40), (54, 160, 76), (58, 112, 210), (150, 78, 196)]
    # eight long legs, each a metro line: plates of its colour, joints of bone, a red claw
    legs = [((62, 62), (36, 40), (14, 54), (2, 80)), ((60, 70), (30, 66), (12, 90), (6, 118)), ((66, 78), (44, 92), (34, 116), (30, 130)), ((72, 80), (62, 102), (60, 122), (56, 132)),
            ((96, 62), (120, 40), (142, 54), (154, 80)), ((98, 70), (126, 66), (144, 90), (150, 118)), ((92, 78), (112, 92), (122, 116), (126, 130)), ((86, 80), (96, 102), (98, 122), (102, 132))]
    for k, (a, b, c2, d) in enumerate(legs):
        col = LC[k % 5]; ramp = [tuple(int(v * m) for v in col) for m in (.18, .32, .5, .7, .88)] + [tuple(min(255, int(v + 60)) for v in col)]
        dx = (-1 if a[0] < 80 else 1) * f
        b2, c3, d2 = (b[0] + dx, b[1]), (c2[0] + dx * 2, c2[1]), (d[0] + dx * 2, d[1])
        lift = .15 if a[0] < 80 else -.04
        taper(c, [a, b2], 9, 8, ramp, lift=lift, name='leg', bulge=1.2)
        taper(c, [b2, c3], 7, 6, ramp, lift=lift, name='leg', bulge=1.2)
        glow(c, b2[0], b2[1], 3, R['bone'][2:])
        blob(c, R['carap'], lambda d_, c3=c3, d2=d2: d_.polygon([(c3[0] - 3, c3[1]), (c3[0] + 3, c3[1]), (d2[0], d2[1])], fill=1), bulge=1.0, lift=lift + .05, name='claw')
        for t in (.3, .7):                                 # stations: white rivets along each line
            x, y = int(b2[0] + (c3[0] - b2[0]) * t), int(b2[1] + (c3[1] - b2[1]) * t); c.rect(x - 1, y - 1, 2, 2, (250, 250, 250))
    # abdomen: a great armoured body of overlapping plates, banded like a map
    blob(c, R['carap'], lambda d: d.ellipse([88, 28, 150, 82], fill=1), bulge=1.2, lift=.04, name='abd')
    for k, x in enumerate(range(96, 148, 9)):
        plate_lines(c, 'abd', [((x, 28), (x - 6, 82))], .55)
        for y in range(30, 82):                                # each plate edged with one metro line, unbroken
            X = x + 2 - int((y - 28) * 6 / 54)
            if c.part[y, X] == 'abd': c.px(X, y, tuple(int(v * .85) for v in LC[k % 5]))
    # thorax plates and a skull-like head, glowing eyes, fangs
    blob(c, R['carap'], lambda d: d.ellipse([54, 44, 104, 88], fill=1), bulge=1.2, lift=.14, name='thx')
    plate_lines(c, 'thx', [((60, 60), (100, 56)), ((58, 72), (102, 70)), ((80, 46), (78, 86))], .55)
    rivets(c, [(64, 58), (72, 57), (88, 56), (96, 57), (66, 70), (94, 69)], R['bone'])
    B = R['bone']; K = (8, 5, 6)
    blob(c, B, lambda d: d.polygon(smooth_poly([(62, 64), (78, 56), (92, 64), (94, 82), (86, 100), (66, 100), (58, 84)], 5), fill=1), bulge=1.2, lift=.2, name='skull')
    facet(c, [(62, 66), (70, 59), (78, 57), (76, 64), (66, 70)], B[6]); facet(c, [(78, 57), (86, 59), (92, 65), (88, 70), (76, 64)], B[4])
    facet(c, [(66, 70), (76, 64), (88, 70), (84, 72), (70, 73)], B[5]); facet(c, [(62, 66), (66, 70), (64, 80), (59, 78), (59, 70)], B[4])
    facet(c, [(92, 65), (94, 72), (93, 80), (89, 79), (88, 70)], B[2])
    for x in range(64, 76): c.px(x, 70 - (x - 64) // 8, B[6])
    for x in range(80, 89): c.px(x, 70, B[5])
    for (x0, y0) in [(70, 60), (71, 61), (72, 63), (72, 64), (73, 65)]: c.px(x0, y0, B[1])          # a crack across the crown
    facet(c, [(62, 79), (71, 80), (74, 84), (66, 86), (60, 84)], B[5]); facet(c, [(60, 84), (66, 86), (65, 90), (61, 89)], B[2])
    facet(c, [(82, 80), (91, 79), (92, 84), (86, 86), (80, 84)], B[3]); facet(c, [(86, 86), (92, 84), (91, 89), (87, 90)], B[1])
    facet(c, [(66, 86), (74, 84), (80, 84), (86, 86), (85, 90), (67, 90)], B[4])
    for poly in ([(63, 71), (73, 70), (74, 76), (70, 79), (64, 78)], [(80, 70), (89, 71), (89, 77), (84, 79), (80, 76)]):
        facet(c, poly, K, 'socket'); xs_ = [p[0] for p in poly]; ys_ = [p[1] for p in poly]
        for x in range(min(xs_) + 1, max(xs_)): c.px(x, min(ys_) + 1, (34, 26, 24))                  # the orbit's upper rim, in shadow
    facet(c, [(76, 77), (78, 77), (80, 83), (74, 83)], K); c.px(77, 78, B[2])
    for (ex, ey) in [(69, 74), (85, 74)]:
        glow(c, ex, ey, 3, R['yglow']); c.px(ex - 1, ey - 1, (255, 255, 255))
    c.rect(66, 90, 22, 1, K)
    for k, x in enumerate(range(66, 87, 3)): tooth3(c, x, 91, 97 + (2 if (k + f) % 2 else 0), B)
    facet(c, [(64, 99), (88, 99), (86, 102), (66, 102)], B[1])
    blob(c, R['carap'], lambda d: d.polygon([(56, 98), (48, 112), (62, 104)], fill=1), bulge=1.0, lift=.15, name='mand')
    blob(c, R['carap'], lambda d: d.polygon([(96, 98), (104, 112), (90, 104)], fill=1), bulge=1.0, lift=.0, name='mand')
    # threads snapping between the legs: the people pulled apart
    for (x0, y0, x1, y1) in [(14, 54, 36, 40), (142, 54, 120, 40), (12, 90, 34, 116), (144, 90, 122, 116)]:
        for t in np.linspace(0, 1, 18):
            if int(t * 18 + f) % 3: c.px(int(x0 + (x1 - x0) * t), int(y0 + (y1 - y0) * t + math.sin(t * 8) * 2), (220, 226, 240))
    texture(c, ['abd', 'thx', 'mand', 'claw'], amt=.10, seed=5)
    texture(c, ['skull', 'fang'], amt=.08, seed=6, scale=.6)
    texture(c, ['leg'], amt=.06, seed=7)
    occlude(c, ['skull', 'thx'], ['abd', 'leg'], r=4, k=.5)
    speculars(c, ['abd', 'thx', 'skull', 'leg', 'claw'], thr=.86)
    return finish(c, [('skull', 'thx'), ('socket', 'skull'), ('fang', 'skull'), ('thx', 'abd'), ('leg', 'thx'), ('leg', 'abd'), ('claw', 'leg'), ('mand', 'skull')],
                  rim=(255, 120, 90), rimparts=('abd', 'thx', 'skull', 'leg'))

# ------------------------------------------------------------------ texture and light passes shared by the wardens
def texture(c, parts, amt=.07, seed=1, scale=1.0):
    amt *= .35
    """per-pixel grain on the named parts: pores, scratches, grit; brighter on lit pixels, quieter in shadow"""
    rs = np.random.RandomState(seed); n = rs.rand(yp.H, yp.W)
    from scipy.ndimage import gaussian_filter as gf
    n = (n - .5) + (gf(rs.rand(yp.H, yp.W), 1.2 * scale) - .5) * 2.4
    m = np.isin(c.part, parts) & c.a
    lum = c.rgb[..., :3].mean(axis=2) / 255.0
    k = 1 + n * amt * (0.5 + lum)
    c.rgb[m] = np.clip(c.rgb[m] * k[m][:, None], 0, 255).astype(np.uint8)
def occlude(c, top, under, r=3, k=.55):
    """contact shadow: darken pixels of `under` parts that lie within r px below/right of a `top` part"""
    a = np.isin(c.part, top); b = np.isin(c.part, under)
    sh = np.zeros_like(a)
    for d in range(1, r + 1):
        sh[d:, d // 2:] |= a[:-d, :yp.W - d // 2]
    m = sh & b
    c.rgb[m] = (c.rgb[m] * k).astype(np.uint8)
def speculars(c, parts, thr=.78, col=(255, 252, 240)):
    """hard glints where a lit surface turns toward the light"""
    lum = c.rgb[..., :3].mean(axis=2)
    m = np.isin(c.part, parts) & c.a
    up = np.roll(lum, 1, 0); left = np.roll(lum, 1, 1)
    g = m & (lum > lum[m].max() * thr if m.any() else False) & (lum >= up) & (lum >= left)
    ys, xs = np.nonzero(g)
    for y, x in zip(ys[::3], xs[::3]): c.rgb[y, x] = col

R.update({k: [hx(c) for c in v] for k, v in {
    'ash':   ['#08070b', '#110f15', '#1a171f', '#24202a', '#2f2a36', '#3b3543', '#494151', '#584f61', '#6a6072', '#7e7486', '#968c9c'],
    'gaunt': ['#0e0c10', '#1c181e', '#2c2630', '#3e3642', '#524956', '#685e6a', '#80767e', '#9a9096', '#b6acb0'],
    'nail':  ['#060406', '#120c0e', '#1e1416', '#2c1e20', '#3a2a2a'],
    'clock': ['#2a2014', '#4a3a24', '#6e5a3a', '#94805a', '#bcaa82', '#e2d4ae', '#fbf2d8'],
    'cold':  ['#06181e', '#0c3038', '#145058', '#24787e', '#4aa4a8', '#8ad4d2', '#d8fbf6']}.items()})

# ------------------------------------------------------------------ mapudungukenoael fillantü: a floating figure with wings of crossed-out days
R.update({k: [hx(c) for c in v] for k, v in {
    'muse':  ['#0f0a12', '#1c1420', '#2b2132', '#3d2f46', '#51405c', '#685474', '#816c8c', '#9c87a6', '#b9a6c0'],
    'robe':  ['#08060a', '#120d15', '#1c1421', '#271c2e', '#33253c', '#41304b', '#52405c'],
    'page2': ['#3a3228', '#5e5444', '#857a64', '#ab9f86', '#cdc2a6', '#e8dec4', '#faf4e2']}.items()})

def page_feather(c, base, tip, w0, w1, lift, name, f=0, mark=True):
    """a feather made of a calendar page: cream paper shaded along its length, a red header at the tip, days crossed out"""
    (x0, y0), (x1, y1) = base, tip
    L = math.hypot(x1 - x0, y1 - y0); ux, uy = (x1 - x0) / L, (y1 - y0) / L; nx, ny = -uy, ux
    poly = [(x0 + nx * w0 / 2, y0 + ny * w0 / 2), (x1 + nx * w1 / 2, y1 + ny * w1 / 2), (x1 + ux * 2, y1 + uy * 2), (x1 - nx * w1 / 2, y1 - ny * w1 / 2), (x0 - nx * w0 / 2, y0 - ny * w0 / 2)]
    m = c.mask(lambda d: d.polygon(poly, fill=1))
    ys, xs = np.nonzero(m)
    if not len(ys): return m
    t = ((xs - x0) * ux + (ys - y0) * uy) / L; side = ((xs - x0) * nx + (ys - y0) * ny) / max(1, w1 / 2)
    lum = .86 + lift - t * .26 - side * .12
    ramp = R['page2']; idx = np.clip(np.floor(lum * (len(ramp) - 1) + (yp.BAYER[ys % 4, xs % 4] - .5) * .2).astype(int), 0, len(ramp) - 1)
    c.rgb[ys, xs] = np.array(ramp)[idx]; c.a[ys, xs] = True; c.part[ys, xs] = name
    edge = m & ~(np.roll(m, 1, 0) & np.roll(m, -1, 0) & np.roll(m, 1, 1) & np.roll(m, -1, 1))
    ey, ex = np.nonzero(edge); c.rgb[ey, ex] = (c.rgb[ey, ex] * .45).astype(np.uint8)   # each page cut out from the next
    hd = (t > .9) & ~edge[ys, xs]                           # the red header strip of the page
    c.rgb[ys[hd], xs[hd]] = np.array([(150, 40, 34), (186, 58, 46), (212, 86, 66)])[np.clip((lum[hd] * 3).astype(int) - 1, 0, 2)]
    for k in range(2, int(L * .8), 4):                        # rows of days, every one crossed out
        cx_, cy_ = x0 + ux * k, y0 + uy * k
        for q in (-1, 1):
            X, Y = int(cx_ + nx * q * w0 / 5), int(cy_ + ny * q * w0 / 5)
            if 0 <= X < yp.W and 0 <= Y < yp.H and c.part[Y, X] == name: c.px(X, Y, (120, 40, 36) if mark else ramp[2])
    sp = [(int(x0 + ux * k), int(y0 + uy * k)) for k in range(0, int(L))]   # the shaft
    for (X, Y) in sp:
        if 0 <= X < yp.W and 0 <= Y < yp.H and c.part[Y, X] == name: c.px(X, Y, ramp[1])
    return m

def wing(c, shoulder, wrist, tip, n, side, lift, name, f):
    """a wing: a bony arm from shoulder to wrist to tip, page-feathers fanning from it in three ranks,
    long primaries at the tip swept outward, short coverts near the shoulder hanging down"""
    bone = cr([shoulder, wrist, tip], 10)
    for rank, (ln, w0, w1, lf) in enumerate([(50, 6, 11, 0), (34, 6, 10, .08), (20, 6, 9, .16)]):
        cnt = n - rank * 2
        for k in range(cnt):
            t = .1 + .9 * k / max(1, cnt - 1); bx, by = bone[int(t * (len(bone) - 1))]
            ang = math.radians(90 + side * (62 * t ** 1.2) + f * 3 * side)
            L_ = ln * (.62 + .32 * t) * (1 if rank == 0 else .9)
            page_feather(c, (bx, by), (bx + math.cos(ang) * L_, by + math.sin(ang) * L_), w0, w1, lift + lf, name, f)
    taper(c, bone, 6, 3, R['muse'], lift=lift + .1, name=name + 'bone', bulge=1.2)

def fillantu(f):
    setsize(164, 152); c = Canvas()
    fl = f                                                 # the whole figure bobs as it floats
    # the far wing, spread up and back to the right, in shadow
    wing(c, (96, 46 + fl), (122, 18 + fl), (140, 6 + fl), 9, -1, -.12, 'wingF', f)
    # the near wing, spread toward the hero
    wing(c, (68, 48 + fl), (42, 18 + fl), (24, 6 + fl), 9, 1, .1, 'wingN', f)
    # wisps of shadow trailing from the hem, as if it were sinking
    for k in range(7):
        x0 = 58 + k * 8
        taper(c, cr([(x0, 136 + fl), (x0 - 6 + k, 144), (x0 - 12 + k * 2 + f * 2, 151)], 5), 6, 1, R['robe'][:4], lift=-.1, name='wisp', bulge=.9)
    # a heavy robe like a blanket, wrapped at the hips and pulled by a wind that is not there
    robe = [(64, 80), (98, 80), (108, 98), (122, 122), (120, 142), (108, 136), (98, 148), (86, 138), (74, 148), (62, 138), (50, 146), (46, 126), (54, 100)]
    blob(c, R['robe'], lambda d: d.polygon([(x, y + fl) for x, y in robe], fill=1), bulge=1.0, lift=.06, name='robe')
    for (pts) in [[(70, 84), (62, 110), (56, 138)], [(82, 84), (80, 112), (84, 140)], [(92, 84), (100, 108), (110, 134)], [(66, 92), (88, 96), (104, 92)]]:
        prev = None
        for (x, y) in cr([(x, y + fl) for x, y in pts], 30):      # unbroken folds: a dark crease with a lit lip beside it
            X, Y = int(round(x)), int(round(y))
            if (X, Y) == prev: continue
            prev = (X, Y)
            if c.part[Y, X] == 'robe': c.px(X, Y, R['robe'][0]); c.px(X - 1, Y, R['robe'][5]); c.px(X + 1, Y, R['robe'][2])
    for x in range(48, 122):                                # a frayed, darned hem
        for y in range(120, 152):
            if c.part[y, x] == 'robe' and (y + 1 >= 152 or c.part[y + 1, x] != 'robe'):
                c.px(x, y, R['robe'][5] if x % 3 else R['robe'][1]); break
    # torso: gaunt but corded with muscle
    blob(c, R['muse'], lambda d: d.polygon([(64, 44 + fl), (98, 44 + fl), (96, 66 + fl), (92, 82 + fl), (70, 82 + fl), (66, 66 + fl)], fill=1), bulge=1.1, lift=.04, name='torso')
    for (box, lift, nm_) in [((64, 44, 81, 58), .2, 'pec'), ((80, 44, 97, 58), .04, 'pec'),
                             ((73, 58, 81, 64), .2, 'abs'), ((80, 58, 88, 64), .06, 'abs'), ((73, 64, 81, 70), .16, 'abs'), ((80, 64, 88, 70), .02, 'abs'),
                             ((73, 70, 81, 77), .1, 'abs'), ((80, 70, 88, 77), -.02, 'abs'), ((65, 56, 73, 74), .08, 'obl'), ((88, 56, 96, 74), -.06, 'obl')]:
        x0, y0, x1, y1 = box
        blob(c, R['muse'], lambda d, x0=x0, y0=y0, x1=x1, y1=y1: d.ellipse([x0, y0 + fl, x1, y1 + fl], fill=1), bulge=1.25, lift=lift, name=nm_)
    for k in range(4):                                      # ribs across the flank
        for t in np.linspace(0, 1, 8):
            X, Y = int(66 + t * 6), int(60 + k * 4 + t * 2 + fl)
            if c.part[Y, X] in ('obl', 'torso'): c.px(X, Y, R['muse'][2]); c.px(X, Y - 1, R['muse'][6])
    # shoulders and the far arm, raised, long fingers spread
    blob(c, R['muse'], lambda d: d.ellipse([90, 40 + fl, 106, 56 + fl], fill=1), bulge=1.3, lift=-.02, name='delt')
    taper(c, cr([(100, 48 + fl), (114, 42 + fl), (126, 38 + fl)], 6), 10, 8, R['muse'], lift=-.02, name='armF', bulge=1.25)
    taper(c, cr([(126, 38 + fl), (136, 30 + fl), (142, 24 + fl)], 6), 8, 6, R['muse'], lift=0, name='armF', bulge=1.25)
    for k in range(5):
        a_ = math.radians(-110 + k * 26)
        taper(c, [(142, 24 + fl), (142 + math.cos(a_) * 8, 24 + fl + math.sin(a_) * 8), (142 + math.cos(a_ + .3) * 15, 24 + fl + math.sin(a_ + .3) * 15)], 3, 1, R['muse'], lift=.05, name='fingF', bulge=1.1)
    # the head, bowed a little toward the hero; shadow streaming back from it like hair
    for k in range(6):
        taper(c, cr([(84, 16 + fl + k * 2), (100, 14 + fl + k * 3 - f), (118, 18 + fl + k * 4), (132, 14 + fl + k * 5 + f * 2)], 5), 4, 1, R['robe'][1:6], lift=-.05, name='hair', bulge=1.0)
    taper(c, [(80, 46 + fl), (78, 36 + fl)], 10, 9, R['muse'], lift=.1, name='neck', bulge=1.2)
    head = [(76, 10), (86, 9), (92, 16), (92, 26), (88, 34), (82, 40), (75, 39), (70, 32), (69, 22), (71, 14)]
    blob(c, R['muse'], lambda d: d.polygon(cr([(x, y + fl) for x, y in head] + [(head[0][0], head[0][1] + fl)], 4), fill=1), bulge=1.3, lift=.12, name='head')
    G = R['muse']
    facet(c, [(72, 15 + fl), (80, 10 + fl), (89, 13 + fl), (88, 20 + fl), (74, 21 + fl)], G[7])          # brow plane
    facet(c, [(89, 13 + fl), (92, 18 + fl), (91, 28 + fl), (88, 23 + fl)], G[3])                         # temple turned away
    facet(c, [(70, 24 + fl), (76, 26 + fl), (76, 31 + fl), (71, 31 + fl)], G[8])                         # lit cheekbone
    facet(c, [(84, 26 + fl), (90, 25 + fl), (88, 31 + fl), (84, 31 + fl)], G[4])
    facet(c, [(73, 33 + fl), (86, 33 + fl), (82, 39 + fl), (76, 39 + fl)], G[5])                         # jaw
    for x in range(71, 90): c.px(x, 21 + fl, G[8] if x < 80 else G[6])                                  # brow ridge
    for (ex, ey) in [(75, 24), (85, 23)]:
        for x in range(ex - 3, ex + 4): c.px(x, ey + fl, (8, 6, 12)); c.px(x, ey + 1 + fl, (20, 14, 26))
        c.px(ex + (1 if f else 0), ey + fl, (214, 252, 250)); c.px(ex - 1 + (1 if f else 0), ey + fl, (110, 190, 196))
    for k, x in enumerate(range(71, 88)):                                                                 # the zipped mouth
        y = 34 + fl + (1 if 74 < x < 84 else 0)
        c.px(x, y, R['zip'][3] if k % 2 else R['zip'][1]); c.px(x, y - 1, R['zip'][2] if k % 2 else R['zip'][4])
        if k % 3 == 0: c.px(x, y + 1, (232, 222, 200))
    blob(c, R['zip'], lambda d: d.rounded_rectangle([86, 33 + fl, 89, 39 + fl], 1, fill=1), bulge=.9, lift=.3, name='pull')
    # the near arm, reaching down toward the hero with a stopped clock in its fingers
    blob(c, R['muse'], lambda d: d.ellipse([56, 40 + fl, 72, 56 + fl], fill=1), bulge=1.3, lift=.2, name='delt')
    taper(c, cr([(62, 50 + fl), (52, 60 + fl), (46, 68 + fl)], 6), 10, 8, R['muse'], lift=.18, name='arm', bulge=1.25)
    taper(c, cr([(46, 68 + fl), (38, 78 + fl), (32, 86 + fl)], 6), 8, 6, R['muse'], lift=.22, name='arm', bulge=1.25)
    blob(c, R['clock'], lambda d: d.ellipse([12, 84 + fl, 34, 106 + fl], fill=1), bulge=1.1, lift=.15, name='clock')
    blob(c, [(200, 196, 180), (226, 222, 206), (244, 240, 226)], lambda d: d.ellipse([15, 87 + fl, 31, 103 + fl], fill=1), bulge=.5, lift=.2, name='dial')
    for a in range(12):
        c.px(int(23 + math.cos(a * math.pi / 6) * 6), int(95 + fl + math.sin(a * math.pi / 6) * 6), (60, 50, 40))
    for t in np.linspace(0, 1, 5): c.px(int(23 + t * 4), int(95 + fl - t), (30, 24, 20)); c.px(23, int(95 + fl - t * 5), (30, 24, 20))
    for (x1, y1) in [(22, 84), (30, 84), (35, 92), (32, 100)]:
        taper(c, cr([(32, 86 + fl), ((32 + x1) // 2 + 1, (86 + y1) // 2 + fl - 2), (x1, y1 + fl)], 5), 3, 2, R['muse'], lift=.2, name='finger', bulge=1.1)
    # cold rim light on everything facing the hero
    lit = np.zeros((yp.H, yp.W), bool)
    for dx in (1, 2): lit |= c.a & ~np.roll(c.a, dx, 1)
    lit &= np.isin(c.part, ['head', 'neck', 'arm', 'finger', 'torso', 'pec', 'obl', 'delt', 'robe', 'abs'])
    ys, xs = np.nonzero(lit)
    for y, x in zip(ys, xs):
        k = .5 if not c.a[y, x - 1] else .3
        c.rgb[y, x] = (c.rgb[y, x] * (1 - k) + np.array((120, 210, 220)) * k).astype(np.uint8)
    occlude(c, ['arm', 'delt', 'torso', 'pec', 'robe'], ['wingN', 'wingNbone'], r=4, k=.55)
    occlude(c, ['head', 'neck'], ['torso', 'pec', 'delt', 'hair'], r=3, k=.6)
    speculars(c, ['clock', 'head', 'pec', 'delt'], thr=.9, col=(240, 236, 246))
    return finish(c, [('pec', 'pec'), ('abs', 'abs'), ('pec', 'abs'), ('obl', 'abs'), ('obl', 'torso'), ('delt', 'torso'), ('delt', 'arm'), ('arm', 'torso'), ('neck', 'torso'), ('head', 'neck'),
                      ('torso', 'robe'), ('finger', 'clock'), ('clock', 'arm'), ('armF', 'delt'), ('fingF', 'armF'), ('hair', 'head'), ('pull', 'head')],
                  rim=(140, 120, 200), rimparts=('wingF', 'robe', 'armF', 'hair'))

# ------------------------------------------------------------------ pañilwe üñüm: a drone, the metal bird of the city
def drone(f):
    setsize(60, 40); c = Canvas()
    for (x, y) in [(8, 10), (52, 10)]:                                                # arms to the rotors
        taper(c, [(30, 18), (x, y)], 4, 3, R['drone'], lift=0.1, name='arm', bulge=1.0)
    for (x, y) in [(8, 10), (52, 10)]:
        blob(c, R['drone'], lambda d, x=x, y=y: d.ellipse([x - 3, y - 2, x + 3, y + 3], fill=1), bulge=1.0, lift=0.2, name='motor')
        w = 12 if f else 9                                                           # the blur of the blades
        for xx in range(x - w, x + w + 1):
            if (xx + f) % 2 == 0: c.px(xx, y - 3, (200, 210, 224)); c.px(xx, y - 4, (150, 160, 176)) if abs(xx - x) < w - 3 else None
    blob(c, R['drone'], lambda d: d.rounded_rectangle([16, 12, 44, 26], 6, fill=1), bulge=1.1, lift=0.18, name='body')
    for x in range(20, 41): c.px(x, 16, R['drone'][6]) if x % 3 else None             # vents
    blob(c, R['drone'], lambda d: d.ellipse([12, 18, 24, 30], fill=1), bulge=1.1, lift=0.1, name='cam')
    blob(c, [(20, 4, 6), (90, 14, 20), (200, 40, 40), (255, 120, 110)], lambda d: d.ellipse([14, 20, 21, 27], fill=1), bulge=0.8, lift=0.1, name='lens')
    c.px(16, 22, (255, 230, 220))
    if f: c.rect(28, 8, 2, 2, (255, 60, 50))                                         # blinking light
    blob(c, R['brass'], lambda d: d.polygon([(34, 26), (40, 26), (44, 36), (30, 36)], fill=1), bulge=1.0, lift=0.1, name='horn')   # a little loudspeaker underneath
    arcs(c, 37, 38, [3 + 2 * f], math.pi * .15, math.pi * .85, (250, 214, 120))
    return finish(c, [('cam', 'body'), ('lens', 'cam'), ('arm', 'body'), ('horn', 'body'), ('motor', 'arm')], rim=(180, 200, 230), rimparts=('body', 'cam', 'arm'))

if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__)); out = {}
    from PIL import Image
    strip = []
    for name, fn in [('wirarun', wirarun), ('dewu', dewu), ('drone', drone), ('ngoyngoyun', ngoyngoyun), ('ngamlef', ngamlef), ('fillantu', fillantu)]:
        big = [fn(0), fn(1)]; small = [yp.half(b) for b in big]
        pb, fb = yp.encode(big); ps, fs = yp.encode(small)
        out[name] = {'big': {'pal': pb, 'f': fb}, 'small': {'pal': ps, 'f': fs}}
        im = Image.new('RGBA', (160, 150), (40, 50, 70, 255)); b0 = Image.fromarray(big[0]); im.paste(b0, ((160 - b0.width) // 2, 150 - b0.height), b0)
        strip.append(im)
    sheet = Image.new('RGBA', (160 * len(strip), 150)); [sheet.paste(s, (i * 160, 0)) for i, s in enumerate(strip)]
    sheet.resize((sheet.width * 3, 450), Image.NEAREST).save('/home/claude/waria_sheet.png')
    json.dump(out, open(os.path.join(here, 'waria.json'), 'w'))
    print('ok')
