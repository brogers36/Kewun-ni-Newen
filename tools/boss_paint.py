"""The bosses of the south and of the forgetting, hand-painted with the Yewen's method (tools/yewen_paint.py)
and the crisper shading of the Santiago wardens (tools/waria_paint.py): per-part masks with their own colour
ramps, height-field light from the upper left, hard bands, selective outlines, contact shadows, grain and
speculars. Every sprite keeps the size and the design of the pixel-art boss it replaces.
Output: tools/boss.json (battle sprite + half-size sprite, two frames each).
Usage: python3 boss_paint.py [name,name,...]  (no argument: all)"""
import json, math, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import yewen_paint as yp
import waria_paint as wp
from yewen_paint import Canvas, taper, hx
from waria_paint import R, setsize, blob, finish, arcs, cr, smooth_poly, glow, ribbed, facet, tooth3, rivets, plate_lines, texture, occlude, speculars

def ramp(*cs): return [hx(c) for c in cs]
def taper(c, pts, *a, **k):
    """yewen_paint.taper stamps six discs per segment: densify long straight segments so shafts stay solid"""
    P = [pts[0]]
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(1, int(math.hypot(x1 - x0, y1 - y0) / 6))
        P += [(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n) for i in range(1, n + 1)]
    return yp.taper(c, P, *a, **k)
R.update({k: [hx(c) for c in v] for k, v in {
    'hide':   ['#0c0e08', '#181c10', '#262c18', '#363e22', '#48522c', '#5c6838', '#748246', '#90a058'],
    'patch':  ['#3a3424', '#5a5038', '#7c7052', '#a09270', '#c2b490', '#e0d4b0'],
    'under':  ['#2a0c10', '#4a1a1c', '#6e2a2a', '#94403a', '#b85a4c', '#d87c66'],
    'water':  ['#020a10', '#06161e', '#0c242e', '#143642', '#1e4a58', '#2c6270', '#46808c', '#7ab0b6'],
    'claw':   ['#1a1610', '#3a3226', '#5e5440', '#8a7e64', '#b4aa8c', '#dcd4b8', '#f8f4e4'],
    'eyey':   ['#3a2a04', '#7a5a08', '#c49410', '#f0d030', '#fff080', '#fffbe0'],
    'basalt': ['#060404', '#100a0a', '#1c1312', '#2a1d1a', '#3a2924', '#4c3830', '#624a3e', '#7a5e4e'],
    'lava':   ['#3a0602', '#781004', '#b42208', '#e44a10', '#fa8420', '#ffbe50', '#fff0b0'],
    'wood':   ['#06080a', '#0e1214', '#161c1e', '#20282a', '#2c3638', '#3a4648', '#4c5a5a'],
    'sail':   ['#1a2a2a', '#2e4644', '#46645e', '#62847a', '#82a69a', '#a8c8ba', '#d4ece0'],
    'ghost':  ['#0a3a2a', '#14604a', '#22906a', '#40c08c', '#80e6b2', '#c8ffe0'],
    'fog':    ['#2a3a3a', '#3a4e4c', '#4c6260', '#607876', '#7a908c'],
    'coat':   ['#050508', '#0a0a10', '#121218', '#1a1a22', '#24242e', '#30303c', '#3e3e4c'],
    'hat':    ['#040406', '#0a0a0e', '#121218', '#1c1c24', '#282832', '#363642'],
    'skull':  ['#2a2c26', '#46483e', '#66685a', '#8a8c7a', '#aeae9a', '#d0ceb8', '#eeecd8'],
    'silver': ['#1a1c20', '#34383e', '#565a62', '#7e828a', '#a8acb2', '#d4d6da', '#ffffff'],
    'gglow':  ['#0a3a1a', '#147a34', '#28c058', '#60f090', '#b0ffc8', '#ffffff'],
}.items()})

def noise(seed, sc=1.5):
    from scipy.ndimage import gaussian_filter as gf
    rs = np.random.RandomState(seed); n = gf(rs.rand(yp.H, yp.W), sc); n = (n - n.min()) / max(1e-6, n.max() - n.min()); return n
def tint(c, m, k):
    c.rgb[m] = np.clip(c.rgb[m].astype(float) * k, 0, 255).astype(np.uint8)
def line(c, pts, col, part=None, w=1, n=None):
    P = cr(pts, 10) if len(pts) > 2 else pts
    out = []
    for (x0, y0), (x1, y1) in zip(P, P[1:]):
        k = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
        for t in np.linspace(0, 1, k + 1):
            X, Y = int(round(x0 + (x1 - x0) * t)), int(round(y0 + (y1 - y0) * t))
            for dx in range(w):
                if 0 <= X + dx < yp.W and 0 <= Y < yp.H and (part is None or c.part[Y, X + dx] in (part if isinstance(part, tuple) else (part,))):
                    c.px(X + dx, Y, col); out.append((X + dx, Y))
    return out
