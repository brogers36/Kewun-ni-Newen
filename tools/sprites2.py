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

def line(g,x0,y0,x1,y1,c):
    n=max(abs(x1-x0),abs(y1-y0),1)
    for i in range(n+1):g.p(round(x0+(x1-x0)*i/n),round(y0+(y1-y0)*i/n),c)
def chonchon(fr):
    W=32;g=G(W,22);cx=W/2
    A=(11,10)
    T=[(2,0),(0,8),(4,15)] if fr==0 else [(1,5),(1,13),(6,19)]
    def tri(a,b,c,x,y):
        d=lambda p,q,r:(p[0]-r[0])*(q[1]-r[1])-(q[0]-r[0])*(p[1]-r[1])
        P=(x+.5,y+.5);d1,d2,d3=d(P,a,b),d(P,b,c),d(P,c,a)
        return not((d1<0 or d2<0 or d3<0) and (d1>0 or d2>0 or d3>0))
    for y in range(g.h):
        for x in range(0,12):
            if tri(A,T[0],T[1],x,y) or tri(A,T[1],T[2],x,y):
                g.p(x,y,'v' if abs(x-A[0])+abs(y-A[1])<5 else 'w')
    for a,b in [(T[0],T[1]),(T[1],T[2])]:
        mx,my=(a[0]+b[0])/2,(a[1]+b[1])/2;ox,oy=mx-A[0],my-A[1];L=(ox*ox+oy*oy)**.5
        r=((a[0]-b[0])**2+(a[1]-b[1])**2)**.5*.5;ccx,ccy=mx+ox/L*r*.55,my+oy/L*r*.55
        for y in range(g.h):
            for x in range(0,12):
                if (x+.5-ccx)**2+(y+.5-ccy)**2<r*r and g.a[y][x] in 'wv':g.a[y][x]='.'
    for t in T:line(g,A[0],A[1],t[0],t[1],'b')
    line(g,A[0],A[1]-1,T[0][0],T[0][1],'b')
    g.p(T[0][0],T[0][1],'c');g.p(T[0][0]+1,T[0][1],'c')
    for y in range(g.h):
        for x in range(0,12):g.a[y][W-1-x]=g.a[y][x]
    # head
    g.e(cx,11.5,5.6,6.6,'s')
    for y in range(4,19):
        for x in range(10,23):
            if g.a[y][x]=='s' and x>=cx+2:g.a[y][x]='S'
    g.e(cx,6.2,5.8,2.6,'h');g.r(10,6,2,5,'h');g.r(20,6,2,5,'h');g.r(15,7,2,1,'s')
    # brows
    for x,y in [(12,9),(13,9),(14,10),(17,10),(18,9),(19,9)]:g.p(x,y,'h')
    # eyes 2x2
    for x,c in [(12,'W'),(13,'r'),(18,'r'),(19,'W')]:g.p(x,11,c)
    for x,c in [(12,'W'),(13,'k'),(18,'k'),(19,'W')]:g.p(x,12,c)
    # nose, cheeks, mouth, fangs
    g.p(15,12,'S');g.p(15,13,'S');g.p(16,14,'S');g.p(15,14,'S')
    g.p(11,14,'q');g.p(20,14,'q')
    g.r(13,16,6,1,'m');g.p(13,15,'S');g.p(18,15,'S');g.p(14,17,'W');g.p(17,17,'W');g.r(15,17,2,1,'m')
    g.r(14,18,4,1,'S')
    g.outline();return g.rows()

def kutral(fr):
    g=G(16,19)
    g.e(8,12.5,6,6,'r');g.e(8,13,4.6,4.8,'O');g.e(8,14,3,3.4,'y');g.e(8,15,1.6,1.8,'w')
    tips=[(4,7,1.2,3),(8,4,1.6,4.5),(12,6,1.2,3.5)] if fr==0 else [(4,6,1.2,3.5),(8,5,1.6,4),(12,7,1.2,3)]
    for x,y,rx,ry in tips:g.e(x,y,rx,ry,'r');g.e(x,y+1.5,rx*.6,ry*.6,'O')
    g.p(6,12,'k');g.p(10,12,'k');g.p(6,11,'k');g.p(10,11,'k');g.r(7,15,3,1,'k')
    g.outline();return g.rows()
