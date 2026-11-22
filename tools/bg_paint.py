"""Hand-built battle backdrops in the style of 16-bit RPG battle scenes: a fixed pixel grid, curated
palette, ordered dithering for every gradient, a perspective ground the fighters stand on, and framing
foreground pieces. Painted at 400x224 (the widest screen); the game crops the middle for narrower ones.
Output: src/paintbg.js (PNG data URLs + a little geometry for the animation layer)."""
import numpy as np, base64, io, json, os, math
from PIL import Image

W, H = 400, 224
B4 = (np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) + .5) / 16
def hx(s): s = s.lstrip('#'); return np.array([int(s[i:i + 2], 16) for i in (0, 2, 4)], np.uint8)
def bay(x, y): return B4[y & 3, x & 3]

class Pic:
    def __init__(s): s.p = np.zeros((H, W, 3), np.uint8); s.a = np.zeros((H, W), bool)
    def px(s, x, y, c):
        x, y = int(x), int(y)
        if 0 <= x < W and 0 <= y < H: s.p[y, x] = hx(c) if isinstance(c, str) else c; s.a[y, x] = True
    def ramp_at(s, x, y, ramp, t):
        """pick a colour from a ramp at position t (0..1) with ordered dithering between neighbours"""
        t = min(.9999, max(0, t)) * (len(ramp) - 1); i = int(t); f = t - i
        return ramp[min(len(ramp) - 1, i + (1 if f > bay(x, y) else 0))]

def P(*c): return [hx(x) for x in c]

SKY = P('#1c2f6e', '#25408a', '#3156a3', '#4470b8', '#5e8cca', '#7ea8d8', '#a3c4e4', '#c6dcef', '#e2ecf4')
CLOUD = P('#7f96bc', '#a7b9d6', '#c9d6ea', '#e6edf7', '#ffffff')
MNT = P('#3e5384', '#4a6194', '#566fa4', '#6680b4', '#7c96c6', '#98b0d6')
SNOW = P('#a9bbd8', '#cad8ec', '#eef4fb')
SEA = P('#1f4f8c', '#245c98', '#2a69a4', '#3077b0', '#3887bc', '#4398c8', '#58aad2')
CREST = P('#7cc0e2', '#a8daf0', '#e6f6ff')
FOAM = P('#9cc8de', '#c8e4f0', '#eef9ff', '#ffffff')
WET = P('#6e5f48', '#7d6c52', '#8f7c5e', '#a1906e', '#b4a684')
SAND = P('#8f7350', '#a2845a', '#b69766', '#c8a973', '#d6b882', '#e3c896', '#eed8ae', '#f6e7c8')
ROCK = P('#141219', '#221f2a', '#322e3c', '#46414f', '#5c5666', '#78717f', '#948c98')
KELP = P('#2a2410', '#40381a', '#5a4e22', '#76662c', '#94823a')
WOOD = P('#2e2118', '#4a3424', '#684a32', '#8a6644', '#ac865c', '#cbaa80')