def eye(c, x, y, rw, rh, rmp, pupil=(8, 4, 2), slit=True, lid=None):
    """an almond eye: dark socket, glowing iris banded from the bottom up, a slit pupil, a catchlight"""
    for yy in range(y - rh - 1, y + rh + 2):
        for xx in range(x - rw - 1, x + rw + 2):
            d = ((xx - x) / (rw + 1)) ** 2 + ((yy - y) / (rh + 1)) ** 2
            if d <= 1: c.px(xx, yy, lid or (10, 6, 6))
    for yy in range(y - rh, y + rh + 1):
        for xx in range(x - rw, x + rw + 1):
            d = ((xx - x) / rw) ** 2 + ((yy - y) / max(1, rh)) ** 2
            if d <= 1:
                t = (yy - (y - rh)) / max(1, 2 * rh); c.px(xx, yy, rmp[min(len(rmp) - 1, int(1 + t * (len(rmp) - 2)))])
    if slit:
        for yy in range(y - rh, y + rh + 1): c.px(x, yy, pupil)
    c.px(x - max(1, rw // 2), y - max(0, rh // 2), (255, 255, 250))
def ripples(c, cx, cy, rx, ry, f, col_hi, col_lo, n=3):
    for k in range(n):
        r = 1 + k * .55 + f * .18
        for a in np.linspace(0, 2 * math.pi, int(160 * r)):
            X, Y = int(round(cx + math.cos(a) * rx * r)), int(round(cy + math.sin(a) * ry * r))
            if 0 <= X < yp.W and 0 <= Y < yp.H and c.part[Y, X] == 'water':
                c.px(X, Y, col_hi if math.sin(a) < 0 else col_lo)
def sea(c, y0, y1, x0, x1, f, rmp=None, name='water'):
    """a band of night water: dark ellipse, horizontal glints that shift with the frame"""
    rmp = rmp or R['water']
    m = c.mask(lambda d: d.ellipse([x0, y0, x1, y1], fill=1))
    ys, xs = np.nonzero(m)
    t = (ys - y0) / max(1, y1 - y0)
    idx = np.clip((2 + (1 - abs(t - .35) * 2.2) * 2.2 + (yp.BAYER[ys % 4, xs % 4] - .5) * .6).astype(int), 0, len(rmp) - 1)
    c.rgb[ys, xs] = np.array(rmp)[idx]; c.a[ys, xs] = True; c.part[ys, xs] = name
    rs = np.random.RandomState(9 + f)
    for _ in range(int((x1 - x0) * (y1 - y0) / 40)):
        x = rs.randint(x0 + 2, x1 - 2); y = rs.randint(y0 + 1, y1 - 1); L = rs.randint(2, 6)
        for k in range(L):
            if 0 <= x + k < yp.W and c.part[y, x + k] == name: c.px(x + k, y, rmp[-1] if k == L // 2 else rmp[-3])
    return m
def drip(c, x, y, L, rmp):
    for k in range(L): c.px(x, y + k, rmp[-2] if k < L - 1 else rmp[-1])
def scales(c, part, step, rmp, seed=0, k_dark=.55, k_lit=1.25, kd=None):
    """overlapping scales: a dark crescent under each, a lit lip on top, staggered rows"""
    ys, xs = np.nonzero(c.part == part)
    if not len(ys): return
    for y in range(ys.min(), ys.max() + 1, step):
        off = (step // 2) if ((y - ys.min()) // step) % 2 else 0
        for x in range(xs.min() + off, xs.max() + 1, step):
            for a in np.linspace(.15 * math.pi, .85 * math.pi, step * 2):
                X, Y = int(round(x + math.cos(a) * step * .55)), int(round(y + math.sin(a) * step * .5))
                if 0 <= X < yp.W and 0 <= Y < yp.H and c.part[Y, X] == part: c.rgb[Y, X] = (c.rgb[Y, X] * k_dark).astype(np.uint8)
            if 0 <= y - 1 < yp.H and 0 <= x < yp.W and c.part[y - 1, x] == part:
                c.rgb[y - 1, x] = np.minimum(255, c.rgb[y - 1, x] * k_lit).astype(np.uint8)

# =========================================================== trelke: a stretched hide rising from the water to wrap you
R.update({k: [hx(c) for c in v] for k, v in {
    'hide':  ['#0e0a08', '#1c1510', '#2c2218', '#3e3022', '#52402c', '#685238', '#806646', '#9a7c56'],
    'patch': ['#4a4436', '#6c6450', '#8e866c', '#b0a88a', '#d0c8a8', '#ece4c6']}.items()})
def trelke(f):
    setsize(108, 84); c = Canvas()
    sea(c, 62, 84, 0, 108, f)
    ripples(c, 54, 72, 34, 4, f, R['water'][6], R['water'][1], 3)
    fl = 2 if f else 0                                       # the flaps lean in toward you, then out
    # the hide stands up out of the water like a sail: neck flap on top, foreleg flaps reaching out and
    # curling forward, hind flaps trailing on the water
    pts = [(54, 2 - fl), (62, 6), (64, 14), (78, 12), (92, 6 + fl), (104, 4 + fl * 2), (100, 14), (90, 22), (88, 34), (94, 50), (104, 64 - fl),
           (90, 70), (74, 66), (54, 70), (34, 66), (18, 70), (4, 64 - fl), (14, 50), (20, 34), (18, 22), (8, 14), (4, 4 + fl * 2), (16, 6 + fl), (30, 12), (44, 14), (46, 6)]
    hide = smooth_poly(pts, 6)
    m = blob(c, R['hide'], lambda d: d.polygon(hide, fill=1), bulge=.55, lift=.36, name='hide')
    ys, xs = np.nonzero(m)                                   # soft creases where the skin is pulled toward the claws
    wave = np.sin((xs - 54) * .32 + (ys - 40) * .08 + f * .6) * np.exp(-((ys - 38) / 30.0) ** 2) * .5
    c.rgb[ys, xs] = np.clip(c.rgb[ys, xs] * (1 + wave * .16)[:, None], 0, 255).astype(np.uint8)
    # pale cowhide patches, irregular, with a soft brown edge
    n = noise(4, 3.6)
    for thr, k in ((.57, None),):
        pm = m & (n > thr)
        ys, xs = np.nonzero(pm)
        lum = c.rgb[ys, xs].mean(1) / 255
        idx = np.clip((lum * 9).astype(int), 0, len(R['patch']) - 1)
        c.rgb[ys, xs] = np.array(R['patch'])[idx]; c.part[pm] = 'patch'
    tint(c, m & (n > .53) & (n <= .57), .72)
    # the edges of the foreleg flaps curl over toward you, showing the raw red underside
    for path, w in [([(6, 6 + fl * 2), (14, 10), (22, 16), (30, 16)], 4), ([(102, 6 + fl * 2), (94, 10), (84, 16), (76, 16)], 4), ([(48, 8), (54, 5 - fl), (60, 8)], 3)]:
        taper(c, cr(path, 6), w, w - 1, R['under'], lift=.22, name='under', bulge=1.15)
        line(c, [(x, y + w // 2) for x, y in path], R['under'][1], 'under')
    # down the middle, the seam where it folds shut around its prey: a slit of teeth
    for y in range(26, 62):
        w = int(round(2.2 * math.sin(math.pi * (y - 26) / 36)))
        for x in range(54 - w, 55 + w):
            if c.part[y, x] in ('hide', 'patch'): c.px(x, y, (18, 4, 6)); c.part[y, x] = 'slit'
        if w >= 1:
            c.px(54 - w - 1, y, R['under'][3]); c.px(55 + w, y, R['under'][1])
            if y % 3 == 0: c.px(54 - w, y, R['claw'][6]); c.px(54 + w, y + 1, R['claw'][5])
    # hooked claws all round the rim
    for (x, y, dx, dy) in [(4, 4 + fl * 2, -1, -1), (104, 4 + fl * 2, 1, -1), (54, 2 - fl, 0, -1), (92, 6 + fl, 1, -1), (16, 6 + fl, -1, -1), (100, 14, 1, 0), (8, 14, -1, 0),
                           (104, 64 - fl, 1, 1), (4, 64 - fl, -1, 1), (90, 22, 1, 0), (18, 22, -1, 0), (88, 34, 1, 0), (20, 34, -1, 0), (94, 50, 1, 0), (14, 50, -1, 0)]:
        tip = (x + dx * 5, y + dy * 5); mid = (x + dx * 4 + dy * 2, y + dy * 3 - dx * 2)
        taper(c, cr([(x, y), mid, tip], 5), 3.5, 1, R['claw'], lift=.22, name='claw', bulge=1.2)
    # eyes: a cluster up on the neck flap, and single ones opening in the skin
    for (ex, ey, s) in [(54, 16, 3), (47, 20, 2), (61, 20, 2), (30, 28, 2), (78, 28, 2), (40, 46, 1), (70, 46, 1)]:
        eye(c, ex, ey, s + 1, s, R['eyey'], lid=R['hide'][0])
    # drips where it rises out of the water
    for x in range(12, 100, 8): drip(c, x + f * 2, 64 + (x % 4), 3 + (x % 3), R['water'])
    texture(c, ['hide', 'patch'], amt=.12, seed=3)
    occlude(c, ['under', 'claw'], ['hide', 'patch'], r=3, k=.62)
    occlude(c, ['hide', 'patch'], ['water'], r=3, k=.5)
    speculars(c, ['hide', 'patch', 'claw', 'under'], thr=.86)
    return finish(c, [('claw', 'hide'), ('claw', 'patch'), ('under', 'hide'), ('under', 'patch'), ('hide', 'water'), ('patch', 'water')], rim=(150, 200, 120), rimparts=('hide', 'patch', 'claw'))

# =========================================================== cherufe: a giant of basalt split by rivers of lava
def cherrufe(f):
    setsize(92, 112); c = Canvas()
    B, L = R['basalt'], R['lava']
    blob(c, L[:5], lambda d: d.ellipse([10, 100, 82, 111], fill=1), bulge=.4, lift=.2, name='pool')
    bob = f
    # legs: two pillars of stacked basalt
    for (x0, x1, lift) in [(26, 42, .12), (50, 66, -.04)]:
        blob(c, B, lambda d, x0=x0, x1=x1: d.polygon([(x0, 70), (x1, 70), (x1 + 2, 92), (x1 + 4, 104), (x0 - 4, 104), (x0 - 2, 92)], fill=1), bulge=1.1, lift=lift, name='leg')
        plate_lines(c, 'leg', [((x0 - 3, 86), (x1 + 3, 84)), ((x0 - 3, 96), (x1 + 3, 97))], .5)
    # torso: a hunched mass of plates, chest split open on a molten core
    torso = smooth_poly([(24, 34 + bob), (46, 28 + bob), (70, 34 + bob), (74, 52 + bob), (66, 72), (46, 76), (26, 72), (18, 52 + bob)], 6)
    blob(c, B, lambda d: d.polygon(torso, fill=1), bulge=1.2, lift=.14, name='torso')
    # the molten core showing through the cracked chest
    core = [(40, 40 + bob), (52, 40 + bob), (56, 50 + bob), (50, 62), (42, 62), (36, 50 + bob)]
    blob(c, L, lambda d: d.polygon(core, fill=1), bulge=1.0, lift=.35, name='core')
    glow(c, 46, 50 + bob, 5, L[3:])
    # lava rivers running across the plates, branching from the core
    cracks = [[(38, 46), (30, 44), (22, 50)], [(54, 46), (62, 42), (72, 46)], [(44, 62), (40, 70), (34, 76)], [(50, 62), (56, 70), (58, 78)],
              [(30, 44), (28, 36)], [(62, 42), (66, 36)], [(30, 88), (34, 96), (32, 104)], [(58, 86), (56, 94), (60, 104)]]
    for k, cr_ in enumerate(cracks):
        pts = [(x, y + (bob if y < 70 else 0)) for x, y in cr_]
        for (X, Y) in line(c, pts, L[4], ('torso', 'leg')):
            if 0 <= X + 1 < yp.W and c.part[Y, X + 1] in ('torso', 'leg'): c.px(X + 1, Y, L[2])
            if 0 <= Y - 1 and c.part[Y - 1, X] in ('torso', 'leg'): c.rgb[Y - 1, X] = np.minimum(255, c.rgb[Y - 1, X].astype(int) + np.array([70, 24, 6])).astype(np.uint8)
    # shoulders: great boulders
    for (cx, cy, lift) in [(22, 38, .2), (70, 38, 0)]:
        blob(c, B, lambda d, cx=cx, cy=cy: d.polygon(smooth_poly([(cx - 12, cy + 2 + bob), (cx - 6, cy - 9 + bob), (cx + 6, cy - 9 + bob), (cx + 12, cy + 1 + bob), (cx + 6, cy + 10 + bob), (cx - 6, cy + 10 + bob)], 5), fill=1), bulge=1.25, lift=lift, name='shoulder')
    # arms: the near one hangs, fist glowing; the far one lifts a burning stone overhead
    taper(c, cr([(16, 44 + bob), (10, 60), (12, 76)], 7), 13, 12, B, lift=.15, name='arm', bulge=1.2)
    blob(c, B, lambda d: d.polygon(smooth_poly([(4, 74), (20, 72), (22, 86), (12, 90), (4, 86)], 4), fill=1), bulge=1.25, lift=.12, name='fist')
    for (x, y) in [(8, 78), (14, 77), (18, 80)]: c.px(x, y, L[4]); c.px(x, y + 1, L[2])
    taper(c, cr([(74, 40 + bob), (84, 30), (82, 16)], 7), 12, 11, B, lift=-.05, name='arm2', bulge=1.2)
    blob(c, L, lambda d: d.ellipse([68, 0 + bob, 92, 20 + bob], fill=1), bulge=1.2, lift=.0, name='stone')
    n = noise(7, 1.4); sm = (c.part == 'stone') & (n < .45); tint(c, sm, .35)
    glow(c, 82, 9 + bob, 4, L[3:])
    # head: sunk between the shoulders, a jaw of rock, eyes and mouth of fire, a crown of flame
    hd = smooth_poly([(36, 14 + bob), (46, 10 + bob), (56, 14 + bob), (58, 26 + bob), (52, 34 + bob), (40, 34 + bob), (34, 26 + bob)], 5)
    blob(c, B, lambda d: d.polygon(hd, fill=1), bulge=1.3, lift=.18, name='head')
    for x in range(37, 56): c.px(x, 20 + bob, B[1])                      # the heavy brow
    for x in range(38, 46): c.px(x, 19 + bob, B[6])
    for ex in (41, 51):
        c.rect(ex - 2, 21 + bob, 5, 3, (20, 4, 2)); c.rect(ex - 1, 22 + bob, 3, 1, L[5]); c.px(ex, 22 + bob, L[6])
    for x in range(40, 54): c.px(x, 29 + bob, L[3] if x % 2 else L[4])
    for x in range(40, 54, 2): c.px(x, 28 + bob, (24, 6, 2)); c.px(x + 1, 30 + bob, (24, 6, 2))
    for k, x in enumerate(range(36, 58, 4)):                              # flames of the crown
        h = 8 + (k * 5 + f * 3) % 7
        yp.flame(c, x, 14 + bob, h, 1.5, k * 1.3 + f, 3, ramp=L)
    yp.flame(c, 82, 4 + bob, 10, 2, 1 + f, 4, ramp=L)
    texture(c, ['torso', 'leg', 'shoulder', 'arm', 'arm2', 'fist', 'head'], amt=.16, seed=5)
    occlude(c, ['shoulder', 'head', 'arm'], ['torso'], r=4, k=.55)
    occlude(c, ['torso'], ['leg'], r=5, k=.5)
    speculars(c, ['torso', 'shoulder', 'head', 'arm', 'fist', 'leg'], thr=.82, col=(255, 200, 150))
    return finish(c, [('shoulder', 'torso'), ('head', 'torso'), ('arm', 'torso'), ('arm', 'shoulder'), ('fist', 'arm'), ('arm2', 'shoulder'), ('leg', 'torso'), ('core', 'torso'), ('stone', 'arm2'), ('leg', 'leg')],
                  rim=(255, 110, 40), rimparts=('torso', 'shoulder', 'arm2', 'leg', 'head', 'arm'))

# =========================================================== kaleuche: the ghost ship, all lights and music in the fog
def kaleuche(f):
    setsize(124, 108); c = Canvas()
    W_, G = R['wood'], R['ghost']
    sea(c, 84, 108, 0, 124, f, name='water')
    # hull: a long dark galleon, planked, its gunwale picked out in sickly light
    hull = smooth_poly([(6, 66), (20, 70), (100, 70), (118, 58), (114, 72), (104, 88), (20, 90), (10, 80)], 5)
    blob(c, W_, lambda d: d.polygon(hull, fill=1), bulge=.9, lift=.12, name='hull')
    for y in (74, 79, 84):
        line(c, [(10, y), (60, y + 1), (110, y - 4)], W_[0], 'hull')
        line(c, [(10, y - 1), (60, y), (110, y - 5)], W_[5], 'hull')
    for x in range(14, 112, 9):                                              # plank butts, staggered
        y = 75 + (x // 9) % 3 * 4
        if c.part[y, x] == 'hull': c.px(x, y, W_[0]); c.px(x, y + 1, W_[0])
    blob(c, W_, lambda d: d.polygon([(80, 60), (116, 52), (118, 58), (100, 70), (80, 70)], fill=1), bulge=1.0, lift=.22, name='castle')
    blob(c, W_, lambda d: d.polygon([(6, 62), (24, 62), (24, 70), (6, 66)], fill=1), bulge=1.0, lift=.2, name='castle')
    for x in range(8, 116):
        y = 69 if x < 80 else 69 - (x - 80) * 16 // 36
        if c.part[y, x] in ('hull', 'castle'): c.px(x, y, G[3] if x % 4 else G[4])
    for (x, y) in [(22, 78), (36, 79), (50, 80), (64, 80), (78, 78), (92, 76), (104, 62), (94, 64)]:   # portholes full of light
        c.rect(x - 2, y - 2, 4, 4, W_[0]); c.rect(x - 1, y - 1, 2, 2, G[5] if (x + f) % 3 else G[4]); c.px(x - 1, y - 1, (255, 255, 255))
    # bowsprit and a pale figurehead
    taper(c, [(112, 60), (122, 50)], 3, 2, W_, lift=.2, name='spar', bulge=1.0)
    blob(c, R['skull'], lambda d: d.polygon([(110, 60), (116, 56), (118, 64), (113, 68)], fill=1), bulge=1.1, lift=.2, name='figure')
    # three masts, yards, and tattered sails that glow from within
    masts = [(32, 16, 1.0), (62, 6, 1.15), (92, 18, .95)]
    for (mx, top, s) in masts:
        taper(c, [(mx, 70), (mx, top)], 3, 2, W_, lift=.15, name='mast', bulge=1.0)
        for (yy, w) in [(top + 6, 13 * s), (top + 26 * s, 15 * s)]:
            taper(c, [(mx - w, yy), (mx + w, yy)], 2, 2, W_, lift=.25, name='yard', bulge=1.0)
        for (y0, y1, w0, w1) in [(top + 7, top + 25 * s, 12 * s, 14 * s), (top + 27 * s, top + 46 * s, 14 * s, 15 * s)]:
            rag = [(mx + w1 - k * (2 * w1) / 8, y1 + (3 if (k + f) % 2 else -1) + (k % 3)) for k in range(9)]
            poly = [(mx - w0, y0), (mx + w0, y0), (mx + w1 + 1, (y0 + y1) / 2)] + rag + [(mx - w1 - 1, (y0 + y1) / 2)]
            m = blob(c, R['sail'], lambda d, p=poly: d.polygon(p, fill=1), bulge=.7, lift=.08, name='sail')
            ys, xs = np.nonzero(m)                                           # billowing: brightest across the belly
            k = 1 + .18 * np.sin((ys - y0) / max(1, y1 - y0) * math.pi) - .1 * ((xs - mx) / max(1, w1))
            c.rgb[ys, xs] = np.clip(c.rgb[ys, xs] * k[:, None], 0, 255).astype(np.uint8)
            n = noise(11 + int(mx), 1.2)
            holes = m & (n < .18); c.a[holes] = False; c.part[holes] = ''      # rot holes in the canvas
            for x in range(int(mx - w0) + 2, int(mx + w0), 4): line(c, [(x, y0 + 1), (x + (x - mx) * .1, y1 - 2)], R['sail'][2], 'sail')
    # rigging
    for (a, b) in [((8, 64), (32, 16)), ((32, 16), (62, 6)), ((62, 6), (92, 18)), ((92, 18), (122, 50)), ((20, 68), (32, 40)), ((104, 66), (92, 42))]:
        for (X, Y) in line(c, [a, b], (70, 90, 86), part=('', 'water')): c.a[Y, X] = True; c.part[Y, X] = 'rope'
    # lanterns at the mastheads and stern, and the music it plays on the wind
    for (x, y) in [(32, 12), (62, 2), (92, 14), (10, 58)]:
        glow(c, x, y + 1, 3, G)
    for k, (x, y) in enumerate([(12, 40), (20, 30), (104, 34), (112, 26), (50, 52)]):
        y += (2 if (k + f) % 2 else -1)
        c.rect(x, y, 2, 2, G[5]); c.px(x + 1, y - 1, G[4]); c.px(x + 2, y - 1, G[4]); c.px(x + 2, y - 2, G[4]); c.px(x + 2, y - 3, G[4]); c.part[y, x] = 'note'
        if k % 2: c.px(x + 3, y - 3, G[4]); c.px(x + 4, y - 2, G[4])
    # fog rolling along the waterline
    rs = np.random.RandomState(2 + f)
    for _ in range(10):
        cx = rs.randint(0, 124); cy = rs.randint(84, 96); rx = rs.randint(8, 18); ry = rs.randint(2, 4)
        m = c.mask(lambda d, cx=cx, cy=cy, rx=rx, ry=ry: d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=1))
        ys, xs = np.nonzero(m)
        keep = (yp.BAYER[ys % 4, xs % 4] < .55)
        ys, xs = ys[keep], xs[keep]
        c.rgb[ys, xs] = np.clip(c.rgb[ys, xs] * .4 + np.array(R['fog'][4]) * .6, 0, 255).astype(np.uint8); c.a[ys, xs] = True
        c.part[ys, xs] = np.where(c.part[ys, xs] == '', 'fog', c.part[ys, xs])
    texture(c, ['hull', 'castle', 'mast', 'yard'], amt=.12, seed=8)
    texture(c, ['sail'], amt=.07, seed=9)
    occlude(c, ['castle'], ['hull'], r=3, k=.6)
    occlude(c, ['sail'], ['mast', 'sail'], r=2, k=.75)
    speculars(c, ['hull', 'castle', 'figure'], thr=.86, col=(200, 255, 220))
    return finish(c, [('castle', 'hull'), ('mast', 'sail'), ('yard', 'sail'), ('figure', 'hull'), ('spar', 'castle'), ('hull', 'water')],
                  rim=(120, 240, 180), rimparts=('hull', 'castle', 'sail', 'mast'))

# =========================================================== witranalwe: a tall bony horseman's ghost in a black poncho
def witranalwe(f):
    setsize(60, 120); c = Canvas()
    C_, S, G = R['coat'], R['skull'], R['gglow']
    sw = f
    # the long poncho, falling straight to the ground and fraying into mist
    hem = [(4 + k * 6.5, 112 + ((k + f) % 2) * 3 + (k % 3)) for k in range(9)]
    poncho = [(16, 38), (44, 38), (52, 60), (56, 90), (56, 110)] + hem[::-1] + [(4, 110), (4, 90), (8, 60)]
    m = blob(c, C_, lambda d: d.polygon(poncho, fill=1), bulge=.6, lift=.12, name='poncho')
    for (x0, x1) in [(14, 10), (22, 20), (30, 30), (38, 40), (46, 50)]:          # long vertical folds
        line(c, [(x0, 44), (x1, 110)], C_[0], 'poncho'); line(c, [(x0 - 1, 46), (x1 - 1, 110)], C_[4], 'poncho')
    for y in range(102, 120):                                               # the hem dissolves into green mist
        for x in range(0, 60):
            if c.part[y, x] == 'poncho' and yp.BAYER[y % 4, x % 4] < (y - 100) / 20: c.a[y, x] = False; c.part[y, x] = ''
    for k in range(4):                                                       # a woven border of trarilonko-like steps
        for x in range(6, 56):
            y = 96 + k * 2 + (x // 3) % 2
            if c.part[y, x] == 'poncho': c.px(x, y, (34, 60, 44) if k % 2 else (60, 64, 70))
    # silver buttons down the front (the original's pairs)
    for y in range(46, 96, 10):
        for x in (27, 33): c.rect(x, y, 2, 2, R['silver'][4]); c.px(x, y, R['silver'][6]); c.px(x + 1, y + 1, R['silver'][1])
    # bony arms: forearms out of the poncho, long jointed fingers, one holding a rawhide whip
    taper(c, [(10, 56), (6, 70), (8 + sw, 82)], 5, 4, S, lift=.15, name='arm', bulge=1.2)
    for k in range(4):
        line(c, [(8 + sw, 82), (6 + k * 2 + sw, 88), (5 + k * 2 + sw, 92)], S[5 - (k % 2)], ('', 'poncho'))
    taper(c, [(50, 56), (54, 70), (52 - sw, 82)], 5, 4, S, lift=-.05, name='arm', bulge=1.2)
    line(c, [(52 - sw, 82), (56, 90), (58, 100), (54, 112), (58, 118)], (110, 80, 50))
    for (X, Y) in line(c, [(52 - sw, 82), (56, 90), (58, 100), (54, 112), (58, 118)], (130, 96, 60)): c.part[Y, X] = 'whip'
    for k in range(3): line(c, [(50 - sw, 82), (49 + k * 2 - sw, 87)], S[4])
    # the head: a long horse-like skull under a wide hat, eyes of green fire
    blob(c, S, lambda d: d.polygon(smooth_poly([(22, 18), (38, 18), (40, 28), (36, 38), (30, 41), (24, 38), (20, 28)], 5), fill=1), bulge=1.2, lift=.2, name='skull')
    facet(c, [(21, 26), (26, 22), (26, 30), (22, 31)], S[6]); facet(c, [(34, 22), (39, 26), (38, 31), (34, 30)], S[3])
    for (ex, ey) in [(25, 26), (35, 26)]:
        c.rect(ex - 2, ey - 2, 5, 4, (8, 10, 6)); glow(c, ex, ey, 2, G); c.px(ex - 1, ey - 1, (255, 255, 255))
    c.rect(29, 30, 2, 3, (10, 10, 8))
    for x in range(25, 36): c.px(x, 35, (10, 10, 8))
    for x in range(25, 36, 2): c.px(x, 34, S[6]); c.px(x, 36, S[5])
    for y in range(37, 42): c.px(29, y, S[1])
    # wide flat hat with a band and a long crown
    blob(c, R['hat'], lambda d: d.polygon([(18, 4), (42, 4), (42, 18), (18, 18)], fill=1), bulge=1.0, lift=.15, name='crown')
    blob(c, R['hat'], lambda d: d.ellipse([0, 14, 60, 23], fill=1), bulge=.8, lift=.2, name='brim')
    for x in range(18, 43): c.px(x, 15, (40, 70, 50)); c.px(x, 16, (24, 44, 32))
    for x in range(3, 57): c.px(x, 23, (4, 4, 6)) if c.part[23, x] == 'brim' else None
    # a green haze clinging to the figure
    for k in range(18):
        x = (k * 13 + f * 5) % 58 + 1; y = 40 + (k * 29) % 70
        if not c.a[y, x]: c.px(x, y, G[2] if k % 3 else G[3]); c.part[y, x] = 'mist'
    texture(c, ['poncho', 'crown', 'brim'], amt=.08, seed=4)
    texture(c, ['skull', 'arm'], amt=.1, seed=6, scale=.6)
    occlude(c, ['brim'], ['skull'], r=4, k=.45)
    speculars(c, ['skull', 'arm', 'brim'], thr=.88)
    return finish(c, [('brim', 'skull'), ('crown', 'brim'), ('skull', 'poncho'), ('arm', 'poncho')], rim=(120, 230, 160), rimparts=('poncho', 'brim', 'crown', 'skull', 'arm'))

# =========================================================== shared: a serpent's body along a path
def serpent(c, path, w0, w1, rmp, belly, name, lift=.1, step=4, spikes=None, n=10, front=False, kd=.55):
    """a tapered scaled body; belly plates on the underside (the side facing down); optional dorsal spikes"""
    P = cr(path, n) if len(path) > 2 else path
    taper(c, P, w0, w1, rmp, lift=lift, name=name, bulge=1.25)
    scales(c, name, step, rmp, k_dark=kd, k_lit=1 + (1 - kd) * .5)
    N = len(P)
    for i in range(1, N - 1):
        (x0, y0), (x1, y1) = P[i - 1], P[i + 1]
        L = max(.01, math.hypot(x1 - x0, y1 - y0)); nx, ny = -(y1 - y0) / L, (x1 - x0) / L
        if ny < 0: nx, ny = -nx, -ny                                   # the normal that points down
        w = (w0 + (w1 - w0) * i / N) / 2
        x, y = P[i]
        if front:                                                       # seen from the front: plates down the middle
            for k in np.linspace(-w * .4, w * .4, max(2, int(w))):
                X, Y = int(round(x + nx * k)), int(round(y + ny * k))
                if 0 <= X < yp.W and 0 <= Y < yp.H and c.part[Y, X] == name:
                    c.px(X, Y, belly[max(0, min(len(belly) - 1, int((1 - abs(k) / (w * .4) * .6 - (.25 if i % 3 == 0 else 0)) * (len(belly) - 1))))]); c.part[Y, X] = name + 'b'
            continue
        for k in np.linspace(w * .35, w * .95, max(2, int(w))):
            X, Y = int(round(x + nx * k)), int(round(y + ny * k))
            if 0 <= X < yp.W and 0 <= Y < yp.H and c.part[Y, X] == name:
                t = (k - w * .35) / max(.01, w * .6)
                c.px(X, Y, belly[max(0, min(len(belly) - 1, int((1 - t) * (len(belly) - 1) * .9 + .5)))]); c.part[Y, X] = name + 'b'
        if i % 3 == 0:
            for k in np.linspace(w * .35, w * .95, max(2, int(w))):
                X, Y = int(round(x + nx * k)), int(round(y + ny * k))
                if 0 <= X < yp.W and 0 <= Y < yp.H and c.part[Y, X] == name + 'b': c.rgb[Y, X] = (c.rgb[Y, X] * .55).astype(np.uint8)
        if spikes and i % spikes[0] == 0:
            sx, sy = x - nx * w * .9, y - ny * w * .9; ln = spikes[1] * (1 - i / N * .6)
            taper(c, [(sx, sy), (sx - nx * ln, sy - ny * ln)], 3, 1, spikes[2], lift=lift + .1, name=name + 's', bulge=1.0)
    return P

# =========================================================== chiñifilu: the serpent of ash, coiled around what is forgotten
R.update({k: [hx(c) for c in v] for k, v in {
    'ashs':  ['#0c0b0a', '#1a1816', '#2a2724', '#3c3834', '#504b45', '#666058', '#7e776d', '#989085'],
    'ashb':  ['#3a2c22', '#5a4434', '#7c5e48', '#9e7c60', '#bea080'],
    'ember': ['#3a0a02', '#7a1a04', '#c43a08', '#f47a18', '#ffc048', '#fff0a0']}.items()})
def chinifilu(f):
    setsize(104, 76); c = Canvas()
    A, E = R['ashs'], R['ember']
    blob(c, A[:4], lambda d: d.ellipse([6, 62, 100, 75], fill=1), bulge=.4, lift=.1, name='ashbed')
    for k in range(40):                                               # a bed of cinders
        x, y = 10 + (k * 37) % 86, 64 + (k * 13) % 9
        if c.part[y, x] == 'ashbed': c.px(x, y, E[2 + k % 3]) if k % 3 else c.px(x, y, A[5])
    b = f * 1.5
    # back coil, then front coil, then the rising neck: drawn back to front
    serpent(c, [(88, 60), (98, 46), (86, 34), (64, 36), (52, 48)], 13, 13, A, R['ashb'], 'coil1', lift=-.04, spikes=(3, 5, A))
    serpent(c, [(14, 60), (34, 68), (66, 68), (90, 62), (96, 52)], 16, 12, A, R['ashb'], 'coil2', lift=.12, spikes=(4, 5, A))
    serpent(c, [(60, 64), (40, 58), (28, 44), (26, 28 - b), (34, 16 - b)], 15, 11, A, R['ashb'], 'neck', lift=.18, spikes=(3, 6, A))
    # embers glowing through the cracks between the scales
    for part in ('coil1', 'coil2', 'neck'):
        ys, xs = np.nonzero(c.part == part)
        rs = np.random.RandomState(len(part) + f)
        for i in rs.choice(len(ys), len(ys) // 26, replace=False):
            y, x = ys[i], xs[i]
            if (c.rgb[y, x].mean() < 60): c.px(x, y, E[3 + (i % 2)]); c.px(x + 1, y, E[2]) if c.part[y, min(yp.W - 1, x + 1)] == part else None
    # the head: a wedge of ash-grey plates, ember eye, a forked tongue
    hx0, hy0 = 34, 14 - b
    head = smooth_poly([(hx0 - 14, hy0 + 2), (hx0 - 6, hy0 - 7), (hx0 + 8, hy0 - 8), (hx0 + 14, hy0 - 2), (hx0 + 10, hy0 + 8), (hx0 - 4, hy0 + 9)], 5)
    blob(c, A, lambda d: d.polygon(head, fill=1), bulge=1.25, lift=.2, name='head')
    facet(c, [(hx0 - 6, hy0 - 7), (hx0 + 8, hy0 - 8), (hx0 + 4, hy0 - 3), (hx0 - 6, hy0 - 2)], A[6])
    for x in range(int(hx0 - 12), int(hx0 + 12)): c.px(x, int(hy0 + 3 + (x - hx0) * .1), (14, 6, 4))
    for x in range(int(hx0 - 10), int(hx0 + 10), 3): tooth3(c, x, int(hy0 + 4), int(hy0 + 7), R['claw'])
    eye(c, int(hx0 - 4), int(hy0 - 3), 3, 2, E)
    for (dx, dy) in [(-3, -5), (2, -5), (7, -5)]: c.px(int(hx0 + dx), int(hy0 + dy - 3), A[7])   # brow horns
    t0 = (int(hx0 - 15), int(hy0 + 3))
    for (X, Y) in line(c, [t0, (t0[0] - 6, t0[1] + 2 - f * 2), (t0[0] - 9, t0[1] - 1 - f * 2)], (200, 50, 60)): c.part[Y, X] = 'tongue'
    line(c, [(t0[0] - 6, t0[1] + 2 - f * 2), (t0[0] - 9, t0[1] + 4 - f * 2)], (200, 50, 60))
    # ash drifting up from it
    for k in range(26):
        x = (k * 41 + f * 7) % 100 + 2; y = (k * 17 + f * 5) % 50 + 2
        if not c.a[y, x]: c.px(x, y, A[6] if k % 3 else E[3]); c.part[y, x] = 'flake'
    texture(c, ['coil1', 'coil2', 'neck', 'head'], amt=.14, seed=12)
    occlude(c, ['neck', 'head'], ['coil1', 'coil2', 'coil1b', 'coil2b'], r=4, k=.55)
    occlude(c, ['coil2', 'coil2b'], ['coil1', 'coil1b', 'ashbed'], r=4, k=.55)
    speculars(c, ['coil1', 'coil2', 'neck', 'head'], thr=.88, col=(255, 230, 200))
    return finish(c, [('neck', 'coil2'), ('neckb', 'coil2'), ('coil2', 'coil1'), ('coil2b', 'coil1'), ('head', 'neck'), ('neck', 'coil1'), ('necks', 'neck'), ('coil1s', 'coil1'), ('coil2s', 'coil2')],
                  rim=(240, 120, 50), rimparts=('coil1', 'coil2', 'neck', 'head'))

# =========================================================== piwüchen: the great winged serpent of the rivers
R.update({k: [hx(c) for c in v] for k, v in {
    'pscale': ['#12040a', '#260812', '#3e0e1c', '#5a1626', '#7a2232', '#9c3240', '#be4a52', '#da6c68'],
    'pbelly': ['#5a3a1a', '#8a6028', '#b48a3a', '#d8b056', '#f2d886'],
    'pmemb':  ['#0c0612', '#180c22', '#261434', '#361e48', '#48285c', '#5c3472', '#74448a', '#8e58a2'],
    'feath':  ['#0a2a2a', '#124444', '#1c6260', '#2a8480', '#40a8a0', '#68ccc0']}.items()})
def piwuchen(f):
    setsize(112, 88); c = Canvas()
    fl = -4 if f else 2; O = 8
    # bat wings spread from the neck, ribbed and scalloped
    for side in (-1, 1):
        rx, ry = 56 + side * 6, 26 + O
        lead = [(rx, ry), (56 + side * 24, 8 + O + fl), (56 + side * 46, 6 + O + fl), (56 + side * 54, 20 + O + fl)]
        ribs = [(56 + side * 50, 40 + O + fl), (56 + side * 40, 48 + O + fl * .7), (56 + side * 26, 50 + O + fl * .4), (56 + side * 14, 44 + O)]
        wp.R['memb'] = R['pmemb']
        wp.ear_wing(c, (rx, ry), lead, ribs, 0, .12 if side < 0 else -.02, 'wingL' if side < 0 else 'wingR', side)
        for (x, y) in [lead[2], lead[3]]:
            taper(c, [(x, y), (x + side * 4, y - 4)], 3, 1, R['claw'], lift=.2, name='claw', bulge=1.0)
    # the body hangs below in a long S, tail tip curling
    serpent(c, [(56, 32), (58, 48), (51, 60), (56, 70), (65, 77), (62, 85)], 17, 4, R['pscale'], R['pbelly'], 'body', lift=.12, step=3, n=12, front=True)
    # head: a fanged snake head with a crest of river-green feathers
    hd = [(43, 12), (49, 4), (63, 4), (69, 12), (66, 20), (61, 27), (51, 27), (46, 20)]
    blob(c, R['throat'], lambda d: d.polygon([(48, 30), (64, 30), (60, 44), (52, 44)], fill=1), bulge=.8, lift=-.05, name='maw')
    blob(c, R['pscale'], lambda d: d.polygon([(49, 38), (63, 38), (60, 46), (52, 46)], fill=1), bulge=1.1, lift=.05, name='jaw')
    blob(c, R['pscale'], lambda d: d.polygon(hd, fill=1), bulge=1.3, lift=.22, name='head')
    P_ = R['pscale']
    facet(c, [(49, 13), (56, 12), (56, 20), (48, 21)], P_[7]); facet(c, [(56, 12), (63, 13), (64, 21), (56, 20)], P_[5])
    facet(c, [(48, 21), (56, 20), (56, 28), (50, 29)], P_[6]); facet(c, [(56, 20), (64, 21), (62, 29), (56, 28)], P_[4])
    for y in range(5, 34): c.px(56, y, P_[2])
    c.px(53, 24, (20, 4, 6)); c.px(59, 24, (20, 4, 6))
    tooth3(c, 50, 35, 42, R['claw']); tooth3(c, 61, 35, 42, R['claw'])
    for x in range(53, 60, 3): tooth3(c, x, 35, 38, R['claw'])
    for k in range(7):                                                   # the crest, fanned behind the head
        a = math.radians(-165 + k * 25); L = 10 + (k % 2) * 3
        taper(c, [(56, 13), (56 + math.cos(a) * L, 13 + math.sin(a) * L * .9 - fl * .2)], 4, 1.5, R['feath'], lift=.1, name='crest', bulge=1.1)
    eye(c, 47, 20, 3, 2, R['eyey']); eye(c, 65, 20, 3, 2, R['eyey'])
    # its whistle: rings rolling out from the open jaws
    arcs(c, 56, 42, [9 + 3 * f, 15 + 3 * f], math.pi * .3, math.pi * .7, (240, 220, 160), step=.08)
    texture(c, ['body', 'head'], amt=.12, seed=14)
    occlude(c, ['head', 'crest'], ['body', 'bodyb', 'wingL', 'wingR'], r=3, k=.55)
    speculars(c, ['body', 'head', 'wingLrim', 'wingRrim'], thr=.86)
    return finish(c, [('head', 'body'), ('jaw', 'maw'), ('head', 'maw'), ('body', 'wingL'), ('body', 'wingR'), ('crest', 'head'), ('wingLbowl', 'body'), ('wingRbowl', 'body')],
                  rim=(230, 120, 140), rimparts=('body', 'head', 'wingLrim', 'wingRrim'))

# =========================================================== wallepeñ: a calf's head on a sheep's body, on legs too long
R.update({k: [hx(c) for c in v] for k, v in {
    'wool':  ['#16161c', '#26262e', '#3a3a42', '#504e54', '#6a666a', '#868080', '#a49c96', '#c0b8ae'],
    'calf':  ['#120806', '#22120c', '#341c12', '#48281a', '#5e3622', '#76462c', '#8e5838'],
    'muzzle':['#2e1818', '#4a2828', '#683c3a', '#8a5652', '#a87068'],
    'hoof':  ['#060606', '#121214', '#202024', '#30303a', '#44444e'],
    'blue':  ['#06183a', '#0c3070', '#1a54b0', '#3a86e0', '#80c0ff', '#e0f4ff']}.items()})
def wallipen(f):
    setsize(92, 76); c = Canvas()
    W_, C_ = R['wool'], R['calf']
    st = 1 if f else 0
    # four long thin legs, knobbed knees, hooves; the far pair darker
    for (x, lift, ph) in [(40, -.12, 0), (74, -.12, 1), (30, .1, 1), (64, .1, 0)]:
        k = st if ph else -st
        taper(c, [(x, 44), (x + 2 + k, 58), (x + k, 70)], 5, 4, C_, lift=lift, name='leg', bulge=1.2)
        blob(c, C_, lambda d, x=x, k=k: d.ellipse([x - 1 + k, 55, x + 5 + k, 61], fill=1), bulge=1.2, lift=lift + .05, name='knee')
        blob(c, R['hoof'], lambda d, x=x, k=k: d.polygon([(x - 3 + k, 70), (x + 3 + k, 70), (x + 4 + k, 75), (x - 4 + k, 75)], fill=1), bulge=1.0, lift=lift, name='hoof')
    # the fleece: a lumpy cloud of curls, darker underneath
    lumps = [(50, 30, 18), (66, 26, 14), (36, 28, 14), (78, 34, 11), (58, 42, 16), (40, 42, 13), (24, 36, 10)]
    for (x, y, r) in lumps:
        blob(c, W_, lambda d, x=x, y=y, r=r: d.ellipse([x - r, y - r * .8 - st, x + r, y + r * .8 - st], fill=1), bulge=1.0, lift=.16, name='wool')
    ys, xs = np.nonzero(c.part == 'wool')                                # tight curls: small dark rings everywhere
    for y in range(ys.min(), ys.max() + 1, 3):
        for x in range(xs.min() + (y % 2) * 2, xs.max() + 1, 4):
            for (dx, dy) in [(0, 1), (1, 1), (2, 0)]:
                X, Y = x + dx, y + dy
                if 0 <= X < yp.W and 0 <= Y < yp.H and c.part[Y, X] == 'wool': c.rgb[Y, X] = (c.rgb[Y, X] * .72).astype(np.uint8)
            if c.part[y, x] == 'wool': c.rgb[y, x] = np.minimum(255, c.rgb[y, x].astype(int) + 22).astype(np.uint8)
    # the marks it leaves on the unborn: dark spots in the wool
    for (x, y, r) in [(56, 26, 4), (70, 36, 3), (44, 36, 3), (62, 44, 2)]:
        m = c.mask(lambda d, x=x, y=y, r=r: d.ellipse([x - r, y - r * .7 - st, x + r, y + r * .7 - st], fill=1)) & (c.part == 'wool')
        ys, xs = np.nonzero(m); c.rgb[ys, xs] = np.array(R['carap'])[np.clip((c.rgb[ys, xs].mean(1) / 255 * 9).astype(int), 0, 6)]
    # stubby tail
    blob(c, W_, lambda d: d.ellipse([84, 26 - st, 92, 36 - st], fill=1), bulge=1.1, lift=0, name='wool2')
    # the calf's head, set low and turned toward you, wet muzzle, nubs of horn, one pale blue eye too many
    hd = smooth_poly([(8, 22), (20, 16), (30, 20), (32, 32), (24, 44), (14, 46), (6, 38)], 5)
    for side, (ex, ey) in [(-1, (8, 20)), (1, (30, 18))]:                   # ears, flopped out sideways
        blob(c, C_, lambda d, ex=ex, ey=ey, side=side: d.polygon([(ex, ey + 4), (ex + side * 10, ey + 2), (ex + side * 8, ey + 7)], fill=1), bulge=1.0, lift=.1 if side < 0 else -.05, name='ear')
    blob(c, C_, lambda d: d.polygon(hd, fill=1), bulge=1.25, lift=.22, name='head')
    blob(c, R['muzzle'], lambda d: d.ellipse([9, 34, 27, 47], fill=1), bulge=1.2, lift=.2, name='muzzle')
    c.rect(13, 40, 2, 2, (20, 8, 8)); c.rect(21, 40, 2, 2, (20, 8, 8)); c.px(12, 39, R['muzzle'][4]); c.px(20, 39, R['muzzle'][4])
    for x in range(13, 24): c.px(x, 45, R['muzzle'][0])
    blob(c, W_, lambda d: d.ellipse([12, 12, 26, 22], fill=1), bulge=1.0, lift=.2, name='wool')    # a tuft of wool between the horns
    for (hx_, side) in [(12, -1), (26, 1)]:
        taper(c, [(hx_, 18), (hx_ + side * 3, 12)], 4, 2, R['claw'], lift=.18, name='horn', bulge=1.1)
    for (ex, ey) in [(13, 28), (26, 28)]:
        c.rect(ex - 3, ey - 2, 6, 4, (8, 4, 4)); glow(c, ex, ey, 2, R['blue'][2:]); c.px(ex - 1, ey - 1, (255, 255, 255))
    for k in range(3): c.px(10 + k * 6, 46 + k % 2, (190, 210, 230)); c.px(10 + k * 6, 47 + k % 2 + f, (140, 170, 200))   # drool
    texture(c, ['wool', 'wool2'], amt=.08, seed=15, scale=.6)
    texture(c, ['head', 'ear', 'leg', 'knee'], amt=.1, seed=16)
    occlude(c, ['head', 'muzzle'], ['wool', 'leg'], r=4, k=.55)
    occlude(c, ['wool'], ['leg', 'knee'], r=5, k=.5)
    speculars(c, ['head', 'muzzle', 'horn', 'hoof'], thr=.86)
    return finish(c, [('head', 'wool'), ('muzzle', 'head'), ('ear', 'head'), ('horn', 'wool'), ('leg', 'wool'), ('knee', 'leg'), ('hoof', 'leg'), ('wool2', 'wool')],
                  rim=(120, 140, 210), rimparts=('wool', 'head', 'leg', 'ear'))

# =========================================================== trawko: the little man of the southern forest, axe raised, eyes that enchant
R.update({k: [hx(c) for c in v] for k, v in {
    'bark':  ['#0c0806', '#1a120c', '#2a1e14', '#3c2c1e', '#503c28', '#685034', '#806642'],
    'moss':  ['#0a1206', '#14220c', '#203614', '#2e4c1c', '#3e6426', '#527e32', '#6a9a42'],
    'straw': ['#1e1608', '#3a2c12', '#5a461e', '#7c622c', '#a0823c', '#c4a454', '#e2c672'],
    'stone': ['#141418', '#24242a', '#36363e', '#4a4a54', '#62626c', '#7e7e88', '#a0a0aa'],
    'redg':  ['#3a0404', '#7a0808', '#c41414', '#f43a2a', '#ff8a70', '#ffffff']}.items()})
def trawko(f):
    setsize(96, 112); c = Canvas()
    Bk, M = R['bark'], R['moss']
    # a cloak of fern fronds and moss behind him, red lining glimpsed
    cloak = smooth_poly([(26, 46), (70, 44), (82, 74), (86, 102), (62, 98), (40, 100), (14, 104), (16, 74)], 5)
    blob(c, M, lambda d: d.polygon(cloak, fill=1), bulge=.7, lift=.06, name='cloak')
    for k in range(9):                                                   # fronds: a midrib and leaflets
        x0 = 18 + k * 8; y1 = 100 + (k % 2) * 4 + (f if k % 2 else -f)
        pts = [(x0 + 4, 50), (x0 + 2, 76), (x0 + (k - 4), y1)]
        for (X, Y) in line(c, pts, M[5], 'cloak'): pass
        for t in range(54, 100, 4):
            X = int(x0 + 2 + (t - 54) * (k - 4) / 50)
            for s_ in (-1, 1):
                for q in range(1, 4):
                    xx, yy = X + s_ * q, t + q // 2
                    if 0 <= xx < yp.W and c.part[yy, xx] == 'cloak': c.px(xx, yy, M[4 if s_ < 0 else 2])
    blob(c, R['carap'], lambda d: d.polygon([(70, 52), (84, 78), (88, 104), (80, 102), (74, 76)], fill=1), bulge=.8, lift=-.05, name='lining')
    # squat body of knotted bark, short bowed legs, root feet
    blob(c, Bk, lambda d: d.polygon(smooth_poly([(30, 50), (66, 50), (70, 70), (62, 86), (34, 86), (26, 70)], 5), fill=1), bulge=1.2, lift=.18, name='body')
    for (a, b) in [((34, 56), (40, 82)), ((48, 54), (46, 84)), ((60, 56), (58, 82))]:
        line(c, [a, ((a[0] + b[0]) / 2 + 2, (a[1] + b[1]) / 2), b], Bk[1], 'body')
    for (x, lift) in [(38, .15), (58, -.02)]:
        taper(c, [(x, 84), (x - 3 if x < 48 else x + 3, 96), (x, 104)], 9, 8, Bk, lift=lift, name='leg', bulge=1.2)
        for k in range(4):
            line(c, [(x, 103), (x - 6 + k * 4, 107), (x - 8 + k * 5, 110)], Bk[3 + (k % 2)], ('', 'leg', 'cloak'))
    # belt of braided fibre
    for x in range(28, 70):
        y = 72 + int(2 * math.sin(x / 7))
        if c.part[y, x] == 'body': c.px(x, y, R['straw'][4 if x % 3 else 2]); c.px(x, y + 1, R['straw'][1])
    # arms: one hanging, gnarled hand; one raising the stone axe overhead
    taper(c, cr([(30, 56), (20, 68), (18, 80)], 6), 8, 7, Bk, lift=.15, name='arm', bulge=1.2)
    for k in range(4): line(c, [(18, 80), (13 + k * 3, 87), (12 + k * 3, 90)], Bk[5 - (k % 2)], ('', 'cloak', 'leg'))
    taper(c, cr([(66, 54), (78, 44), (82, 30)], 6), 8, 7, Bk, lift=-.04, name='arm2', bulge=1.2)
    sw = 2 if f else 0
    taper(c, [(82, 34), (88 - sw, 6)], 4, 4, Bk, lift=.35, name='haft', bulge=1.0)
    blob(c, R['stone'], lambda d: d.polygon([(76 - sw, 2), (96 - sw, 4), (94 - sw, 18), (80 - sw, 16), (72 - sw, 10)], fill=1), bulge=1.2, lift=.18, name='axe')
    facet(c, [(76 - sw, 3), (90 - sw, 4), (84 - sw, 9), (74 - sw, 9)], R['stone'][6])
    for k in range(5): line(c, [(81 - sw + k, 12), (83 - sw + k, 20)], R['straw'][3 + k % 2], ('haft', 'axe'))   # lashing
    blob(c, Bk, lambda d: d.ellipse([78, 26, 88, 36], fill=1), bulge=1.2, lift=.0, name='fist')
    # the head: big, knotted, a beard of moss, eyes of red fire, a grin full of crooked teeth
    hd = smooth_poly([(28, 22), (46, 16), (66, 22), (70, 38), (60, 52), (36, 52), (26, 38)], 5)
    blob(c, Bk, lambda d: d.polygon(hd, fill=1), bulge=1.3, lift=.24, name='head')
    blob(c, M, lambda d: d.polygon(smooth_poly([(30, 42), (66, 42), (62, 60), (48, 66), (34, 60)], 5), fill=1), bulge=1.0, lift=.1, name='beard')
    for x in range(32, 64, 2): line(c, [(x, 46), (x + (x - 48) * .08, 60 - abs(x - 48) // 3)], M[2 if x % 4 else 5], 'beard')
    facet(c, [(30, 30), (40, 28), (40, 32), (30, 34)], Bk[1]); facet(c, [(54, 28), (66, 30), (66, 34), (54, 32)], Bk[1])
    for (ex, ey) in [(36, 34), (58, 34)]:
        c.rect(ex - 4, ey - 2, 9, 5, (12, 4, 4)); glow(c, ex, ey, 3, R['redg']); c.px(ex - 1, ey - 1, (255, 255, 255))
    blob(c, R['muzzle'], lambda d: d.polygon([(44, 32), (52, 32), (54, 40), (42, 40)], fill=1), bulge=1.2, lift=.25, name='nose')
    c.rect(36, 43, 24, 4, (16, 4, 4))
    for k, x in enumerate(range(37, 59, 3)): tooth3(c, x, 43, 46 + (k % 2), R['claw'])
    # the pointed straw hat
    blob(c, R['straw'], lambda d: d.polygon([(48, -2 + f), (20, 26), (76, 26)], fill=1), bulge=.9, lift=.18, name='hat')
    for y in range(4, 26, 4):
        for x in range(18, 78):
            if c.part[y, x] == 'hat': c.px(x, y, R['straw'][1]); c.px(x, y - 1, R['straw'][5]) if c.part[y - 1, x] == 'hat' else None
    for x in range(20, 77, 3):
        if c.part[25, x] == 'hat': c.px(x, 26, R['straw'][3]); c.px(x, 27, R['straw'][2])
    texture(c, ['body', 'leg', 'arm', 'arm2', 'head', 'fist'], amt=.16, seed=17)
    texture(c, ['cloak', 'beard'], amt=.1, seed=18)
    occlude(c, ['hat'], ['head'], r=4, k=.5)
    occlude(c, ['beard', 'head'], ['body'], r=4, k=.55)
    speculars(c, ['head', 'axe', 'hat', 'body'], thr=.86)
    return finish(c, [('head', 'beard'), ('beard', 'body'), ('hat', 'head'), ('arm', 'body'), ('arm2', 'body'), ('leg', 'body'), ('axe', 'haft'), ('fist', 'haft'), ('cloak', 'body'), ('lining', 'cloak'), ('nose', 'head')],
                  rim=(190, 220, 140), rimparts=('cloak', 'head', 'hat', 'body', 'arm2'))

# =========================================================== walichu: a gaunt spirit in a painted guanaco-hide cloak, horned skull for a face
R.update({k: [hx(c) for c in v] for k, v in {
    'quill': ['#140c08', '#24160e', '#382416', '#4e3420', '#66462c', '#80583a', '#9a6c4a'],
    'sick':  ['#2a3008', '#4a5410', '#728018', '#a0b028', '#cce050', '#f0ffa0'],
    'pale':  ['#2a2826', '#46423c', '#665e56', '#8a8076', '#ada298', '#cec4b8', '#ece4da']}.items()})
def walichu(f):
    setsize(88, 116); c = Canvas()
    Q, P = R['quill'], R['pale']
    sw = f
    # the cloak: a wide quillango falling from narrow shoulders to the ground, flaring out
    hem = [(4 + k * 10, 112 + ((k + f) % 2) * 2) for k in range(9)]
    cl = [(34, 34), (54, 34), (64, 50), (76, 80), (86, 110)] + hem[::-1] + [(2, 110), (12, 80), (24, 50)]
    blob(c, Q, lambda d: d.polygon(cl, fill=1), bulge=.65, lift=.12, name='cloak')
    # painted panels: red and black step-frets and zigzags, as on Puelche hide cloaks, following the folds
    for band, y0 in enumerate((58, 78, 98)):
        for x in range(0, 88):
            for k in range(4):
                y = y0 + k + (2 if (x // 4 + band) % 2 else 0) * (1 if k < 2 else -1) + int((x - 44) ** 2 / 600)
                if 0 <= y < yp.H and c.part[y, x] == 'cloak':
                    v = c.rgb[y, x].mean() / 255
                    c.px(x, y, (int(150 * v + 40), int(30 * v + 8), int(20 * v + 6)) if (k + x // 4) % 3 else (12, 6, 4))
    for x in range(10, 80, 6):                                                # seams between the stitched skins
        line(c, [(44 + (x - 44) * .45, 38), (x, 112)], Q[1], 'cloak')
        for y in range(44, 112, 4):
            X = int(round(44 + (x - 44) * (.45 + .55 * (y - 38) / 74)))
            if c.part[y, X] == 'cloak': c.px(X + 1, y, Q[5])
    # long white arms, too many joints, fingers like twigs
    for side in (-1, 1):
        lf = .15 if side < 0 else -.04
        e = (44 + side * 30, 62 + (sw if side < 0 else -sw)); h = (44 + side * 34, 84 + (sw if side < 0 else -sw))
        taper(c, cr([(44 + side * 12, 40), e, h], 6), 4, 3, P, lift=lf, name='arm', bulge=1.2)
        for k in range(5):
            a = math.radians(90 + side * (-30 + k * 15))
            line(c, [h, (h[0] + math.cos(a) * 5, h[1] + math.sin(a) * 5), (h[0] + math.cos(a) * 8 + side * 2, h[1] + math.sin(a) * 9)], P[5 - (k % 2) * 2])
    # a mantle of grey fur about the shoulders
    blob(c, R['wool'], lambda d: d.polygon(smooth_poly([(24, 36), (44, 28), (64, 36), (60, 46), (44, 50), (28, 46)], 5), fill=1), bulge=1.0, lift=.15, name='fur')
    for x in range(26, 64, 2):
        line(c, [(x, 40), (x + (x - 44) * .1, 48 - abs(x - 44) // 5)], R['wool'][2 if x % 4 else 5], 'fur')
    # the head: a long horned skull, jaw hanging open, yellow light in the sockets
    blob(c, P, lambda d: d.polygon(smooth_poly([(36, 10), (52, 10), (56, 20), (52, 34), (48, 40), (40, 40), (36, 34), (32, 20)], 5), fill=1), bulge=1.25, lift=.22, name='skull')
    facet(c, [(36, 12), (44, 10), (44, 20), (34, 22)], P[6]); facet(c, [(44, 10), (52, 12), (54, 22), (44, 20)], P[4])
    for side in (-1, 1):
        pts = [(44 + side * 9, 12), (44 + side * 20, 4), (44 + side * 26, 8), (44 + side * 24, 16)]
        taper(c, cr(pts, 6), 6, 2, R['claw'], lift=.15 if side < 0 else 0, name='horn', bulge=1.2)
        for (X, Y) in line(c, cr(pts, 6)[2::4], R['claw'][1], 'horn'): pass
    for (ex, ey) in [(39, 22), (49, 22)]:
        c.rect(ex - 3, ey - 3, 7, 6, (10, 8, 4)); glow(c, ex, ey, 2, R['sick']); c.px(ex - 1, ey - 1, (255, 255, 255))
    c.rect(43, 28, 2, 3, (10, 8, 4))
    c.rect(38, 34, 12, 3 + sw, (12, 8, 4))
    for x in range(38, 50, 2): c.px(x, 33, P[6]); c.px(x + 1, 37 + sw, P[5])
    # a cloud of sickness around it: motes and wisps
    rs = np.random.RandomState(3 + f)
    for _ in range(46):
        x, y = rs.randint(0, 88), rs.randint(20, 112)
        if not c.a[y, x]: c.px(x, y, R['sick'][rs.randint(2, 5)]); c.part[y, x] = 'mote'
    texture(c, ['cloak'], amt=.12, seed=21)
    texture(c, ['skull', 'arm', 'horn'], amt=.1, seed=22, scale=.6)
    occlude(c, ['fur', 'skull'], ['cloak'], r=4, k=.55)
    speculars(c, ['skull', 'horn', 'arm'], thr=.86)
    return finish(c, [('fur', 'cloak'), ('skull', 'fur'), ('horn', 'skull'), ('arm', 'cloak'), ('arm', 'fur')], rim=(210, 200, 160), rimparts=('cloak', 'skull', 'fur', 'arm', 'horn'))

# =========================================================== elëngasëm: a giant of stone and salt from the eastern plains
R.update({k: [hx(c) for c in v] for k, v in {
    'salt':  ['#2a3438', '#425056', '#5e6e74', '#7e9098', '#a2b4ba', '#c4d4d8', '#e2eef0', '#ffffff'],
    'rock':  ['#100e0e', '#1e1a1a', '#2e2828', '#403838', '#544a48', '#6a5e5a', '#84766e'],
    'teal':  ['#063a30', '#0c6a56', '#18a080', '#40d4b0', '#9cfce0', '#ffffff']}.items()})
def crystal(c, x, y, w, h, lean, rmp, name, lift=0.0):
    """a hexagonal salt crystal: a lit left face, a darker right face, a pointed top cut into two planes"""
    top = (x + lean, y - h)
    L = [(x - w, y), (x - w + lean * .8, y - h * .78), top, (x + lean * .9, y - h * .82), (x, y + 1)]
    Rr = [(x, y + 1), (x + lean * .9, y - h * .82), top, (x + w + lean * .8, y - h * .78), (x + w, y)]
    m1 = facet(c, L, rmp[min(len(rmp) - 1, 5 + int(lift * 4))], name); m2 = facet(c, Rr, rmp[max(0, 3 + int(lift * 4))], name)
    facet(c, [(x - w + lean * .8, y - h * .78), top, (x + lean * .9, y - h * .82)], rmp[-1], name)
    facet(c, [(x + lean * .9, y - h * .82), top, (x + w + lean * .8, y - h * .78)], rmp[-3], name)
    for (X, Y) in line(c, [(x + lean * .45, y - h * .4), (x - w * .4 + lean * .6, y - h * .6)], rmp[-2], name): pass
    return m1 | m2
def chadikura(f):
    setsize(88, 100); c = Canvas()
    S_, Rk, T = R['salt'], R['rock'], R['teal']
    bob = f
    # the salt flat it stands on, cracked into hexagons
    blob(c, S_[:6], lambda d: d.ellipse([4, 88, 84, 99], fill=1), bulge=.4, lift=.2, name='flat')
    for (a, b) in [((12, 93), (26, 91)), ((26, 91), (34, 96)), ((44, 90), (56, 94)), ((56, 94), (70, 92)), ((34, 96), (44, 90))]: line(c, [a, b], S_[1], 'flat')
    # legs: columns of rock crusted with salt
    for (x, lift) in [(30, .12), (56, -.04)]:
        blob(c, Rk, lambda d, x=x: d.polygon([(x - 8, 62), (x + 8, 62), (x + 10, 92), (x - 10, 92)], fill=1), bulge=1.1, lift=lift, name='leg')
        crystal(c, x - 6, 92, 3, 9, -2, S_, 'cry', .1); crystal(c, x + 6, 92, 2, 6, 2, S_, 'cry', 0)
    # the torso: a great block of rock split by salt veins, a teal glow in the cracks
    torso = smooth_poly([(20, 28 + bob), (68, 28 + bob), (74, 46 + bob), (66, 68), (22, 68), (14, 46 + bob)], 5)
    blob(c, Rk, lambda d: d.polygon(torso, fill=1), bulge=1.2, lift=.16, name='torso')
    for pts in ([(30, 30), (36, 44), (32, 56), (36, 66)], [(58, 30), (52, 46), (58, 60)], [(36, 44), (52, 46)]):
        for (X, Y) in line(c, [(x, y + (bob if y < 60 else 0)) for x, y in pts], T[3], 'torso'):
            if c.part[Y, X + 1] == 'torso': c.px(X + 1, Y, T[1])
            if c.part[Y, X - 1] == 'torso': c.px(X - 1, Y, S_[5])
    glow(c, 44, 46 + bob, 4, T)
    # salt crystals bursting from the shoulders and back like a mane
    for (x, y, w, h, lean) in [(16, 36, 4, 20, -6), (24, 30, 4, 26, -3), (32, 28, 3, 18, -1), (56, 28, 3, 18, 1), (64, 30, 4, 26, 3), (72, 36, 4, 20, 6), (44, 28, 3, 14, 0)]:
        crystal(c, x, y + bob, w, h, lean, S_, 'cry', .1 if x < 44 else -.1)
    # arms: boulders hung from the shoulders, fists of raw salt
    for side in (-1, 1):
        lf = .14 if side < 0 else -.04
        taper(c, cr([(44 + side * 26, 40 + bob), (44 + side * 34, 56), (44 + side * 32, 72)], 6), 13, 12, Rk, lift=lf, name='arm', bulge=1.2)
        crystal(c, 44 + side * 32, 84, 7, 14, side * 2, S_, 'fist', lf)
    # the head: a smaller block set low, a brow of salt, teal eyes, a slot of a mouth
    hd = smooth_poly([(34, 12 + bob), (54, 12 + bob), (58, 24 + bob), (52, 34 + bob), (36, 34 + bob), (30, 24 + bob)], 4)
    blob(c, Rk, lambda d: d.polygon(hd, fill=1), bulge=1.25, lift=.2, name='head')
    facet(c, [(32, 18 + bob), (56, 18 + bob), (54, 22 + bob), (34, 22 + bob)], S_[5], 'brow'); facet(c, [(34, 22 + bob), (54, 22 + bob), (53, 23 + bob), (35, 23 + bob)], S_[2], 'brow')
    for ex in (38, 50):
        c.rect(ex - 2, 24 + bob, 5, 3, (4, 10, 8)); glow(c, ex, 25 + bob, 2, T); c.px(ex - 1, 24 + bob, (255, 255, 255))
    c.rect(38, 30 + bob, 12, 2, (6, 8, 8)); c.rect(39, 30 + bob, 10, 1, T[1])
    crystal(c, 44, 13 + bob, 4, 10, 0, S_, 'cry', .1)
    # salt dust in the air
    for k in range(20):
        x, y = (k * 29 + f * 3) % 86 + 1, (k * 19 + f * 7) % 84 + 2
        if not c.a[y, x]: c.px(x, y, S_[6] if k % 2 else S_[4]); c.part[y, x] = 'dust'
    texture(c, ['torso', 'leg', 'arm', 'head'], amt=.16, seed=23)
    occlude(c, ['head', 'arm', 'cry'], ['torso'], r=4, k=.55)
    occlude(c, ['torso'], ['leg'], r=5, k=.5)
    speculars(c, ['torso', 'head', 'arm', 'leg'], thr=.84, col=(220, 255, 245))
    return finish(c, [('head', 'torso'), ('arm', 'torso'), ('leg', 'torso'), ('cry', 'torso'), ('fist', 'arm'), ('brow', 'head'), ('cry', 'head')],
                  rim=(150, 255, 210), rimparts=('torso', 'arm', 'leg', 'head', 'cry'))

# =========================================================== epunamun: the two-faced ngen of war, a lance in each hand
R.update({k: [hx(c) for c in v] for k, v in {
    'copper':['#1a0a04', '#36160a', '#562610', '#7a3a18', '#9e5224', '#c26e34', '#e08e4a', '#f6b070'],
    'redc':  ['#1a0204', '#3a060a', '#600c12', '#8c161a', '#b42622', '#d8402c'],
    'blk':   ['#040404', '#0c0a0a', '#161212', '#221c1c', '#2e2626'],
    'skinE': ['#1a0c08', '#341a10', '#52281a', '#703824', '#904a30', '#b0603e', '#cc7a52']}.items()})
def epunamun(f):
    setsize(84, 104); c = Canvas()
    Cu, Rd, Sk = R['copper'], R['redc'], R['skinE']
    st = f
    # two lances, planted upright, red tassels at the blade
    for (x, lift) in [(8, .2), (76, 0)]:
        taper(c, [(x, 100), (x, 8)], 4, 3, R['bark'], lift=lift + .3, name='haft', bulge=1.0)
        blob(c, R['silver'], lambda d, x=x: d.polygon([(x, -1), (x + 4, 8), (x, 12), (x - 4, 8)], fill=1), bulge=1.1, lift=.2, name='blade')
        for k in range(4): line(c, [(x - 1 + k, 13), (x - 3 + k * 2 + st, 22)], Rd[3 + k % 2])
    # legs in a wide stance, wrapped in a chiripa, leather bands at the shins
    for (x0, x1, lift) in [(30, 18, .14), (54, 66, -.04)]:
        taper(c, [(x0, 66), (x1, 82), (x1 + (2 if x1 < 40 else -2), 98)], 10, 8, Sk, lift=lift, name='leg', bulge=1.2)
        for y in (86, 90): line(c, [(x1 - 5, y), (x1 + 5, y)], R['blk'][3], 'leg')
        blob(c, R['blk'], lambda d, x1=x1: d.polygon([(x1 - 6, 97), (x1 + 6, 97), (x1 + 8, 103), (x1 - 8, 103)], fill=1), bulge=1.0, lift=lift, name='foot')
    blob(c, Rd, lambda d: d.polygon([(24, 60), (60, 60), (66, 76), (52, 78), (42, 72), (32, 78), (18, 76)], fill=1), bulge=1.0, lift=.12, name='chiripa')
    for x in range(22, 64, 4): line(c, [(x, 62), (x + (x - 42) * .15, 76)], Rd[1], 'chiripa')
    # torso, bare and painted with red and black war stripes; a copper breastplate shaped like a kultrun
    blob(c, Sk, lambda d: d.polygon(smooth_poly([(26, 30), (58, 30), (62, 44), (56, 62), (28, 62), (22, 44)], 5), fill=1), bulge=1.2, lift=.18, name='torso')
    blob(c, Cu, lambda d: d.ellipse([30, 34, 54, 56], fill=1), bulge=1.25, lift=.2, name='plate')
    for (a, b) in [((42, 35), (42, 55)), ((31, 45), (53, 45))]: line(c, [a, b], Cu[1], 'plate')
    for (x, y) in [(36, 39), (48, 39), (36, 51), (48, 51)]: c.rect(x - 1, y - 1, 3, 3, Rd[4]); c.px(x - 1, y - 1, Rd[5])
    for x in range(24, 60): c.px(x, 59, Cu[5]); c.px(x, 60, Cu[2])
    # arms out to the lances
    for side in (-1, 1):
        lf = .16 if side < 0 else -.04; x = 8 if side < 0 else 76
        taper(c, cr([(42 + side * 16, 34), (42 + side * 26, 44), (x + side * -2, 48 + st)], 6), 8, 7, Sk, lift=lf, name='arm', bulge=1.2)
        for k in range(3): line(c, [(42 + side * (19 + k * 2), 36 + k * 2), (42 + side * (21 + k * 2), 38 + k * 2)], Rd[4] if k % 2 else R['blk'][0], 'arm')
        blob(c, Sk, lambda d, x=x: d.ellipse([x - 5, 44 + st, x + 5, 53 + st], fill=1), bulge=1.25, lift=lf, name='fist')
        for k in range(3): c.px(x - 3 + k * 3 if side < 0 else x + 3 - k * 3, 46 + st + k, Sk[6])
    # the head with two faces, one looking each way, under a crown of red and black feathers
    for k in range(9):
        a = math.radians(-160 + k * 17.5); L = 15 + (k % 2) * 4
        taper(c, [(42, 16), (42 + math.cos(a) * L, 16 + math.sin(a) * L)], 4, 1.5, Rd if k % 2 else R['blk'], lift=.1, name='feather', bulge=1.1)
    blob(c, Sk, lambda d: d.polygon(smooth_poly([(32, 12), (52, 12), (58, 20), (54, 30), (30, 30), (26, 20)], 5), fill=1), bulge=1.25, lift=.2, name='head')
    for x in range(28, 57): c.px(x, 13, Rd[4]); c.px(x, 14, Rd[2])                # trarilonko band
    for x in range(30, 56, 4): c.px(x, 13, Cu[6])
    # face one, looking left (lit, calm); face two, looking right (shadowed, snarling)
    facet(c, [(26, 20), (30, 16), (34, 22), (30, 28)], Sk[6]); facet(c, [(58, 20), (54, 16), (50, 22), (54, 28)], Sk[2])
    c.px(25, 21, Sk[5]); c.px(24, 22, Sk[4])                                       # noses, in profile
    c.px(59, 21, Sk[3]); c.px(60, 22, Sk[2])
    for (ex, col) in [(30, (255, 230, 160)), (54, (255, 90, 60))]:
        c.rect(ex - 2, 19, 4, 2, (16, 6, 4)); c.px(ex - 1 if ex < 42 else ex, 19, col); c.px(ex - 1 if ex < 42 else ex, 20, col)
    for x in range(28, 33): c.px(x, 25, (40, 14, 10))
    for x in range(51, 57): c.px(x, 25, (20, 4, 4))
    for x in range(52, 57, 2): c.px(x, 24, (240, 230, 210))
    for x in range(36, 49): c.px(x, 21, Rd[4]); c.px(x, 23, R['blk'][0])          # war paint across the shared brow
    texture(c, ['torso', 'arm', 'leg', 'head', 'fist'], amt=.1, seed=24)
    texture(c, ['plate'], amt=.07, seed=25)
    occlude(c, ['plate', 'arm', 'head'], ['torso'], r=3, k=.6)
    occlude(c, ['chiripa'], ['leg'], r=4, k=.55)
    speculars(c, ['plate', 'blade', 'head', 'torso'], thr=.85)
    return finish(c, [('plate', 'torso'), ('arm', 'torso'), ('head', 'torso'), ('chiripa', 'torso'), ('leg', 'chiripa'), ('fist', 'haft'), ('feather', 'head'), ('foot', 'leg')],
                  rim=(255, 170, 90), rimparts=('torso', 'arm', 'leg', 'head', 'plate'))

# =========================================================== fütra kalku: the great sorcerer of the forgetting
R.update({k: [hx(c) for c in v] for k, v in {
    'robeK': ['#050308', '#0a0610', '#110a1a', '#1a1026', '#241834', '#302244', '#3e2c56'],
    'mask':  ['#2a2830', '#46424e', '#66606e', '#8a8292', '#aea6b4', '#d0cad4', '#eeeaf0'],
    'vglow': ['#2a0a4a', '#5a1a8a', '#8a34c8', '#b464f0', '#dcaaff', '#ffffff']}.items()})
def kalku(f):
    setsize(80, 112); c = Canvas()
    Rb, M, V = R['robeK'], R['mask'], R['vglow']
    # the robe: a tall cone, layered capes, a hem that frays into smoke
    hem = [(2 + k * 9.5, 108 + ((k + f) % 2) * 3) for k in range(8)]
    blob(c, Rb, lambda d: d.polygon([(32, 26), (48, 26), (60, 60), (70, 104)] + hem[::-1] + [(4, 104), (18, 60)], fill=1), bulge=.7, lift=.14, name='robe')
    for k, y in enumerate((44, 64, 84)):                                    # silver-stitched edges of each cape layer
        for x in range(0, 80):
            yy = y + int(abs(x - 38) * .35)
            if c.part[yy, x] == 'robe':
                c.px(x, yy, R['silver'][3] if x % 2 else R['silver'][1]); c.px(x, yy - 1, Rb[1])
                if x % 6 == 0: c.px(x, yy + 1, V[2])
    for x0 in (20, 30, 46, 56):
        line(c, [(38 + (x0 - 38) * .2, 30), (x0, 104)], Rb[0], 'robe'); line(c, [(38 + (x0 - 38) * .2 - 1, 32), (x0 - 1, 104)], Rb[4], 'robe')
    for y in range(100, 112):
        for x in range(80):
            if c.part[y, x] == 'robe' and yp.BAYER[y % 4, x % 4] < (y - 98) / 14: c.a[y, x] = False; c.part[y, x] = ''
    # the staff: crooked wood, a skull at the top cradling a violet flame
    taper(c, cr([(64, 108), (66, 70), (63, 40), (66, 16)], 6), 3, 3, R['bark'], lift=.15, name='staff', bulge=1.0)
    blob(c, M, lambda d: d.polygon(smooth_poly([(60, 6), (72, 6), (74, 14), (68, 20), (62, 20), (58, 14)], 4), fill=1), bulge=1.2, lift=.18, name='skullS')
    c.rect(61, 11, 3, 3, (8, 4, 12)); c.rect(68, 11, 3, 3, (8, 4, 12)); c.px(62, 12, V[4]); c.px(69, 12, V[4])
    yp.flame(c, 66, 6, 10, 2, 1 + f * 1.4, 4, ramp=V)
    # sleeves and hands: long grey fingers, nails like thorns
    taper(c, cr([(34, 36), (24, 52), (28, 62)], 6), 10, 12, Rb, lift=.2, name='sleeve', bulge=1.1)
    taper(c, cr([(46, 36), (56, 48), (62, 52)], 6), 10, 12, Rb, lift=0, name='sleeve', bulge=1.1)
    for (hx_, hy, side) in [(30, 62, -1), (64, 52, 1)]:
        blob(c, M, lambda d, hx_=hx_, hy=hy: d.ellipse([hx_ - 4, hy - 3, hx_ + 4, hy + 4], fill=1), bulge=1.2, lift=.1, name='hand')
        for k in range(4):
            tip = (hx_ - 4 + k * 3, hy + 9 + (k % 2))
            line(c, [(hx_ - 3 + k * 2, hy + 2), tip], M[4 - (k % 2)])
            c.px(tip[0], tip[1] + 1, (20, 10, 24))
    for k in range(5):                                                       # violet threads of forgetting from the open hand
        a = .6 + k * .5 + f * .3
        line(c, [(30, 70), (30 + math.cos(a) * 6 - 6, 76 + k * 2), (24 - k * 3, 86 + k * 4)], V[2 + k % 3])
    # the hood and the mask: a pale moon-face, no mouth, violet eyes
    blob(c, Rb, lambda d: d.polygon(smooth_poly([(26, 18), (38, 4), (52, 14), (56, 30), (48, 40), (32, 40), (24, 30)], 5), fill=1), bulge=1.2, lift=.18, name='hood')
    blob(c, M, lambda d: d.ellipse([30, 14, 50, 36], fill=1), bulge=1.3, lift=.15, name='mask')
    facet(c, [(31, 22), (38, 15), (40, 16), (36, 26)], M[6])
    for (ex, ey) in [(35, 23), (45, 23)]:
        c.rect(ex - 3, ey - 1, 6, 3, (8, 4, 12)); glow(c, ex, ey, 2, V); c.px(ex - 1, ey, (255, 255, 255))
    for y in range(26, 34): c.px(40, y, M[2])
    for x in range(35, 46): c.px(x, 31, M[1])                                # a stitched seam where a mouth should be
    for x in range(35, 46, 2): c.px(x, 30, M[0]); c.px(x, 32, M[0])
    for k in range(3): c.px(33 + k * 5, 17, V[3])                            # painted marks on the brow
    # violet sparks
    for k in range(22):
        x, y = (k * 31 + f * 5) % 78 + 1, (k * 23 + f * 3) % 100 + 4
        if not c.a[y, x]: c.px(x, y, V[3] if k % 2 else V[2]); c.part[y, x] = 'spark'
    texture(c, ['robe', 'hood', 'sleeve'], amt=.08, seed=26)
    texture(c, ['mask', 'skullS', 'hand'], amt=.07, seed=27, scale=.6)
    occlude(c, ['hood', 'mask'], ['robe'], r=4, k=.5)
    occlude(c, ['sleeve'], ['robe'], r=3, k=.6)
    speculars(c, ['mask', 'skullS', 'hand'], thr=.88)
    return finish(c, [('mask', 'hood'), ('hood', 'robe'), ('sleeve', 'robe'), ('hand', 'sleeve'), ('hand', 'staff'), ('skullS', 'staff')],
                  rim=(170, 110, 230), rimparts=('robe', 'hood', 'sleeve', 'mask', 'staff'))

# =========================================================== the Fütra Ngoymatulfe: five forms of the great forgetting
R.update({k: [hx(c) for c in v] for k, v in {
    'stn':   ['#0a0c0e', '#14181c', '#20262c', '#2e363e', '#3e4852', '#505c68', '#66727e', '#7e8a96', '#9aa6b0'],
    'void':  ['#020204', '#06060a', '#0c0c12', '#14141c'],
    'fgreen':['#0a1a0a', '#163a16', '#246024', '#3a8a34', '#62b450', '#a0e080', '#e0ffd0'],
    'shade': ['#020104', '#06040a', '#0c0812', '#140e1c', '#1e1628', '#2a2036', '#382c46']}.items()})
def cracks(c, part, paths, rmp, w=1):
    for pts in paths:
        for (X, Y) in line(c, pts, rmp[3], part):
            if c.part[Y, min(yp.W - 1, X + 1)] == part: c.px(X + 1, Y, rmp[1])
            if Y > 0 and c.part[Y - 1, X] == part: c.rgb[Y - 1, X] = np.minimum(255, c.rgb[Y - 1, X].astype(int) + 26).astype(np.uint8)
def holes(c, part, pts, r=2):
    """stopped mouths in the stone: a dark pit, a lit lower lip, a shadowed upper lip"""
    for (x, y) in pts:
        for yy in range(y - r, y + r + 1):
            for xx in range(x - r - 1, x + r + 2):
                if ((xx - x) / (r + 1)) ** 2 + ((yy - y) / r) ** 2 <= 1 and c.part[yy, xx] == part: c.px(xx, yy, (6, 6, 8))
        for xx in range(x - r, x + r + 1):
            if c.part[y + r + 1, xx] == part: c.rgb[y + r + 1, xx] = np.minimum(255, c.rgb[y + r + 1, xx].astype(int) + 40).astype(np.uint8)
def rubble(c, n, box, rmp, seed, f):
    rs = np.random.RandomState(seed)
    for _ in range(n):
        x = rs.randint(box[0], box[2]); y = rs.randint(box[1], box[3]) + (f if rs.rand() < .5 else -f); r = rs.randint(1, 3)
        blob(c, rmp, lambda d, x=x, y=y, r=r: d.polygon([(x - r, y), (x, y - r), (x + r, y + 1), (x, y + r)], fill=1), bulge=1.0, lift=.15, name='rubble')

def ngoyman1(f):
    """Ti Fütra Ngoymatulfe: a stone idol rising from a mound of stopped mouths, arms flung up, a void for a face"""
    setsize(128, 96); c = Canvas()
    S_, E = R['stn'], R['ember']
    bob = f
    mound = smooth_poly([(14, 94), (30, 72), (50, 64), (78, 64), (98, 72), (114, 94)], 5)
    blob(c, S_, lambda d: d.polygon(mound, fill=1), bulge=.9, lift=.12, name='mound')
    holes(c, 'mound', [(30, 86), (44, 78), (58, 88), (72, 76), (86, 86), (100, 88), (52, 70), (80, 70)], 2)
    # arms flung up and out in an X, three-fingered claws
    for side in (-1, 1):
        lf = .16 if side < 0 else -.02
        sh = (64 + side * 16, 34 + bob); el = (64 + side * 36, 22); hd = (64 + side * 54, 6 - bob)
        taper(c, cr([sh, el, hd], 8), 12, 8, S_, lift=lf, name='arm', bulge=1.25)
        plate_lines(c, 'arm', [((el[0] - 4, el[1] - 4), (el[0] + 4, el[1] + 4))], .55)
        for k in range(3):
            a = math.radians(-90 + side * (20 + k * 25))
            taper(c, [hd, (hd[0] + math.cos(a) * 9, hd[1] + math.sin(a) * 9)], 4, 1, S_, lift=lf + .1, name='claw', bulge=1.1)
        # the lower arms: pointing down and out, braced
        taper(c, cr([(64 + side * 14, 46 + bob), (64 + side * 32, 56), (64 + side * 46, 70)], 6), 8, 5, S_, lift=lf - .05, name='arm2', bulge=1.2)
    # body: a tapering trunk with a hollow chest where words smoulder
    trunk = smooth_poly([(46, 30 + bob), (82, 30 + bob), (78, 50), (70, 70), (58, 70), (50, 50)], 5)
    blob(c, S_, lambda d: d.polygon(trunk, fill=1), bulge=1.2, lift=.16, name='trunk')
    blob(c, R['void'], lambda d: d.ellipse([54, 38 + bob, 74, 56 + bob], fill=1), bulge=.6, lift=0, name='hollow')
    rs = np.random.RandomState(5 + f)
    for _ in range(22):
        x, y = rs.randint(56, 73), rs.randint(41, 55) + bob
        if c.part[y, x] == 'hollow': c.px(x, y, E[rs.randint(2, 6)])
    cracks(c, 'trunk', [[(52, 34 + bob), (56, 46), (54, 60)], [(76, 34 + bob), (72, 50), (74, 62)]], S_)
    # head: a smooth egg of stone, the face a void with two embers for eyes and a round dark mouth, four horns
    for (a, L) in [(-115, 18), (-65, 18), (-150, 14), (-30, 14)]:
        r = math.radians(a)
        taper(c, cr([(64, 14 + bob), (64 + math.cos(r) * L * .6, 14 + bob + math.sin(r) * L * .6 - 2), (64 + math.cos(r) * L, 14 + bob + math.sin(r) * L)], 5), 5, 1.5, S_, lift=.18, name='horn', bulge=1.2)
    blob(c, S_, lambda d: d.ellipse([50, 4 + bob, 78, 32 + bob], fill=1), bulge=1.3, lift=.2, name='head')
    blob(c, R['void'], lambda d: d.ellipse([54, 10 + bob, 74, 30 + bob], fill=1), bulge=.6, lift=0, name='face')
    for ex in (59, 69):
        glow(c, ex, 17 + bob, 2.4, E[1:]); c.px(ex - 1, 16 + bob, (255, 255, 255))
    for a in np.linspace(0, 2 * math.pi, 30):
        c.px(int(round(64 + math.cos(a) * 3)), int(round(25 + bob + math.sin(a) * 2)), E[2])
    rubble(c, 14, (4, 30, 124, 70), S_, 31, f)
    texture(c, ['mound', 'arm', 'arm2', 'trunk', 'head', 'horn'], amt=.14, seed=40)
    occlude(c, ['trunk', 'head'], ['mound', 'arm2'], r=4, k=.55)
    occlude(c, ['arm'], ['trunk'], r=3, k=.6)
    speculars(c, ['head', 'trunk', 'arm', 'mound'], thr=.86)
    return finish(c, [('head', 'trunk'), ('face', 'head'), ('hollow', 'trunk'), ('arm', 'trunk'), ('arm2', 'trunk'), ('trunk', 'mound'), ('horn', 'head'), ('claw', 'arm'), ('arm2', 'mound')],
                  rim=(140, 200, 120), rimparts=('head', 'trunk', 'arm', 'mound', 'horn'))

def ngoyman2(f):
    """Ngoymatulfe ñi piwke: its heart, a stone heart bound in roots, green veins of the forgotten words pulsing"""
    setsize(80, 100); c = Canvas()
    S_, G = R['oxblood'], R['fgreen']
    p = 1 if f else 0
    # the plinth and the roots that hold it
    blob(c, S_, lambda d: d.polygon([(24, 86), (56, 86), (62, 98), (18, 98)], fill=1), bulge=1.0, lift=.12, name='plinth')
    blob(c, S_, lambda d: d.polygon([(30, 78), (50, 78), (54, 88), (26, 88)], fill=1), bulge=1.0, lift=.2, name='plinth2')
    # the heart: two lobes and a point, armoured in plates
    heart = smooth_poly([(40, 22 - p), (50, 8 - p), (66, 6 - p), (76, 20), (72, 40), (58, 60), (40, 80), (22, 60), (8, 40), (4, 20), (14, 6 - p), (30, 8 - p)], 5)
    blob(c, S_, lambda d: d.polygon(heart, fill=1), bulge=1.25, lift=.18, name='heart')
    plate_lines(c, 'heart', [((40, 22), (40, 78)), ((10, 30), (70, 30)), ((18, 52), (62, 52))], .5)
    rivets(c, [(20, 28), (30, 28), (50, 28), (60, 28), (26, 50), (54, 50), (34, 62), (46, 62)], S_)
    # veins of green light branching across it, brighter on the beat
    veins = [[(40, 22), (34, 34), (24, 44), (16, 46)], [(40, 22), (48, 36), (58, 40), (68, 34)], [(34, 34), (36, 50), (40, 66), (40, 76)], [(48, 36), (50, 50), (46, 60)],
             [(24, 44), (26, 56)], [(58, 40), (60, 50)], [(30, 12), (34, 24)], [(52, 12), (48, 24)]]
    for v in veins:
        for (X, Y) in line(c, v, G[4 + p], 'heart'):
            if c.part[Y, X + 1] == 'heart': c.px(X + 1, Y, G[2 + p])
            if c.part[Y, X - 1] == 'heart' and p: c.px(X - 1, Y, G[3])
    glow(c, 40, 34, 4 + p, G)
    # roots wrapping it, from the plinth up over the lobes
    for pts in ([(28, 82), (14, 64), (8, 40), (14, 18), (28, 10)], [(52, 82), (66, 64), (72, 40), (66, 18), (52, 10)], [(36, 80), (30, 60), (34, 44)], [(44, 80), (50, 60), (46, 46)]):
        taper(c, cr(pts, 7), 5, 2, R['bark'], lift=.15, name='root', bulge=1.2)
    # drops of light falling from the point
    for k in range(3): c.px(40, 84 + k * 4 + p * 2, G[4]); c.px(40, 85 + k * 4 + p * 2, G[2])
    texture(c, ['heart', 'plinth', 'plinth2'], amt=.14, seed=41)
    texture(c, ['root'], amt=.12, seed=42)
    occlude(c, ['root'], ['heart'], r=2, k=.6)
    occlude(c, ['heart'], ['plinth2'], r=4, k=.55)
    speculars(c, ['heart', 'root', 'plinth'], thr=.86, col=(220, 255, 210))
    return finish(c, [('root', 'heart'), ('heart', 'plinth2'), ('plinth2', 'plinth'), ('root', 'plinth2')], rim=(130, 230, 120), rimparts=('heart', 'root', 'plinth'))

def rock(c, cx, cy, rx, ry, seed, rmp, lift=.1, name='rock', n=9, jag=.22):
    """a rough-hewn boulder: a jagged outline, a rounded mass, then chiselled planes cut into it from a ridge"""
    rs = np.random.RandomState(seed)
    pts = []
    for k in range(n):
        a = 2 * math.pi * k / n + rs.uniform(-.2, .2); r = 1 + rs.uniform(-jag, jag)
        pts.append((cx + math.cos(a) * rx * r, cy + math.sin(a) * ry * r))
    m = blob(c, rmp, lambda d: d.polygon(pts, fill=1), bulge=1.15, lift=lift, name=name)
    ridge = (cx - rx * .25, cy - ry * .3)                         # the planes all meet at a ridge up toward the light
    for (x, y) in pts[::2]:
        for (X, Y) in line(c, [ridge, ((ridge[0] + x) / 2, (ridge[1] + y) / 2)], rmp[1], name):
            if c.part[Y, min(yp.W - 1, X + 1)] == name: c.rgb[Y, X + 1] = np.minimum(255, c.rgb[Y, X + 1].astype(int) + 22).astype(np.uint8)
    ys, xs = np.nonzero(m)
    up = (ys - cy) < -ry * .35                                    # a flat-ish lit top face
    c.rgb[ys[up], xs[up]] = np.minimum(255, c.rgb[ys[up], xs[up]].astype(int) + 14).astype(np.uint8)
    return m, pts
def moss_on(c, part, rmp, seed, amount=.3):
    """moss only where a surface faces up: pixels of the part with empty space or another part above them"""
    from scipy.ndimage import gaussian_filter as gf
    rs = np.random.RandomState(seed); n = gf(rs.rand(yp.H, yp.W), 1.2)
    m = np.isin(c.part, part) & c.a
    top = m & ~np.roll(m, 3, 0)
    grow = np.zeros_like(m)
    for k in range(3): grow |= np.roll(top, k, 0)
    grow &= m & (n > np.percentile(n, 100 - amount * 100))
    ys, xs = np.nonzero(grow)
    c.rgb[ys, xs] = np.array(rmp)[np.clip((c.rgb[ys, xs].mean(1) / 255 * len(rmp) * 1.6).astype(int), 0, len(rmp) - 1)]
def ngoyman3(f):
    """Fütra Ngoymatulfe: a golem of rough-hewn sandstone, the blocks held together by the forgetting's own light"""
    setsize(96, 124); c = Canvas()
    S_, Y_ = R['sand'], R['yglow']
    bob = f
    J = []                                                         # joints: where the light shows between the blocks
    # legs: thigh block, shin block, a flat foot slab; the far leg first
    for (x, lift, sd) in [(62, -.06, 1), (34, .12, 2)]:
        rock(c, x + 2 * (1 if x > 48 else -1), 117, 13, 6, 30 + sd, S_, lift, 'foot', n=8, jag=.12)
        rock(c, x, 104, 10, 10, 32 + sd, S_, lift, 'shin')
        rock(c, x, 87, 11, 10, 34 + sd, S_, lift + .04, 'thigh')
        J += [(x, 96), (x, 112)]
    rock(c, 48, 76, 22, 10, 40, S_, .06, 'hip', n=10)
    # the trunk: a great chest block, a belly stone under it, slabs on the shoulders
    rock(c, 48, 64 + bob, 20, 10, 41, S_, .08, 'belly')
    rock(c, 48, 46 + bob, 30, 17, 42, S_, .16, 'chest', n=11, jag=.16)
    J += [(36, 70), (60, 70), (30, 56 + bob), (66, 56 + bob)]
    # arms: long, heavy, hanging to the knees, the fists big as boulders
    for side in (-1, 1):
        lf = .14 if side < 0 else -.04; sx = 48 + side * 34
        rock(c, sx + side * 4, 54 + bob, 9, 13, 50 + side, S_, lf, 'arm', n=8)
        rock(c, sx + side * 6, 78, 8, 12, 52 + side, S_, lf, 'arm', n=8)
        rock(c, sx + side * 5, 99, 11, 10, 54 + side, S_, lf + .05, 'fist', n=9)
        J += [(sx + side * 5, 66), (sx + side * 6, 89)]
    for side in (-1, 1):
        rock(c, 48 + side * 26, 33 + bob, 15, 10, 60 + side, S_, .2 if side < 0 else .04, 'shoulder', n=9)
    # the head: a small heavy stone sunk forward between the shoulders, no mouth, eyes as a slit of light in a crevice
    rock(c, 48, 26 + bob, 12, 10, 70, S_, .24, 'head', n=8, jag=.14)
    for x in range(38, 59):                                         # the brow ledge and the crevice under it
        y = 25 + bob + (1 if x in (47, 48, 49) else 0)
        if c.part[y, x] == 'head': c.px(x, y - 1, S_[7]); c.px(x, y, (8, 6, 2)); c.px(x, y + 1, (14, 10, 4)); c.px(x, y + 2, S_[1])
    for ex in (42, 54):
        c.px(ex - 1, 25 + bob, Y_[3]); c.px(ex, 25 + bob, Y_[5]); c.px(ex + 1, 25 + bob, Y_[3])
        glow(c, ex, 25 + bob, 1.6, Y_)
    # the light of the forgetting holding the blocks together: glowing gaps at every joint, and runes cut into the chest
    for (x, y) in J:
        glow(c, x, y, 2.2, Y_[:5])
    for pts in ([(40, 40 + bob), (44, 46 + bob), (40, 52 + bob)], [(56, 40 + bob), (52, 46 + bob), (56, 52 + bob)], [(44, 46 + bob), (52, 46 + bob)]):
        for (X, Y) in line(c, pts, Y_[4], 'chest'):
            if c.part[Y, X + 1] == 'chest': c.px(X + 1, Y, Y_[2])
    moss_on(c, ['shoulder', 'head', 'chest', 'fist', 'hip'], [hx(x) for x in ['#0e140a', '#1a2412', '#28361a', '#384a24', '#4a5e30']], 7, .28)
    rubble(c, 9, (2, 4, 94, 70), S_, 33, f)
    texture(c, ['foot', 'shin', 'thigh', 'hip', 'belly', 'chest', 'arm', 'fist', 'shoulder', 'head'], amt=.2, seed=43)
    occlude(c, ['head'], ['chest'], r=4, k=.5)
    occlude(c, ['shoulder'], ['chest', 'arm'], r=4, k=.55)
    occlude(c, ['chest'], ['belly', 'hip'], r=4, k=.55)
    occlude(c, ['hip'], ['thigh'], r=4, k=.5)
    occlude(c, ['thigh'], ['shin'], r=3, k=.55)
    speculars(c, ['head', 'shoulder', 'chest', 'fist'], thr=.88)
    parts = ['foot', 'shin', 'thigh', 'hip', 'belly', 'chest', 'arm', 'fist', 'shoulder', 'head']
    return finish(c, [(p_, q) for p_ in parts for q in parts if p_ != q], rim=(230, 190, 110), rimparts=tuple(parts))

def ngoyman4(f):
    """Füta Dumiñ: the great darkness, not a body but a fog: a column of smoke that thins at every edge, arms that are
    only drifts of it, and in the thickest dark a crown of red eyes"""
    setsize(112, 144)
    from scipy.ndimage import gaussian_filter as gf
    H_, W_ = 144, 112
    yy, xx = np.mgrid[0:H_, 0:W_].astype(float)
    dens = np.zeros((H_, W_))
    def puff(x, y, r, k=1.0):
        dens[:] = np.maximum(dens, k * np.exp(-((xx - x) ** 2 + (yy - y - 6) ** 2) / (2 * r * r)))
    ph = f * .7
    # the column: thick at the head and shoulders, thinning and fraying toward the ground
    for t in np.linspace(0, 1, 40):
        y = 22 + t * 110; x = 56 + math.sin(t * 5 + ph) * 4 * t
        puff(x, y, 16 - t * 7, 1.2 - t * .5)
    puff(56, 20, 12, 1.4); puff(56, 40, 17, 1.25)
    # arms of drifting smoke reaching out and curling down
    for side in (-1, 1):
        for t in np.linspace(0, 1, 34):
            x = 56 + side * (12 + t * 42); y = 38 - math.sin(t * 2.6) * 14 + t * t * 44 + math.sin(t * 7 + ph + side) * 3
            puff(x, y, 7.5 - t * 4.5, 1.05 - t * .4)
    # loose wisps rising off it
    for k in range(9):
        x0 = 20 + k * 9; y0 = 30 + (k * 37) % 70
        for t in np.linspace(0, 1, 12):
            puff(x0 + math.sin(t * 4 + k + ph) * 5, y0 - t * 18, 3 - t * 2, .5 - t * .3)
    # the fog itself: churned by noise that drifts between the frames
    rs = np.random.RandomState(4)
    n1 = gf(rs.rand(H_ + 8, W_ + 8), 3.0); n2 = gf(rs.rand(H_ + 8, W_ + 8), 1.2)
    o = 2 + f * 3
    n = (n1[o:o + H_, 2:2 + W_] - n1.mean()) / n1.std() * .5 + (n2[2:2 + H_, o:o + W_] - n2.mean()) / n2.std() * .22
    D = dens * (1 + n * .45) - .04 * n
    bay = yp.BAYER[yy.astype(int) % 4, xx.astype(int) % 4]
    a = D > (.2 + (bay - .5) * .3)                                # edges dither away into nothing
    ramp = [hx(c_) for c_ in ['#010003', '#04020a', '#090512', '#100a1c', '#1a1228', '#251a36', '#332646', '#443658']]
    # thick dark at the core, thin fog lighter (lit faintly from above-left) at the edges
    gy, gx = np.gradient(gf(D, 1.5))
    lit = np.clip(-(gx + gy) * 4, -.5, .5)
    t = np.clip(1 - (D - .2) / .7, 0, 1) ** 1.3 * .85 + lit * .35 + n * .08
    idx = np.clip(np.floor(t * (len(ramp) - 1) + (bay - .5) * .5).astype(int), 0, len(ramp) - 1)
    img = np.zeros((H_, W_, 4), np.uint8)
    img[..., :3] = np.array(ramp)[idx]; img[..., 3] = a * 255
    c = Canvas(); c.rgb = img[..., :3].copy(); c.a = a.copy(); c.part[a] = 'fog'
    Rg = R['redg']
    # the eyes: a crown of red embers in the thickest dark of the head
    for (ex, ey, r) in [(50, 18, 2.6), (62, 18, 2.6), (56, 13, 2.0), (45, 23, 1.6), (67, 23, 1.6), (56, 23, 1.4)]:
        glow(c, ex, ey + 6 + (1 if f else 0), r, Rg); c.px(int(ex) - 1, int(ey) + 6, (255, 236, 230))
    # swallowed words: faint red sparks drifting in the fog
    ys, xs = np.nonzero(a & (D > .5))
    rs2 = np.random.RandomState(7 + f)
    for i in rs2.choice(len(ys), 16, replace=False):
        if ys[i] > 34: c.px(xs[i], ys[i], Rg[2] if i % 2 else Rg[1])
    out = np.zeros((H_, W_, 4), np.uint8); out[..., :3] = c.rgb; out[..., 3] = c.a * 255
    return out

def ngoyman5(f):
    """Rüf Fütra Ngoymatulfe: the true form, a colossus of the forgetting whose stone body is splitting open,
    the words it swallowed breaking out of it in gold"""
    setsize(144, 208); c = Canvas()
    S_, Y_, E = R['stn'], R['yglow'], R['ember']
    bob = f
    # base: a mound of stone pierced with mouths, the colossus rooted in it
    mound = smooth_poly([(8, 206), (20, 176), (48, 164), (96, 164), (124, 176), (136, 206)], 5)
    blob(c, S_, lambda d: d.polygon(mound, fill=1), bulge=.9, lift=.12, name='mound')
    holes(c, 'mound', [(28, 194), (42, 182), (56, 196), (72, 178), (88, 194), (102, 182), (116, 196), (64, 190), (80, 200), (36, 202), (108, 202)], 3)
    # the torso: a long twisting trunk, split by cracks of gold
    trunk = smooth_poly([(44, 70 + bob), (100, 70 + bob), (96, 100), (86, 128), (92, 156), (100, 172), (44, 172), (52, 156), (58, 128), (48, 100)], 6)
    blob(c, S_, lambda d: d.polygon(trunk, fill=1), bulge=1.25, lift=.14, name='trunk')
    for k, y in enumerate(range(84, 168, 14)):                             # twisting bands of the trunk
        line(c, [(40, y + bob * (y < 100)), (72, y + 6 - (k % 2) * 3), (104, y)], S_[1], 'trunk')
        line(c, [(40, y - 1 + bob * (y < 100)), (72, y + 5 - (k % 2) * 3), (104, y - 1)], S_[6], 'trunk')
    goldc = [[(60, 76 + bob), (66, 92), (60, 110), (70, 128), (64, 150), (72, 168)], [(88, 78 + bob), (80, 96), (86, 114), (78, 134)], [(66, 92), (78, 96)], [(60, 110), (50, 116)], [(70, 128), (84, 132)]]
    for v in goldc:
        for (X, Y) in line(c, v, Y_[5], 'trunk'):
            for dx in (-1, 1):
                if c.part[Y, X + dx] == 'trunk': c.px(X + dx, Y, Y_[3])
    for (x, y) in [(66, 92), (64, 118), (78, 134), (84, 100)]: glow(c, x, y + (bob if y < 100 else 0), 3.2, Y_)
    # golden letters breaking free from the cracks and rising: the words remembered
    glyphs = ['ñ', 'ü', 'tr', 'ng', 'll', 'ch']
    rs = np.random.RandomState(11 + f)
    for k in range(10):
        x = rs.randint(24, 120); y = rs.randint(60, 160) - f * 3
        if c.a[y, x]: continue
        w = rs.randint(2, 4)
        for i in range(w): c.px(x + i, y, Y_[4]); c.part[y, x + i] = 'glyph'
        c.px(x + w // 2, y - 2, Y_[5]); c.px(x, y + 1, Y_[3]); c.px(x + w - 1, y - 1, Y_[3])
    # shoulders and arms raised high, fists clenched over its head
    for side in (-1, 1):
        lf = .16 if side < 0 else -.02
        blob(c, S_, lambda d, side=side: d.ellipse([72 + side * 30 - 16, 60 + bob, 72 + side * 30 + 16, 88 + bob], fill=1), bulge=1.3, lift=lf + .04, name='shoulder')
        taper(c, cr([(72 + side * 34, 72 + bob), (72 + side * 56, 50), (72 + side * 58, 24), (72 + side * 50, 10)], 8), 18, 13, S_, lift=lf, name='arm', bulge=1.25)
        blob(c, S_, lambda d, side=side: d.polygon(smooth_poly([(72 + side * 40, 2 - bob), (72 + side * 58, 0 - bob), (72 + side * 62, 14 - bob), (72 + side * 44, 18 - bob)], 4), fill=1), bulge=1.3, lift=lf + .06, name='fist')
        for k in range(3): c.px(72 + side * (44 + k * 5), 13 - bob, S_[1]); c.px(72 + side * (44 + k * 5), 3 - bob, S_[7])
        cracks(c, 'arm', [[(72 + side * 52, 56), (72 + side * 58, 40), (72 + side * 54, 28)]], S_)
        for (X, Y) in line(c, [(72 + side * 52, 56), (72 + side * 58, 40)], Y_[4], 'arm'): pass
        # rubble and dust falling from the raised fists
        for k in range(4): c.px(72 + side * (46 + k * 4), 22 + k * 7 + f * 2, S_[6]); c.part[22 + k * 7 + f * 2, 72 + side * (46 + k * 4)] = 'rubble'
    # the head: a round helmed dome, a single visor-slit of white-hot light, four horns
    for (a, L) in [(-120, 26), (-60, 26), (-155, 18), (-25, 18)]:
        r = math.radians(a)
        taper(c, cr([(72, 46 + bob), (72 + math.cos(r) * L * .6, 46 + bob + math.sin(r) * L * .6 - 3), (72 + math.cos(r) * L, 46 + bob + math.sin(r) * L)], 6), 6, 2, S_, lift=.2, name='horn', bulge=1.2)
    blob(c, S_, lambda d: d.ellipse([52, 32 + bob, 92, 72 + bob], fill=1), bulge=1.35, lift=.22, name='head')
    blob(c, R['void'], lambda d: d.polygon([(56, 48 + bob), (88, 48 + bob), (86, 60 + bob), (58, 60 + bob)], fill=1), bulge=.5, lift=0, name='visor')
    for x in range(60, 85): c.px(x, 53 + bob, Y_[5] if x % 3 else Y_[6]); c.px(x, 54 + bob, Y_[3])
    glow(c, 72, 54 + bob, 3.5, Y_)
    for k, x in enumerate(range(60, 86, 4)): tooth3(c, x, 60 + bob, 64 + bob + (k % 2), S_[3:])
    plate_lines(c, 'head', [((54, 44 + bob), (90, 44 + bob)), ((72, 34 + bob), (72, 47 + bob))], .55)
    rivets(c, [(58, 42 + bob), (66, 38 + bob), (78, 38 + bob), (86, 42 + bob)], S_)
    rubble(c, 16, (4, 80, 140, 168), S_, 35, f)
    texture(c, ['mound', 'trunk', 'arm', 'fist', 'shoulder', 'head', 'horn'], amt=.15, seed=45)
    occlude(c, ['head', 'shoulder'], ['trunk'], r=5, k=.5)
    occlude(c, ['trunk'], ['mound'], r=5, k=.5)
    speculars(c, ['head', 'trunk', 'arm', 'fist', 'shoulder', 'mound'], thr=.86)
    return finish(c, [('head', 'trunk'), ('head', 'shoulder'), ('visor', 'head'), ('shoulder', 'trunk'), ('arm', 'shoulder'), ('fist', 'arm'), ('trunk', 'mound'), ('horn', 'head')],
                  rim=(150, 200, 120), rimparts=('head', 'trunk', 'arm', 'shoulder', 'mound', 'fist'))

# =========================================================== the Kaykayfilu: the great serpent of the water, five forms
R.update({k: [hx(c) for c in v] for k, v in {
    'kay':   ['#031012', '#071e22', '#0c2e34', '#124048', '#1a565e', '#246e76', '#328a90', '#48a8aa', '#6cc6c2'],
    'kayb':  ['#1e2c22', '#34483a', '#4e6854', '#6e8a70', '#94ae90', '#c2d6b6'],
    'kglow': ['#04363a', '#0a6a70', '#18a8aa', '#40e0d8', '#a0fff4', '#ffffff'],
    'kbone': ['#2a2a24', '#4a4a40', '#6e6c5e', '#94927e', '#bab8a2', '#dcdac6', '#f6f4e6']}.items()})
def kayhead(c, x, y, dr, s=1.0, jaw=0, lift=.2, glowm=True):
    """the Kaykayfilu's head in profile, facing dr (+1 right, -1 left): horned skull, barbels, a jaw that opens on cyan light"""
    K, G = R['kay'], R['kglow']
    T = lambda pts: [(x + dr * px_ * s, y + py * s) for px_, py in pts]
    for (bx, by, tx, ty) in [(-2, -6, -14, -14), (2, -7, -8, -17)]:        # horns swept back
        taper(c, cr(T([(bx, by), ((bx + tx) / 2, (by + ty) / 2 - 2), (tx, ty)]), 5), 4 * s, 1.2, R['kbone'], lift=lift, name='khorn', bulge=1.2)
    jw = T([(-4, 2), (8, 3 + jaw * .4), (20, 4 + jaw), (19, 8 + jaw), (6, 9 + jaw * .4), (-4, 8)])
    if jaw > 0:
        blob(c, R['throat'], lambda d: d.polygon(T([(0, 1), (22, 0), (22, 4 + jaw), (0, 7)]), fill=1), bulge=.6, lift=0, name='kmouth')
        if glowm: glow(c, x + dr * 10 * s, y + (3 + jaw * .5) * s, 2.5 * s, G)
    blob(c, K, lambda d: d.polygon(jw, fill=1), bulge=1.2, lift=lift - .1, name='kjaw')
    up = T([(-6, -4), (0, -8), (10, -7), (20, -4), (25, -1), (24, 2), (10, 2), (-6, 4)])
    blob(c, K, lambda d: d.polygon(up, fill=1), bulge=1.3, lift=lift, name='khead')
    for (a, b) in [((2, -6), (20, -3)), ((4, -4), (14, -3))]:
        line(c, T([a, b]), K[7], 'khead')
    ex, ey = T([(6, -3)])[0]
    c.rect(int(ex - 2), int(ey - 1), 5, 3, (2, 10, 10)); glow(c, ex, ey, 1.6 * s, G); c.px(int(ex), int(ey) - 1, (255, 255, 255))
    for (X, Y) in [T([(23, 0)])[0]]: c.px(int(X), int(Y), (2, 8, 10))     # nostril
    for k in range(int(4 + 2 * s), 22, 4):                                 # teeth
        X, Y = T([(k, 2)])[0]; tooth3(c, int(X), int(Y), int(Y + 2 + s), R['kbone'], 'ktooth')
    for q in (0, 1):                                                       # barbels trailing from the snout
        line(c, T([(22, 2 + q * 2), (26, 8 + q * 3), (22 + q * 2, 16 + q * 2), (16, 20 + q)]), K[6] if q else K[7])
def kaybody(c, path, w0, w1, name='kbody', lift=.12, fins=False, n=10):
    P = serpent(c, path, w0, w1, R['kay'], R['kayb'], name, lift=lift - .1, step=5, n=n, kd=.72)
    # dorsal crest: a ridge of fin-spines along the top
    for i in range(3, len(P) - 3, 4):
        (x0, y0), (x1, y1) = P[i - 1], P[i + 1]
        L = max(.01, math.hypot(x1 - x0, y1 - y0)); nx, ny = -(y1 - y0) / L, (x1 - x0) / L
        if ny > 0: nx, ny = -nx, -ny
        w = (w0 + (w1 - w0) * i / len(P)) / 2
        x, y = P[i]
        ln = 2 + w * .35
        taper(c, [(x + nx * w * .7, y + ny * w * .7), (x + nx * (w + ln) - (x1 - x0) / L * 3, y + ny * (w + ln) - (y1 - y0) / L * 3)], 4, 1, R['kay'][2:], lift=.05, name=name + 'fin', bulge=1.0)
        c.px(int(round(x + nx * (w + ln * .6))), int(round(y + ny * (w + ln * .6))), R['kglow'][2])
        if i % 8 == 0:                                                   # glowing spots along the flank
            c.px(int(x + nx * w * .2), int(y + ny * w * .2), R['kglow'][3]); c.px(int(x + nx * w * .2) + 1, int(y + ny * w * .2), R['kglow'][2])
    return P
def kaywater(c, f, y0=None):
    y0 = y0 if y0 is not None else yp.H - 18
    sea(c, y0, yp.H, 0, yp.W, f)
    ripples(c, yp.W // 2, y0 + 8, yp.W // 3, 3, f, R['water'][6], R['water'][1], 2)
def kayfinish(c, extra=()):
    texture(c, ['kbody', 'kbody2', 'kbody3', 'khead', 'kjaw'], amt=.1, seed=50)
    occlude(c, ['khead', 'kjaw', 'kbody'], ['kbody2', 'kbody2b', 'kbody3', 'kbody3b', 'water'], r=4, k=.55)
    speculars(c, ['kbody', 'kbody2', 'kbody3', 'khead'], thr=.86, col=(210, 255, 250))
    return finish(c, [('khead', 'kbody'), ('kjaw', 'khead'), ('kmouth', 'khead'), ('khorn', 'khead'), ('kbody', 'kbody2'), ('kbodyb', 'kbody2'), ('kbody', 'water'), ('kbody2', 'water'), ('kbody', 'kbody3')] + list(extra),
                  rim=(80, 200, 190), rimparts=('kbody', 'kbody2', 'kbody3', 'khead'))

def llufu1(f):
    """asleep and waking: coiled in the shallows, the head resting on its own coils, one eye open"""
    setsize(104, 80); c = Canvas()
    kaywater(c, f, 62)
    kaybody(c, [(90, 70), (98, 56), (86, 44), (60, 42), (40, 50)], 16, 14, 'kbody2', lift=-.02)
    kaybody(c, [(12, 70), (30, 74), (62, 74), (88, 68), (94, 58)], 18, 12, 'kbody3', lift=.06)
    kaybody(c, [(64, 70), (44, 64), (30, 54), (28, 44), (36, 38)], 16, 12, 'kbody', lift=.14)
    kayhead(c, 34, 36 + f, -1, 1.0, jaw=1 + f)
    return kayfinish(c)

def llufu2(f):
    """Kaykayfilu ñi foro: its bones: the neck rises, the scales torn away to show the spine and ribs beneath"""
    setsize(104, 96); c = Canvas()
    kaywater(c, f, 78)
    kaybody(c, [(8, 88), (30, 92), (60, 92), (84, 88), (96, 80)], 18, 14, 'kbody2', lift=.0)
    P = kaybody(c, [(70, 90), (82, 74), (84, 54), (76, 36), (62, 26 - f)], 16, 12, 'kbody', lift=.14)
    # the bared section: dark flesh, the spine's knuckles and a cage of ribs
    for i in range(int(len(P) * .3), int(len(P) * .75)):
        (x0, y0), (x1, y1) = P[i - 1], P[i + 1]
        L = max(.01, math.hypot(x1 - x0, y1 - y0)); nx, ny = -(y1 - y0) / L, (x1 - x0) / L
        x, y = P[i]
        for k in np.linspace(-5, 5, 12):
            X, Y = int(round(x + nx * k)), int(round(y + ny * k))
            if 0 <= X < yp.W and 0 <= Y < yp.H and c.part[Y, X] in ('kbody', 'kbodyb'): c.px(X, Y, R['throat'][1 + int(abs(k) < 3)]); c.part[Y, X] = 'flesh'
        if i % 3 == 0:
            for k in np.linspace(-6, 6, 13):
                X, Y = int(round(x + nx * k)), int(round(y + ny * k))
                if 0 <= X < yp.W and 0 <= Y < yp.H and c.part[Y, X] == 'flesh': c.px(X, Y, R['kbone'][5 if k < 0 else 3]); c.part[Y, X] = 'rib'
        c.px(int(x), int(y), R['kbone'][6]); c.px(int(x) + 1, int(y), R['kbone'][3])
    kayhead(c, 60, 24 - f, -1, 1.15, jaw=3 + 2 * f)
    return kayfinish(c, [('rib', 'kbody'), ('flesh', 'kbody')])

def llufu3(f):
    """Kaykayfilu ñi müpü: its wings: it swims in great loops through the water, fins spread like wings"""
    setsize(120, 84); c = Canvas()
    kaywater(c, f, 66)
    ph = f * .6
    path = [(4, 72), (16, 60 - 4 * math.sin(ph)), (28, 50), (40, 64), (52, 74), (64, 60), (76, 48 + 3 * math.sin(ph)), (86, 62), (94, 66), (96, 50), (88, 38)]
    P = kaybody(c, path, 9, 14, 'kbody', lift=.12, n=8)
    # two pairs of wing-fins, membranes between long rays
    for (i0, side) in [(int(len(P) * .22), 1), (int(len(P) * .62), 1)]:
        x, y = P[i0]
        for k in range(5):
            a = math.radians(-150 + k * 22 + f * 8); L = 22 - abs(k - 2) * 3
            taper(c, [(x, y), (x + math.cos(a) * L, y + math.sin(a) * L)], 2.5, 1, R['kglow'][1:5], lift=.15, name='wingray', bulge=1.0)
        mem = [(x, y)] + [(x + math.cos(math.radians(-150 + k * 22 + f * 8)) * (22 - abs(k - 2) * 3), y + math.sin(math.radians(-150 + k * 22 + f * 8)) * (22 - abs(k - 2) * 3)) for k in range(5)]
        m = c.mask(lambda d, mem=mem: d.polygon(mem, fill=1)) & ~c.a
        ys, xs = np.nonzero(m)
        keep = yp.BAYER[ys % 4, xs % 4] < .7
        c.rgb[ys[keep], xs[keep]] = np.array(R['kglow'][1]); c.a[ys[keep], xs[keep]] = True; c.part[ys[keep], xs[keep]] = 'wingm'
    kayhead(c, 86, 34 + f, 1, 1.0, jaw=2 + f)
    return kayfinish(c, [('wingray', 'kbody')])

def llufu4(f):
    """Kaykayfilu ñi piwke: its heart: the body knotted in a figure of eight around a heart of cyan light"""
    setsize(100, 108); c = Canvas()
    kaywater(c, f, 92)
    # the lower loop (behind), then the heart, then the upper loop crossing in front
    loop = lambda cy, ry: [(50 + math.cos(a) * 28, cy + math.sin(a) * ry) for a in np.linspace(0, 2 * math.pi, 14)]
    kaybody(c, loop(76, 16), 11, 11, 'kbody2', lift=.0, n=6)
    blob(c, R['kglow'], lambda d: d.polygon(smooth_poly([(50, 50 - f), (58, 42 - f), (66, 50), (62, 62), (50, 72), (38, 62), (34, 50), (42, 42 - f)], 4), fill=1), bulge=1.3, lift=.25 + f * .1, name='gem')
    for (a, b) in [((44, 48), (50, 66)), ((56, 48), (50, 66)), ((38, 54), (62, 54))]: line(c, [a, b], R['kglow'][2], 'gem')
    glow(c, 47, 50, 3, R['kglow']); c.px(44, 46, (255, 255, 255)); c.px(45, 46, (255, 255, 255))
    kaybody(c, loop(32, 18)[:12], 12, 11, 'kbody', lift=.14, n=6)
    kayhead(c, 64, 16 - f, 1, 1.0, jaw=2 + 2 * f)
    for k in range(6):                                                    # light leaking from the heart
        a = k * 1.05 + f * .5
        x, y = 50 + math.cos(a) * 22, 56 + math.sin(a) * 14
        if not c.a[int(y), int(x)]: c.px(int(x), int(y), R['kglow'][3]); c.part[int(y), int(x)] = 'spark'
    return kayfinish(c, [('gem', 'kbody2'), ('kbody', 'gem')])

def llufu5(f):
    """Rüf Kaykayfilu: the serpent as it truly is, risen from its coils, crowned, singing again"""
    setsize(112, 128); c = Canvas()
    kaywater(c, f, 108)
    kaybody(c, [(96, 116), (104, 98), (90, 86), (60, 84), (36, 92)], 18, 16, 'kbody2', lift=-.02)
    kaybody(c, [(8, 116), (30, 122), (64, 122), (92, 116), (100, 104)], 20, 14, 'kbody3', lift=.06)
    kaybody(c, [(70, 118), (44, 110), (30, 92), (32, 66), (46, 46), (54, 34 - f)], 20, 14, 'kbody', lift=.16, n=12)
    kayhead(c, 56, 30 - f, 1, 1.3, jaw=3 + 2 * f)
    # a crown of light-horns over the head and music in rings
    for k in range(5):
        a = math.radians(-150 + k * 25); L = 12 + (k % 2) * 4
        taper(c, [(56, 18 - f), (56 + math.cos(a) * L, 18 - f + math.sin(a) * L)], 3, 1, R['kglow'][1:], lift=.2, name='crown', bulge=1.0)
    arcs(c, 86, 40 - f, [6 + 3 * f, 12 + 3 * f, 18 + 3 * f], -math.pi * .35, math.pi * .35, (160, 255, 240), step=.07)
    for k in range(16):
        x, y = (k * 23 + f * 5) % 108 + 2, (k * 37 + f * 3) % 96 + 4
        if not c.a[y, x]: c.px(x, y, R['kglow'][3] if k % 2 else R['kglow'][4]); c.part[y, x] = 'spark'
    return kayfinish(c, [('crown', 'khead')])

# =========================================================== polishing straight from the pixel art (Ngoymatulfe forms 1 and 5):
# the original sprite is the drawing; every pixel keeps its place and its role, only the light, the form and the finish change
def _s2x(rows):
    h = len(rows); w = len(rows[0]); out = [['.'] * (w * 2) for _ in range(h * 2)]
    g = lambda x, y: rows[y][x] if 0 <= x < w and 0 <= y < h else '.'
    for y in range(h):
        for x in range(w):
            P = g(x, y); A = g(x, y - 1); B = g(x + 1, y); C = g(x - 1, y); Dd = g(x, y + 1)
            out[2 * y][2 * x] = A if (C == A and C != Dd and A != B) else P
            out[2 * y][2 * x + 1] = B if (A == B and A != C and B != Dd) else P
            out[2 * y + 1][2 * x] = C if (Dd == C and Dd != B and C != A) else P
            out[2 * y + 1][2 * x + 1] = Dd if (B == Dd and B != A and Dd != C) else P
    return out
PX = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ngoy_px.json')))
def pixpolish(name, f, stone, tones, special, rim, seed=60):
    """stone: colour ramp for the body; tones: char -> original tone 0..1 (its place in the old shading);
    special: char -> (ramp, mode) for voids, glows and accents, drawn by their own rules"""
    from scipy.ndimage import label, distance_transform_edt as edt, gaussian_filter as gf
    G = np.array(_s2x(PX[name]['f'][f])); H_, W_ = G.shape; setsize(W_, H_); c = Canvas()
    # the old 2-px outline: the outer layer goes (finish draws a fine one), the inner ones stay as seams between the masses
    inside = G != '.'
    outer = (G == 'o') & ~(np.roll(inside, 1, 0) & np.roll(inside, -1, 0) & np.roll(inside, 1, 1) & np.roll(inside, -1, 1))
    body = np.isin(G, list(tones))
    lab, n = label(body)
    K = len(stone)
    yy, xx = np.mgrid[0:H_, 0:W_]
    bay = yp.BAYER[yy % 4, xx % 4]
    tone = np.zeros((H_, W_))
    for ch, t in tones.items(): tone[G == ch] = t
    tone = gf(tone, .6)
    for i in range(1, n + 1):
        m = lab == i
        d = edt(m); Rr = max(2.0, d.max())
        h = gf((np.clip(d / Rr, 0, 1) ** .6) * Rr * 1.1, 1.0)
        gy, gx = np.gradient(h)
        nn = np.dstack([-gx, -gy, np.ones_like(h) * .8]); nn /= np.linalg.norm(nn, axis=2, keepdims=True)
        lum = (nn @ yp.LIGHT - .15) / .85
        lum = (lum - .45) * 1.3 + .45 - yy / H_ * .06
        t = .5 * lum + .5 * tone
        rimlit = (d <= 1.5) & ((gx > .05) | (gy > .05))           # reflected light along the shadow-side edge
        t = np.where(rimlit & (t < .35), t + .14, t)
        idx = np.clip(np.floor(t * (K - 1) + .35 + (bay - .5) * .3).astype(int), 0, K - 1)
        c.rgb[m] = np.array(stone)[idx[m]]; c.a[m] = True; c.part[m] = 'st%d' % (i % 7)
    # seams: the inner outline pixels, dark but not black, so the masses read as carved
    seam = (G == 'o') & ~outer
    c.rgb[seam] = np.array(stone[0]); c.a[seam] = True; c.part[seam] = 'seam'
    for ch, (rmp, mode) in special.items():
        m = G == ch
        if not m.any(): continue
        d = edt(m)
        if mode == 'void':                                         # a hollow: darkest at the heart, a faint lip of light
            k = np.clip(1 - d / 4, 0, 1)
            idx = np.clip((k * (len(rmp) - 1) * .8 + (bay - .5) * .4).astype(int), 0, len(rmp) - 1)
        elif mode == 'glow':                                       # light: hottest at the core
            k = np.clip(d / 2.5, 0, 1)
            idx = np.clip((1 + k * (len(rmp) - 2)).astype(int), 0, len(rmp) - 1)
        else:                                                      # flat accent, shaded top to bottom
            k = np.clip(1 - (yy - yy[m].min()) / max(1, np.ptp(yy[m]) + 1), 0, 1)
            idx = np.clip((1 + k * (len(rmp) - 2) + (bay - .5) * .5).astype(int), 0, len(rmp) - 1)
        c.rgb[m] = np.array(rmp)[idx[m]]; c.a[m] = True; c.part[m] = 'sp_' + mode
    for ch, (rmp, mode) in special.items():                        # light spills out of the glows onto the stone round them
        if mode != 'glow': continue
        m = G == ch
        near = (edt(~m) <= 3) & ~m & c.a & np.isin(c.part, ['st%d' % i for i in range(7)])
        c.rgb[near] = np.clip(c.rgb[near] * .6 + np.array(rmp[3]) * .4, 0, 255).astype(np.uint8)
    texture(c, ['st%d' % i for i in range(7)], amt=.12, seed=seed)
    speculars(c, ['st%d' % i for i in range(7)], thr=.9)
    return finish(c, [('st%d' % i, 'sp_void') for i in range(7)], rim=rim, rimparts=tuple('st%d' % i for i in range(7)))

R.update({k: [hx(c) for c in v] for k, v in {
    # five forms, five stones
    'slate':  ['#06080e', '#0e1220', '#182034', '#24304a', '#344462', '#4a5c7c', '#647896', '#8496b0', '#a8b8cc'],     # 1: cold blue slate
    'oxblood':['#0e0406', '#1e080c', '#320e14', '#48161c', '#602028', '#7a2e34', '#963e42', '#b05652', '#c87466'],     # 2: the heart, dark red stone
    'sand':   ['#100c06', '#20180c', '#342814', '#4a3a1e', '#62502a', '#7c6838', '#968048', '#b09a5e', '#cab47a'],     # 3: weathered sandstone
    'verd':   ['#040a08', '#0a1612', '#12241e', '#1c342c', '#284840', '#365e54', '#48766a', '#609082', '#80ac9c'],     # 5: dark verdigris bronze
    'vvoid':  ['#000000', '#020404', '#060a0a', '#0c1414', '#162222'],
    'svoid':  ['#000000', '#030408', '#080a12', '#10141e', '#1c2230'],
    'gold':   ['#3a2a04', '#6a4c08', '#a07418', '#d0a030', '#f0cc60', '#fff0b0'],
    'moss2':  ['#0c1a0a', '#1a3014', '#2a4a20', '#3c6430', '#527e44']}.items()})

def oldpolish(name, f, stone, rim, seed=60, gamma=1.0, accb=1.0):
    """start from the form as it was painted before (its old battle sprite) and only polish it: the stone is recoloured
    by its own light values into a new ramp with a touch more contrast, glows get a core and a halo, the shadow-side
    edges catch a rim light, the lit edges a highlight, and the surface a little grain. Nothing moves."""
    from scipy.ndimage import distance_transform_edt as edt
    d = PX[name]['b']; rows = d['f'][f]; H_, W_ = len(rows), len(rows[0]); setsize(W_, H_); c = Canvas()
    pal = {k: hx(v) for k, v in d['pal'].items()}
    img = np.zeros((H_, W_, 3), float); a = np.zeros((H_, W_), bool)
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch != '.': img[y, x] = pal[ch]; a[y, x] = True
    mx, mn = img.max(2), img.min(2); sat = mx - mn; lum = img @ np.array([.3, .55, .15]) / 255
    line_ = a & (mx < 26)                                          # the old outline and seams
    warm = (img[..., 0] - img[..., 2]) > 28                     # the gold, the embers, the letters: never stone
    stone_m = a & ~line_ & (sat < 70) & ~warm
    accent = a & ~line_ & ~stone_m
    K = len(stone)
    lo, hi = np.percentile(lum[stone_m], 2), np.percentile(lum[stone_m], 99)
    t = np.clip((lum - lo) / max(.01, hi - lo), 0, 1) ** gamma
    yy, xx = np.mgrid[0:H_, 0:W_]
    idx = np.clip(np.floor(t * (K - 1) + .5 + (yp.BAYER[yy % 4, xx % 4] - .5) * .25).astype(int), 0, K - 1)
    c.rgb[stone_m] = np.array(stone)[idx[stone_m]]
    c.rgb[accent] = np.clip(img[accent] * accb, 0, 255).astype(np.uint8)
    c.rgb[line_] = (np.array(stone[0]) * .6).astype(np.uint8)
    c.a[:] = a; c.part[stone_m] = 'st'; c.part[accent] = 'acc'; c.part[line_] = 'line'
    # glows: the bright saturated accents get a white-hot core and a halo on the stone around them
    hot = accent & (mx > 200)
    if hot.any():
        dist = edt(~hot)
        halo = (dist <= 3) & (dist > 0) & stone_m
        c.rgb[halo] = np.clip(c.rgb[halo] * .55 + img[hot].mean(0) * .45 * (1 - (dist[halo] - 1)[:, None] / 3), 0, 255).astype(np.uint8)
        core = hot & (edt(hot) >= 1.5)
        c.rgb[core] = np.clip(img[core] * .5 + 128, 0, 255).astype(np.uint8)
    # lit edges: stone pixels whose upper-left neighbour is outline or empty catch a highlight
    out_ = ~a
    near_out = out_ | (np.roll(out_, 1, 0) & line_) | (np.roll(out_, 1, 1) & line_)
    ul = np.roll(near_out, 1, 0) | np.roll(near_out, 1, 1) | np.roll(np.roll(near_out, 1, 0), 1, 1)
    lit = stone_m & ul & (idx >= K // 3) & ~np.roll(stone_m, 1, 0)
    c.rgb[lit] = np.array(stone)[np.minimum(K - 1, idx[lit] + 2)]
    texture(c, ['st'], amt=.10, seed=seed)
    speculars(c, ['st'], thr=.93)
    # rim light on the shadow side, from the forgetting's own glow behind it
    for y in range(H_):
        for x in range(1, W_ - 2):
            if stone_m[y, x] and not stone_m[y, x + 1] and (not a[y, x + 1] or (x + 2 < W_ and not a[y, x + 2])) and idx[y, x] < K // 2:
                c.rgb[y, x] = (c.rgb[y, x] * .5 + np.array(rim) * .5).astype(np.uint8)
    out = np.zeros((H_, W_, 4), np.uint8); out[..., :3] = c.rgb; out[..., 3] = c.a * 255
    return out

R.update({k: [hx(c) for c in v] for k, v in {
    'ashen': ['#08060e', '#140f1e', '#221a30', '#342a44', '#4a405a', '#625a72', '#7e768c', '#9e98aa', '#c4c0cc', '#e8e4ec'],
    'bone2': ['#0a0806', '#18140f', '#2a231b', '#3e352a', '#564b3d', '#706454', '#8e816e', '#ae a18c'.replace(' ', ''), '#cec2ac', '#ece4d2']}.items()})

def ngoyman1(f):
    return oldpolish('ngoyman1', f, R['slate'], rim=(255, 150, 80), seed=61)

def ngoyman5(f):
    return oldpolish('ngoyman5', f, R['bone2'], rim=(240, 200, 100), seed=65, gamma=.85, accb=1.3)

SPRITES = {'trelke': trelke, 'cherrufe': cherrufe, 'kaleuche': kaleuche, 'witranalwe': witranalwe, 'chinifilu': chinifilu, 'piwuchen': piwuchen, 'wallipen': wallipen, 'trawko': trawko, 'walichu': walichu, 'chadikura': chadikura, 'epunamun': epunamun, 'kalku': kalku, 'ngoyman1': ngoyman1, 'ngoyman2': ngoyman2, 'ngoyman3': ngoyman3, 'ngoyman4': ngoyman4, 'ngoyman5': ngoyman5,
           'llufu1': llufu1, 'llufu2': llufu2, 'llufu3': llufu3, 'llufu4': llufu4, 'llufu5': llufu5}

if __name__ == '__main__':
    from PIL import Image
    here = os.path.dirname(os.path.abspath(__file__)); jp = os.path.join(here, 'boss.json')
    out = json.load(open(jp)) if os.path.exists(jp) else {}
    names = sys.argv[1].split(',') if len(sys.argv) > 1 else list(SPRITES)
    strip = []
    for name in names:
        big = [SPRITES[name](0), SPRITES[name](1)]; small = [yp.half(b) for b in big]
        pb, fb = wp.encode2(big); ps, fs = wp.encode2(small)
        out[name] = {'big': {'pal': pb, 'f': fb}, 'small': {'pal': ps, 'f': fs}}
        for b in big:
            im = Image.new('RGBA', (b.shape[1] + 8, 216), (34, 38, 52, 255)); b0 = Image.fromarray(b); im.paste(b0, (4, 212 - b0.height), b0); strip.append(im)
    Wt = sum(s.width for s in strip); sheet = Image.new('RGBA', (Wt, 216)); x = 0
    for s in strip: sheet.paste(s, (x, 0)); x += s.width
    sheet.resize((sheet.width * 2, 432), Image.NEAREST).save('/tmp/bs/boss_sheet.png')
    json.dump(out, open(jp, 'w'))
    print('ok', names)
