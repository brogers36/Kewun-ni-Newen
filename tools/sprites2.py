"""Pixel templates for animals and the Witranalwe. Run to regenerate src/spr2.js."""
import json,os
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','src','spr2.js')
class G:
    def __init__(s,w,h):s.w,s.h=w,h;s.a=[['.']*w for _ in range(h)]
    def p(s,x,y,c):
        if 0<=x<s.w and 0<=y<s.h:s.a[y][x]=c
    def r(s,x,y,w,h,c):
        for yy in range(y,y+h):
            for xx in range(x,x+w):s.p(xx,yy,c)
    def e(s,cx,cy,rx,ry,c):
        for yy in range(s.h):
            for xx in range(s.w):
                if ((xx+.5-cx)/rx)**2+((yy+.5-cy)/ry)**2<=1:s.p(xx,yy,c)
    def get(s,x,y):return s.a[y][x] if 0<=x<s.w and 0<=y<s.h else '.'
    def outline(s,o='o'):
        add=[]
        for y in range(s.h):
            for x in range(s.w):
                if s.a[y][x]=='.' and any(s.get(x+dx,y+dy) not in '.o' for dx,dy in((1,0),(-1,0),(0,1),(0,-1))):add.append((x,y))
        for x,y in add:s.a[y][x]=o
    def rows(s):return[''.join(r) for r in s.a]

def horse(fr):
    g=G(30,24)
    # body
    g.e(17.5,11.5,9,5,'b');g.r(10,9,15,6,'b')
    g.r(11,14,13,2,'B');g.e(17.5,15,8,1.6,'B')
    g.r(11,8,13,1,'h');g.r(12,9,9,1,'h')
    # neck + head (left)
    for i in range(7):g.r(5+i,3+i,4,4,'b')
    g.e(4,5.5,3.2,2.6,'b');g.r(1,5,4,3,'b');g.r(1,7,3,1,'n');g.p(0,6,'b')
    g.p(4,4,'e');g.p(2,5,'w');g.p(2,6,'w');g.p(3,4,'w')
    g.r(5,0,1,3,'b');g.r(7,0,1,3,'b');g.p(5,0,'B');g.p(7,0,'B')
    # mane
    for i in range(8):g.r(7+i,1+i,2,2,'m')
    # tail
    g.r(26,9,2,2,'m');g.r(27,10,2,6,'m');g.r(28,15,1,3,'m')
    # legs
    L=[(11,0),(14,1),(20,0),(23,1)]
    for x,ph in L:
        dy=1 if (ph+fr)%2 else 0
        g.r(x,16,2,6-dy,'B' if ph else 'b');g.r(x,22-dy,2,1,'k')
    g.outline();return g.rows()
def cow(fr):
    g=G(30,22)
    g.e(17,10.5,9.5,5.5,'w');g.r(9,7,17,7,'w');g.r(10,14,15,1,'W')
    for (x,y,rx,ry) in [(13,9,3,2.4),(21,8,2.6,2),(23,12,2.4,1.8),(16,13,2,1)]:g.e(x,y,rx,ry,'k')
    # head
    g.e(5,8,3.6,3.6,'w');g.r(2,9,6,4,'w');g.r(1,10,6,3,'u');g.p(2,11,'n');g.p(5,11,'n')
    g.p(4,7,'e');g.p(7,7,'k');g.p(6,6,'k')
    g.r(1,4,2,1,'c');g.p(0,3,'c');g.r(7,4,2,1,'c');g.p(9,3,'c');g.r(0,6,2,1,'W');g.r(8,6,2,1,'W')
    g.r(26,8,1,6,'W');g.r(26,13,2,2,'k')
    g.r(19,15,3,2,'u')
    L=[(10,0),(13,1),(20,0),(23,1)]
    for x,ph in L:
        dy=1 if (ph+fr)%2 else 0
        g.r(x,15,2,5-dy,'W' if ph else 'w');g.r(x,20-dy,2,1,'K')
    g.outline();return g.rows()