def pire(fr):
    g=G(18,18)
    g.e(9,8,6,5.5,'w');g.e(9,12,4.5,3,'w');g.e(8.5,13.5+fr*.5,2.6,3.2,'w')
    for y in range(3,15):
        for x in range(18):
            if g.a[y][x]=='w' and x>=11:g.a[y][x]='b'
    g.e(9,16+fr,1.4,1.2,'b')
    for (x,y) in [(2,4),(15,3),(1,10),(16,11)]:
        g.p(x,y,'c');g.p(x-1,y,'c');g.p(x+1,y,'c');g.p(x,y-1,'c');g.p(x,y+1,'c')
    g.r(6,7,2,2,'k');g.r(11,7,2,2,'k');g.p(6,7,'c');g.p(11,7,'c')
    g.r(8,11,2,1,'k')
    g.outline();return g.rows()
def kura(fr):
    g=G(20,17)
    g.e(10,9,7,6,'g');g.r(4,9,12,6,'g');g.e(10,5,5,3.5,'g')
    for y in range(17):
        for x in range(20):
            if g.a[y][x]=='g' and (x>12 or y>12):g.a[y][x]='G'
    g.r(1,8+fr,3,5,'G');g.r(16,8+(1-fr),3,5,'G')
    g.r(5,15,4,2,'G');g.r(11,15,4,2,'G')
    for (x,y) in [(7,9),(8,10),(8,11),(13,6),(12,7),(11,12),(12,13),(5,6)]:g.p(x,y,'k')
    g.r(7,5,2,1,'e');g.r(12,5,2,1,'e');g.p(10,3,'h');g.p(9,4,'h');g.p(6,8,'h')
    g.outline();return g.rows()
def nirivilu(fr):
    g=G(32,18)
    # snake tail (right) with curl
    pts=[(14,12),(17,13),(20,13),(23,12),(25,10),(26,7),(28,5),(30,6)] if fr==0 else [(14,12),(17,14),(20,14),(23,13),(26,12),(28,9),(29,6),(30,4)]
    for i,(x,y) in enumerate(pts):
        rr=2.4-i*.22;g.e(x,y,rr,rr,'s')
    for i,(x,y) in enumerate(pts[:-1]):
        if i%2==0:g.p(x,y-1,'S')
    for (x,y) in pts[1::2]:g.p(x,y+1,'S')
    # fox body
    g.e(10,10,5,3.6,'o');g.r(6,12,2,4,'O');g.r(12,12,2,4,'O');g.r(6,15,2,1,'k');g.r(12,15,2,1,'k')
    g.e(10,11.5,3,1.5,'w')
    # head
    g.e(4.5,7,3.6,3,'o');g.r(0,7,3,2,'o');g.p(0,7,'k');g.e(3,8.6,2.2,1,'w')
    g.r(3,2,2,3,'o');g.r(6,2,2,3,'o');g.p(3,2,'O');g.p(6,2,'O');g.p(4,3,'k');g.p(7,3,'k')
    g.p(4,6,'y');g.p(4,7,'k')
    g.outline();return g.rows()
def cherrufe(fr):
    W=44;g=G(W,46);c=W/2
    def sym(x,y,w,h,col):g.r(x,y,w,h,col);g.r(W-x-w,y,w,h,col)
    # legs
    sym(13,36,6,8,'B');sym(12,43,8,2,'B')
    # torso
    g.e(c,27,12,11,'b');g.r(10,22,24,12,'b')
    # arms
    sw=fr
    sym(3,20+sw,7,6,'b');sym(2,25+sw,6,12,'B');sym(1,36+sw,8,4,'b')
    # head
    g.e(c,13,8,7,'b');g.r(15,13,14,6,'b')
    # flame hair
    flames=[(15,6,2,4),(19,3,2,5),(22,2,2.4,6),(25,3,2,5),(29,6,2,4)]
    for x,y,rx,ry in flames:
        yy=y+(fr if x%2 else -fr)*0
        g.e(x,yy+fr*.5,rx,ry,'r');g.e(x,yy+1.5,rx*.6,ry*.6,'O')
    # shading right side
    for y in range(46):
        for x in range(W):
            if g.a[y][x]=='b' and x>=c+5:g.a[y][x]='B'
    # lava cracks
    cracks=[(18,22),(19,23),(19,24),(20,25),(26,21),(25,22),(25,23),(24,24),(21,30),(22,31),(23,31),(24,32),(14,28),(15,29),(29,28),(30,29),(4,27),(5,28),(39,27),(38,28),(16,38),(27,38)]
    for x,y in cracks:g.p(x,y,'l')
    g.e(c,28,3.2,3,'L');g.e(c,28,1.8,1.6,'y')
    # face
    sym(17,12,3,2,'y');g.p(18,12,'w');g.p(W-19,12,'w')
    sym(16,10,4,1,'B')
    g.r(18,16,8,2,'k');sym(18,16,1,1,'l');g.r(20,16,4,1,'L')
    g.outline();return g.rows()