def coast():
    s = Pic(); rnd = np.random.RandomState(7)
    HZ = 76   # sea horizon
    # ---- sky: dithered bands, warmer and paler toward the horizon on the right (afternoon sun)
    for y in range(HZ):
        for x in range(W):
            t = (y / HZ) ** 1.15 * .92 + (x / W) * .06 * (y / HZ)
            s.px(x, y, s.ramp_at(x, y, SKY, t))
    # sun glow low on the right, banded
    sx, sy = 292, 70
    for y in range(20, HZ):
        for x in range(220, W):
            d = math.hypot((x - sx) * .55, y - sy)
            if d < 52:
                lvl = int((1 - d / 52) * 4 + bay(x, y))
                if lvl > 0: s.p[y, x] = (s.p[y, x] * (1 - .13 * lvl) + hx('#ffeec4') * .13 * lvl).astype(np.uint8)
    # ---- clouds: flat-bottomed cumulus, lit from the right-top, three tones + rim
    def cloud(cx, cy, w, h, seed):
        r = np.random.RandomState(seed); lobes = [(cx + r.randint(-w // 2, w // 2), cy - r.randint(0, h), r.randint(h, h * 2)) for _ in range(6)]
        lobes += [(cx - w // 2 + 6, cy - 2, h), (cx + w // 2 - 6, cy - 2, h)]
        for y in range(cy - h * 3, cy + 2):
            for x in range(cx - w, cx + w):
                if y > cy + 1: continue
                inside = [(x - lx_) ** 2 / (lr * 1.35) ** 2 + (y - ly) ** 2 / lr ** 2 for lx_, ly, lr in lobes]
                m = min(inside)
                if m <= 1:
                    # light from upper right
                    lx_, ly, lr = lobes[int(np.argmin(inside))]
                    nx, ny = (x - lx_) / (lr * 1.35), (y - ly) / lr
                    lit = .55 + .45 * (nx * .6 - ny * .8)
                    if y >= cy - 1: lit -= .45
                    if m > .82: lit += .15
                    s.px(x, y, s.ramp_at(x, y, CLOUD, lit))
    for cx, cy, w, h, sd in [(60, 30, 34, 7, 1), (150, 18, 22, 5, 2), (236, 36, 30, 6, 3), (352, 24, 26, 6, 4), (110, 56, 16, 3, 5), (290, 58, 14, 3, 6)]:
        cloud(cx, cy, w, h, sd)
    # ---- two coastal ranges: a pale far one in haze, a nearer darker one, and a snow-capped volcano
    def ridge(seed, base, amp, x):
        r = np.random.RandomState(seed); ph = r.rand(4) * 6
        return base - amp * (abs(math.sin(x / 41 + ph[0])) * .6 + abs(math.sin(x / 17 + ph[1])) * .3 + abs(math.sin(x / 7 + ph[2])) * .1)
    for layer, (seed, base, amp, lo, hi) in enumerate([(3, 70, 20, .55, .95), (5, 76, 13, .15, .6)]):
        prof = [ridge(seed, base, amp, x) for x in range(W)]
        if layer == 0:
            prof = [min(p, 30 + abs(x - 150) * .58) if 98 < x < 208 else p for x, p in enumerate(prof)]
        for x in range(W):
            top = int(prof[x]); sl = prof[min(W - 1, x + 4)] - prof[max(0, x - 4)]   # >0: slope faces right (lit)
            for y in range(top, HZ):
                t = (y - top) / max(1, HZ - top)
                lit = lo + (hi - lo) * (.55 + max(-.3, min(.35, sl * .05)) - t * .45)
                c = s.ramp_at(x, y, MNT, lit)
                if layer == 0 and 98 < x < 208 and y - top < 10 - abs(x - 150) * .09 and y < 50:
                    c = s.ramp_at(x, y, SNOW, .95 - (y - top) / 10 + (.25 if sl > 0 else -.1))
                if layer == 0 and t > .6 and bay(x, y) < (t - .6) * .5: c = SKY[7]          # haze at the foot of the far range
                s.px(x, y, c)
            s.px(x, top, MNT[5] if sl > 0 else MNT[2] if layer else MNT[4])
    # ---- sea: perspective rows, crests spaced wider toward the shore
    SH = 112
    for y in range(HZ, SH):
        t = (y - HZ) / (SH - HZ)
        for x in range(W):
            c = s.ramp_at(x, y, SEA, .15 + t * .8)
            s.px(x, y, c)
    s.p[HZ, :] = hx('#9cc4e4')   # bright horizon line
    k = 0; y = HZ + 2.0
    while y < SH - 6:
        gap = 2 + k * .9; k += 1; yi = int(y)
        x = rnd.randint(0, 12)
        while x < W:
            L = rnd.randint(3, 8 + k * 2)
            for i in range(L):
                if x + i < W: s.px(x + i, yi, CREST[0] if k < 3 else CREST[min(2, 1 + (i % 4 == 0))])
            if k > 2 and rnd.rand() < .6:
                for i in range(L - 1): s.px(x + i, yi + 1, SEA[1])          # shadow under each crest
            x += L + rnd.randint(4, 18)
        y += gap
    # sun path: broken glints under the sun
    for y in range(HZ + 1, SH - 4):
        spread = 6 + (y - HZ) * 1.4
        for x in range(int(sx - spread), int(sx + spread)):
            if (x + y * 3) % 5 == 0 and rnd.rand() < .5 * (1 - abs(x - sx) / spread):
                for i in range(rnd.randint(2, 5)): s.px(x + i, y, CREST[2] if i % 2 else '#fff4d8')
    # sea stack (a rock island) mid-distance on the left
    for y in range(78, 104):
        w2 = 5 + (y - 78) * .55 + (2 if y > 96 else 0)
        for x in range(int(250 - w2 * .6), int(250 + w2)):
            lit = .2 + (x - 244) / 24 + rnd.rand() * .1
            s.px(x, y, s.ramp_at(x, y, ROCK, min(.8, lit)))
        if y > 98:
            for x in range(int(250 - w2 * .6) - 2, int(250 + w2) + 3, 2): s.px(x, y + 1, FOAM[2])
    for x, y in [(247, 77), (249, 76), (250, 76), (252, 77)]: s.px(x, y, ROCK[4])
    # ---- shore break: two foam lines, irregular
    for x in range(W):
        f1 = SH - 2 + int(2 * math.sin(x / 9.0) + 1.5 * math.sin(x / 3.7 + 1))
        for y in range(f1 - 2, f1 + 3): s.px(x, y, FOAM[min(3, max(0, 3 - abs(y - f1)))])
        if rnd.rand() < .5: s.px(x, f1 - 3, FOAM[1])
    # ---- wet sand: darker, mirrors the sky in streaks
    WS = 122
    for y in range(SH - 1, WS):
        for x in range(W):
            t = (y - SH) / (WS - SH)
            c = s.ramp_at(x, y, WET, .85 - t * .5)
            if (x + y * 7) % 23 < 6 and rnd.rand() < .5: c = hx('#9fb0bc')
            s.px(x, y, c)
    for x in range(W):   # a thin lace of foam left on the wet sand
        if math.sin(x / 6.0) + math.sin(x / 2.3) > .9: s.px(x, SH + 4 + int(math.sin(x / 11.0) * 1.5), FOAM[1])
    # ---- the beach floor in perspective: ripple rows widening toward the viewer, a light pool where the fighters stand
    for y in range(WS, H):
        for x in range(W):
            depth = (y - WS) / (H - WS)
            # light pool centred on the fighting ground, darker toward the edges and the bottom corners
            pool = math.exp(-(((x - W * .52) / (W * .42)) ** 2 + ((y - 140) / 46) ** 2))
            t = .32 + pool * .55 - depth * .12
            s.px(x, y, s.ramp_at(x, y, SAND, t))
    # ripples: curved rows, spacing grows with depth
    yy = WS + 3.0; k = 0
    while yy < H:
        gap = 3 + k * 1.15; k += 1
        for x in range(W):
            y = int(yy + 2.2 * math.sin(x / (22 + k * 4) + k * 1.7) + (x - W / 2) ** 2 / 9000)
            if WS < y < H - 1 and math.sin(x / 5.0 + k) > -.55:
                base = s.p[y, x].astype(int)
                s.p[y, x] = np.clip(base - 26, 0, 255).astype(np.uint8)          # shadow side
                s.p[y - 1, x] = np.clip(s.p[y - 1, x].astype(int) + 16, 0, 255).astype(np.uint8)   # lit crest
        yy += gap
    # shells and pebbles, a few
    for _ in range(26):
        x, y = rnd.randint(0, W), rnd.randint(WS + 6, H - 4)
        if rnd.rand() < .5: s.px(x, y, SAND[7]); s.px(x + 1, y, SAND[6]); s.px(x, y + 1, SAND[2])
        else: s.px(x, y, ROCK[3]); s.px(x + 1, y, ROCK[2]); s.px(x, y - 1, ROCK[5])
    # ---- foreground framing: basalt rocks with cochayuyo on the left, driftwood and rocks on the right
    def boulder(cx, cy, rx, ry, seed):
        r = np.random.RandomState(seed)
        for y in range(int(cy - ry), int(cy + ry)):
            for x in range(int(cx - rx), int(cx + rx)):
                nx, ny = (x - cx) / rx, (y - cy) / ry
                wob = .12 * math.sin(math.atan2(ny, nx) * 5 + seed)
                if nx * nx + ny * ny <= (1 + wob) ** 2 and y < H:
                    lit = .55 + nx * .35 - ny * .45 + r.rand() * .08
                    if nx * nx + ny * ny > (.86 + wob) ** 2 and ny < 0: lit += .2
                    s.px(x, y, s.ramp_at(x, y, ROCK, lit))
        for x in range(int(cx - rx * .9), int(cx + rx * .9)):   # contact shadow
            s.px(x, int(cy + ry) - 1, ROCK[0])
    for cx, cy, rx, ry, sd in [(60, 210, 40, 26, 11), (100, 218, 26, 16, 12), (130, 222, 12, 7, 13), (352, 210, 36, 24, 14), (322, 220, 18, 10, 15)]:
        boulder(cx, cy, rx, ry, sd)
    # cochayuyo strands draped over the left rocks
    for k in range(9):
        x0 = 34 + k * 6; y0 = 186 + (k % 3) * 4
        for i in range(26):
            x = x0 + int(4 * math.sin(i / 5 + k)); y = y0 + i
            s.px(x, y, KELP[2 + (i % 3 == 0)]); s.px(x + 1, y, KELP[1])
    # driftwood log, lit from the right
    for x in range(236, 318):
        t = (x - 236) / 82; yc = 198 + int(6 * t) + int(1.5 * math.sin(x / 7))
        for d in range(-5, 6):
            s.px(x, yc + d, s.ramp_at(x, yc + d, WOOD, .58 - d * .075 + (.06 if (x // 6) % 2 else 0) - (.25 if abs(d) == 5 else 0)))
        s.px(x, yc + 6, ROCK[0]); s.px(x, yc + 7, SAND[1])
    for d in range(-5, 6):   # sawn end of the log, rings showing
        for e in range(-5, 6):
            if d * d + e * e <= 25: s.px(318 + e // 2, 204 + d, WOOD[5] if (d * d + e * e) % 9 < 3 else WOOD[4])
    for x in range(240, 316, 11): s.px(x, 198 + int(6 * (x - 236) / 82), WOOD[0])   # grain knots
    return s, {'hz': HZ, 'sh': SH, 'ws': WS, 'sun': [sx, sy]}

def encode(s):
    img = Image.fromarray(s.p, 'RGB').quantize(colors=96, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    b = io.BytesIO(); img.save(b, 'PNG', optimize=True); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()

if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    out = {}
    for name, fn in [('coast', coast)]:
        s, geo = fn(); out[name] = {'src': encode(s), 'geo': geo}
        Image.fromarray(s.p).resize((W * 3, H * 3), Image.NEAREST).save('/home/claude/bg_%s.png' % name)
    open(os.path.join(here, '..', 'src', 'paintbg.js'), 'w').write('/* generated by tools/bg_paint.py: hand-built battle backdrops */\nconst PAINTBG=' + json.dumps(out) + ';\n')
    print({k: len(v['src']) for k, v in out.items()})
