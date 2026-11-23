"""The other battle backdrops, built with the same method as the coast (tools/bg_paint.py):
heightfield shading under a low sun from the right, ordered dithering, a perspective ground with a pool
of light where the fighters stand, and framing pieces kept inside the middle 256 px."""
import math, numpy as np
from bg_paint import (W, H, Pic, P, hx, bay, B4, YY, XX, BAYF, fbm, ridged, vnoise, shade, paint,
                      SKY, CLOUD, MNT, SNOW, ROCK, WOOD, SAND, FOAM, CREST)

# ---------------------------------------------------------------- shared pieces
def sky(s, hz, ramp, sun=None, warm='#ffeec4', stars=0, seed=1):
    t = (YY / max(1, hz)) ** 1.1
    paint(s, YY < hz, t, ramp)
    if sun:
        sx, sy, rad = sun
        d = np.hypot((XX - sx) * .6, YY - sy); lvl = np.floor((1 - d / rad) * 4 + BAYF)
        m = (YY < hz) & (lvl > 0); k = (lvl[m] * .13)[:, None]
        s.p[m] = (s.p[m] * (1 - k) + hx(warm) * k).astype(np.uint8)
    if stars:
        r = np.random.RandomState(seed)
        for _ in range(stars):
            x, y = r.randint(0, W), r.randint(0, int(hz * .8))
            s.px(x, y, '#ffffff' if r.rand() < .3 else '#c8d0f0')