def sheep(fr):
    g=G(22,18)
    for (x,y,r) in [(8,7,3.2),(12,6,3.4),(16,7,3.2),(7,10,3),(11,11,3.4),(15,10.5,3.2),(18,9,2.4)]:g.e(x,y,r,r*0.9,'w')
    for (x,y) in [(9,5),(13,4),(16,6),(10,9),(14,9),(8,11),(17,10)]:g.p(x,y,'W')
    for (x,y) in [(12,8),(15,8),(9,8),(12,12)]:g.p(x,y,'s')
    g.e(4,8,2.6,2.4,'f');g.r(1,8,3,3,'f');g.p(3,7,'e');g.r(4,5,2,1,'f');g.p(1,10,'n')
    for x,ph in [(8,0),(10,1),(14,0),(16,1)]:
        dy=1 if (ph+fr)%2 else 0
        g.r(x,13,1,4-dy,'f')
    g.outline();return g.rows()
def witranalwe(fr):
    W=26;g=G(W,56);c=W/2
    def sym(x,y,w,h,col):g.r(x,y,w,h,col);g.r(W-x-w,y,w,h,col)
    # glow aura left to render
    # hat
    sym(7,0,6,4,'H');sym(7,3,6,1,'h');sym(2,4,11,2,'H');sym(3,6,10,1,'q')
    # face
    sym(9,7,4,6,'F');sym(9,11,1,2,'f');sym(10,13,3,1,'f');sym(11,14,2,1,'F')
    g.p(10,9,'E');g.p(W-11,9,'E');g.p(10,10,'e');g.p(W-11,10,'e')
    sym(11,12,2,1,'f')
    # poncho
    for y in range(15,38):
        hw=5+int((y-15)*5/23)
        for x in range(int(c-hw),int(c)):
            col='P'
            if x<c-hw+2:col='q'
            elif x>c-3 and y>17:col='p'
            g.p(x,y,col);g.p(W-1-x,y,col)
    # silver step pattern rows
    for y0 in (22,30):
        for x in range(0,W):
            if g.get(x,y0+1) not in 'Ppq':continue
            k=x%6
            if k in (0,1,2):g.p(x,y0+2,'s')
            if k in (2,3,4):g.p(x,y0,'s')
            if k in (2,):g.p(x,y0+1,'s')
            if k==5:g.p(x,y0+1,'s')
    sym(12,15,1,22,'q')  # center fold line
    # arms (long, hanging, hugging the poncho)
    sym(5,15,3,2,'P')
    for y in range(16,44):
        hw=5+int((min(y,37)-15)*5/23);x0=int(c-hw)-2
        if y>=34:x0-=fr
        sym(x0,y,2,1,'A')
        if y<38:g.p(x0+1,y,'q');g.p(W-x0-2,y,'q')
    x0=int(c-10)-2-fr
    for y in range(44,47):sym(x0-1,y,3,1,'K')
    sym(x0-1,47,1,1,'K');sym(x0+1,47,1,1,'K')
    # legs
    for y in range(38,53):sym(9,y,2,1,'L')
    sym(8,53,3,1,'L')
    g.outline();return g.rows()

PAL={
 'kawellu':{'b':'#9a5a2a','B':'#6e3a18','h':'#c27c40','m':'#2a1a10','e':'#000000','w':'#f2e6d0','n':'#4a2a14','k':'#2a2020','o':'#1a1008'},
 'waka':{'w':'#f6f4ee','W':'#c8c4bc','k':'#26221e','u':'#e6a0a0','n':'#8a4a4a','e':'#000000','c':'#e8dcc0','K':'#3a3430','o':'#1a1612'},
 'ofisa':{'w':'#f4f0e4','W':'#ffffff','s':'#d4ccb8','f':'#3a3434','e':'#e8e0d0','n':'#1a1414','o':'#1a1614'},
 'witranalwe':{'H':'#1c1c2e','h':'#7a6a9a','q':'#141428','F':'#d0e0f8','f':'#8aa0c8','E':'#40f0ff','e':'#1a6a90','P':'#2c2c50','p':'#46467a','s':'#d0dcf0','A':'#26264a','K':'#d0e0f8','L':'#121220','o':'#06060e'}}
D={}
for name,fn in [('kawellu',horse),('waka',cow),('ofisa',sheep),('witranalwe',witranalwe)]:
    D[name]={'pal':PAL[name],'f':[fn(0),fn(1)]}
open(OUT,'w').write('const SPR2='+json.dumps(D,ensure_ascii=False)+';\n')
if __name__=='__main__':
    for n in D:
        print(n);print('\n'.join(D[n]['f'][0]))
