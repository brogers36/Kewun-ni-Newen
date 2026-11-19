"""Build the game from src/.
  python3 build.py           -> www/index.html  (the player version)
  python3 build.py --master  -> master/index.html (testing copy: start at any region; not committed)
"""
import os,sys
ROOT=os.path.dirname(os.path.abspath(__file__))
ORDER=['core1','audio','ui','state','spr','retro','maprows','maps','mapstate','maplogic','cutlogic','scripts','pause','battle','render','boot']
MASTER='--master' in sys.argv
src=lambda f:open(os.path.join(ROOT,'src',f),encoding='utf-8').read()
js='\n'.join(src(f+'.js') for f in ORDER).replace('</script>\n</body>\n</html>\n','')
head=src('head.html')
if MASTER:
    js='window.KEWUN_MASTER=1;\n'+js+'\n'+src('master.js')
    head=head.replace('<title>Kewün ñi Newen','<title>MAESTRO · Kewün ñi Newen',1)
out=os.path.join(ROOT,'master' if MASTER else 'www')
os.makedirs(out,exist_ok=True)
open(os.path.join(out,'index.html'),'w',encoding='utf-8').write(head+js+'\n</script>\n</body>\n</html>\n')
print('built',os.path.relpath(os.path.join(out,'index.html'),ROOT))