def clouds(s, lst, ramp, hz):
    for cx, cy, w, h, sd in lst:
        r = np.random.RandomState(sd)
        lobes = [(cx + r.randint(-w // 2, w // 2), cy - r.randint(0, h), r.randint(h, h * 2)) for _ in range(7)]
        lobes += [(cx - w // 2 + 6, cy - 2, h), (cx + w // 2 - 6, cy - 2, h)]
        m = np.zeros((H, W), bool); L = np.zeros((H, W))
        for lx, ly, lr in lobes:
            e = ((XX - lx) / (lr * 1.35)) ** 2 + ((YY - ly) / lr) ** 2
            inside = (e <= 1) & (YY <= cy + 1)
            lit = .55 + .45 * (((XX - lx) / (lr * 1.35)) * .6 - ((YY - ly) / lr) * .8)
            L = np.where(inside & (~m | (lit > L)), lit, L); m |= inside
        L = L - (YY >= cy - 1) * .4
        paint(s, m & (YY < hz), L, ramp)

def ridge1(seed, base, amp, x):
    r = np.random.RandomState(seed); ph = r.rand(4) * 6
    return base - amp * (abs(np.sin(x / 41 + ph[0])) * .6 + abs(np.sin(x / 17 + ph[1])) * .3 + abs(np.sin(x / 7 + ph[2])) * .1)

def range_layer(s, seed, base, amp, hz, ramp, ridge_w=5, lo=.05, gain=1.0, snow=None, fade=None, fade_from=.45, round_=False):
    xs = np.arange(W, dtype=float)
    top = ridge1(seed, base, amp, xs)
    if round_: top = base - amp * (.55 + .45 * np.sin(xs / 53 + seed)) - amp * .25 * np.sin(xs / 19 + seed * 2)
    T = top[None, :]; below = (YY >= T) & (YY < hz)
    rid = ridged(XX / 15 + seed, YY / 7, 20 + seed, 4)
    z = (hz - YY) * .35 + rid * ridge_w
    L = shade(z, 1.0); dist = (YY - T) / np.maximum(1, hz - T)
    paint(s, below, lo + L * gain - dist * .15, ramp)
    if snow is not None:
        sm = below & (T < snow[0]) & ((YY - T) < 2 + (rid > .55) * snow[1])
        paint(s, sm, .1 + L * 1.1, SNOW)
    if fade is not None:
        f = below & (dist > fade_from); k = np.clip((dist - fade_from) * .9, 0, .5)[f][:, None]
        s.p[f] = (s.p[f] * (1 - k) + hx(fade) * k).astype(np.uint8)
    g = np.gradient(top)
    for x in range(W):
        ty = int(top[x])
        if 0 <= ty < hz: s.px(x, ty, ramp[-1] if g[x] > 0 else ramp[max(0, len(ramp) // 2 - 1)])
    return top

def ground(s, y0, ramp, cx=.52, cy=140, spread=46, base=.32, pool=.55, depth=.14, tex=.28, seed=0):
    m = YY >= y0
    pl = np.exp(-(((XX - W * cx) / (W * .42)) ** 2 + ((YY - cy) / spread) ** 2))
    # patches stretched by perspective: wide and flat far away, bigger near the viewer
    sc = 1 + (YY - y0) / 30
    pat = fbm(XX / (8 * sc), (YY - y0) / (2.2 * sc) + seed, 200 + seed, 3) - .5
    paint(s, m, base + pl * pool - (YY - y0) / (H - y0) * depth + pat * tex * 2, ramp)
    r = np.random.RandomState(300 + seed)
    for _ in range(260):   # pebbles / clods with a lit top and a dark underside
        x, y = r.randint(0, W), r.randint(y0 + 2, H - 2); w = 1 + int((y - y0) / 40)
        for i in range(w): s.px(x + i, y, ramp[min(len(ramp) - 1, 5)]); s.px(x + i, y + 1, ramp[0])

def rows(s, y0, fn, start=3.0, grow=1.15):
    """call fn(y, k) for perspective rows: spacing grows toward the viewer"""
    yy, k = y0 + start, 0
    while yy < H:
        fn(int(yy), k); yy += 3 + k * grow; k += 1

def darken(s, mask, k):
    s.p[mask] = (s.p[mask] * k).astype(np.uint8)

def boulder(s, cx, cy, rx, ry, seed, ramp, cast=True, wet=None, snowcap=False, rim=None):
    nx, ny = (XX - cx) / rx, (YY - cy) / ry; ang = np.arctan2(ny, nx)
    edge = 1 + .12 * np.sin(ang * 4 + seed) + .03 * np.sin(ang * 9 + seed * 2)
    r2 = np.sqrt(nx * nx + ny * ny); m = (r2 <= edge) & (YY < H)
    dome = np.sqrt(np.clip(1 - (r2 / edge) ** 2, 0, 1)) * min(rx, ry)
    z = dome + np.floor(fbm(XX / 7 + seed, YY / 7, 80 + seed, 2) * 5) * 2.2 + fbm(XX / 3.5, YY / 3.5, 90 + seed) * .7
    L = shade(z, .9)
    if cast:
        sh = (np.sqrt(((XX - cx + rx * .45) / (rx * 1.1)) ** 2 + ((YY - cy - ry * .55) / (ry * .45)) ** 2) <= 1) & ~m & (YY < H)
        darken(s, sh, .62)
    ao = np.clip((YY - (cy + ry * .35)) / (ry * .7), 0, 1)
    paint(s, m, .14 + L * .95 - ao * .3, ramp)
    cr = m & (abs(fbm(XX / 4, YY / 9, 99 + seed) - .5) < .018); s.p[cr] = ramp[0]
    if wet: w_ = m & (fbm(XX / 4, YY / 4, 95 + seed) > .7) & (L > .6); s.p[w_] = hx(wet)
    if snowcap:
        sc = m & (ny < -.25 + (fbm(XX / 3, YY / 3, 97 + seed) - .5) * .5); paint(s, sc, .2 + L * .9, SNOW)
    if rim:
        rm = m & (r2 / edge > .7) & (nx > .3) & (BAYF < (nx - .3) * 1.4); s.p[rm] = (s.p[rm] * .4 + hx(rim) * .6).astype(np.uint8)
    return m

def grass_tuft(s, x, y, h, ramp, seed, lean=0):
    r = np.random.RandomState(seed)
    for k in range(int(h * .9)):
        bx = x + r.randint(-h // 2, h // 2 + 1); bh = int(h * (.5 + r.rand() * .5)); bl = (r.rand() - .5) * 1.2 + lean
        for i in range(bh):
            px_ = int(bx + bl * i * i / max(1, bh)); c = ramp[min(len(ramp) - 1, int((i / bh) * (len(ramp) - 1) * .9 + (1 if px_ > x else 0)))]
            s.px(px_, y - i, c)

def broadleaf(s, cx, base_y, h, seed, leaf, trunk, dark=None):
    """a round-crowned tree (coigüe, roble): trunk, then clusters shaded as spheres lit from the right"""
    r = np.random.RandomState(seed)
    tw = max(2, h // 12)
    for y in range(base_y - int(h * .5), base_y):
        for x in range(cx - tw, cx + tw + 1): s.px(x, y, trunk[min(len(trunk) - 1, 1 + (x - cx + tw) * (len(trunk) - 2) // (2 * tw + 1))])
    cl = [(cx + r.randint(-h // 3, h // 3), base_y - int(h * .55) - r.randint(0, int(h * .4)), r.randint(h // 6, h // 4 + 1)) for _ in range(9)]
    for (x0, y0, rr) in sorted(cl, key=lambda c: c[1]):
        m = (((XX - x0) / (rr * 1.15)) ** 2 + ((YY - y0) / rr) ** 2 <= 1)
        nxx = (XX - x0) / (rr * 1.15); nyy = (YY - y0) / rr
        L = np.clip(.5 + nxx * .45 - nyy * .4, 0, 1) + (fbm(XX / 2, YY / 2, seed + x0) - .5) * .5
        paint(s, m, L, leaf)
    if dark is not None:
        sh = (((XX - cx + h * .3) / (h * .5)) ** 2 + ((YY - base_y) / 3.5) ** 2 <= 1); darken(s, sh & (YY < H), dark)

def pewen(s, cx, base_y, h, seed, leaf, trunk):
    """araucaria: a tall straight trunk and a flat umbrella crown of upturned branch tufts"""
    r = np.random.RandomState(seed)
    for y in range(base_y - h, base_y):
        for x in range(cx - 1, cx + 2): s.px(x, y, trunk[1 + (x - cx + 1)])
        if (y * 3) % 7 == 0: s.px(cx - 1, y, trunk[0])
    crown_top = base_y - h; layers = 4
    for l in range(layers):
        yy = crown_top + l * 4; span = 6 + l * 4 + r.randint(0, 3)
        for side in (-1, 1):
            for i in range(span):
                x = cx + side * i; y = yy + int(i * i / (span * 3.5)) - (1 if i > span - 3 else 0)
                for d in range(-1, 2):
                    c = leaf[min(len(leaf) - 1, max(0, 2 + d + (1 if side > 0 else -1) - (l == layers - 1)))]
                    s.px(x, y + d, c)
                if i > span - 3: s.px(x, y - 2, leaf[-1] if side > 0 else leaf[2])   # upturned tips

def conifer(s, cx, base_y, h, seed, leaf, trunk):
    """alerce / tall evergreen: a straight trunk with ragged drooping boughs, clumps lit from the right"""
    r = np.random.RandomState(seed)
    for y in range(base_y - h, base_y):
        for x in range(cx - 1, cx + 2): s.px(x, y, trunk[1 + (x - cx + 1)])
    y = base_y - h
    while y < base_y - h * .12:
        t = (y - (base_y - h)) / h; span = int(2 + t * h * .26 + r.randint(0, 3))
        for side in (-1, 1):
            for i in range(span):
                x = cx + side * i; yy = y + int(i * i / (span * 2.2 + 1))
                for d in range(-1, 2):
                    L = .45 + side * .25 - d * .15 + (r.rand() - .5) * .3
                    if r.rand() < .85: s.px(x, yy + d, leaf[int(np.clip(L, 0, .999) * len(leaf))])
        y += 3 + int(t * 2)

def vignette(s, k=.35):
    d = np.hypot((XX - W / 2) / (W * .62), (YY - H * .48) / (H * .75)); lvl = np.floor(np.clip(d - .75, 0, 1) * 4 * k * 4 + BAYF) / 4 * .5
    m = lvl > 0; s.p[m] = (s.p[m] * (1 - np.clip(lvl[m], 0, .6))[:, None]).astype(np.uint8)

# ---------------------------------------------------------------- palettes
GRASS = P('#1f3a1a', '#2c4f20', '#3b6626', '#4d7e2e', '#62953a', '#7aad48', '#98c65a', '#b8dc78')
WHEAT = P('#6a4e18', '#8a6a22', '#aa8a30', '#c8a840', '#dcc25a', '#eedb84')
LEAF = P('#0f2414', '#173420', '#22472a', '#2f5d33', '#3f7540', '#558e4c', '#72a95a')
DLEAF = P('#08140c', '#0f2016', '#16301f', '#1f4229', '#2a5534', '#386a40')
BARK = P('#1a120c', '#2e2016', '#463222', '#5e4630', '#7a5e42')
PEWL = P('#0e1e14', '#16301e', '#20442a', '#2c5a36', '#3a7044', '#4e8a54')
SNOWG = P('#7c8cac', '#96a6c4', '#b2c0da', '#cad6ea', '#dfe8f4', '#eef4fb', '#fbfdff')
LAVA = P('#3a0804', '#6a1208', '#a2220c', '#d8401a', '#f6742a', '#ffb04a', '#ffe08a')
BASALT = P('#0c0a0e', '#17131a', '#221c26', '#2e2632', '#3c3240', '#4c4050')
ASHSKY = P('#1a0a0e', '#2a0f12', '#3e1614', '#561e16', '#702a18', '#8e3a1c', '#b0522a')
RAINSKY = P('#3e4a52', '#4a5760', '#57656e', '#64737c', '#73828a', '#839299', '#95a3a8')
MOSS = P('#15200f', '#1f2f16', '#2b411d', '#385426', '#476a30', '#5a803c', '#73984c')
FJSKY = P('#1c222e', '#262e3c', '#313a4a', '#3d4858', '#4b5768', '#5c6878', '#707c8a')
FJROCK = P('#0c0e12', '#15181e', '#1f232b', '#2a2f38', '#363c46', '#444b56', '#565e6a')
PEBBLE = P('#1a1a1e', '#26262c', '#33333a', '#41414a', '#52525a', '#66666e')
DARKSEA = P('#0c1620', '#122030', '#182a3c', '#203648', '#2a4456', '#365466')
PSKY = P('#2c4a8a', '#3a5c9e', '#4c72b2', '#6a8cc4', '#8ea8d2', '#b6c6dc', '#dcd8c8', '#f0e4c8')
COIRON = P('#5a4418', '#76582020'[:7], '#927028', '#ae8a36', '#c8a446', '#dcbe62', '#ecd68a')
DUST = P('#6a4e30', '#82623c', '#9a7848', '#b28e58', '#c6a46a', '#d8ba82', '#e8d0a0')
SHRUB = P('#1e2414', '#2c3418', '#3c461e', '#4e5a26', '#647030')
NIGHT = P('#060818', '#0a0e26', '#101636', '#18204a', '#22305e', '#344676', '#4a5e8e')
LAGOON = P('#0a1424', '#0e1c32', '#142640', '#1a3250', '#223e60', '#2e4e72')
REED = P('#141a0c', '#1e2812', '#2a3818', '#3a4a20', '#4e602a', '#667a38')
DEEP = P('#04121c', '#071c2a', '#0a2638', '#0e3246', '#143e54', '#1c4c62', '#285e74', '#3a7486')
KELPG = P('#0c1a0c', '#142812', '#1e3a18', '#2a4c1e', '#386226', '#4a7a30')
SEAFLOOR = P('#3a3a2c', '#4a4a36', '#5c5a42', '#706c50', '#86805e', '#9c946e')
CAVE = P('#0c0a0a', '#181412', '#241e1a', '#322a24', '#42382e', '#544838', '#685a46')
CAVEW = P('#07141a', '#0c1e26', '#122a34', '#1a3842', '#244852', '#305a64')
CHENKE = P('#140e08', '#22180e', '#322414', '#44321c', '#584226', '#6e5432', '#866a42')
CITYSKY = P('#120c18', '#1e1222', '#2c182a', '#3e1f30', '#552834', '#6e3434', '#8a4434')
ASPH = P('#0e0e12', '#16161c', '#1e1e26', '#282832', '#34343e', '#42424c', '#54545e')
BRICK = P('#1c1214', '#2c1a1c', '#3e2426', '#523032', '#683e3e', '#7e4e4a')

# ---------------------------------------------------------------- the backdrops
def field():   # Nagche: rolling valley, wheat, fence, coigüe, a far volcano
    s = Pic(); HZ = 84
    sky(s, HZ, SKY, sun=(300, 76, 50))
    clouds(s, [(70, 26, 30, 6, 21), (190, 16, 22, 5, 22), (330, 30, 28, 6, 23), (260, 50, 14, 3, 24)], CLOUD, HZ)
    range_layer(s, 31, 74, 14, 104, MNT, ridge_w=4, lo=.25, gain=.9, fade=SKY[7], snow=(64, 3))
    # rolling green hills shaded as a heightfield
    xs = np.arange(W, dtype=float); top = 80 - 7 * np.sin(xs / 47 + 1) - 4 * np.sin(xs / 19); T = top[None, :]
    m = (YY >= T) & (YY < 108); z = (108 - YY) * .4 + fbm(XX / 18, YY / 6, 32) * 7
    paint(s, m, .2 + shade(z, 1.0) * .7 - (YY - T) / 40 * .1, GRASS)
    for x in range(W): s.px(x, int(top[x]), GRASS[6])
    # wheat field band with furrows
    wm = (YY >= 100) & (YY < 116) & (XX > 120) & (XX < 330)
    paint(s, wm, .35 + fbm(XX / 3, YY / 1.2, 33) * .45 + (YY % 3 == 0) * .1, WHEAT)
    # meadow floor
    ground(s, 108, GRASS, base=.38, pool=.45)
    def gr(y, k):
        for x in range(0, W, 3 + k // 3):
            if math.sin(x * .7 + k * 2.1) > .2: s.px(x, y, GRASS[6] if (x // 5) % 2 else GRASS[2]); s.px(x, y - 1, GRASS[7] if k > 6 else GRASS[5])
    rows(s, 110, gr)
    # fence across the mid-ground
    for x in range(86, 340):
        y = 112 + int((x - 86) * .02)
        if (x - 86) % 22 == 0:
            for d in range(0, 11): s.px(x, y - d, WOOD[3]); s.px(x + 1, y - d, WOOD[5])
        s.px(x, y - 8, WOOD[4]); s.px(x, y - 4, WOOD[4]); s.px(x, y - 7, WOOD[2])
    broadleaf(s, 80, 118, 46, 41, LEAF, BARK, dark=.75); broadleaf(s, 338, 116, 40, 42, LEAF, BARK, dark=.75)
    for x, y, h, sd in [(84, 222, 14, 1), (106, 224, 10, 2), (300, 223, 13, 3), (326, 224, 9, 4), (96, 214, 8, 5)]:
        grass_tuft(s, x, y, h, GRASS, sd)
    r = np.random.RandomState(5)
    for _ in range(40):
        x, y = r.randint(0, W), r.randint(124, H)
        s.px(x, y, ['#f4e070', '#f4f4f4', '#e88ab0'][r.randint(3)])
    return s, {'hz': HZ}

def forest():  # Ngen-mawida: a clearing in the deep forest, shafts of light, ferns
    s = Pic()
    paint(s, YY < H, .15 + (1 - YY / H) * .35, DLEAF)
    r = np.random.RandomState(7)
    for layer, (n, wmin, wmax, lit) in enumerate([(14, 3, 6, .15), (9, 6, 10, .35), (6, 10, 16, .55)]):
        for _ in range(n):
            x0 = r.randint(-10, W + 10); w = r.randint(wmin, wmax)
            for y in range(0, 128 + layer * 6):
                for x in range(x0 - w, x0 + w):
                    L = lit + (x - x0) / w * .3 + (fbm(x / 2.0, y / 9.0, 70 + layer) - .5) * .3
                    s.px(x, y, s.ramp_at(x, y, BARK if layer == 2 else DLEAF, L))
    # canopy framing the top
    cm = YY < 26 + fbm(XX / 9, YY / 9, 71) * 26
    paint(s, cm, .15 + fbm(XX / 3, YY / 3, 72) * .6, LEAF)
    # mossy clearing floor
    ground(s, 120, MOSS, base=.3, pool=.6, cy=142)
    rows(s, 122, lambda y, k: [s.px(x, y, MOSS[6]) for x in range(k % 4, W, 5 + k // 2) if math.sin(x + k) > 0])
    # light shafts (banded, additive)
    for k, bx in enumerate([150, 210, 270]):
        for y in range(20, 160):
            x0 = bx + (y - 20) * .45; wdt = 7 + k * 2
            for x in range(int(x0), int(x0 + wdt)):
                if 0 <= x < W and BAYF[y, x] < .5 - abs(x - x0 - wdt / 2) / wdt:
                    s.p[y, x] = np.minimum(255, s.p[y, x].astype(int) + 34).astype(np.uint8)
    # ferns (nalca-like fronds) at the foreground corners
    for cx, cy, sd in [(70, 214, 1), (100, 222, 2), (318, 218, 3), (346, 212, 4)]:
        for a in range(7):
            ang = -math.pi / 2 + (a - 3) * .38
            for i in range(26):
                x = cx + math.cos(ang) * i * 1.2 + (a - 3) * i * .05; y = cy + math.sin(ang) * i * .9 + i * i * .02
                s.px(x, y, LEAF[4 + (a > 3)]); s.px(x + 1, y, LEAF[2])
                if i % 3 == 0:
                    for j in (1, 2, 3): s.px(x - j, y + j * .3, LEAF[3]); s.px(x + j + 1, y + j * .3, LEAF[5])
    vignette(s, .4)
    return s, {}

def mount():   # Pewenche: cordillera, araucarias, snowfield
    s = Pic(); HZ = 92
    sky(s, HZ, SKY, sun=(310, 60, 46))
    clouds(s, [(80, 22, 26, 5, 31), (240, 14, 20, 4, 32)], CLOUD, HZ)
    range_layer(s, 41, 72, 34, HZ, MNT, ridge_w=3.5, lo=.2, gain=.9, snow=(66, 4), fade=SKY[7])
    range_layer(s, 43, 88, 14, HZ, MNT, ridge_w=2.5, lo=.05, gain=.6, snow=(80, 2))
    ground(s, HZ, SNOWG, base=.3, pool=.45, depth=.2, cy=138, tex=.4)
    def sw(y, k):   # wind-carved snow furrows
        for x in range(W):
            yy = int(y + 1.6 * math.sin(x / (20 + k * 3) + k))
            if HZ < yy < H - 1 and math.sin(x / 4.0 + k) > -.4:
                s.p[yy, x] = np.clip(s.p[yy, x].astype(int) - 22, 0, 255); s.p[yy - 1, x] = np.clip(s.p[yy - 1, x].astype(int) + 10, 0, 255)
    rows(s, HZ, sw, grow=1.3)
    for x, h, sd in [(62, 60, 1), (96, 44, 2), (124, 30, 3), (290, 34, 4), (322, 52, 5), (354, 64, 6)]:
        pewen(s, x, HZ + 4 + h // 3, h, sd, PEWL, BARK)
        darken(s, (((XX - x + 10) / 14) ** 2 + ((YY - (HZ + 4 + h // 3)) / 2.5) ** 2 <= 1), .8)
    for cx, cy, rx, ry, sd in [(70, 214, 34, 20, 51), (108, 222, 18, 10, 52), (340, 212, 32, 20, 53)]:
        boulder(s, cx, cy, rx, ry, sd, ROCK, snowcap=True)
    return s, {'hz': HZ}

def crater():  # Pillañ: inside the volcano, lava rivers, cracked basalt
    s = Pic(); HZ = 70
    sky(s, HZ, ASHSKY, sun=(200, 64, 70), warm='#ff8a3a')
    r = np.random.RandomState(3)
    for _ in range(60): s.px(r.randint(0, W), r.randint(0, HZ), '#ffb050' if r.rand() < .3 else '#6a3020')
    # crater walls rising on both sides
    xs = np.arange(W, dtype=float); top = 64 - (abs(xs - W / 2) / (W / 2)) ** 1.6 * 40 + 6 * np.sin(xs / 13) + (np.array([fbm(np.array([x / 6.0]), np.array([0.0]), 84)[0] for x in xs]) - .5) * 22
    T = top[None, :]; m = (YY >= T) & (YY < 112)
    z = ridged(XX / 7, YY / 5, 81, 4) * 7 + (112 - YY) * .3
    L = shade(z, 1.0); paint(s, m, .05 + L * .75, BASALT)
    glow = m & (YY > 90) & (BAYF < (YY - 90) / 30)     # lava glow lighting the foot of the walls
    s.p[glow] = (s.p[glow] * .6 + hx('#b0361a') * .4).astype(np.uint8)
    # lava lake across the middle
    lm = (YY >= 104) & (YY < 118)
    paint(s, lm, .45 + fbm(XX / 6, YY / 2, 82) * .5, LAVA)
    # cracked basalt floor with glowing seams
    ground(s, 116, BASALT, base=.25, pool=.45, cy=140)
    cr = (YY >= 118) & (abs(fbm(XX / 22, YY / 9, 83) - .5) < .008 + (YY - 118) / 9000)
    paint(s, cr, .55 + BAYF * .3, LAVA)
    for cx, cy, rx, ry, sd in [(64, 212, 36, 22, 61), (346, 210, 34, 22, 62)]:
        boulder(s, cx, cy, rx, ry, sd, BASALT, rim='#e0582a')
    vignette(s, .45)
    return s, {'hz': HZ}

def rainforest():  # Williche: overcast, alerce trunks, lake mist, mossy ground
    s = Pic(); HZ = 90
    sky(s, HZ, RAINSKY)
    range_layer(s, 51, 80, 18, HZ, P('#3a4a50', '#46565c', '#536369', '#617076', '#707e82'), ridge_w=4, lo=.2, gain=.6, fade='#8c9aa0', fade_from=.2)
    # far forest band
    fm = (YY >= 82 + fbm(XX / 4, YY, 52) * 6) & (YY < 104); paint(s, fm, .2 + fbm(XX / 2, YY / 2, 53) * .4, DLEAF)
    mist = (YY > 88) & (YY < 104) & (BAYF < .5 - abs(YY - 96) / 16); s.p[mist] = hx('#9aa8ac')
    for x, h, sd in [(40, 110, 1), (74, 96, 2), (330, 104, 3), (362, 116, 4), (120, 60, 5), (290, 64, 6)]:
        conifer(s, x, 104 + h // 8, h, sd, DLEAF, BARK)
    ground(s, 104, MOSS, base=.3, pool=.5, cy=140)
    rows(s, 106, lambda y, k: [s.px(x, y, MOSS[6] if k % 2 else MOSS[1]) for x in range(k % 3, W, 4 + k // 3) if math.sin(x * .5 + k) > .1])
    # puddles reflecting the grey sky
    for cx, cy, rx in [(180, 160, 26), (250, 176, 18)]:
        pm = (((XX - cx) / rx) ** 2 + ((YY - cy) / (rx * .18)) ** 2 <= 1); paint(s, pm, .5 + BAYF * .4, RAINSKY)
    # nalca leaves framing the bottom corners
    for cx, cy, sd in [(76, 210, 1), (330, 208, 2)]:
        for a in range(5):
            ang = -2.3 + a * .55; lx_, ly_ = cx + math.cos(ang) * 22, cy + math.sin(ang) * 16
            lm2 = (((XX - lx_) / 13) ** 2 + ((YY - ly_) / 8) ** 2 <= 1)
            paint(s, lm2, .3 + ((XX - lx_) / 13) * .3 + fbm(XX / 2, YY / 2, sd + a) * .3, LEAF)
            for i in range(20): s.px(cx + math.cos(ang) * i, cy + math.sin(ang) * i * .75, LEAF[6])
    return s, {'hz': HZ}

def fjord():   # Ngen-kürüf / Ngoyman threshold: steep cliffs, dark water, low cloud
    s = Pic(); HZ = 96
    sky(s, HZ, FJSKY)
    clouds(s, [(120, 40, 60, 8, 71), (300, 30, 50, 7, 72)], P('#3a4454', '#4a5464', '#5a6474', '#6c7684', '#808a96'), HZ)
    xs = np.arange(W, dtype=float)
    for side in (0, 1):
        if side == 0: edge = 6 + (xs / 165) ** 1.6 * 100 + 6 * np.sin(xs / 9) + 3 * np.sin(xs / 3.1)
        else: edge = 6 + ((W - xs) / 165) ** 1.6 * 100 + 6 * np.sin(xs / 11 + 2) + 3 * np.sin(xs / 2.9)
        top = np.clip(edge, 4, 120); T = top[None, :]
        m = (YY >= T) & (YY < 118) & (((XX < 175) if side == 0 else (XX > 225)))
        z = ridged(XX / 6, YY / 10, 91 + side, 4) * 8 + (XX if side == 0 else W - XX) * -.12
        paint(s, m, .05 + shade(z, 1.0) * .8, FJROCK)
    far = (YY >= 70 + 6 * np.sin(XX / 17)) & (YY < HZ) & ~s.a.astype(bool)
    paint(s, far, .45, FJSKY)
    wm = (YY >= HZ) & (YY < 118); paint(s, wm, .3 + (YY - HZ) / 40 + (np.sin(XX / 5 + YY * 1.3) > .8) * .2, DARKSEA)
    ground(s, 116, PEBBLE, base=.3, pool=.45, cy=142)
    r = np.random.RandomState(9)
    for _ in range(500):
        x, y = r.randint(0, W), r.randint(118, H); s.px(x, y, PEBBLE[5] if r.rand() < .4 else PEBBLE[1])
    fog = (YY > 60) & (YY < 116) & (BAYF < .3 - abs(YY - 100) / 60); s.p[fog] = hx('#7a8492')
    for cx, cy, rx, ry, sd in [(66, 212, 34, 22, 81), (340, 210, 32, 22, 82)]:
        boulder(s, cx, cy, rx, ry, sd, FJROCK, wet='#7a8898')
    vignette(s, .4)
    return s, {'hz': HZ}

def pampa():   # Puelmapu: huge sky, flat horizon, a far meseta, coirón grass, thorny shrubs
    s = Pic(); HZ = 98
    sky(s, HZ, PSKY, sun=(320, 88, 70), warm='#ffe0a8')
    clouds(s, [(60, 30, 40, 4, 91), (200, 22, 50, 4, 92), (330, 40, 30, 3, 93)], CLOUD, HZ)
    xs = np.arange(W, dtype=float); top = np.where((xs > 40) & (xs < 160), 84 + np.maximum(0, abs(xs - 100) - 44) * .6, 94) - 1.2 * np.sin(xs / 7)
    T = top[None, :]; m = (YY >= T) & (YY < HZ)
    paint(s, m, .35 + shade((HZ - YY) * .5 + fbm(XX / 4, YY / 2, 94) * 4, 1.0) * .4, P('#7a6a62', '#8e7c70', '#a28e80', '#b8a492'))
    ground(s, HZ, COIRON, base=.3, pool=.55, cy=144, depth=.18)
    def tuft(y, k):
        for x in range(k % 5, W, 5 + k):
            if math.sin(x * 1.3 + k) > 0:
                h = 1 + k // 3
                for i in range(h): s.px(x - i // 2, y - i, COIRON[6] if i == h - 1 else COIRON[4]); s.px(x + i // 2 + 1, y - i, COIRON[3])
    rows(s, HZ, tuft, grow=1.25)
    # a dusty track toward the horizon
    cxp = W * .5 + (YY - HZ) * .55; tm = (YY > HZ + 4) & (abs(XX - cxp) < (YY - HZ) * .45)
    paint(s, tm, .3 + fbm(XX / 3, YY / 3, 95) * .5, DUST)
    rut = tm & (abs(abs(XX - cxp) - (YY - HZ) * .25) < .6 + (YY - HZ) / 90); paint(s, rut, .15 + BAYF * .2, DUST)
    grass_mid = tm & (abs(XX - cxp) < (YY - HZ) * .06) & (BAYF < .5); s.p[grass_mid] = COIRON[3]
    for cx, cy, sd in [(72, 216, 1), (108, 222, 2), (318, 214, 3), (348, 220, 4)]:
        r = np.random.RandomState(sd)
        for _ in range(140):
            a = r.rand() * math.pi; d = r.rand() ** .6 * 20
            x, y = cx + math.cos(a) * d * 1.2, cy - math.sin(a) * d * .8
            s.px(x, y, SHRUB[r.randint(1, 5)])
        for _ in range(12): s.px(cx + r.randint(-20, 20), cy - r.randint(0, 14), '#f0e4a0')   # neneo flowers
    return s, {'hz': HZ}

def lagoon():  # Ngen-lafken: the sacred lagoon at dusk, totora reeds, the moon on the water
    s = Pic(); HZ = 92
    sky(s, HZ, NIGHT, stars=90, seed=4)
    mx, my = 280, 30
    moon = (((XX - mx) / 9) ** 2 + ((YY - my) / 9) ** 2 <= 1); paint(s, moon, .5 + (XX - mx) / 18 + .2, P('#a8b0c8', '#ccd4e6', '#eef2fa'))
    halo = (np.hypot(XX - mx, YY - my) < 26) & ~moon & (BAYF < .5 - np.hypot(XX - mx, YY - my) / 52); s.p[halo] = hx('#3a4e7e')
    range_layer(s, 61, 86, 14, HZ, NIGHT, ridge_w=3, lo=.25, gain=.4, round_=True)
    wm = (YY >= HZ) & (YY < 124); paint(s, wm, .2 + (YY - HZ) / 60, LAGOON)
    for y in range(HZ + 1, 124):     # moon path
        for x in range(mx - 2 - (y - HZ) // 3, mx + 3 + (y - HZ) // 3):
            if (x * 5 + y * 3) % 7 == 0: s.px(x, y, '#c8d4ee' if y % 2 else '#8ea4cc')
    ground(s, 122, P('#141a12', '#1c2418', '#26301e', '#323e26', '#404e30'), base=.3, pool=.5, cy=146)
    for cx, n in [(60, 30), (100, 16), (330, 26), (366, 18)]:
        r = np.random.RandomState(cx)
        for _ in range(n):
            x = cx + r.randint(-18, 18); h = r.randint(20, 44); b = 128 + r.randint(0, 60)
            for i in range(h): s.px(x + int(i * i * .004 * (1 if x > cx else -1)), b - i, REED[1 + (i > h * .3) + (i > h * .7)])
            for i in range(4): s.px(x, b - h - i, REED[5]); s.px(x + 1, b - h - i, REED[3])
    return s, {'hz': HZ, 'moon': [mx, my]}

def deep():    # Münche lafken: under the lake, rays of light, kelp, a sandy floor
    s = Pic()
    paint(s, YY < H, .85 - YY / H * .8, DEEP)
    for k, bx in enumerate([100, 180, 260, 330]):
        for y in range(0, 170):
            x0 = bx + y * .25; w = 10 + k * 2
            for x in range(int(x0), int(x0 + w)):
                if 0 <= x < W and BAYF[y, x] < .35 - y / 600 - abs(x - x0 - w / 2) / w * .5:
                    s.p[y, x] = np.minimum(255, s.p[y, x].astype(int) + 26).astype(np.uint8)
    ground(s, 118, SEAFLOOR, base=.2, pool=.5, cy=142)
    rows(s, 120, lambda y, k: [s.px(x, y, SEAFLOOR[4]) for x in range(k % 4, W, 6 + k) if math.sin(x * .3 + k) > .3])
    r = np.random.RandomState(12)
    for cx in [30, 52, 76, 330, 356, 380, 150, 250]:
        h = r.randint(60, 120) if cx < 100 or cx > 300 else r.randint(30, 50); base_y = 120 + r.randint(0, 20)
        for i in range(h):
            x = cx + 4 * math.sin(i / 9 + cx); y = base_y - i
            s.px(x, y, KELPG[3]); s.px(x + 1, y, KELPG[2]); s.px(x - 1, y, KELPG[4] if i % 3 else KELPG[5])
            if i % 7 == 0:
                for j in range(5): s.px(x + 2 + j, y - j * .5, KELPG[4]); s.px(x - 2 - j, y - j * .3, KELPG[3])
    for cx, cy, rx, ry, sd in [(70, 214, 34, 22, 101), (340, 212, 32, 22, 102)]:
        boulder(s, cx, cy, rx, ry, sd, P('#10181a', '#18262a', '#22363a', '#2e4648', '#3c5858', '#4c6a68'), wet='#6a9aa0')
    for _ in range(40): s.px(r.randint(0, W), r.randint(10, 110), '#8ec8d8')
    vignette(s, .45)
    return s, {}

def cave_base(rock, floor, light='#ffb060', seed=0, lava=False, water=False, bones=False):
    s = Pic()
    jt = 120 + (fbm(XX / 10, YY * 0, 115 + seed, 3) - .5) * 14            # wall/floor junction, uneven
    z = ridged(XX / 14 + seed, YY / 18, 110 + seed, 4) * 9 + fbm(XX / 4, YY / 4, 111 + seed) * 2
    wall = YY < jt
    t = .12 + shade(z, 1.0) * .7 + (1 - abs(XX - W / 2) / (W / 2)) * .12 - np.clip((40 - YY) / 40, 0, 1) * .3 - np.clip((YY - (jt - 14)) / 14, 0, 1) * .2
    paint(s, wall, t, rock)
    # a dark passage opening in the middle back
    d2 = ((XX - W / 2) / 44) ** 2 + ((YY - 104) / 32) ** 2; om = (d2 <= 1) & wall
    paint(s, om, np.clip(1 - d2, 0, 1) * .3, P('#000000', '#06050a', '#0c0a10', '#14101a'))
    rimm = (d2 > 1) & (d2 < 1.25) & wall & (XX > W / 2); s.p[rimm] = rock[-2]
    ground(s, 112, floor, base=.22, pool=.5, cy=142, seed=seed)
    s.p[wall] = s.p[wall]   # keep the wall over the ground
    paint(s, wall & ~om, t, rock); paint(s, om, np.clip(1 - d2, 0, 1) * .3, P('#000000', '#06050a', '#0c0a10', '#14101a'))
    jm = (YY >= jt) & (YY < jt + 5); darken(s, jm, .6)                   # contact shadow at the foot of the wall
    r = np.random.RandomState(seed + 5)
    for _ in range(70):                                                  # rubble along the foot of the wall
        x = r.randint(0, W); y = int(jt[0, x]) + r.randint(-1, 4); w = r.randint(2, 6)
        for dx in range(w):
            for dy in range(max(1, w // 2)): s.px(x + dx, y - dy, rock[min(len(rock) - 1, 2 + (dx > w // 2) * 2 - (dy == 0))])
    # stalactites, outlined and lit from the right
    for _ in range(24):
        x = r.randint(0, W); L = r.randint(8, 34); w = r.randint(2, 5)
        for i in range(L):
            ww = max(0, int(w * (1 - i / L)))
            for d in range(-ww, ww + 1): s.px(x + d, i, rock[int(np.clip(.25 + (d / max(1, ww)) * .35 + .15, 0, .99) * len(rock))])
            s.px(x - ww - 1, i, rock[0]); s.px(x + ww + 1, i, rock[0])
        s.px(x, L, rock[-1])
    # stalagmites rising from the floor at the sides
    for x0 in [26, 48, 352, 374]:
        L = r.randint(14, 26); base_y = 130 + r.randint(0, 8)
        for i in range(L):
            ww = int(4 * (1 - i / L)) + 1
            for d in range(-ww, ww + 1): s.px(x0 + d, base_y - i, rock[int(np.clip(.3 + d / ww * .35, 0, .99) * len(rock))])
    if lava:
        rv = (YY > 124) & (abs(XX - (W * .5 + 30 * np.sin(YY / 18))) < 3 + (YY - 124) * .07)
        paint(s, rv, .45 + BAYF * .4 + (np.sin(YY / 3 + XX) > .8) * .2, LAVA)
        gl = (YY > 120) & (abs(XX - (W * .5 + 30 * np.sin(YY / 18))) < 10 + (YY - 124) * .2) & ~rv & (BAYF < .35)
        s.p[gl] = (s.p[gl] * .6 + hx('#c0401a') * .4).astype(np.uint8)
    if water:
        pm = (((XX - 200) / 74) ** 2 + ((YY - 138) / 9) ** 2 <= 1)
        paint(s, pm, .3 + ((YY - 129) / 18) * .4 + (np.sin(XX / 3 + YY * 2) > .85) * .35, CAVEW)
        edge = pm & ~((((XX - 200) / 70) ** 2 + ((YY - 138) / 7.6) ** 2) <= 1); s.p[edge] = CAVEW[-1]
    if bones:
        for x, y in [(150, 170), (262, 184), (212, 160)]:
            for i in range(10): s.px(x + i, y + i // 4, '#d8d0bc'); s.px(x + i, y + i // 4 + 1, '#6a6250')
            for k in (0, 10): s.px(x + k - 1, y + k // 4 - 1, '#efe8d6'); s.px(x + k - 1, y + k // 4 + 1, '#efe8d6')
        for i in range(6):   # a skull
            for j in range(5):
                if (i - 2.5) ** 2 / 9 + (j - 2) ** 2 / 6 <= 1: s.px(300 + i, 160 + j, '#e2dac6' if i > 2 else '#b8b09c')
        s.px(301, 162, '#1a140c'); s.px(304, 162, '#1a140c')
    # torch-light pools on the walls
    for tx in (70, 330):
        d = np.hypot(XX - tx, (YY - 70) * 1.2); lvl = np.floor(np.clip(1 - d / 64, 0, 1) * 4 + BAYF)
        m = lvl > 0; k = (lvl[m] * .07)[:, None]; s.p[m] = (s.p[m] * (1 - k) + hx(light) * k).astype(np.uint8)
        for y in range(60, 76): s.px(tx, y, WOOD[2]); s.px(tx + 1, y, WOOD[3])
        for i, c in enumerate(['#ffe08a', '#ffb04a', '#f6742a', '#d8401a']): s.px(tx, 58 - i, c); s.px(tx + 1, 59 - i, c)
    for cx, cy, rx, ry, sd in [(66, 214, 34, 22, 121 + seed), (342, 212, 32, 22, 122 + seed)]:
        boulder(s, cx, cy, rx, ry, sd, rock, rim=light if lava else None)
    vignette(s, .5)
    return s

def cave():  return cave_base(CAVE, P('#1a1612', '#26201a', '#332a22', '#40362c', '#4e4436', '#5e5242'), seed=1), {}
def cave3(): return cave_base(BASALT, P('#140e0e', '#201616', '#2c1e1c', '#3a2824', '#4a322c'), light='#ff7a30', seed=3, lava=True), {}
def cave4(): return cave_base(P('#06100e', '#0c1a18', '#122624', '#1a3432', '#244442', '#305652'), P('#0c1614', '#14201e', '#1c2c28', '#263834', '#324642'), light='#9ae0d0', seed=4, water=True), {}
def cave5(): return cave_base(CHENKE, P('#1c140c', '#2a1e12', '#3a2a1a', '#4a3822', '#5c482c'), light='#ffc070', seed=5, bones=True), {}

def waria():   # Santiago: a city street at dusk, lit windows, wet asphalt
    s = Pic(); HZ = 88
    sky(s, HZ, CITYSKY, sun=(200, 84, 80), warm='#ff8a50')
    r = np.random.RandomState(14)
    x = -10
    while x < W + 10:   # building silhouettes, two depths
        bw = r.randint(26, 54); bh = r.randint(20, 70)
        m = (XX >= x) & (XX < x + bw) & (YY >= HZ - bh) & (YY < 118)
        paint(s, m, .15 + (XX - x) / bw * .25 + fbm(XX / 2, YY / 2, x + 300) * .1, BRICK if r.rand() < .5 else ASPH)
        for wy in range(HZ - bh + 4, 112, 7):
            for wx in range(x + 3, x + bw - 4, 6):
                if r.rand() < .55:
                    c = '#f8d070' if r.rand() < .6 else '#8ab0d8'
                    for dy in range(3):
                        for dx in range(3): s.px(wx + dx, wy + dy, c if dy < 2 else '#a07a30')
        x += bw + r.randint(0, 6)
    ground(s, 116, ASPH, base=.25, pool=.5, cy=144)
    for y in range(118, H):   # wet asphalt mirrors the windows and the sky
        for xx in range(0, W):
            src = 232 - y
            if 0 <= src < 116 and BAYF[y, xx] < .25 and (s.p[src, xx] > 180).any(): s.p[y, xx] = (s.p[y, xx] * .5 + s.p[src, xx] * .5).astype(np.uint8)
    for x in range(0, W, 30): [s.px(x + i, 150, '#d8c860') for i in range(14)]   # lane marks
    for lx in (88, 316):   # street lamps
        for y in range(60, 140): s.px(lx, y, '#2a2a30'); s.px(lx + 1, y, '#44444c')
        for i in range(8): s.px(lx + 1 + i, 60, '#44444c')
        for dy in range(3):
            for dx in range(5): s.px(lx + 6 + dx, 61 + dy, '#fff0b0')
        d = np.hypot(XX - lx - 8, (YY - 120) * .6); lvl = np.floor(np.clip(1 - d / 50, 0, 1) * 4 + BAYF)
        m = (lvl > 0) & (YY > 62); k = (lvl[m] * .08)[:, None]; s.p[m] = (s.p[m] * (1 - k) + hx('#ffd27a') * k).astype(np.uint8)
    for cx, cy, sd in [(60, 210, 1), (350, 212, 2)]:   # curb and a bin
        bm = (abs(XX - cx) < 10) & (YY > cy - 20) & (YY < cy + 2); paint(s, bm, .3 + (XX - cx) / 20 + .2, P('#1a3020', '#24442c', '#305838', '#3e6e46'))
    return s, {'hz': HZ}

def light_pool(s, cx, cy, rx, ry, col, k=.22, mask=None):
    d = np.hypot((XX - cx) / rx, (YY - cy) / ry); lvl = np.floor(np.clip(1 - d, 0, 1) * 5 + BAYF) / 5
    m = lvl > 0
    if mask is not None: m &= mask
    kk = (lvl[m] * k)[:, None]; s.p[m] = np.clip(s.p[m] * (1 - kk) + hx(col) * kk, 0, 255).astype(np.uint8)

def metro():   # Santiago: a Metro platform, tiled wall, a tunnel mouth, the track pit, a polished floor
    s = Pic(); HZ = 112
    TILE = P('#6c6a62', '#7e7c72', '#918e84', '#a5a296', '#b8b5a8', '#cac7ba', '#dcd9cc')
    r = np.random.RandomState(31)
    jit = np.zeros((H, W))
    for ty in range(0, HZ, 8):                       # each tile its own faint tone
        for tx in range(-4, W, 12):
            ox = 6 if (ty // 8) % 2 else 0
            jit[ty:ty + 8, max(0, tx + ox):max(0, tx + ox + 12)] = r.rand() * .08
    paint(s, YY < HZ, .30 + YY / HZ * .22 + jit + fbm(XX / 5, YY / 5, 77) * .06, TILE)
    for y in range(0, HZ, 8):
        for x in range(W):
            if BAYF[y, x] < .9: s.p[y, x] = (s.p[y, x] * .78).astype(np.uint8)
    for y in range(HZ):
        ox = 6 if (y // 8) % 2 else 0
        for x in range(ox, W, 12): s.p[y, x] = (s.p[y, x] * .82).astype(np.uint8)
    paint(s, YY < 14, .08 + YY / 14 * .2, P('#16171b', '#202228', '#2c2e36', '#3a3c46'))       # ceiling beam
    for y in range(58, 68):                          # the line colour, a red band
        for x in range(W): s.p[y, x] = hx('#b83a34') if y < 66 else hx('#7a2420')
    for x in range(W): s.p[58, x] = hx('#e06a5c')
    for (x0, x1, poster) in [(132, 268, None), (296, 344, 'cordillera'), (60, 0, None)][:2]:
        if poster is None:                               # the station-name panel, blank until the player names it
            for y in range(24, 50):
                for x in range(x0, x1): s.px(x, y, '#e6e8ec' if not (26 <= y < 48 and x0 + 2 <= x < x1 - 2) else ('#1e3c78' if y < 44 else '#16305e'))
            for x in range(x0 + 2, x1 - 2): s.px(x, 26, '#3a5a9a')
        else:                                            # a framed poster: the cordillera at dawn
            for y in range(20, 54):
                for x in range(x0, x1):
                    edge = y in (20, 53) or x in (x0, x1 - 1)
                    t = (y - 20) / 34; col = '#2a2a30' if edge else ('#f0b070' if y < 30 else '#d07a5a' if y < 38 else '#5a4a6a')
                    if not edge and y >= 32 and abs(x - (x0 + 20)) < (y - 30) * 1.4: col = '#3a3450' if y > 36 else '#f4f0f0'
                    s.px(x, y, col)
    m = (((XX - 46) / 32.0) ** 2 + ((YY - 112) / 74.0) ** 2 < 1) & (YY < 112)   # tunnel mouth: depth in rings
    d = np.sqrt(((XX - 46) / 32.0) ** 2 + ((YY - 112) / 74.0) ** 2)
    paint(s, m, .02 + d * .32, P('#040508', '#090b10', '#10131a', '#181c24', '#22262f', '#2e333d'))
    for (lx, ly) in [(38, 98), (54, 98)]:
        for dy in range(3):
            for dx in range(3): s.px(lx + dx, ly + dy, '#fffbe0' if dx == 1 or dy == 1 else '#c8a860')
        light_pool(s, lx + 1, ly + 1, 14, 8, '#ffe8a0', k=.35, mask=m)
    for k, x in enumerate(range(70, W, 64)):              # fluorescent tubes and the light they throw on the tiles
        for i2 in range(34):
            s.px(x + i2, 15, '#ffffff'); s.px(x + i2, 16, '#d8ecf4'); s.px(x + i2, 14, '#5a5e68')
        light_pool(s, x + 17, 20, 48, 46, '#f4fbff', k=.20, mask=(YY < HZ) & (YY > 16))
    pit = (YY >= HZ) & (YY < 138)                         # ballast, sleepers, rails
    paint(s, pit, .08 + (YY - HZ) / 26 * .18 + fbm(XX / 1.6, YY / 1.4, 90) * .22, P('#0c0c0e', '#16161a', '#202026', '#2c2c32', '#3a3a40', '#48484e'))
    for x in range(3, W, 13):
        for y in range(118, 135):
            if y not in (120, 121, 131, 132): s.px(x, y, '#2e2418'); s.px(x + 1, y, '#3e3020'); s.px(x + 2, y, '#241c12')
    for ry in (119, 130):
        for x in range(W): s.px(x, ry - 1, '#d2d6dc'); s.px(x, ry, '#8a9098'); s.px(x, ry + 1, '#3e4248')
    for x in range(W):                                    # the platform lip, tactile strip and yellow line
        s.px(x, 138, '#1a1a1e'); s.px(x, 139, '#c2c4c8'); s.px(x, 140, '#9a9ca2')
        for y in (141, 142, 143): s.px(x, y, '#e8bc1c' if y < 143 else '#a68410')
        if x % 3 == 0: s.px(x, 145, '#d8d8dc')
    FLOOR = P('#2c2c32', '#38383f', '#45454d', '#53535c', '#63636c', '#75757e', '#8a8a92')
    ground(s, 146, FLOOR, base=.32, pool=.55, cy=178, tex=.08)
    for y in range(146, H, 14):                           # granite tile joints, in perspective
        for x in range(W): s.p[y, x] = (s.p[y, x] * .8).astype(np.uint8)
    for x0 in range(-200, W + 200, 40):
        for y in range(146, H):
            x = int(W / 2 + (x0 - W / 2) * (1 + (y - 146) / 60))
            if 0 <= x < W: s.p[y, x] = (s.p[y, x] * .82).astype(np.uint8)
    for k, x in enumerate(range(70, W, 64)):              # the tubes reflected softly in the polished floor
        light_pool(s, x + 17, 160, 26, 10, '#c8ccd6', k=.22, mask=YY > 146)
    for cx in (338,):                                     # a round pillar framing the right side
        for y in range(0, 200):
            for x in range(cx, cx + 22):
                t = (x - cx) / 21; v = .15 + .75 * math.sin(math.pi * (t * .8 + .1)) ** 2 * (1 - t * .5)
                s.px(x, y, s.ramp_at(x, y, P('#2c2e34', '#3e4048', '#52545c', '#686a72', '#80828a', '#9a9ca2'), v))
        light_pool(s, cx + 11, 206, 26, 6, '#000000', k=.5)
    vignette(s, .45)
    return s, {'hz': HZ}

def feria():   # Santiago: the street market under striped tarps, late afternoon
    s = Pic(); HZ = 96
    sky(s, HZ, P('#4a78b8', '#5a8cc8', '#6ea0d4', '#86b4de', '#a2c6e6', '#c2daee', '#e2ecf4'), sun=(330, 40, 90), warm='#ffe0a8')
    clouds(s, [(90, 30, 70, 10, 3), (250, 20, 60, 8, 4)], CLOUD, HZ)
    r = np.random.RandomState(8); x = -6
    FAC = [P('#7a5a4a', '#94705c', '#ae8870', '#c6a084', '#dab898'), P('#5a6a7a', '#6e8090', '#8498a8', '#9cb0be', '#b8c8d4'), P('#7a6a4a', '#94845c', '#ae9c70', '#c6b484', '#dacb9c')]
    while x < W:                                       # low houses and shops behind the market
        bw = r.randint(40, 70); bh = r.randint(28, 46); ramp = FAC[r.randint(0, 3)]
        m = (XX >= x) & (XX < x + bw) & (YY >= HZ - bh) & (YY < HZ + 6)
        paint(s, m, .35 + (XX - x) / bw * .3, ramp)
        for wy in range(HZ - bh + 6, HZ - 2, 12):
            for wx in range(x + 5, x + bw - 8, 12):
                for dy in range(7):
                    for dx in range(6): s.px(wx + dx, wy + dy, '#2a3442' if dy < 6 else '#8a7a6a')
                s.px(wx + 1, wy + 1, '#7a92aa')
        x += bw + r.randint(0, 4)
    paint(s, (YY >= HZ) & (YY < 132), .25 + fbm(XX / 4, YY / 3, 41) * .25 + (YY - HZ) / 40 * .1, P('#2a201a', '#3a2c22', '#4c3a2c', '#5e4a38', '#725c46'))   # the shaded stalls behind
    for x in range(0, W, 9):
        for y in range(HZ + 4, 112):
            if (x // 9) % 3 == 0: s.px(x, y, '#6a5440') if y % 4 else None                 # sacks and boxes stacked in the back
    TARPS = [('#c83a30', '#f2ece0'), ('#2e64b0', '#eef2f6'), ('#3a9a58', '#eef4ec'), ('#e0a030', '#fff4dc'), ('#c83a30', '#f2ece0')]
    for k, (cx, w0) in enumerate([(40, 90), (128, 86), (212, 92), (300, 88), (384, 80)]):   # striped tarps sagging between poles
        c1, c2 = TARPS[k]
        for x in range(cx - w0 // 2, cx + w0 // 2):
            if not 0 <= x < W: continue
            t = (x - (cx - w0 // 2)) / w0; sag = int(math.sin(math.pi * t) * 6)
            for y in range(70 + sag, 86 + sag):
                col = hx(c1) if ((x - cx) // 6) % 2 == 0 else hx(c2)
                sh = .62 + .38 * (1 - (y - 70 - sag) / 16)
                s.p[y, x] = (np.array(col) * sh).astype(np.uint8); s.a[y, x] = True
            for y in range(86 + sag, 89 + sag): s.p[y, x] = (np.array(hx(c1)) * .45).astype(np.uint8)      # scalloped hem shadow
        for px_ in (cx - w0 // 2 + 2, cx + w0 // 2 - 2):
            for y in range(66, 132): s.px(px_, y, '#3a3a40'); s.px(px_ + 1, y, '#5a5a62')
    for y in range(89, 132): s.p[y] = (s.p[y] * .86).astype(np.uint8)                   # shade under the tarps
    for k, cx in enumerate([40, 128, 212, 300, 384]):    # tables of produce
        for y in range(112, 126):
            for x in range(cx - 34, cx + 34):
                if 0 <= x < W: s.px(x, y, '#6a4628' if y > 113 else '#8a5e36')
        for j, (col, hi) in enumerate([('#c22a1e', '#ff7a5a'), ('#e8c020', '#fff08a'), ('#2e5a24', '#6aa04a'), ('#e0701e', '#ffb060'), ('#6a2a5a', '#b06aa0')]):
            bx = cx - 30 + j * 13
            if not 0 <= bx < W - 12: continue
            for (dx, dy) in [(1, 0), (4, 0), (7, 0), (10, 0), (2, -2), (5, -2), (8, -2), (4, -4), (7, -4)]:
                pc = (k + j) % 5; c0, ch = [('#c22a1e', '#ff7a5a'), ('#e8c020', '#fff08a'), ('#2e5a24', '#6aa04a'), ('#e0701e', '#ffb060'), ('#6a2a5a', '#b06aa0')][pc]
                for (a, b) in [(0, 0), (1, 0), (0, 1), (1, 1), (2, 0), (2, 1)]: s.px(bx + dx + a, 109 + dy + b, c0)
                s.px(bx + dx, 109 + dy, ch)
            for y in range(102, 107):                     # a price card
                for x in range(bx + 2, bx + 9): s.px(x, y, '#f4f0e4' if y > 102 else '#2a2a2a')
    ground(s, 132, P('#3a3634', '#4a4542', '#5a5450', '#6c6560', '#7e7670', '#928a82'), base=.36, pool=.55, cy=170, tex=.18)
    for k in range(30):                                 # leaves and dropped fruit on the asphalt
        x, y = r.randint(0, W), r.randint(136, H - 4); col = ['#3a7a2a', '#c23a24', '#d8b030', '#7a5a3a'][k % 4]
        s.px(x, y, col); s.px(x + 1, y, col)
    for (cx, cy) in [(26, 200), (372, 196)]:              # crates framing the front
        for y in range(cy - 22, cy + 2):
            for x in range(cx - 16, cx + 16):
                if 0 <= x < W: s.px(x, y, '#8a6438' if (y - cy) % 6 else '#5a3e20')
        for x in range(cx - 16, cx + 16):
            for y in range(cy - 26, cy - 22):
                if 0 <= x < W: s.px(x, y, ['#c22a1e', '#e8c020', '#3a7a2a'][(x // 3) % 3] if y > cy - 26 else '#2a1a10')
    light_pool(s, 210, 150, 170, 40, '#ffe8b8', k=.12)
    vignette(s, .35)
    return s, {'hz': HZ}

def blocks():   # Santiago: the apartment blocks at dusk, the cordillera behind, washing on the lines
    s = Pic(); HZ = 104
    sky(s, HZ, P('#1c1834', '#2a1e44', '#3e2650', '#5c3054', '#84405a', '#b45a5a', '#e08a5a', '#f6b86c'), sun=(200, 108, 120), warm='#ffc070')
    def ridge2(x): return 86 - 18 * math.exp(-((x - 120) / 70.0) ** 2) - 24 * math.exp(-((x - 290) / 60.0) ** 2) + 3 * math.sin(x / 9.0) + 2 * math.sin(x / 4.1)
    for x in range(W):                                  # the Andes, snow catching the last light
        top = int(ridge2(x))
        for y in range(top, HZ):
            t = (y - top) / max(1, HZ - top)
            col = '#f4c8b0' if y - top < 4 and top < 70 else ('#5a3a5a' if t < .4 else '#3e2a48')
            if y - top < 4 and top < 70 and BAYF[y, x] > .7: col = '#c08a8a'
            s.px(x, y, col)
    r2 = np.random.RandomState(12); x = 100
    while x < 290:                                       # far blocks between the two near ones
        bw = r2.randint(30, 50); bh = r2.randint(20, 40)
        m = (XX >= x) & (XX < x + bw) & (YY >= HZ + 8 - bh) & (YY < 152)
        paint(s, m, .2 + (XX - x) / bw * .2, P('#1c1828', '#26203a', '#30284a', '#3a3258'))
        for wy in range(HZ + 12 - bh, 146, 8):
            for wx in range(x + 3, x + bw - 4, 7):
                if r2.rand() < .3: s.px(wx, wy, '#f0c878'); s.px(wx + 1, wy, '#f0c878')
        x += bw + r2.randint(0, 3)
    paint(s, (YY >= HZ) & (YY < 152) & ~s.a, .2 + (YY - HZ) / 48 * .3, P('#1c1828', '#241e32', '#2c243a', '#342a40'))
    BLK = [P('#3a2a2a', '#5a3e3a', '#7a564c', '#9a7060', '#b88a74', '#d0a488'), P('#2e2e3a', '#46465a', '#5e5e76', '#787892', '#9494ac', '#b0b0c4')]
    for k, (x0, w0, h0) in enumerate([(-10, 130, 84), (270, 140, 92)]):     # two blocks, four floors each
        ramp = BLK[k]; top = 150 - h0
        m = (XX >= x0) & (XX < x0 + w0) & (YY >= top) & (YY < 150)
        paint(s, m, .3 + ((XX - x0) / w0) * (.35 if k else -.15) + .25 * (k == 0) + fbm(XX / 3, YY / 3, 11 + k) * .08, ramp)
        for fl in range(4):
            fy = top + 6 + fl * (h0 // 4)
            for wx in range(x0 + 8, x0 + w0 - 12, 22):
                lit = r_ = (fl * 7 + wx) % 5 < 2
                for dy in range(10):
                    for dx in range(12): s.px(wx + dx, fy + dy, ('#f8d27a' if dy < 9 else '#a07a3a') if lit else ('#1e2030' if dy < 9 else '#4a4a5a'))
                if lit: light_pool(s, wx + 6, fy + 14, 12, 5, '#ffd27a', k=.25)
                for dx in range(-2, 16): s.px(wx + dx, fy + 11, '#2a2a30'); s.px(wx + dx, fy + 13, '#2a2a30') if dx % 3 == 0 else None   # balcony rail
            for x in range(x0, x0 + w0): s.px(x, fy + 15, '#2a2028')
    for (y0, x0, x1) in [(82, 120, 270), (100, 120, 270)]:  # washing lines strung between the blocks
        for x in range(x0, x1):
            y = y0 + int(math.sin(math.pi * (x - x0) / (x1 - x0)) * 6); s.px(x, y, '#1a1418')
            if (x - x0) % 14 == 3:
                col = ['#d83a3a', '#3a7ad8', '#f0f0e8', '#e8c030', '#3aa05a'][(x // 14) % 5]
                for dy in range(1, 9 + (x % 3) * 2):
                    for dx in range(6): s.px(x + dx, y + dy, col if dx < 5 else '#2a2028')
    ground(s, 150, P('#2a2418', '#3a3020', '#4a3e2a', '#5c4e36', '#6e5e44', '#827054'), base=.3, pool=.5, cy=180, tex=.25)
    for k in range(60):                                  # patchy grass
        x = (k * 67) % W; y = 156 + (k * 31) % 60
        for i2 in range(3): s.px(x + i2, y, '#3a5a2a'); s.px(x + i2 + 1, y - 1, '#5a7a3a') if i2 == 1 else None
    for lx in (96, 318):                                 # lampposts lighting the courtyard
        for y in range(70, 158): s.px(lx, y, '#1e1e24'); s.px(lx + 1, y, '#3a3a44')
        for dy in range(4):
            for dx in range(7): s.px(lx - 3 + dx, 66 + dy, '#fff0b8' if dy > 0 else '#2a2a30')
        light_pool(s, lx, 170, 60, 26, '#ffd890', k=.25)
    vignette(s, .4)
    return s, {'hz': HZ}

ALL = [('field', field), ('forest', forest), ('mount', mount), ('crater', crater), ('rainforest', rainforest), ('fjord', fjord),
       ('pampa', pampa), ('lagoon', lagoon), ('deep', deep), ('cave', cave), ('cave3', cave3), ('cave4', cave4), ('cave5', cave5), ('waria', waria), ('metro', metro), ('feria', feria), ('blocks', blocks)]