def thick(g,x0,y0,x1,y1,r,c):
    n=int(max(abs(x1-x0),abs(y1-y0))*2)+1
    for i in range(n+1):
        x=x0+(x1-x0)*i/n;y=y0+(y1-y0)*i/n
        for yy in range(int(y-r-1),int(y+r+2)):
            for xx in range(int(x-r-1),int(x+r+2)):
                if (xx+.5-x)**2+(yy+.5-y)**2<=r*r:g.p(xx,yy,c)
def witranalwe2(fr):
    W=28;g=G(W,62);c=W/2
    def sym(x,y,w,h,col):g.r(x,y,w,h,col);g.r(W-x-w,y,w,h,col)
    # coat (long, widening, tattered hem)
    for y in range(19,58):
        hw=4+int((y-19)*7/38)
        for x in range(int(c-hw),int(c+hw)):
            col='P'
            if x<c-hw+2 or x>=c+hw-2:col='q'
            elif abs(x-c+.5)<1.5 and y>24:col='q'
            elif (x-int(c-hw))%5==2 and y>30:col='p'
            g.p(x,y,col)
    for x in range(0,W):
        cut=int(2.5+2.5*__import__('math').sin(x*1.7+fr))
        for y in range(58-cut,58):
            if g.a[y][x] in 'Ppq':g.a[y][x]='.'
    # lapels
    for y in range(19,27):g.p(int(c)-2-(y-19)//3,y,'p');g.p(int(c)+1+(y-19)//3,y,'p')
    # arms: long sleeves then bony hands with claws
    sw=fr
    for y in range(20,42):
        ax=int(c-6-(y-20)*3/22)-1
        g.r(ax-(sw if y>34 else 0),y,2,1,'A');g.r(W-ax-2+(sw if y>34 else 0),y,2,1,'A')
    for side in (0,1):
        hx=int(c-6-3)-1-sw if side==0 else W-(int(c-6-3)-1)-2+sw
        for y in range(42,47):g.r(hx,y,2,1,'K')
        for k,dx in enumerate((-1,0,1,2)):
            for y in range(47,50+(k%2)):g.p(hx+dx,y,'c')
    # hair (long grey strands)
    for x,len_ in [(8,20),(9,15),(18,15),(19,20),(10,9),(17,9)]:
        for y in range(8,8+len_):
            if g.a[y][x] in '.PqpA':g.p(x,y,'g' if (x+y)%3 else 'G')
    # head/face
    g.e(c,12,3.6,5,'F');g.r(11,14,6,4,'F')
    g.r(11,10,2,2,'k');g.r(15,10,2,2,'k');g.p(12,11,'E');g.p(15,11,'E')
    g.p(13,13,'f');g.p(14,13,'f');g.r(11,13,1,3,'f');g.r(16,13,1,3,'f')
    g.r(12,16,4,1,'k');g.p(12,17,'w');g.p(14,17,'w');g.p(13,17,'k');g.p(15,17,'k')
    g.r(12,18,4,1,'f')
    # hat
    g.r(9,0,10,5,'H');g.r(9,4,10,1,'h');g.r(2,5,24,2,'H');g.r(3,7,22,1,'q')
    # feet
    sym(10,57,3,2,'L')
    g.outline();return g.rows()
def trelke(fr):
    W=50;g=G(W,62)
    import math
    def rel(cx,cy,rx,ry,ang,col,only=None):
        ca,sa=math.cos(ang),math.sin(ang)
        for y in range(g.h):
            for x in range(W):
                dx,dy=x+.5-cx,y+.5-cy;u=dx*ca+dy*sa;v=-dx*sa+dy*ca
                if (u/rx)**2+(v/ry)**2<=1 and (only is None or g.a[y][x] in only):g.p(x,y,col)
    # hide: tall curved sheet
    rel(28,26,13,22,.25,'h');rel(22,44,9,12,-.3,'h');rel(22,10,11,7,-.4,'h')
    # frilled hide edge (right)
    for y in range(6,52,3):
        x=max([xx for xx in range(W) if g.a[y][xx]=='h'] or [0])
        g.p(x+1,y,'h');g.p(x+1,y+1,'H')
    for y in range(g.h):
        for x in range(W):
            if g.a[y][x]=='h' and x>31:g.a[y][x]='H'
            elif g.a[y][x]=='h' and x<20 and y<16:g.a[y][x]='u'
    # long mouth (tilted slit), flesh and palate teeth
    rel(21,26,7.5,17,.18,'m');rel(22,27,4.5,12,.18,'M')
    for k in range(18):
        x=20+(k%3)*2+((k//3)%2);y=17+(k//3)*3
        if g.get(x,y)=='M':g.p(x,y,'W')
    # teeth along both lips (outside ring of mouth)
    ca,sa=math.cos(.18),math.sin(.18)
    for t in range(0,360,7):
        r=math.radians(t);u=8.6*math.cos(r);v=18.2*math.sin(r)
        x=int(21+u*ca-v*sa);y=int(26+u*sa+v*ca)
        if g.get(x,y) in 'hHu':g.p(x,y,'w')
        u2=9.6*math.cos(r);v2=19.2*math.sin(r);x2=int(21+u2*ca-v2*sa);y2=int(26+u2*sa+v2*ca)
        if g.get(x2,y2) in 'hHu' and (t//7)%2:g.p(x2,y2,'W')
    # eye stalks from the top lobe
    sw=1 if fr else 0
    for (bx,by,tx,ty) in [(16,8,8-sw,1),(19,6,15+sw,0),(23,6,24-sw,1),(13,12,5+sw,8)]:
        thick(g,bx,by,tx,ty+2,.6,'r');g.e(tx+.5,ty+1.6,1.7,1.5,'r');g.p(tx,ty+1,'e')
    # tendrils: from mouth and from the bottom
    for y in range(30,46):g.p(20+int(math.sin(y*.55+fr)*2),y,'r')
    for (bx,ph) in [(16,0),(22,1.4),(28,2.6)]:
        for y in range(52,62):
            x=bx+int(2.2*math.sin(y*.55+ph+fr));g.p(x,y,'r');g.p(x+1,y,'R')
    g.outline();return g.rows()
def cherrufe2(fr):
    W=48;g=G(W,54);c=W/2
    import math
    # crown slabs (separate stone plates)
    for (tx,ty) in [(11,3),(17,0),(24,-1),(31,0),(37,3)]:
        thick(g,c+(tx-c)*.25,13,tx,ty+1,1.25,'b')
        thick(g,c+(tx-c)*.25-.5,13,tx-.5,ty+1,.5,'h')
        g.p(int(tx),max(0,ty),'h')
        mx=c+(tx-c)*.6;my=13+(ty-13)*.6;g.p(int(mx),int(my),'l');g.p(int(mx),int(my)+1,'l')
    # head
    g.e(c,16,4,5.5,'b');g.r(int(c)-3,18,6,4,'b')
    g.p(22,15,'y');g.p(25,15,'y');g.p(22,16,'O');g.p(25,16,'O')
    g.p(23,19,'l');g.p(24,20,'l');g.p(24,18,'l')
    # torso (crouched, broad)
    g.e(c,30,11,9,'b');g.r(14,26,20,10,'b');g.e(c,38,8,5,'b')
    # left arm reaching down to ground
    thick(g,14,27,8,36,2.6,'b');thick(g,8,36,9,48,2.3,'b');g.r(6,48,6,2,'b')
    # right arm forward with open hand
    thick(g,34,27,39,34,2.6,'b');thick(g,39,34,38,40,2.2,'b')
    g.e(38,42,3,2.4,'h')
    for k in range(4):g.r(36+k,44,1,2,'h')
    # legs crouched
    thick(g,19,40,15,47,2.6,'B');thick(g,15,47,17,52,2.2,'B');thick(g,29,40,33,47,2.6,'B');thick(g,33,47,31,52,2.2,'B')
    # shading
    for y in range(54):
        for x in range(W):
            if g.a[y][x]=='b' and x>c+4:g.a[y][x]='B'
    # lava veins (random walk)
    import random
    rnd=random.Random(7)
    for start in [(24,24),(20,29),(28,29),(16,33),(32,32),(10,40),(37,35),(24,36),(18,45),(31,45)]:
        x,y=start
        for i in range(9):
            if g.a[y][x] in 'bB':g.a[y][x]='l' if i%3 else 'L'
            x+=rnd.choice((-1,0,1));y+=rnd.choice((0,1,1))
            if not(0<=x<W and 0<=y<54):break
    for y in range(22,34):g.p(24,y,'L')
    g.e(24,28,1.6,1.6,'y')
    # drips from left hand
    for x in (7,9,11):
        for y in range(50,53-(x%2)):g.p(x,y,'l')
    # flame from right hand
    f=fr
    for (x,y,rx,ry,col) in [(39,48,4,5,'r'),(39,49,2.8,3.6,'O'),(39,50,1.6,2.2,'y'),(36+f,52,1.6,2,'O'),(42-f,52,1.4,1.8,'r')]:g.e(x,y,rx,ry,col)
    g.outline();return g.rows()

PAL={
 'kawellu':{'b':'#9a5a2a','B':'#6e3a18','h':'#c27c40','m':'#2a1a10','e':'#000000','w':'#f2e6d0','n':'#4a2a14','k':'#2a2020','o':'#1a1008'},
 'waka':{'w':'#f6f4ee','W':'#c8c4bc','k':'#26221e','u':'#e6a0a0','n':'#8a4a4a','e':'#000000','c':'#e8dcc0','K':'#3a3430','o':'#1a1612'},
 'ofisa':{'w':'#f4f0e4','W':'#ffffff','s':'#d4ccb8','f':'#3a3434','e':'#e8e0d0','n':'#1a1414','o':'#1a1614'},
 'chonchon':{'s':'#d6a27a','S':'#a06a48','h':'#1c1418','W':'#f4f0e6','r':'#ff2a2a','k':'#5a0a0a','q':'#c87860','m':'#3a0e0e','w':'#5a3a5c','v':'#82587c','b':'#24142a','c':'#e8e0d0','o':'#0e060e'},
 'kutral':{'r':'#d82818','O':'#f87818','y':'#f8d040','w':'#fff8d0','k':'#3a0808','o':'#2a0806'},
 'pire':{'w':'#f4faff','b':'#a8c8f0','c':'#60e0ff','k':'#1a3a7a','o':'#203060'},
 'kura':{'g':'#8a8a90','G':'#5a5a64','k':'#2a2a30','e':'#ff8a20','h':'#c0c0c8','o':'#16161c'},
 'nirivilu':{'o':'#d8742a','O':'#a85018','w':'#f4e8d8','k':'#1a1010','y':'#f8e040','s':'#3a8a5a','S':'#1e5a38'},
 'cherrufe':{'b':'#3a2c2c','B':'#241a1c','h':'#6a5450','r':'#e83018','O':'#f89020','y':'#ffe880','l':'#e8401c','L':'#ffa030','o':'#0e0608'},
 'trelke':{'h':'#6a5a34','H':'#463a20','u':'#8a7a4c','m':'#9a4a48','M':'#6a2a2e','W':'#e8c8c0','w':'#f4f0e0','r':'#a8503a','R':'#7a3424','e':'#ffd040','o':'#140e08'},
 'witranalwe':{'H':'#16161e','h':'#4a4a3a','q':'#0e0e14','F':'#c8ccc0','f':'#7a8274','k':'#0a0a0a','E':'#7aff9a','w':'#e8e8d8','P':'#24242c','p':'#34343e','A':'#3a3a46','K':'#9a9a90','c':'#d8d8c8','g':'#b8b8ac','G':'#808078','L':'#101014','o':'#040406'}}
D={}
BIG={'trelke':2,'witranalwe':2,'chonchon':2,'kutral':2,'pire':2,'kura':2,'nirivilu':2,'cherrufe':2}
for name,fn in [('kawellu',horse),('waka',cow),('ofisa',sheep),('witranalwe',witranalwe2),('chonchon',chonchon),('kutral',kutral),('pire',pire),('kura',kura),('nirivilu',nirivilu),('cherrufe',cherrufe2),('trelke',trelke)]:
    D[name]={'pal':PAL[name],'f':[fn(0),fn(1)],'big':BIG.get(name,1),'aura':{'witranalwe':'150,230,170','cherrufe':'255,130,50','trelke':'150,200,120'}.get(name,0)}
open(OUT,'w').write('const SPR2='+json.dumps(D,ensure_ascii=False)+';\n')
if __name__=='__main__':
    for n in D:
        print(n);print('\n'.join(D[n]['f'][0]))
