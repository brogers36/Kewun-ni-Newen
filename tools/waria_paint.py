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

# ------------------------------------------------------------------ ngoyngoyün: the tower of noise
def ngoyngoyun(f):
    setsize(96, 112); c = Canvas()
    # a crowd of shadow heads at its base, all talking at once
    for k, x in enumerate(range(8, 92, 11)):
        blob(c, R['case'], lambda d, x=x, k=k: d.ellipse([x - 7, 92 - (k % 2) * 3, x + 7, 110], fill=1), bulge=0.8, lift=-0.1, name='crowd')
        c.px(x - 3, 99 - (k % 2) * 3, (200, 60, 50) if (k + f) % 2 else R['case'][0])
    # stacked boxes: speakers and old televisions
    boxes = [((22, 62, 74, 92), 'spk'), ((26, 36, 68, 64), 'tv'), ((30, 14, 64, 38), 'spk')]
    for (b, kind) in boxes:
        blob(c, R['case'], lambda d, b=b: d.rounded_rectangle(b, 3, fill=1), bulge=0.9, lift=0.12, name='box')
        x0, y0, x1, y1 = b; cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
        if kind == 'spk':
            rr = min(x1 - x0, y1 - y0) // 2 - 4
            blob(c, R['tin'], lambda d, cx=cx, cy=cy, rr=rr: d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=1), bulge=0.7, lift=-0.05, name='cone')
            blob(c, R['bell'], lambda d, cx=cx, cy=cy, rr=rr: d.ellipse([cx - rr // 2, cy - rr // 3, cx + rr // 2, cy + rr // 3 + 2 * f], fill=1), bulge=0.5, lift=-0.1, name='mouth')
            for x in range(cx - rr // 2 + 2, cx + rr // 2 - 1, 3): c.px(x, cy - rr // 3 + 1, (236, 230, 214))
        else:
            blob(c, R['screen'], lambda d: d.rectangle([x0 + 5, y0 + 5, x1 - 9, y1 - 5], fill=1), bulge=0.4, lift=0.1, name='scr')
            rs = np.random.RandomState(7 + f)
            for _ in range(140):                                                              # static
                x, y = rs.randint(x0 + 6, x1 - 9), rs.randint(y0 + 6, y1 - 5)
                c.px(x, y, R['screen'][rs.randint(2, 7)])
            for y in range(y0 + 8, y1 - 6, 4):
                for x in range(x0 + 6, x1 - 9): c.px(x, y, R['screen'][1]) if (x + y + f) % 7 == 0 else None
            for (x, y) in [(x1 - 6, y0 + 9), (x1 - 6, y0 + 15)]: c.rect(x, y, 3, 3, R['tin'][5])      # knobs
            for x in range(cx - 10, cx + 6): c.px(x, y1 - 9, (40, 10, 10)); c.px(x, y1 - 10, (200, 60, 50) if 12 < x - cx + 10 < 15 else R['screen'][2])
    # the top: a big horn head, two red eyes in the dark
    blob(c, R['tin'], lambda d: d.polygon([(64, 4), (64, 22), (44, 26), (28, 32), (26, 0), (44, 2)], fill=1), bulge=1.0, lift=0.15, name='horn')
    blob(c, R['bell'], lambda d: d.ellipse([24, 0, 34, 32], fill=1), bulge=0.6, lift=-0.1, name='mouth')
    for y in (10, 20): c.rect(31, y, 2, 2, (255, 200, 90))
    # cable arms ending in megaphones, one toward the hero, one raised
    taper(c, [(24, 70), (12, 64), (8, 52)], 5, 4, R['case'], lift=0.15, name='arm', bulge=1.0)
    blob(c, R['tin'], lambda d: d.polygon([(10, 52), (0, 42 - f), (0, 58 + f), (10, 56)], fill=1), bulge=1.0, lift=0.2, name='mega')
    taper(c, [(74, 70), (86, 58), (88, 44)], 5, 4, R['case'], lift=-0.05, name='arm', bulge=1.0)
    blob(c, R['tin'], lambda d: d.polygon([(86, 44), (80, 32 - f), (96, 32 - f), (90, 44)], fill=1), bulge=1.0, lift=0.0, name='mega')
    arcs(c, 0, 50, [5 + 3 * f, 10 + 3 * f], math.pi * .6, math.pi * 1.4, (250, 220, 120))
    arcs(c, 88, 28, [5 + 3 * f, 10 + 3 * f], math.pi * 1.1, math.pi * 1.9, (250, 220, 120))
    arcs(c, 22, 16, [6 + 3 * f, 12 + 3 * f], math.pi * .7, math.pi * 1.3, (250, 220, 120))
    return finish(c, [('box', 'box'), ('cone', 'box'), ('scr', 'box'), ('mouth', 'cone'), ('horn', 'mouth'), ('arm', 'box'), ('mega', 'arm'), ('crowd', 'crowd'), ('horn', 'box')],
                  rim=(255, 200, 120), rimparts=('box', 'horn', 'mega'))

# ------------------------------------------------------------------ ngamleftripael: the one who scatters
def ngamlef(f):
    setsize(96, 112); c = Canvas()
    d0 = 2 + f * 2   # how far the pieces have drifted apart
    # four pieces of a long coat pulling away from each other, each crossed by a coloured line
    pieces = [  # polygon, drift dx, dy
        ([(48, 30), (30, 34), (22, 60), (40, 62), (48, 46)], -d0, -1),
        ([(50, 30), (68, 34), (74, 60), (56, 62), (50, 46)], d0, -1),
        ([(40, 64), (22, 64), (16, 106), (40, 106)], -d0 - 2, 2),
        ([(56, 64), (76, 64), (82, 106), (56, 106)], d0 + 2, 2)]
    for i, (poly, dx, dy) in enumerate(pieces):
        pl = [(x + dx, y + dy) for (x, y) in poly]
        m = blob(c, R['coat'], lambda d, pl=pl: d.polygon(pl, fill=1), bulge=0.9, lift=0.12 - i * 0.04, name='coat%d' % i)
        col = LINES[i]; ys = [y for _, y in pl]; y0 = (min(ys) + max(ys)) // 2
        for x in range(0, 96):
            y = y0 + int(round(math.sin(x / 9 + i) * 3))
            if 0 <= y < 111 and c.part[y, x] == 'coat%d' % i:
                c.px(x, y, col); c.px(x, y + 1, tuple(int(v * .6) for v in col))
        for k in range(2):                                                                     # stations: white dots on the line
            x = min(xx for xx, _ in pl) + 6 + k * 10; y = y0 + int(round(math.sin(x / 9 + i) * 3))
            if c.part[y, x] == 'coat%d' % i: c.rect(x - 1, y - 1, 3, 3, (250, 250, 250)); c.px(x, y, col)
    # the head: an empty hood with a map of dots for a face
    blob(c, R['coat'], lambda d: d.ellipse([34, 4, 62, 34], fill=1), bulge=1.0, lift=0.12, name='hood')
    blob(c, R['coat'][:3], lambda d: d.ellipse([38, 10, 58, 32], fill=1), bulge=0.5, lift=0.0, name='void')
    for (x, y, k) in [(42, 18, 0), (52, 17, 3), (47, 25, 1), (44, 28, 2)]:
        c.rect(x, y, 2, 2, LINES[k]); c.px(x, y, (255, 255, 255))
    for (x0, y0), (x1, y1) in [((43, 19), (47, 25)), ((53, 18), (47, 25)), ((47, 26), (45, 28))]:
        for t in np.linspace(0, 1, 8): c.px(int(x0 + (x1 - x0) * t), int(y0 + (y1 - y0) * t), (120, 130, 150))
    # two arms pulling in opposite directions, hands open
    taper(c, [(30, 38), (14, 40), (4, 34)], 6, 5, R['coat'], lift=0.18, name='arm', bulge=1.0)
    blob(c, R['grey'], lambda d: d.ellipse([0, 28, 8, 38], fill=1), bulge=1.1, lift=0.25, name='hand')
    taper(c, [(66, 38), (82, 40), (92, 34)], 6, 5, R['coat'], lift=-0.02, name='arm', bulge=1.0)
    blob(c, R['grey'], lambda d: d.ellipse([88, 28, 96, 38], fill=1), bulge=1.1, lift=0.0, name='hand')
    # loose threads between the pieces, stretched thin
    for (x0, y0, x1, y1) in [(40 - d0, 50, 56 + d0, 50), (40 - d0 - 2, 70, 56 + d0 + 2, 70), (30 - d0, 62, 30 - d0 - 2, 66)]:
        for t in np.linspace(0, 1, 24):
            if int(t * 24) % 3: c.px(int(x0 + (x1 - x0) * t), int(y0 + (y1 - y0) * t + math.sin(t * 6) * 1), (150, 160, 180))
    return finish(c, [('hood', 'void'), ('arm', 'hand'), ('coat0', 'coat1'), ('coat2', 'coat3'), ('hood', 'coat0'), ('hood', 'coat1')],
                  rim=(150, 190, 255), rimparts=('coat1', 'coat3', 'hood', 'arm'))

# ------------------------------------------------------------------ mapudungukenoael fillantü: the everyday silence
def fillantu(f):
    setsize(96, 112); c = Canvas()
    # calendar pages drifting round it, each day crossed out
    for k, (x, y) in enumerate([(4, 14), (78, 8), (2, 60), (82, 52), (70, 88)]):
        y += (f * 2 if k % 2 else -f * 2)
        blob(c, R['paper'], lambda d, x=x, y=y: d.rectangle([x, y, x + 12, y + 14], fill=1), bulge=0.4, lift=0.2, name='page')
        c.rect(x + 1, y + 1, 11, 3, (200, 60, 50))
        for gy in range(y + 6, y + 13, 3):
            for gx in range(x + 2, x + 11, 3): c.px(gx, gy, (70, 66, 60)); c.px(gx + 1, gy + 1, (180, 50, 40))
    # a heavy, slumped body, sinking into itself
    blob(c, R['grey'], lambda d: d.polygon([(20, 50), (76, 50), (90, 84), (84, 108), (12, 108), (6, 84)], fill=1), bulge=1.0, lift=0.08, name='body')
    for (x0, x1) in [(30, 24), (48, 48), (66, 72)]:                                         # heavy folds
        for y in range(62, 106):
            t = (y - 62) / 44; x = int(round(x0 + (x1 - x0) * t))
            if c.part[y, x] == 'body': c.px(x, y, R['grey'][1]); c.px(x - 1, y, R['grey'][4] if y % 3 else R['grey'][3])
    blob(c, R['grey'], lambda d: d.ellipse([22, 16, 74, 64], fill=1), bulge=1.1, lift=0.14, name='head')
    # heavy-lidded eyes, half closed, lit by a screen glow from below-left
    for ex in (34, 56):
        blob(c, R['screen'], lambda d, ex=ex: d.ellipse([ex - 5, 32, ex + 5, 40], fill=1), bulge=0.5, lift=0.1, name='eye')
        blob(c, R['grey'], lambda d, ex=ex: d.ellipse([ex - 6, 28 - f, ex + 6, 36 - f], fill=1), bulge=0.9, lift=0.18, name='lid')
        c.px(ex, 37, (20, 30, 40))
    # the mouth: a long zipper, closed
    for x in range(30, 66):
        c.px(x, 50, R['zip'][1]); c.px(x, 49, R['zip'][3] if x % 2 else R['zip'][2]); c.px(x, 51, R['zip'][2] if x % 2 else R['zip'][3])
    blob(c, R['zip'], lambda d: d.rectangle([64, 47, 69, 55], fill=1), bulge=0.8, lift=0.25, name='pull')
    c.px(66, 52, R['zip'][0])
    # arms hanging, a remote control slack in one hand
    taper(c, [(22, 60), (12, 76), (14, 92)], 9, 8, R['grey'], lift=0.18, name='arm', bulge=1.1)
    blob(c, R['grey'], lambda d: d.ellipse([8, 88, 22, 100], fill=1), bulge=1.1, lift=0.25, name='hand')
    blob(c, R['case'], lambda d: d.rectangle([2, 86, 10, 104], fill=1), bulge=0.8, lift=0.15, name='remote')
    for y in (89, 93, 97): c.px(6, y, (200, 60, 50) if y == 89 else (120, 120, 130))
    taper(c, [(74, 60), (84, 76), (82, 92)], 9, 8, R['grey'], lift=-0.02, name='arm', bulge=1.1)
    blob(c, R['grey'], lambda d: d.ellipse([76, 88, 90, 100], fill=1), bulge=1.1, lift=0.0, name='hand')
    # a faint screen glow on its front
    for y in range(40, 108):
        for x in range(10, 60):
            if c.part[y, x] in ('body', 'head', 'arm') and yp.BAYER[y % 4][x % 4] < 0.18 * (1 - (x - 10) / 50):
                v = c.rgb[y, x].astype(float); c.rgb[y, x] = (v * .6 + np.array((120, 200, 220)) * .4).astype(np.uint8)
    return finish(c, [('lid', 'eye'), ('head', 'body'), ('arm', 'body'), ('hand', 'arm'), ('remote', 'hand'), ('pull', 'head'), ('page', 'page')],
                  rim=(140, 210, 230), rimparts=('body', 'head', 'arm'))

if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__)); out = {}
    from PIL import Image
    strip = []
    for name, fn in [('wirarun', wirarun), ('dewu', dewu), ('ngoyngoyun', ngoyngoyun), ('ngamlef', ngamlef), ('fillantu', fillantu)]:
        big = [fn(0), fn(1)]; small = [yp.half(b) for b in big]
        pb, fb = yp.encode(big); ps, fs = yp.encode(small)
        out[name] = {'big': {'pal': pb, 'f': fb}, 'small': {'pal': ps, 'f': fs}}
        im = Image.new('RGBA', (112, 112), (40, 50, 70, 255)); b0 = Image.fromarray(big[0]); im.paste(b0, ((112 - b0.width) // 2, 112 - b0.height), b0)
        strip.append(im)
    sheet = Image.new('RGBA', (112 * len(strip), 112)); [sheet.paste(s, (i * 112, 0)) for i, s in enumerate(strip)]
    sheet.resize((sheet.width * 3, 336), Image.NEAREST).save('/home/claude/waria_sheet.png')
    json.dump(out, open(os.path.join(here, 'waria.json'), 'w'))
    print('ok')
