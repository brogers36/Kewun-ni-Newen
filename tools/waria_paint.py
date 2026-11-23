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
    glow(c, 78, 59 + bob, 6, R['glow'])
    for x in range(60, 98, 3):                            # the grille: a row of steel teeth
        blob(c, R['bone'], lambda d, x=x: d.polygon([(x, 84 + bob), (x + 3, 84 + bob), (x + 1.5, 92 + bob + (2 if (x // 3 + f) % 2 else 0))], fill=1), bulge=.9, lift=.15, name='tooth')
    blob(c, R['glow'][:4], lambda d: d.rectangle([60, 80 + bob, 97, 84 + bob], fill=1), bulge=.4, lift=.2, name='maw')
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
        for y in range(34, 78, 6):
            if c.part[y, x - 3 - (y - 30) // 10] == 'abd': c.px(x - 3 - (y - 30) // 10, y, LC[k % 5])
    # thorax plates and a skull-like head, glowing eyes, fangs
    blob(c, R['carap'], lambda d: d.ellipse([54, 44, 104, 88], fill=1), bulge=1.2, lift=.14, name='thx')
    plate_lines(c, 'thx', [((60, 60), (100, 56)), ((58, 72), (102, 70)), ((80, 46), (78, 86))], .55)
    rivets(c, [(64, 58), (72, 57), (88, 56), (96, 57), (66, 70), (94, 69)], R['bone'])
    blob(c, R['bone'], lambda d: d.polygon(smooth_poly([(62, 64), (78, 58), (90, 64), (92, 82), (84, 98), (66, 98), (58, 84)], 5), fill=1), bulge=1.2, lift=.2, name='skull')
    for (ex, ey) in [(68, 74), (84, 73)]:
        blob(c, [(10, 6, 8), (24, 14, 14)], lambda d, ex=ex, ey=ey: d.ellipse([ex - 5, ey - 4, ex + 5, ey + 4], fill=1), bulge=.5, name='socket')
        glow(c, ex, ey, 3, R['yglow'])
    for x in range(64, 90, 3):                             # a jaw full of fangs
        blob(c, R['bone'], lambda d, x=x: d.polygon([(x, 90), (x + 3, 90), (x + 1.5, 97 + (2 if x % 2 else 0) + f)], fill=1), bulge=.9, lift=.25, name='fang')
    c.rect(66, 89, 22, 2, (20, 4, 6))
    blob(c, R['carap'], lambda d: d.polygon([(56, 98), (48, 112), (62, 104)], fill=1), bulge=1.0, lift=.15, name='mand')
    blob(c, R['carap'], lambda d: d.polygon([(96, 98), (104, 112), (90, 104)], fill=1), bulge=1.0, lift=.0, name='mand')
    # threads snapping between the legs: the people pulled apart
    for (x0, y0, x1, y1) in [(14, 54, 36, 40), (142, 54, 120, 40), (12, 90, 34, 116), (144, 90, 122, 116)]:
        for t in np.linspace(0, 1, 18):
            if int(t * 18 + f) % 3: c.px(int(x0 + (x1 - x0) * t), int(y0 + (y1 - y0) * t + math.sin(t * 8) * 2), (220, 226, 240))
    return finish(c, [('skull', 'thx'), ('socket', 'skull'), ('fang', 'skull'), ('thx', 'abd'), ('leg', 'thx'), ('leg', 'abd'), ('claw', 'leg'), ('mand', 'skull')],
                  rim=(255, 120, 90), rimparts=('abd', 'thx', 'skull', 'leg'))

# ------------------------------------------------------------------ mapudungukenoael fillantü: a heap of mouths sewn shut, heavy eyes on stalks
def fillantu(f):
    setsize(150, 140); c = Canvas()
    # drooping tendrils underneath, dripping
    for k, x in enumerate(range(30, 126, 12)):
        taper(c, cr([(x, 104), (x - 4 + (k % 3) * 3, 118), (x - 2 + f * (1 if k % 2 else -1), 132 + (k % 3) * 2)], 6), 7, 2, R['flesh'], lift=-.05, name='tend', bulge=1.0)
        if k % 2: c.px(x - 2, 136 + (k % 3), R['flesh'][5])
    # the bloated body
    body = smooth_poly([(76, 20), (112, 28), (138, 56), (136, 92), (112, 112), (76, 118), (40, 112), (16, 90), (14, 56), (40, 28)], 6)
    blob(c, R['flesh'], lambda d: d.polygon(body, fill=1), bulge=1.25, lift=.12, name='body')
    rs = np.random.RandomState(9)
    for _ in range(160):                                  # mottled, veined skin
        x, y = rs.randint(18, 136), rs.randint(24, 114)
        if c.part[y, x] == 'body':
            c.px(x, y, R['flesh'][rs.randint(1, 3)])
            if rs.rand() < .3: c.px(x + 1, y + 1, R['flesh'][1])
    # small mouths all over it, every one sewn shut with a zip
    for (x, y, w) in [(36, 50, 14), (112, 46, 14), (30, 82, 12), (118, 80, 14), (58, 34, 10), (96, 32, 10)]:
        blob(c, R['gum'], lambda d, x=x, y=y, w=w: d.ellipse([x - w // 2, y - 4, x + w // 2, y + 4], fill=1), bulge=1.0, lift=.05, name='lip')
        for xx in range(x - w // 2 + 2, x + w // 2 - 1):
            c.px(xx, y, R['zip'][2] if xx % 2 else R['zip'][3]); c.px(xx, y - 1 if xx % 2 else y + 1, R['zip'][1])
        for xx in range(x - w // 2 + 2, x + w // 2 - 1, 3): c.px(xx, y + 2, (236, 226, 204))   # teeth pressing behind the zip
    # the great maw: straining against a broken zip, teeth and a lolling tongue
    blob(c, R['gum'], lambda d: d.ellipse([42, 62, 112, 108], fill=1), bulge=1.0, lift=.0, name='lip')
    blob(c, [(8, 2, 4), (24, 4, 8), (44, 8, 14)], lambda d: d.ellipse([48, 70, 106, 102], fill=1), bulge=.6, lift=-.1, name='throat')
    for k, x in enumerate(range(50, 104, 5)):              # upper and lower fangs
        h = 8 + (k % 3) * 3
        blob(c, R['bone'], lambda d, x=x, h=h: d.polygon([(x, 72), (x + 5, 72), (x + 2.5, 72 + h)], fill=1), bulge=.9, lift=.25, name='fang')
        blob(c, R['bone'], lambda d, x=x, h=h: d.polygon([(x + 2, 101), (x + 7, 101), (x + 4.5, 101 - h + 2)], fill=1), bulge=.9, lift=.1, name='fang')
    taper(c, cr([(72, 96), (66, 108), (58, 120 + 2 * f), (62, 128 + 2 * f)], 6), 12, 7, R['tongue'], lift=.15, name='tongue', bulge=1.1)
    for x in range(44, 112):                               # the zip, torn open in the middle
        if 64 < x < 92: continue
        y = 70 + int(((x - 77) / 34.0) ** 2 * 6)
        c.px(x, y, R['zip'][3] if x % 2 else R['zip'][2]); c.px(x, y + (1 if x % 2 else -1), R['zip'][1])
    # eyestalks: heavy-lidded, always about to close
    for k, (bx, by, ex, ey) in enumerate([(52, 30, 30, 8), (76, 22, 76, 4), (100, 30, 122, 8), (24, 52, 6, 36), (128, 54, 146, 38)]):
        taper(c, cr([(bx, by), ((bx + ex) // 2 + (3 if k % 2 else -3), (by + ey) // 2), (ex, ey + 4)], 6), 6, 4, R['flesh'], lift=.15, name='stalk', bulge=1.1)
        r_ = 7 if k == 1 else 6
        blob(c, R['eyeg'], lambda d, ex=ex, ey=ey, r_=r_: d.ellipse([ex - r_, ey - r_ + 4, ex + r_, ey + r_ + 4], fill=1), bulge=1.2, lift=.2, name='eye')
        c.rect(ex - 1, ey + 3, 3, 4, (10, 20, 6)); c.px(ex - 3, ey + 1, (240, 255, 220))
        lid = 4 + f
        blob(c, R['flesh'], lambda d, ex=ex, ey=ey, r_=r_, lid=lid: d.ellipse([ex - r_ - 1, ey - r_ + 3, ex + r_ + 1, ey - r_ + 3 + lid * 2], fill=1), bulge=1.0, lift=.25, name='lid')
    # crossed-out calendar pages stuck to its hide
    for (x, y, a) in [(122, 98, 1), (24, 100, -1)]:
        blob(c, R['paper'], lambda d, x=x, y=y, a=a: d.polygon([(x, y), (x + 12, y + 2 * a), (x + 10 + 2 * a, y + 14), (x - 2, y + 12)], fill=1), bulge=.4, lift=.25, name='page')
        c.rect(x + 1, y + 1, 9, 3, (196, 58, 48))
        for t in range(8): c.px(x + 2 + t, y + 5 + t, (180, 40, 34))
    return finish(c, [('lip', 'body'), ('throat', 'lip'), ('fang', 'throat'), ('fang', 'lip'), ('tongue', 'throat'), ('stalk', 'body'), ('eye', 'stalk'), ('lid', 'eye'), ('tend', 'body'), ('page', 'body')],
                  rim=(200, 150, 255), rimparts=('body', 'stalk', 'tend', 'lid'))

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
