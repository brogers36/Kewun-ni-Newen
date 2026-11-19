"""Build the game: concatenates src/head.html + src/*.js into www/index.html (one self-contained file)."""
import os
ROOT=os.path.dirname(os.path.abspath(__file__))
ORDER=['core1','audio','ui','state','spr','retro','maprows','maps','mapstate','maplogic','cutlogic','scripts','pause','battle','render','boot']
src=lambda f:open(os.path.join(ROOT,'src',f),encoding='utf-8').read()
js='\n'.join(src(f+'.js') for f in ORDER).replace('</script>\n</body>\n</html>\n','')
os.makedirs(os.path.join(ROOT,'www'),exist_ok=True)
open(os.path.join(ROOT,'www','index.html'),'w',encoding='utf-8').write(src('head.html')+js+'\n</script>\n</body>\n</html>\n')
print('built www/index.html')
