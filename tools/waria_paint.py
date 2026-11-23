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

# ------------------------------------------------------------------ ngoyngoyün: the noise, a body of smoke sprouting horns
def ngoyngoyun(f):
    setsize(108, 116); c = Canvas()
    # a crowd of half-formed faces at its base, mouths open, all talking at once
    for k, (x, y) in enumerate([(12, 104), (28, 109), (46, 111), (64, 110), (82, 107), (98, 104), (20, 96), (90, 96)]):
        blob(c, R['smoke'], lambda d, x=x, y=y: d.ellipse([x - 7, y - 9, x + 7, y + 6], fill=1), bulge=1.1, lift=0.12 + (k % 3) * .05, name='crowd')
        mo = 1 + ((k + f) % 3)
        c.rect(x - 1, y, 3, mo, R['throat'][1]); c.px(x - 1, y, R['throat'][4])
        c.px(x - 3, y - 4, (150, 140, 180)); c.px(x + 2, y - 4, (150, 140, 180))
    # the body: a column of smoke that swells and frays at the edges
    body = smooth_poly([(54, 20), (76, 30), (84, 58), (80, 86), (90, 100), (54, 104), (18, 100), (28, 86), (24, 58), (32, 30)], 6)
    blob(c, R['smoke'], lambda d: d.polygon(body, fill=1), bulge=1.0, lift=0.10, name='body')
    rs = np.random.RandomState(5 + f)
    for _ in range(40):                                    # wisps leaving the silhouette
        x, y = rs.randint(18, 92), rs.randint(26, 100)
        if not c.a[y, x]:
            continue
        for k in range(rs.randint(3, 7)): c.px(x + (k if x > 54 else -k), y - k // 2, R['smoke'][2 + (k % 2)])
    # cables snaking out of the body, each ending in a brass horn, each horn shouting
    horns = [((34, 50), [(26, 44), (18, 36)], (16, 30), -2.6),
             ((74, 48), [(82, 42), (88, 34)], (92, 28), -0.5),
             ((30, 76), [(22, 78)], (18, 74), 3.0),
             ((80, 74), [(88, 76)], (90, 72), 0.2)]
    for (st, mid, tip, ang) in horns:
        path = cr([st] + mid + [tip], 6)
        taper(c, path, 6, 4, R['rubber'], lift=0.1, name='cable', bulge=1.1)
        a2 = ang + (0.12 if f else 0); ca, sa = math.cos(a2), math.sin(a2)
        L2, Wd = 17, 9
        poly = [(tip[0] - sa * 2, tip[1] + ca * 2), (tip[0] + sa * 2, tip[1] - ca * 2),
                (tip[0] + ca * L2 + sa * Wd, tip[1] + sa * L2 - ca * Wd), (tip[0] + ca * L2 - sa * Wd, tip[1] + sa * L2 + ca * Wd)]
        blob(c, R['brass'], lambda d, poly=poly: d.polygon(poly, fill=1), bulge=1.1, lift=0.18, name='horn')
        mx, my = tip[0] + ca * L2, tip[1] + sa * L2
        blob(c, R['throat'], lambda d, mx=mx, my=my: d.ellipse([mx - 3, my - 3, mx + 3, my + 3], fill=1), bulge=0.5, lift=-0.1, name='mouth')
        arcs(c, mx, my, [5 + 3 * f, 10 + 3 * f], a2 - 0.6, a2 + 0.6, (252, 214, 120), step=0.1)
    # the great horn-head, turned toward the hero, a throat full of teeth
    fl = lambda x: 5 + 19 * ((72 - x) / 62.0) ** 2.2     # half-height of the flare at x
    top = [(x, 24 - fl(x)) for x in range(72, 9, -3)]; bot = [(x, 24 + fl(x)) for x in range(10, 73, 3)]
    blob(c, R['brass'], lambda d: d.polygon(top + bot, fill=1), bulge=1.1, lift=0.20, name='head')
    for x in (62, 50, 38, 28):                             # rings round the horn
        h2 = fl(x)
        for y in range(int(24 - h2), int(24 + h2) + 1):
            if 0 <= y < 116 and c.part[y, x] == 'head': c.px(x, y, R['brass'][2]); c.px(x + 1, y, R['brass'][7] if y < 24 else R['brass'][5])
    blob(c, R['brass'], lambda d: d.ellipse([6, 0, 18, 48], fill=1), bulge=0.9, lift=0.3, name='rim')
    blob(c, R['throat'], lambda d: d.ellipse([8, 3, 18, 45], fill=1), bulge=0.7, lift=-0.15, name='mouth')
    for y in range(8, 45, 3):
        x = 6 + int(abs(y - 26) / 6)
        c.px(x, y, (236, 226, 204)); c.px(x + 1, y + 1, (190, 176, 150))
    for y in range(18, 36): c.px(13 + int(math.sin(y / 3 + f) * 1.5), y, R['throat'][5])   # a tongue of hot light
    # eyes: two embers glowing in the smoke under the horn
    for (x, y) in [(46, 54), (58, 55)]:
        c.rect(x, y, 4, 2, (255, 170, 60)); c.rect(x + 1, y, 2, 1, (255, 246, 210)); c.px(x - 1, y + 1, (120, 60, 30))
    return finish(c, [('horn', 'cable'), ('mouth', 'horn'), ('mouth', 'rim'), ('rim', 'head'), ('cable', 'body'), ('head', 'body'), ('crowd', 'crowd'), ('crowd', 'body')],
                  rim=(255, 196, 110), rimparts=('head', 'horn', 'body', 'cable'))

# ------------------------------------------------------------------ ngamleftripael: the dispersion, a cloak unravelling into metro lines
def ngamlef(f):
    setsize(108, 116); c = Canvas()
    sp = 2 * f
    # five streamers pouring from the hem and pulling away in five directions
    streams = [([(46, 70), (34, 84), (18, 92), (2, 90 - sp)], LINES[0]),
               ([(52, 74), (46, 92), (40, 106), (32, 114)], LINES[1]),
               ([(58, 74), (64, 92), (72, 104), (84, 112)], LINES[2]),
               ([(64, 70), (78, 82), (94, 86), (106, 80 - sp)], LINES[3]),
               ([(56, 66), (62, 54), (82, 46), (100, 40 - sp)], LINES[4])]
    for k, (pts, col) in enumerate(streams):
        path = cr(pts, 7); ramp = [tuple(int(v * m) for v in col) for m in (.25, .4, .58, .78, 1.0)] + [tuple(min(255, int(v * 1.0 + 70)) for v in col)]
        taper(c, path, 7, 3, ramp, lift=0.12, name='line%d' % k, bulge=1.1)
        for t in (0.35, 0.65, 0.9):                       # stations along each line
            x, y = path[int(t * (len(path) - 1))]; x, y = int(x), int(y)
            c.rect(x - 1, y - 1, 3, 3, (250, 250, 250)); c.px(x, y, col)
        x, y = path[-1]
        for d in range(3):                                # the end frays into loose dots drifting off
            dx = int((x - 54) / 18 * (d + 2 + f)); dy = int((y - 70) / 18 * (d + 2 + f))
            if 0 <= int(x) + dx < 108 and 0 <= int(y) + dy < 116: c.px(int(x) + dx, int(y) + dy, col)
    # a tall cloak, narrow at the shoulders, splitting at the hem
    cloak = smooth_poly([(54, 22), (70, 28), (74, 50), (70, 72), (62, 78), (54, 70), (46, 78), (38, 72), (34, 50), (38, 28)], 6)
    blob(c, R['navy2'], lambda d: d.polygon(cloak, fill=1), bulge=1.0, lift=0.12, name='cloak')
    for (x0, x1) in [(46, 42), (54, 54), (62, 66)]:     # long folds
        for y in range(36, 74):
            t = (y - 36) / 38; x = int(round(x0 + (x1 - x0) * t))
            if c.part[y, x] == 'cloak': c.px(x, y, R['navy2'][1]); c.px(x - 1, y, R['navy2'][4] if y % 3 else R['navy2'][3])
    # arms flung wide, each hand letting a thread go
    for (pts, lift) in [([(40, 32), (28, 34), (14, 28), (4, 22)], .2), ([(68, 32), (80, 34), (94, 28), (104, 22)], -.02)]:
        taper(c, cr(pts, 6), 7, 4, R['navy2'], lift=lift, name='arm', bulge=1.0)
        hx_, hy_ = pts[-1]
        blob(c, R['mask2'], lambda d, hx_=hx_, hy_=hy_: d.ellipse([hx_ - 4, hy_ - 4, hx_ + 4, hy_ + 4], fill=1), bulge=1.1, lift=lift + .1, name='hand')
        for t in np.linspace(0, 1, 10):
            x = hx_ + (1 if hx_ > 54 else -1) * t * 10; y = hy_ - 6 - t * 8 + math.sin(t * 6 + f) * 2
            if int(t * 10) % 2 == 0: c.px(int(x), int(y), (200, 210, 230))
    # hood and a smooth pale mask with a map for a face: lines that meet at "you are here"
    blob(c, R['navy2'], lambda d: d.ellipse([40, 2, 68, 32], fill=1), bulge=1.0, lift=0.14, name='hood')
    blob(c, R['mask2'], lambda d: d.ellipse([45, 7, 63, 29], fill=1), bulge=1.2, lift=0.2, name='mask')
    for k, (pts) in enumerate([[(47, 14), (52, 18), (58, 16), (62, 12)], [(49, 26), (54, 20), (57, 26)], [(54, 8), (54, 18), (55, 28)]]):
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            for t in np.linspace(0, 1, 8): c.px(int(x0 + (x1 - x0) * t), int(y0 + (y1 - y0) * t), LINES[k + 1])
    c.rect(53, 17, 3, 3, (230, 40, 40)); c.px(54, 18, (255, 220, 220))      # "you are here"
    return finish(c, [('hood', 'mask'), ('arm', 'hand'), ('arm', 'cloak'), ('hood', 'cloak'), ('cloak', 'line0'), ('cloak', 'line3')],
                  rim=(150, 190, 255), rimparts=('cloak', 'hood', 'arm', 'line3', 'line4'))

# ------------------------------------------------------------------ mapudungukenoael fillantü: the everyday silence, sunk in an armchair
def fillantu(f):
    setsize(108, 116); c = Canvas()
    # the armchair, worn and deep
    blob(c, R['chair'], lambda d: d.rounded_rectangle([14, 30, 94, 104], 14, fill=1), bulge=0.9, lift=0.0, name='chair')
    for (x0, x1) in [(6, 26), (82, 102)]:
        blob(c, R['chair'], lambda d, x0=x0, x1=x1: d.rounded_rectangle([x0, 62, x1, 108], 8, fill=1), bulge=1.1, lift=0.10 if x0 < 50 else -0.05, name='carm')
    for x in range(20, 90, 5):
        for y in range(34, 60):
            if c.part[y, x] == 'chair' and y % 2: c.px(x, y, R['chair'][1])         # buttoned tufting
    # a heavy body under a grey blanket, slumped
    body = smooth_poly([(32, 44), (76, 44), (88, 70), (86, 100), (54, 110), (22, 100), (20, 70)], 6)
    blob(c, R['blanket'], lambda d: d.polygon(body, fill=1), bulge=1.1, lift=0.10, name='body')
    for (pts) in [[(34, 56), (30, 78), (32, 102)], [(54, 58), (52, 84), (54, 108)], [(74, 56), (78, 80), (76, 102)], [(40, 66), (54, 72), (68, 66)]]:
        for (x0, y0), (x1, y1) in zip(cr(pts, 6), cr(pts, 6)[1:]):
            x, y = int(x0), int(y0)
            if c.part[y, x] == 'body': c.px(x, y, R['blanket'][1]); c.px(x + 1, y, R['blanket'][5])
    for x in range(26, 84, 6):                                                        # a stitched hem
        y = 98 + int(math.sin(x / 7) * 2)
        if c.part[y, x] == 'body': c.px(x, y, R['blanket'][6]); c.px(x + 1, y, R['blanket'][6])
    # the head, sinking into the shoulders, half-lit by a screen
    blob(c, R['grey'], lambda d: d.ellipse([32, 6, 78, 52], fill=1), bulge=1.15, lift=0.16, name='head')
    for (x, y) in [(40, 12), (52, 9), (64, 11)]: c.px(x, y, R['grey'][5]); c.px(x + 1, y, R['grey'][5])
    for ex in (46, 64):
        blob(c, [(10, 8, 12), (230, 240, 244), (250, 252, 255)], lambda d, ex=ex: d.ellipse([ex - 4, 27, ex + 4, 33], fill=1), bulge=0.5, name='eye')
        c.px(ex - 1, 31, (30, 40, 50)); c.px(ex, 31, (30, 40, 50))
        blob(c, R['grey'], lambda d, ex=ex: d.ellipse([ex - 6, 22 - f, ex + 6, 31 - f], fill=1), bulge=1.0, lift=0.22, name='lid')   # heavy lids
        for x in range(ex - 5, ex + 6): c.px(x, 31 - f, R['grey'][0])
    for x in range(40, 72):                                                           # the zip, closed tight
        y = 42 + int(((x - 56) / 16) ** 2 * 2)
        c.px(x, y, R['zip'][1]); c.px(x, y - 1, R['zip'][3] if x % 2 else R['zip'][2]); c.px(x, y + 1, R['zip'][2] if x % 2 else R['zip'][3])
    blob(c, R['zip'], lambda d: d.rounded_rectangle([70, 40, 75, 49], 1, fill=1), bulge=0.8, lift=0.3, name='pull'); c.px(72, 46, R['zip'][0])
    # hands: one limp with a remote, one on the armrest
    blob(c, R['grey'], lambda d: d.ellipse([12, 80, 26, 92], fill=1), bulge=1.1, lift=0.2, name='hand')
    blob(c, R['rubber'], lambda d: d.rounded_rectangle([6, 84, 14, 104], 2, fill=1), bulge=0.8, lift=0.2, name='remote')
    for y in (87, 91, 95, 99): c.px(10, y, (210, 60, 50) if y == 87 else (120, 124, 134))
    blob(c, R['grey'], lambda d: d.ellipse([84, 82, 98, 94], fill=1), bulge=1.1, lift=0.0, name='hand')
    # the screen's cold light washing over its left side
    bay = yp.BAYER
    for y in range(8, 112):
        for x in range(0, 70):
            if c.a[y, x] and c.part[y, x] in ('body', 'head', 'lid', 'hand', 'carm', 'chair'):
                k = 0.42 * max(0, 1 - x / 64) ** 1.4
                if k > 0.04:
                    k = round(k * 4 + (bay[y % 4][x % 4] - .5) * .6) / 4.0
                    v = c.rgb[y, x].astype(float); c.rgb[y, x] = (v * (1 - k) + np.array((120, 205, 225)) * k).astype(np.uint8)
    # calendar pages circling it, every day crossed out and put off
    for k, (x, y) in enumerate([(2, 10), (90, 6), (96, 40), (0, 46)]):
        y += (f * 2 if k % 2 else -f * 2)
        blob(c, R['paper'], lambda d, x=x, y=y: d.polygon([(x, y + 1), (x + 11, y), (x + 12, y + 13), (x + 1, y + 14)], fill=1), bulge=0.4, lift=0.25, name='page')
        c.rect(x + 1, y + 1, 10, 3, (196, 58, 48))
        for gy in range(y + 6, y + 13, 3):
            for gx in range(x + 2, x + 11, 3): c.px(gx, gy, (90, 84, 76))
        for t in range(8): c.px(x + 2 + t, y + 5 + t, (190, 50, 40))
    return finish(c, [('lid', 'eye'), ('head', 'body'), ('body', 'chair'), ('carm', 'chair'), ('hand', 'body'), ('remote', 'hand'), ('pull', 'head'), ('body', 'carm')],
                  rim=(150, 215, 235), rimparts=('body', 'head', 'chair', 'carm'))

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
        im = Image.new('RGBA', (120, 120), (40, 50, 70, 255)); b0 = Image.fromarray(big[0]); im.paste(b0, ((120 - b0.width) // 2, 120 - b0.height), b0)
        strip.append(im)
    sheet = Image.new('RGBA', (120 * len(strip), 120)); [sheet.paste(s, (i * 120, 0)) for i, s in enumerate(strip)]
    sheet.resize((sheet.width * 3, 360), Image.NEAREST).save('/home/claude/waria_sheet.png')
    json.dump(out, open(os.path.join(here, 'waria.json'), 'w'))
    print('ok')
